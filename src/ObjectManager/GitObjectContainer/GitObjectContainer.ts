import { inflateSync } from 'zlib';
import { GitObjectType } from '../../Enum/GitObjectType';
import path from 'path';
import { readFileSync } from 'fs';
import getGitObjectType, {
    isUndeltifiedObject,
} from '../../utils/getGitObjectType';
import convertRecordToArray from '../../utils/convertRecordToArray';
import swapKeyAndValueInRecords from '../../utils/swapKeyAndValueInRecords';
import { BufferVarint } from '../../Buffer/BufferVarint';
import sortRecords from '../../utils/sortRecords';

export class GitObject {
    hash: string;

    gitObjectType: GitObjectType;

    size: number;

    baseHash: string | undefined;

    filePath: string;

    // For the loose object, the content need to be inflated first
    startIdx: number;

    endIdx: number;

    constructor(
        hash: string,
        gitObjectType: GitObjectType,
        size: number,
        baseHash: string | undefined,
        filePath: string,
        startIdx: number,
        endIdx: number,
    ) {
        this.hash = hash;

        this.gitObjectType = gitObjectType;

        this.size = size;

        this.baseHash = baseHash;

        this.filePath = filePath;

        this.startIdx = startIdx;

        this.endIdx = endIdx;
    }

    public toJson(): string {
        const json: any = {};
        for (const key of Object.keys(this)) {
            json[key] = (this as any)[key];
        }
        return json;
    }
}

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

export class GitObjectContainer {
    looseObjectsContainer: GitObject[];

    packedObjectsContainer: GitObject[];

    // Count the occurrence number of each hash.
    mapToObject: Map<string, number>;

    constructor() {
        this.looseObjectsContainer = [];

        this.packedObjectsContainer = [];

        // There are some duplicated packed objects.
        this.mapToObject = new Map<string, number>();
    }

    private _splitHeaderAndBody(
        buffer: Buffer,
        delimiter = 0x00,
    ): [Buffer, Buffer] {
        const idx = buffer.indexOf(delimiter);
        return [buffer.subarray(0, idx), buffer.subarray(idx + 1)];
    }

