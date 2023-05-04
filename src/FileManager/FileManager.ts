import exactMatchArray from "../utils/exactMatchArray";
import { FileManagerInterface } from "./FileManagerInterface";
import { MongoClient } from 'mongodb';
import path from 'path';
import fs from 'fs';

// TODO: move dotenv variables to the configuration manager
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export class FileManager implements FileManagerInterface {
    private _inDir: string;
    private _outDir: string;
    public objectPath: string;

    constructor(inDir: string, outDir: string) {
        this._inDir = inDir;
        this._outDir = outDir;
        this.objectPath = path.join(this._inDir, 'objects');
    }
    
    /**
     * 
     * @param dir The directory to start, all file paths will be counted under this folder.
     * @param filePaths The result array, always start with an empty array.
     * @param filterRegexToExclude An array of all directory names to exclude.
     * @returns 
    */
    private listAllSubordinatesDFS(dir: string, filePaths: string[], filterRegexToExclude: RegExp[]): string[] {
        this._outDir;
        const currFolder = dir.split(path.sep).pop();
        if (currFolder && exactMatchArray(currFolder, filterRegexToExclude)) {
            return filePaths;
        }
    
        const subordinates = fs.readdirSync(dir, {
            encoding: null,
            withFileTypes: true,
        });
    
        const currFilePaths: string[] = subordinates
            .filter((sub) => !sub.isDirectory())
            .map((sub) => path.join(dir, sub.name));
    
        filePaths = filePaths.concat(currFilePaths);
    
        const dirs = subordinates.filter((sub) => sub.isDirectory());
    
        for (let i = 0; i < dirs.length; i++) {
            const sub = dirs[i];
            const currDir = path.join(dir, sub.name);
            filePaths = this.listAllSubordinatesDFS(currDir, filePaths, filterRegexToExclude);
        }
    
        return filePaths;
    }

    public getLooseFilePaths(): string[] {
        return this.listAllSubordinatesDFS(this.objectPath, [], [/^info$/, /^pack$/]);
    }

    public getPackedFilePaths(): string[] {
        const files = this.listAllSubordinatesDFS(
            this.objectPath,
            [],
            [/^info$/, /^[0-9a-z]{2}$/],
        );
      
        const noExtension = files.map((file) => {
            const lastIndex = file.lastIndexOf('.');
            return file.substring(0, lastIndex);
        });
      
        const set = new Set(noExtension);
      
        return Array.from(set.values());
    }

    public async saveJsonToMongodb(colName: string, json: any) {
        const mongoUri = process.env.MONGO_URI ?? '';
        const client = await MongoClient.connect(mongoUri);
        const db = client.db();
        const collection = db.collection(colName);
        await collection.insertMany(json);
        await client.close();
    }
}