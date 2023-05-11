import { readFileSync, writeFileSync } from 'fs';
import { GitObjectType } from '../Enum/GitObjectType';
import { GitObject } from '../GitObject/GitObject';
import { inflateSync } from 'zlib';
import blobParser from './ContentParser/blobParser';
import treeParser, { GitTreeObjectFileEntry } from './ContentParser/treeParser';
import commitParser, { CommitObjectInfo } from './ContentParser/commitParser';
import tagParser, { TagObjectInfo } from './ContentParser/tagParser';
import path from 'path';
import { BufferVarint } from '../Buffer/BufferVarint';
import { isUndeltifiedObject } from '../utils/getGitObjectType';

export interface Distribution {
    filePath: string;

    bodyStartIdx: number;

    bodyEndIdx: number;

    type: GitObjectType;
}

/**
 * Duplicated gitObjects with the same hash share the same EntranceNode, but each has its own unique previous EntranceNode or EntranceFile.
 */
export class EntranceNode {
    hash: string;

    nextNodes: EntranceNode[];

    distributions: Distribution[];

    constructor(hash: string) {
        this.hash = hash;
        this.distributions = [];
        this.nextNodes = [];
    }
}

export class EntranceFile {
    filePath: string;

    nextNodes: EntranceNode[];

    constructor(filePath: string) {
        this.filePath = filePath;
        this.nextNodes = [];
    }
}

export class Entrance {
    // Due to the possibility of duplicated hashes, filePath is necessary.
    // Map<hash, entranceNode>;
    private _mapToEntranceNode: Map<string, EntranceNode>;

    // Map<filePath, entranceFile>;
    private _mapToEntranceFile: Map<string, EntranceFile>;

    public entranceFiles: EntranceFile[];

    constructor() {
        this._mapToEntranceNode = new Map<string, EntranceNode>();
        this._mapToEntranceFile = new Map<string, EntranceFile>();
        this.entranceFiles = [];
    }

    // The gitObject should be a Packed Object
    public insertGitObject(gitObject: GitObject) {
        const curr = this._insertCurrGitObject(gitObject);
        if (gitObject.baseHash) {
            // For deltified object
            this._insertPrevGitObject(gitObject.baseHash, curr);
        } else {
            // For undeltified object
            this._createEntranceFile(gitObject.filePath ?? '', curr);
        }
    }

    private _insertCurrGitObject(gitObject: GitObject): EntranceNode {
        let entranceNode;
        if (this._mapToEntranceNode.has(gitObject.hash)) {
            // For the duplicated gitObject, get the existing one.
            entranceNode = this._mapToEntranceNode.get(gitObject.hash)!;
        } else {
            // Create a new one.
            entranceNode = new EntranceNode(gitObject.hash);
            this._mapToEntranceNode.set(gitObject.hash, entranceNode);
        }
        const inflation: Distribution = {
            bodyStartIdx: gitObject.startIdx ?? 0,
            bodyEndIdx: gitObject.endIdx ?? 0,
            filePath: gitObject.filePath ?? '',
            type: gitObject.gitObjectType!,
        };
        entranceNode.distributions.push(inflation);

        return entranceNode;
    }

    private _insertPrevGitObject(prevHash: string, curr: EntranceNode): void {
        if (this._mapToEntranceNode.has(prevHash)) {
            const entranceNode = this._mapToEntranceNode.get(prevHash)!;
            entranceNode.nextNodes.push(curr);
        } else {
            const entranceNode = new EntranceNode(prevHash);
            entranceNode.nextNodes.push(curr);
            this._mapToEntranceNode.set(prevHash, entranceNode);
        }
    }

    private _createEntranceFile(filePath: string, curr: EntranceNode): void {
        if (this._mapToEntranceFile.has(filePath)) {
            const entranceFile = this._mapToEntranceFile.get(filePath)!;
            entranceFile.nextNodes.push(curr);
        } else {
            const entranceFile = new EntranceFile(filePath);
            entranceFile.nextNodes.push(curr);
            this.entranceFiles.push(entranceFile);
            this._mapToEntranceFile.set(filePath, entranceFile);
        }
    }

    parse(outObjectDir?: string) {
        for (const entranceFile of this.entranceFiles) {
            const filePath = entranceFile.filePath;
            const file = readFileSync(filePath);
            for (const node of entranceFile.nextNodes) {
                try {
                    const undeltifiedType = this._getUndeltifiedType(
                        node.distributions,
                    );
                    this._dfsParser(
                        node,
                        filePath,
                        file,
                        undeltifiedType,
                        outObjectDir,
                    );
                } catch (e) {
                    // Considering the fds function, the error may not come from the undeltified object itself.
                    throw new Error(
                        `${e} under the undeltified node ${node.hash}.`,
                    );
                }
            }
        }
    }