    // Fanout Layer 1: [0, 1024), 256 entries, each has 4 bytes.
    private _parseFanoutLayer1(
        fanoutContent: Buffer,
    ): [Record<number, number>, number, number] {
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
    private _parseFanoutLayer2(
        fanoutContent: Buffer,
        startBytes: number,
        entrySize: number,
    ): [string[], number] {
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
    private _parseFanoutLayer3(
        fanoutContent: Buffer,
        startBytes: number,
        entrySize: number,
    ): [Buffer, number] {
        const endBytes = startBytes + 4 * entrySize;
        const layer3 = fanoutContent.subarray(startBytes, endBytes);

        return [layer3, endBytes];
    }

    // Fanout Layer 4: [startBytes, startBytes + 4 * entrySize)
    private _parseFanoutLayer4(
        fanoutContent: Buffer,
        startBytes: number,
        entrySize: number,
        layer2: string[],
    ): [Record<string, number>, number] {
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

    private _getOffsets(dotIdxFilePath: string) {
        const idxContent = readFileSync(dotIdxFilePath);
        const fanoutContent = idxContent.subarray(8, idxContent.length - 20);
        const [_, entrySize, startOfLayer2] =
            this._parseFanoutLayer1(fanoutContent);
        const [fanoutLayer2, startOfLayer3] = this._parseFanoutLayer2(
            fanoutContent,
            startOfLayer2,
            entrySize,
        );
        const [__, startOfLayer4] = this._parseFanoutLayer3(
            fanoutContent,
            startOfLayer3,
            entrySize,
        );
        const [offsets, ___] = this._parseFanoutLayer4(
            fanoutContent,
            startOfLayer4,
            entrySize,
            fanoutLayer2,
        );
        return offsets;
    }

    private _getEntry(
        content: Buffer,
        startIndex: number,
        endIndex: number,
    ): Omit<Entry, 'offsetIndex' | 'hash'> {
        const chunk = content.subarray(startIndex, endIndex);
        const bv = new BufferVarint();
        const [[size, bodyStartIndex], typeNumber] =
            bv.getFirstVarintWithType(chunk);
        return {
            type: getGitObjectType(typeNumber),
            size,
            bodyStartIndex: startIndex + bodyStartIndex,
            bodyEndIndex: endIndex,
        };
    }

    private _parseDotPackLayer4(
        dotPackContent: Buffer,
        offsets: Record<string, number>,
    ): Entry[] {
        const offsetArray: Offset[] = convertRecordToArray(
            offsets,
            'hex',
            'offset',
        ) as Offset[];

        // sort offsetArray ascending
        // offsetArray.length = offsets.length + 1
        offsetArray.sort((prev, next) => prev.offset - next.offset);
        offsetArray.push({
            hex: '',
            offset: dotPackContent.length - 20, // this is the endIndex of the last object entry
        });

        const gitPackObjectEntry: Entry[] = [];
        for (let i = 0; i < Object.keys(offsets).length; i++) {
            const startIndex = offsetArray[i].offset;
            const endIndex = offsetArray[i + 1].offset;
            const hex = offsetArray[i].hex;
            const entry = this._getEntry(dotPackContent, startIndex, endIndex);
            gitPackObjectEntry.push({
                ...entry,
                offsetIndex: startIndex,
                hash: hex,
            });
        }
        return gitPackObjectEntry;
    }

    private _parseEntryToGitObject(
        content: Buffer,
        entry: Entry,
        filePath: string,
        swapOffsets: Record<number, string>,
    ): GitObject {
        if (isUndeltifiedObject(entry.type)) {
            return new GitObject(
                entry.hash,
                entry.type,
                entry.size,
                undefined,
                filePath,
                entry.bodyStartIndex,
                entry.bodyEndIndex,
            );
        }
        if (entry.type === GitObjectType.REF_DELTA) {
            const bodyStartIndex = entry.bodyStartIndex;
            const baseHash = content
                .subarray(bodyStartIndex, bodyStartIndex + 20)
                .toString('hex');
            return new GitObject(
                entry.hash,
                GitObjectType.REF_DELTA,
                entry.size,
                baseHash,
                filePath,
                bodyStartIndex + 20,
                entry.bodyEndIndex,
            );
        }
        if (entry.type === GitObjectType.OFS_DELTA) {
            const bv = new BufferVarint();
            const [negative, startIdx] = bv.getOffsetEncoding(
                content.subarray(entry.bodyStartIndex),
            );
            const baseHashOffset = entry.offsetIndex - negative;
            const baseHash = swapOffsets[baseHashOffset];

            // OFS_DELTA object must have a baseHash
            if (
                !baseHash ||
                baseHash === undefined ||
                baseHash === null ||
                baseHash.length === 0
            ) {
                throw new Error(`OFS DELTA ${entry.hash} has no baseHash!`);
            }

            return new GitObject(
                entry.hash,
                GitObjectType.OFS_DELTA,
                entry.size,
                baseHash,
                filePath,
                entry.bodyStartIndex + startIdx,
                entry.bodyEndIndex,
            );
        }
        throw new Error(
            `The entry hash ${entry.hash} has illegal type ${entry.type} in _parseEntryToGitObject.`,
        );
    }

    // Add or update the hash into _mapToObject
    private _addOrUpdateMapToObject(hash: string) {
        if (this.mapToObject.has(hash)) {
            this.mapToObject.set(hash, this.mapToObject.get(hash)! + 1);
        } else {
            this.mapToObject.set(hash, 1);
        }
    }

    public generateLooseObject(filePath: string): void {
        const filePaths: string[] = filePath.split(path.sep);
        const suffix = filePaths.pop();
        const prefix = filePaths.pop();
        if (!suffix || !prefix) {
            throw new Error(
                `GitOriginalObjectGenerator: can\'t get prefix or suffix from the file path ${filePath}`,
            );
        }
        const hash = prefix + suffix;

        const decryptedBuf = inflateSync(readFileSync(filePath));
        const [header, _] = this._splitHeaderAndBody(decryptedBuf);
        const headerStr = header.toString();
        const size = parseInt(headerStr.split(' ')[1]);
        const gitObjectType = getGitObjectType(headerStr.split(' ')[0]);

        const startIdx = header.length + 1;
        const endIdx = decryptedBuf.length;

        const gitObject = new GitObject(
            hash,
            gitObjectType,
            size,
            undefined,
            filePath,
            startIdx,
            endIdx,
        );

        this.looseObjectsContainer.push(gitObject);

        this._addOrUpdateMapToObject(hash);
    }

    generatePackedObjects(packedFilePath: string): void {
        const dotIdxFilePath = `${packedFilePath}.idx`;
        const dotPackFilePath = `${packedFilePath}.pack`;

        const offsets = this._getOffsets(dotIdxFilePath);
        const dotPackContent = readFileSync(dotPackFilePath);
        const entries: Entry[] = this._parseDotPackLayer4(
            dotPackContent,
            offsets,
        );
        const swapOffsets: Record<number, string> =
            swapKeyAndValueInRecords(offsets);

        for (const entry of entries) {
            const gitObject = this._parseEntryToGitObject(
                dotPackContent,
                entry,
                dotPackFilePath,
                swapOffsets,
            );
            this.packedObjectsContainer.push(gitObject);

            this._addOrUpdateMapToObject(entry.hash);
        }
    }
}
