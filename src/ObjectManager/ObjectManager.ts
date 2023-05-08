import { Entrance } from "../Entrance/Entrance";
import { GitObject } from "../GitObject/GitObject";
import { isLooseObject } from "../utils/getGitObjectType";
import { LooseObjectGenerator } from "./ObjectGenerator/LooseObjectGenerator";
import { PackedObjectsGenerator } from "./ObjectGenerator/PackedObjectsGenerator";
import { LooseObjectParser } from "./ContentParser/contentParse";

export interface PackMapItem {
    prevHash: string;
    nextHashes: Set<string>;
}

export class ObjectManager {
    private _looseFilePaths: string[];

    private _packedFilePaths: string[];

    private _outObjectDir: string | undefined;

    private _gitObjects: GitObject[];

    public entrance: Entrance;
    public get gitObjects(): GitObject[] {
        return this._gitObjects;
    }
    public set gitObjects(value: GitObject[]) {
        this._gitObjects = value;
    }

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
        this._gitObjects = [];
        this._packMap = new Map<string, PackMapItem>();
        this.entrance = new Entrance();
        this._outObjectDir = outObjectDir;
    }

    // There are some duplicated entries in the gitObjects.
    generateGitObjects(): GitObject[] {
        let packedSum = 0;
        for(const looseFilePath of this._looseFilePaths) {
            const looseObjectGenerator = new LooseObjectGenerator(looseFilePath);
            this.gitObjects.push(looseObjectGenerator.generateGitObjects());
        }
        for(const packedFilePath of this._packedFilePaths) {
            const packedObjectsGenerator = new PackedObjectsGenerator(packedFilePath);
            const packedObjects = packedObjectsGenerator.generateGitObjects();
            this.gitObjects = this.gitObjects.concat(packedObjects);

            packedSum += packedObjects.length;
        }

        console.log(`${this._looseFilePaths.length} loose git objects are generated.\n${packedSum} packed git objects are generated.\n${this._looseFilePaths.length + packedSum} git objects are generated in total.
        `);

        // logMemoryUsage();
        return this.gitObjects;
    }

    generatePackMap(): Map<string, PackMapItem> {
        if(this.gitObjects && this.gitObjects.length === 0) {
            this.generateGitObjects();
        }
        for(const gitObject of this.gitObjects) {
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
        if(this.gitObjects && this.gitObjects.length === 0) {
            this.generateGitObjects();
        }
        for(const gitObject of this.gitObjects) {
            if(!isLooseObject(gitObject.gitObjectType!)){
                this.entrance.insertGitObject(gitObject);}
        }
        console.log(`entrance is generated.`);
        return this.entrance;
    }

    parseContent() {
        if(!this._outObjectDir) {
            console.error('outObjectDir is not specified!');
            return;
        }
        if(this.gitObjects && this.gitObjects.length === 0) {
            this.generateGitObjects();
        }
        for(const gitObject of this._gitObjects) {
            LooseObjectParser(gitObject, this._outObjectDir);
        }
    }

    gitObjectToJson(): Object[] {
        const gitObjectJson: Object[] = [];
        for (const gitObject of this.gitObjects) {
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