import { readFileSync } from "fs";
import sortRecords from "../../utils/sortRecords";
import { GitObjectType } from "../../Enum/GitObjectType";
import convertRecordToArray from "../../utils/convertRecordToArray";
import { BufferVarint } from "../../Buffer/BufferVarint";
import getGitObjectType, { isUndeltifiedObject } from "../../utils/getGitObjectType";
import { GitObject } from "../../GitObject/GitObject";
import swapKeyAndValueInRecords from "../../utils/swapKeyAndValueInRecords";

export interface Offset {
    hex: string;
    offset: number;
}

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

export class PackedObjectsGenerator {
    private _dotIdxFilePath: string;

    private _dotPackFilePath: string;

    constructor(filePath: string) {
        this._dotIdxFilePath = `${filePath}.idx`;
        this._dotPackFilePath = `${filePath}.pack`;
    }

    // Fanout Layer 1: [0, 1024), 256 entries, each has 4 bytes.
    private _parseFanoutLayer1(fanoutContent: Buffer): [Record<number, number>, number, number] {
        const accumulation: Record<number, number> = {};
        const endBytes = 1024;
        const layer1: Record<number, number> = {};
        // [0, 1024) bytes
        for (let i = 0; i < 256; i++) {
            accumulation[i] = fanoutContent.readUInt32BE(i * 4);
        }
        for (let i = 255; i >= 0; i--) {
            layer1[i] =
                i > 0 ? accumulation[i] - accumulation[i - 1] : accumulation[0];
        }
        const entrySize = accumulation[255];
        return [layer1, entrySize, endBytes];
    }
  
    // Fanout Layer 2: [1024, 1024 + 20 * entrySize)
    private _parseFanoutLayer2(fanoutContent: Buffer, startBytes: number, entrySize: number): [string[], number] {
        const endBytes = startBytes + 20 * entrySize;
        const layer2: string[] = [];
        for (let i = 0; i < entrySize; i++) {
            layer2.push(
                fanoutContent
                    .subarray(startBytes + 20 * i, startBytes + 20 * (i + 1))
                    .toString('hex'),
            );
        }
  
        return [layer2, endBytes];
    }
  
    // Fanout Layer 3: [startBytes, startBytes + 4 * entrySize)
    private _parseFanoutLayer3(fanoutContent: Buffer, startBytes: number, entrySize: number): [Buffer, number] {
        const endBytes = startBytes + 4 * entrySize;
        const layer3 = fanoutContent.subarray(startBytes, endBytes);
    
        return [layer3, endBytes];
    }

    // Fanout Layer 4: [startBytes, startBytes + 4 * entrySize)
    private _parseFanoutLayer4(fanoutContent: Buffer, startBytes: number, entrySize: number, layer2: string[]): [Record<string, number>, number] {
        const endBytes = startBytes + 4 * entrySize;
        const offsetsTemp: Record<string, number> = {};
        for (let i = 0; i < layer2.length; i++) {
            const temp = fanoutContent.subarray(
                startBytes + 4 * i,
                startBytes + 4 * (i + 1),
            );
            offsetsTemp[layer2[i]] = temp.readUInt32BE();
        }
  
        // sort offsets
        const offsets = sortRecords(offsetsTemp);
    
        return [offsets, endBytes];
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

    private _parseDotPackLayer4(dotPackContent: Buffer, offsets: Record<string, number>): Entry[] {
        const offsetArray: Offset[] = convertRecordToArray(offsets, 'hex', 'offset') as Offset[];

        // sort offsetArray ascending
        // offsetArray.length = offsets.length + 1
        offsetArray.sort((prev, next) => prev.offset - next.offset);
        offsetArray.push({
            hex: '',
            offset: dotPackContent.length - 20 // this is the endIndex of the last object entry
        })

        const gitPackObjectEntry: Entry[] = [];
        for (let i = 0; i < Object.keys(offsets).length; i++) {
            const startIndex = offsetArray[i].offset;
            const endIndex = offsetArray[i + 1].offset;
            const hex = offsetArray[i].hex;
            const entry = this._getEntry(dotPackContent, startIndex, endIndex);
            gitPackObjectEntry.push({...entry, offsetIndex: startIndex, hash: hex});
        }
        return gitPackObjectEntry;
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

    getOffsets() {
        const idxContent = readFileSync(this._dotIdxFilePath);
        const fanoutContent = idxContent.subarray(8, idxContent.length - 20);
        const [_, entrySize, startOfLayer2] = this._parseFanoutLayer1(fanoutContent);
        const [fanoutLayer2, startOfLayer3] = this._parseFanoutLayer2(fanoutContent, startOfLayer2, entrySize);
        const [__, startOfLayer4] = this._parseFanoutLayer3(fanoutContent, startOfLayer3, entrySize);
        const [offsets, ___] = this._parseFanoutLayer4(fanoutContent, startOfLayer4, entrySize, fanoutLayer2);
        return offsets;
    }

    generateGitObjects(): GitObject[] {
        const offsets = this.getOffsets();
        const dotPackContent = readFileSync(this._dotPackFilePath);
        const entries: Entry[] = this._parseDotPackLayer4(dotPackContent, offsets);
        const swapOffsets: Record<number, string> = swapKeyAndValueInRecords(offsets);
        const gitObjects: GitObject[] = [];
        for(const entry of entries) {
            const gitObject = this._parseEntryToGitObject(dotPackContent, entry, this._dotPackFilePath, swapOffsets);
            gitObjects.push(gitObject);
        }
        return gitObjects;
    }

}