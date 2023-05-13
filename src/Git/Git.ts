import { MongoClient } from "mongodb";
import { FileManager } from "../FileManager/FileManager";
import { ObjectManager } from "../ObjectManager/ObjectManager";

// TODO: move dotenv variables to the configuration manager
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export class Git {
    public fileManager: FileManager;

    public objectManager: ObjectManager;

    constructor(inDir: string, outDir: string) {
        this.fileManager = new FileManager(inDir, outDir);
        const looseFilePaths = this.fileManager.inDir.looseFilePaths;
        const packedFilePaths = this.fileManager.inDir.packedFilePaths;
        this.objectManager = new ObjectManager(looseFilePaths, packedFilePaths);
    }

    public async saveGitObjectToMongodb() {
        // TODO: should move to configuration
        // TODO: should check if we need a wrapper function to wrap all functions which need to use the mongodb.
        const mongoUri = process.env.MONGO_URI ?? '';
        const mongoClient = await MongoClient.connect(mongoUri);
        const json = this.objectManager.gitObjectToJson();

        this.fileManager.saveJsonToMongodb(mongoClient, 'gitObjects', json);
    }

    public async savePackMapToMongodb() {
        // TODO: should move to configuration
        // TODO: should check if we need a wrapper function to wrap all functions which need to use the mongodb.
        const mongoUri = process.env.MONGO_URI ?? '';
        const mongoClient = await MongoClient.connect(mongoUri);
        const json = this.objectManager.packMapToJson();

        this.fileManager.saveJsonToMongodb(mongoClient, 'packMap', json);
    }
}