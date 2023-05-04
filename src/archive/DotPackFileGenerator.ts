import { readFileSync } from 'fs';
import convertRecordToArray from '../utils/convertRecordToArray';
import { isUndeltifiedObject } from '../utils/getGitObjectType';
import { Offset } from './Fanout';
import { GitObjectType } from '../Enum/GitObjectType';
import { BufferVarint } from '../Buffer/BufferVarint';
import getGitObjectType from '../utils/getGitObjectType';
import { GitObject } from '../GitObject/GitObject';
import swapKeyAndValueInRecords from '../utils/swapKeyAndValueInRecords';

// TODO: Archive this class as all logic had been moved to PackedObjectsGenerator

export interface Entry {
    hash: string;

    type: GitObjectType;

    size: number;

    /**
     * This is the start point of all delta objects, which consists of msb, type, length(size), (may or may not) base object info and compressed data.
     */
    offsetIndex: number;

    /**
     * For undeltified objects (blob_delta, tree_delta, commit_delta), the body is the compressed data. For deltified objects (ofs_delta, ref_delta), the body consists of base object info and compressed data.
     */
    bodyStartIndex: number;

    bodyEndIndex: number;
}

export interface DotPackFileGeneratorInterface {
    content: Buffer;

    filePath: string;

    entries: Entry[];

    offsets: Record<string, number>;

    // layer 1: [0, 4)
    parseLayer1(content: Buffer): string;
    // layer 2: [4, 8)
    parseLayer2(content: Buffer): number;

    // layer 3: [8, 12)
    parseLayer3(content: Buffer): number;

    parseLayer5(content: Buffer): Buffer;

    generateGitObjects(): GitObject[];
}

// TODO: need setter and getter
export class DotPackFileGenerator implements DotPackFileGeneratorInterface {
    content: Buffer;

    filePath: string;

    entries: Entry[];

    offsets: Record<string, number>;

    constructor(filePath: string, offsets: Record<string, number>) {
        this.offsets = offsets;
        this.content = readFileSync(filePath);
        this.filePath = filePath;
        this.entries = this._parseLayer4();
    }

    // layer 1: [0, 4)
    parseLayer1(content: Buffer): string {
        return content.subarray(0, 4).toString('utf-8');
    }

    // layer 2: [4, 8)
    parseLayer2(content: Buffer): number {
        return content.subarray(4, 8).readUInt32BE();
    }

    // layer 3: [8, 12)
    parseLayer3(content: Buffer): number {
        return content.subarray(8, 12).readUInt32BE();
    }

    private _parseLayer4(): Entry[] {
        const offsetArray: Offset[] = convertRecordToArray(this.offsets, 'hex', 'offset') as Offset[];

        // sort offsetArray ascending
        // offsetArray.length = offsets.length + 1
        offsetArray.sort((prev, next) => prev.offset - next.offset);
        offsetArray.push({
            hex: '',
            offset: this.content.length - 20 // this is the endIndex of the last object entry
        })

        const gitPackObjectEntry: Entry[] = [];
        for (let i = 0; i < Object.keys(this.offsets).length; i++) {
            const startIndex = offsetArray[i].offset;
            const endIndex = offsetArray[i + 1].offset;
            const hex = offsetArray[i].hex;
            const entry = this._getEntry(this.content, startIndex, endIndex);
            gitPackObjectEntry.push({...entry, offsetIndex: startIndex, hash: hex});
        }
        return gitPackObjectEntry;
    }

    parseLayer5(content: Buffer): Buffer {
        return content.subarray(content.length - 20);
    }

    generateGitObjects(): GitObject[] {
        const swapOffsets: Record<number, string> = swapKeyAndValueInRecords(this.offsets);
        const gitObjects: GitObject[] = [];
        for(const entry of this.entries) {
            const gitObject = this._parseEntryToGitObject(this.content, entry, this.filePath, swapOffsets);
            gitObjects.push(gitObject);
        }
        return gitObjects;
    }

    private _getEntry(content: Buffer, startIndex: number, endIndex: number): Omit<Entry, "offsetIndex" | "hash"> {
        const chunk = content.subarray(startIndex, endIndex);
        const bv = new BufferVarint();
        const [[size, bodyStartIndex], typeNumber] = bv.getFirstVarintWithType(chunk);
        return {
            type: getGitObjectType(typeNumber),
            size,
            bodyStartIndex: startIndex + bodyStartIndex,
            bodyEndIndex: endIndex,
        };
    }

    private _parseEntryToGitObject(content: Buffer, entry: Entry, filePath: string, swapOffsets: Record<number, string>): GitObject {
        if(isUndeltifiedObject(entry.type)) {
            return new GitObject(
                entry.hash, 
                entry.type, 
                entry.size, 
                undefined, 
                filePath, 
                entry.bodyStartIndex, 
                entry.bodyEndIndex);
        }
        if(entry.type === GitObjectType.REF_DELTA) {
            const bodyStartIndex = entry.bodyStartIndex;
            const baseHash =  content.subarray(bodyStartIndex, bodyStartIndex + 20).toString('hex');
            return new GitObject(
                entry.hash,
                GitObjectType.REF_DELTA,
                entry.size,
                baseHash,
                filePath,
                bodyStartIndex + 20,
                entry.bodyEndIndex
            );
        }
        if(entry.type === GitObjectType.OFS_DELTA) {
            const bv = new BufferVarint()
            const [negative, startIdx] = bv.getFirstVarintWithoutType(content.subarray(entry.bodyStartIndex));
            const baseHashOffset = entry.offsetIndex - negative;
            const baseHash = swapOffsets[baseHashOffset];
            return new GitObject(
                entry.hash,
                GitObjectType.OFS_DELTA,
                entry.size,
                baseHash,
                filePath,
                entry.bodyStartIndex + startIdx,
                entry.bodyEndIndex
            );
        }
        throw new Error(`The entry hash ${entry.hash} has illegal type ${entry.type} in _parseEntryToGitObject.`)
    }
}
