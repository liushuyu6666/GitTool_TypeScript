import { readFileSync } from 'fs';
import convertRecordToArray from '../../utils/convertRecordToArray';
import { Offset } from './Fanout';
import { GitObjectType } from '../../Enum/GitObjectType';
import { BufferVarint } from '../../Buffer/BufferVarint';
import getGitObjectType from '../../utils/getGitObjectType';

export interface Entry {
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
    size: number;

    // 'PACK'
    layer1: string;

    // version
    layer2: number;

    // object hex list
    layer3: number;

    // data chunk
    layer4: Record<string, Entry>;

    // checksum
    layer5: Buffer;

    // layer 1: [0, 4)
    parseLayer1(content: Buffer): string;
    // layer 2: [4, 8)
    parseLayer2(content: Buffer): number;

    // layer 3: [8, 12)
    parseLayer3(content: Buffer): number;

    parseLayer4(offsets: Record<string, number>, content: Buffer): Record<string, Entry>;

    parseLayer5(content: Buffer): Buffer;
}

// TODO: need setter and getter
export class DotPackFileGenerator implements DotPackFileGeneratorInterface {
    size: number;

    // 'PACK'
    layer1: string;

    // version
    layer2: number;

    // object hex list
    layer3: number;

    // data chunk
    layer4: Record<string, Entry>;

    // checksum
    layer5: Buffer;

    constructor(filePath: string, offsets: Record<string, number>) {
        const content = readFileSync(filePath);
        this.size = content.length;
        this.layer1 = this.parseLayer1(content);
        this.layer2 = this.parseLayer2(content);
        this.layer3 = this.parseLayer3(content);
        this.layer4 = this.parseLayer4(offsets, content);
        this.layer5 = this.parseLayer5(content);
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

    parseLayer4(offsets: Record<string, number>, content: Buffer): Record<string, Entry> {
        const offsetArray: Offset[] = convertRecordToArray(offsets, 'hex', 'offset') as Offset[];

        // sort offsetArray ascending
        // offsetArray.length = offsets.length + 1
        offsetArray.sort((prev, next) => prev.offset - next.offset);
        offsetArray.push({
            hex: '',
            offset: content.length - 20 // this is the endIndex of the last object entry
        })

        const gitPackObjectEntry: Record<string, Entry> = {};
        for (let i = 0; i < Object.keys(offsets).length; i++) {
            const startIndex = offsetArray[i].offset;
            const endIndex = offsetArray[i + 1].offset;
            const hex = offsetArray[i].hex;
            const entry = this._getEntry(content, startIndex, endIndex);
            gitPackObjectEntry[hex] = {...entry, offsetIndex: startIndex};
        }
        return gitPackObjectEntry;
    }

    parseLayer5(content: Buffer): Buffer {
        return content.subarray(content.length - 20);
    }

    private _getEntry(content: Buffer, startIndex: number, endIndex: number): Omit<Entry, "offsetIndex"> {
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
}
