import { GitObject } from "../GitObject/GitObject";
import logMemoryUsage from "../utils/logMemoryUsage";
import { LooseObjectGenerator } from "./ObjectGenerator/LooseObjectGenerator";
import { PackedObjectsGenerator } from "./ObjectGenerator/PackedObjectsGenerator";

export interface PackMapItem {
    prevHash: string;
    nextHashes: Set<string>;
}

export class ObjectManager {
    private _looseFilePaths: string[];

    private _packedFilePaths: string[];

    private _gitObjects: GitObject[];
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

    constructor(looseFilePaths: string[], packedFilePath: string[]) {
        this._looseFilePaths = looseFilePaths;
        this._packedFilePaths = packedFilePath;
        this._gitObjects = [];
        this._packMap = new Map<string, PackMapItem>();
    }

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

        console.log(`
            ${this._looseFilePaths.length} loose git objects are generated.
            ${packedSum} packed git objects are generated.
            ${this._looseFilePaths.length + packedSum} git objects are generated in total.
        `);

        logMemoryUsage();
        return this.gitObjects;
    }

    generatePackMap(): Map<string, PackMapItem> {
        let i = 0, j = 0;
        if(this.gitObjects.length === 0) {
            this.generateGitObjects();
        }
        for(const gitObject of this.gitObjects) {
            const prevHash = gitObject.baseHash ?? '';
            const currHash = gitObject.hash;

            // update nextHashes
            if(prevHash && !this._packMap.has(prevHash)) {
                this._packMap.set(prevHash, {
                    prevHash: '',
                    nextHashes: new Set<string>(currHash)
                });
                j++;
            } else if(prevHash && this._packMap.has(prevHash)) {
                this._packMap.get(prevHash)!.nextHashes.add(currHash);
                j++;
            }

            // update prevHash
            if(!this._packMap.has(currHash)) {
                this._packMap.set(currHash, {
                    prevHash: prevHash,
                    nextHashes: new Set<string>()
                });
                i++;
            } else {
                this._packMap.get(currHash)!.prevHash = prevHash;
                i++;
            }
        }

        console.log(`update prevHash ${i} times and update nextHashes ${j} times`);

        logMemoryUsage();
        return this._packMap;
    }
}