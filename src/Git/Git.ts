import { FileManager } from "../FileManager/FileManager";
import { ObjectManager } from "../ObjectManager/ObjectManager";

export class Git {
    private _fileManager: FileManager;

    private _objectManager: ObjectManager;

    constructor(inDir: string, outDir: string) {
        this._fileManager = new FileManager(inDir, outDir);
        const looseFilePaths = this._fileManager.getLooseFilePaths();
        const packedFilePaths = this._fileManager.getPackedFilePaths();
        this._objectManager = new ObjectManager(looseFilePaths, packedFilePaths);
    }

    inflation() {
        this._objectManager.generateGitObjects();
        const gitObjectsJson = this._objectManager.gitObjectToJson();
        this._fileManager.saveJsonToMongodb('gitObjects', gitObjectsJson);

        this._objectManager.generatePackMap();
        const packMapJson = this._objectManager.packMapToJson();
        this._fileManager.saveJsonToMongodb('packMap', packMapJson);
    }
}