    private _getUndeltifiedType(distributions: Distribution[]): GitObjectType {
        const distribution = distributions.find((dis) =>
            isUndeltifiedObject(dis.type),
        );
        if (!distribution) {
            throw new Error(
                `Cannot find undeltified type of the undeltified node`,
            );
        } else {
            return distribution.type;
        }
    }

    private _dfsParser(
        node: EntranceNode,
        filePath: string,
        file: Buffer,
        baseType: GitObjectType, // must be an undeltified type for the undeltifiedParser to parse.
        outObjectDir?: string,
        baseBuffer?: Buffer,
    ) {
        // Get the shortest distribution.
        const shortestDistribution =
            node.distributions.find(
                (distribution) => distribution.filePath === filePath,
            ) ?? node.distributions[0];

        // Get the body.
        // For undeltified object, it is the deflated data.
        // For deltified object, it is the compressed delta data.
        const body = file.subarray(
            shortestDistribution.bodyStartIdx,
            shortestDistribution.bodyEndIdx,
        );

        // Get the newBuffer.
        let newBuffer: Buffer;
        if (!baseBuffer) {
            // Undeltified objects: the decryptedDeltaBuf should be the nextBaseBuffer.
            try {
                newBuffer = inflateSync(body);
            } catch (e) {
                throw new Error(
                    `${e} happens when inflating ${node.hash} (${shortestDistribution.type}) in ${shortestDistribution.filePath} (starts from ${shortestDistribution.bodyStartIdx}, ends at ${shortestDistribution.bodyEndIdx}).`,
                );
            }
        } else {
            // Deltified objects: decryptedDeltaBuf need to be applied on the baseBuffer to get the newBuffer.
            newBuffer = this._deltifiedParser(body, baseBuffer)[2];
        }

        // Print to the out file.
        if (outObjectDir) {
            const outFile = path.join(outObjectDir, node.hash);
            // TODO: ensure the baseType keeps the same as its grandparent.
            const outStr = JSON.stringify(
                this._undeltifiedParser(newBuffer, baseType),
            );
            writeFileSync(outFile, outStr);
        }

        // Next node, the newBuffer will be the next BaseBuffer.
        for (const nextNode of node.nextNodes) {
            this._dfsParser(
                nextNode,
                filePath,
                file,
                baseType,
                outObjectDir,
                newBuffer,
            );
        }

        return;
    }

    private _undeltifiedParser(
        decryptedBuf: Buffer,
        type: GitObjectType,
    ):
        | string
        | GitTreeObjectFileEntry[]
        | CommitObjectInfo
        | TagObjectInfo
        | undefined {
        switch (type) {
            case GitObjectType.BLOB_DELTA: {
                return blobParser(decryptedBuf);
            }
            case GitObjectType.TREE_DELTA: {
                return treeParser(decryptedBuf);
            }
            case GitObjectType.COMMIT_DELTA: {
                return commitParser(decryptedBuf);
            }
            case GitObjectType.TAG_DELTA: {
                return tagParser(decryptedBuf);
            }
            default: {
                return;
            }
        }
    }

    private _deltifiedParser(
        decryptedDeltaBuf: Buffer,
        baseBuffer: Buffer,
    ): [number, number, Buffer] {
        // Get the size of the base object.
        const bv1 = new BufferVarint(false);
        const [baseObjectSize, endIdx1] = bv1.getSizeEncoding(
            decryptedDeltaBuf,
            1,
        );

        // Get the size of the deltified object.
        const bv2 = new BufferVarint(false);
        const remain = decryptedDeltaBuf.subarray(endIdx1);
        const [deltifiedObjectSize, endIdx2] = bv2.getSizeEncoding(remain, 1);

        // Get the instructions
        let startIdx = endIdx1 + endIdx2;
        let instructions = decryptedDeltaBuf.subarray(startIdx);

        let finalBuffer = Buffer.from([]);
        while (instructions.length > 0) {
            let flag = instructions[0] & 0b10000000;
            const bv = new BufferVarint(false);
            if (flag) {
                // copy
                const [offset, size, endIdx] =
                    bv.getCopyInstruction(instructions);
                startIdx += endIdx;
                // TODO: The offset and size parameters should be applied to bytes instead according to the official documentation.
                finalBuffer = Buffer.concat([
                    finalBuffer,
                    baseBuffer.subarray(offset, offset + size),
                ]);
                instructions = decryptedDeltaBuf.subarray(startIdx);
            } else {
                // add
                const [newSnippet, endIdx] = bv.getAddInstruction(instructions);
                startIdx += endIdx;
                finalBuffer = Buffer.concat([finalBuffer, newSnippet]);
                instructions = decryptedDeltaBuf.subarray(startIdx);
            }
        }

        return [baseObjectSize, deltifiedObjectSize, finalBuffer];
    }
}
