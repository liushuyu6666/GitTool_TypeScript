import { GitObjectType } from '../Enum/GitObjectType';
import { GitObject } from '../GitObject/GitObject';

export interface Inflation {
    filePath: string;

    bodyStartIdx: number;

    bodyEndIdx: number;
}

/**
 * Duplicated gitObjects with the same hash share the same EntranceNode, but each has its own unique previous EntranceNode or EntranceFile.
 */
export class EntranceNode {
    hash: string;

    type: GitObjectType | undefined;

    nextNodes: EntranceNode[];

    inflations: Inflation[];

    constructor(hash: string) {
        this.hash = hash;
        this.inflations = [];
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
    // Map<filePath, node>;
    private _mapToEntranceNode: Map<string, EntranceNode>;

    public entranceFiles: EntranceFile[]; 

    constructor() {
        this._mapToEntranceNode = new Map<string, EntranceNode>();
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
            // For the duplicated gitObject
            entranceNode = this._mapToEntranceNode.get(gitObject.hash)!;
        } else {
            entranceNode = new EntranceNode(gitObject.hash);
            entranceNode.type = gitObject.gitObjectType;
            this._mapToEntranceNode.set(gitObject.hash, entranceNode);
        }
        const inflation: Inflation = {
            bodyStartIdx: gitObject.startIdx ?? 0,
            bodyEndIdx: gitObject.endIdx ?? 0,
            filePath: gitObject.filePath ?? '',
        };
        entranceNode.inflations.push(inflation);

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
        const entranceFile = new EntranceFile(filePath);
        entranceFile.nextNodes.push(curr);
        this.entranceFiles.push(entranceFile);
    }
}
