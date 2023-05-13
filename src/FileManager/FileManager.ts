import exactMatchArray from "../utils/exactMatchArray";
import { MongoClient } from 'mongodb';
import path from 'path';
import fs from 'fs';

// TODO: move dotenv variables to the configuration manager
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export interface OutDirInterface {
    outRoot: string;
    outObjectPath: string;
}

export interface InDirInterface {
    inRoot: string;
    inObjectPath: string;
    looseFilePaths: string[];
    packedFilePaths: string[];
}

export class FileManager {
    public inDir: InDirInterface;
    public outDir: OutDirInterface;

    constructor(inDir: string, outDir: string) {
        const inObjectPath = path.join(inDir, 'objects');
        const outObjectPath = path.join(outDir, 'objects');
        
        this.inDir = {
            inRoot: inDir,
            inObjectPath,
            looseFilePaths: this.getLooseFilePaths(inObjectPath),
            packedFilePaths: this.getPackedFilePaths(inObjectPath)
        };
        this.outDir = {
            outRoot: outDir,
            outObjectPath
        }
    }
    
    /**
     * 
     * @param dir The directory to start, all file paths will be counted under this folder.
     * @param filePaths The result array, always start with an empty array.
     * @param filterRegexToExclude An array of all directory names to exclude.
     * @returns 
    */
    private _listAllSubordinatesDFS(dir: string, filePaths: string[], filterRegexToExclude: RegExp[]): string[] {
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
            filePaths = this._listAllSubordinatesDFS(currDir, filePaths, filterRegexToExclude);
        }
    
        return filePaths;
    }

    public getLooseFilePaths(objectPath: string): string[] {
        return this._listAllSubordinatesDFS(objectPath, [], [/^info$/, /^pack$/]);
    }

    public getPackedFilePaths(objectPath: string): string[] {
        const files = this._listAllSubordinatesDFS(
            objectPath,
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

    public async saveJsonToMongodb(mongoClient: MongoClient, colName: string, json: any) {
        const db = mongoClient.db();
        if(!this._hasCollection(mongoClient, colName)) {
            await db.createCollection(colName);
        } else {
            await db.collection(colName).deleteMany({});
        }
        const collection = db.collection(colName);
        await collection.insertMany(json);
        await mongoClient.close();
    }

    private async _hasCollection(mongoClient: MongoClient, colName: string): Promise<boolean> {
        const colList = await mongoClient.db().listCollections().toArray();
        return colList.filter((col) => col.name === colName).length > 0;
    }
}