import { GitObject } from "../GitObject/GitObject";
import { LooseObjectGenerator } from "./ObjectGenerator/LooseObjectGenerator";
import { PackedObjectsGenerator } from "./ObjectGenerator/PackedObjectsGenerator";

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

    constructor(looseFilePaths: string[], packedFilePath: string[]) {
        this._looseFilePaths = looseFilePaths;
        this._packedFilePaths = packedFilePath;
        this._gitObjects = [];
    }

    generateGitObjects(): GitObject[] {
        let packedSum = 0;
        for(const looseFilePath of this._looseFilePaths) {
            const looseObjectGenerator = new LooseObjectGenerator(looseFilePath);
            this.gitObjects.push(looseObjectGenerator.generateGitObjects());
        }
        console.log(`${this._looseFilePaths.length} loose git objects are generated.`);
        for(const packedFilePath of this._packedFilePaths) {
            const packedObjectsGenerator = new PackedObjectsGenerator(packedFilePath);
            const packedObjects = packedObjectsGenerator.generateGitObjects();
            this.gitObjects = this.gitObjects.concat(packedObjects);

            packedSum += packedObjects.length;
        }
        console.log(`${packedSum} packed git objects are generated.`);
        console.log(`${this._looseFilePaths.length + packedSum} git objects are generated in total.`);
        return this.gitObjects;
    }
}