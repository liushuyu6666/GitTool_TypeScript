import { CommitInfo, CommitObjectInfo } from "../ContentParser/commitParser";

export class CommitNode {
    hash: string;
    prevNodes: CommitNode[];
    nextNodes: CommitNode[];

    constructor(hash: string) {
        this.hash = hash;
        this.prevNodes = [];
        this.nextNodes = [];
    }
}

export class CommitMapHeader {
    size: number;

    firstNode: CommitNode[];

    constructor() {
        this.size = 0;
        this.firstNode = []; 
    }

    public insertFirstNode(firstNode: CommitNode) {
        this.firstNode.push(firstNode);
    }
}

export class CommitMap {
    public commitHeader: CommitMapHeader;

    public commitInfoMap: Map<string, CommitInfo>;

    private _commitMap: Map<string, CommitNode>;

    constructor() {
        this.commitHeader = new CommitMapHeader();
        this.commitInfoMap = new Map();
        this._commitMap = new Map();
    }

    public insertCommitObjectInfo(commitInfo: CommitObjectInfo) {
        const currNode = this._insertCurrNode(commitInfo);
        if(commitInfo.hashes.parentHashes.length < 1) {
            this.commitHeader.insertFirstNode(currNode);
        } else {
            for(const prevHash of commitInfo.hashes.parentHashes) {
                this._insertPrevNodes(currNode, prevHash);
            }
        }
        
    }

    private _insertCurrNode(commitInfo: CommitObjectInfo) {
        let currNode: CommitNode;
        const hash = commitInfo.hashes.hash;

        if(this._commitMap.has(hash)) {
            currNode = this._commitMap.get(hash)!;
        } else {
            currNode = new CommitNode(hash);
        }

        this._commitMap.set(hash, currNode);
        this.commitHeader.size++;
        this.commitInfoMap.set(hash, commitInfo.info);

        return currNode;
    }

    private _insertPrevNodes(currNode: CommitNode, prevHash: string) {
        let prevNode: CommitNode;
        if(this._commitMap.has(prevHash)) {
            prevNode = this._commitMap.get(prevHash)!;
        } else {
            prevNode = new CommitNode(prevHash);
        }
        prevNode.nextNodes.push(currNode);

        this._commitMap.set(prevHash, prevNode);
    }
}