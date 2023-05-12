import { Entrance } from "./Entrance";
import { GitObjectContainer } from "./GitObjectContainer/GitObjectContainer";

export interface PackMapItem {
    prevHash: string;
    nextHashes: Set<string>;
}

export class ObjectManager {
    private _looseFilePaths: string[];

    private _packedFilePaths: string[];

    private _outObjectDir: string | undefined;

    private _gitObjectContainer: GitObjectContainer;

    public entrance: Entrance;

    private _packMap: Map<string, PackMapItem>;

    public get packMap(): Map<string, PackMapItem> {
        return this._packMap;
    }
    public set packMap(value: Map<string, PackMapItem>) {
        this._packMap = value;
    }

    constructor(looseFilePaths: string[], packedFilePaths: string[], outObjectDir?: string) {
        this._looseFilePaths = looseFilePaths;
        this._packedFilePaths = packedFilePaths;
        this._outObjectDir = outObjectDir;
        this._gitObjectContainer = new GitObjectContainer();

        this.generateGitObjects();
        this._packMap = new Map<string, PackMapItem>();
        this.entrance = new Entrance();
        
    }

    // There are some duplicated gitObjects.
    generateGitObjects() {
        for(const looseFilePath of this._looseFilePaths) {
            this._gitObjectContainer.generateLooseObject(looseFilePath);
        }
        for(const packedFilePath of this._packedFilePaths) {
            this._gitObjectContainer.generatePackedObjects(packedFilePath);
        }

        console.log(`${this._gitObjectContainer.looseObjectsContainer.length} loose git objects are generated.\n${this._gitObjectContainer.packedObjectsContainer.length} packed git objects are generated.`);

        // logMemoryUsage();
    }

    generatePackMap(): Map<string, PackMapItem> {
        for(const gitObject of this._gitObjectContainer.looseObjectsContainer.concat(this._gitObjectContainer.packedObjectsContainer)) {
            const prevHash = gitObject.baseHash ?? '';
            const currHash = gitObject.hash;

            // update nextHashes
            if(prevHash && !this._packMap.has(prevHash)) {
                this._packMap.set(prevHash, {
                    prevHash: '',
                    nextHashes: new Set<string>([currHash])
                });
            } else if(prevHash && this._packMap.has(prevHash)) {
                this._packMap.get(prevHash)!.nextHashes.add(currHash);
            }

            // update prevHash
            if(!this._packMap.has(currHash)) {
                this._packMap.set(currHash, {
                    prevHash: prevHash,
                    nextHashes: new Set<string>()
                });
            } else {
                this._packMap.get(currHash)!.prevHash = prevHash;
            }
        }
        console.log(`${this._packMap.size} packMap are generated.`);
        // logMemoryUsage();
        return this._packMap;
    }

    generateEntrance(): Entrance {
        for(const packedGitObject of this._gitObjectContainer.packedObjectsContainer) {
            this.entrance.insertGitObject(packedGitObject);
        }
        console.log(`entrance is generated.`);
        return this.entrance;
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
        for (const gitObject of this._gitObjectContainer.looseObjectsContainer.concat(this._gitObjectContainer.packedObjectsContainer)) {
            gitObjectJson.push(gitObject.toJson());
        }
        return gitObjectJson
    }

    packMapToJson(): Object[] {
        const json: Object[] = [];
        for(const [key, {prevHash, nextHashes}] of this._packMap.entries()) {
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