import { FileManager } from "../../src/FileManager/FileManager";
import path from 'path';
import fs from 'fs';

describe("Test FileManager class", () => {
    // The location of the example test case.
    const inDir = 'testCases/example/git'; 
    const gitObjectPath = path.join(inDir, 'objects');

    // The location of the info directory.
    const infoRoot = 'testCases/example/info'; // The location of the example test case info.
    const looseFilePaths = path.join(infoRoot, 'looseFilePaths.json');
    const packedFilePaths = path.join(infoRoot, 'packedFilePaths.json');

    const outDir = 'outDir';

    const fileManager = new FileManager(inDir, outDir);

    describe("for its properties, setter and getter:", () => {
        test("should return the right object path.", () => {
            expect(fileManager.objectPath).toBe(gitObjectPath);
        })
    });

    describe("for its methods:", () => {
        test("should return all loose file paths.", () => {
            const path = fileManager.getLooseFilePaths();
            const expectPath = JSON.parse(fs.readFileSync(looseFilePaths, 'utf8'));
            expect(path).toEqual(expectPath);
        });

        test("should return all packed file paths without extension.", () => {
            const path = fileManager.getPackedFilePaths();
            const expectPath = JSON.parse(fs.readFileSync(packedFilePaths, 'utf8'));
            expect(path).toEqual(expectPath);
        })
    })
})