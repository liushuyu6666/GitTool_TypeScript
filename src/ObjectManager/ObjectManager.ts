import { CommitMap } from "./CommitMap/CommitMap";
import { Entrance } from "./Entrance/Entrance";
import { GitObjectContainer } from "./GitObjectContainer/GitObjectContainer";
import { PackMapContainer } from "./PackMap/PackMapContainer";



export class ObjectManager {
    private _looseFilePaths: string[];

    private _packedFilePaths: string[];

    private _outObjectDir: string | undefined;

    public gitObjectContainer: GitObjectContainer;

    public entrance: Entrance;

    public packMapContainer: PackMapContainer;

    public commitMap: CommitMap;

    constructor(looseFilePaths: string[], packedFilePaths: string[], outObjectDir?: string) {
        this._looseFilePaths = looseFilePaths;
        this._packedFilePaths = packedFilePaths;
        this._outObjectDir = outObjectDir;

        this.gitObjectContainer = new GitObjectContainer(this._looseFilePaths, this._packedFilePaths);
        this.packMapContainer = new PackMapContainer(this.gitObjectContainer.allObjectsContainer);
        this.entrance = new Entrance(this.gitObjectContainer.packedObjectsContainer, this.gitObjectContainer.looseObjectsContainer);
        this.commitMap = new CommitMap();
    }

    parseObjects() {
        this.entrance.parsePackedObjects(this.commitMap, this._outObjectDir);
        this.entrance.parseLooseObjects(this.commitMap, this._outObjectDir);
    }

    gitObjectToJson(): Object[] {
        const gitObjectJson: Object[] = [];
        for (const gitObject of this.gitObjectContainer.looseObjectsContainer.concat(this.gitObjectContainer.packedObjectsContainer)) {
            gitObjectJson.push(gitObject.toJson());
        }
        return gitObjectJson
    }

    packMapToJson(): Object[] {
        const json: Object[] = [];
        for(const [key, {prevHash, nextHashes}] of this.packMapContainer.packMap.entries()) {
            json.push(
                {
                    hash: key,
                    prevHash,
                    nextHashes: Array.from(nextHashes)
                }
            );
        }
        return json;
    }
}