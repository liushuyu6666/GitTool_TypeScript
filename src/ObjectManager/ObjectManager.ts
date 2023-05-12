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

    constructor(looseFilePaths: string[], packedFilePaths: string[], outObjectDir?: string) {
        this._looseFilePaths = looseFilePaths;
        this._packedFilePaths = packedFilePaths;
        this._outObjectDir = outObjectDir;

        this.gitObjectContainer = new GitObjectContainer(this._looseFilePaths, this._packedFilePaths);
        this.packMapContainer = new PackMapContainer(this.gitObjectContainer.looseObjectsContainer);
        this.entrance = new Entrance();
        
        this.generateEntrance();
    }

    generateEntrance(): void {
        for(const packedGitObject of this.gitObjectContainer.packedObjectsContainer) {
            this.entrance.insertGitObject(packedGitObject);
        }
        console.log(`entrance is generated.`);
    }

    // TODO: Better to make the input parameter of the looseObjectParser to be the gitObject
    parsePackedObjects() {
        if(!this.entrance || this.entrance.entranceFiles.length === 0) {
            this.generateEntrance();
        }

        this.entrance.parse(this._outObjectDir);
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