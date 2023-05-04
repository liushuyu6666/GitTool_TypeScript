import { FileManager } from "../../src/FileManager/FileManager";
import path from 'path';
import fs, { readFileSync } from 'fs';

// TODO: all test files need to be re-organized
describe("Test FileManager class", () => {
    let fileManager: FileManager;

    describe("upon the example test cases", () => {
        // The location of the example test case.
        const inDir = 'testCases/example/git'; 
        const gitObjectPath = path.join(inDir, 'objects');

        // The location of the info directory.
        const infoRoot = 'testCases/example/info'; // The location of the example test case info.
        const looseFilePaths = path.join(infoRoot, 'looseFilePaths.json');
        const packedFilePaths = path.join(infoRoot, 'packedFilePaths.json');

        const outDir = 'outDir';

        fileManager = new FileManager(inDir, outDir);

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
            });

            test("should save json file into the local mongodb", async () => {
                const json = [
                    {
                        name: 'tester1',
                        age: 11
                    },
                    {
                        name: 'tester2',
                        age: 12
                    }];
                await fileManager.saveJsonToMongodb('test', json);
            })
        });
    });

    describe("upon the prod repository.", () => {
        const inDir = "testCases/prodExample/git";
        const outDir = "outDir";

        beforeAll(() => {
            fileManager = new FileManager(inDir, outDir);
        });

        test("The looseFilePaths method should return the right paths", () => {
            const looseFilePaths = fileManager.getLooseFilePaths();
            const expectPaths = JSON.parse(readFileSync('testCases/prodExample/info/looseFilePaths.json', 'utf8'));
            expect(looseFilePaths).toEqual(expectPaths);
        });

        test("The packedFilePaths method should return the right paths", () => {
            const packedFilePaths = fileManager.getPackedFilePaths();
            const expectPaths = JSON.parse(readFileSync('testCases/prodExample/info/packedFilePaths.json', 'utf8'));
            expect(packedFilePaths).toEqual(expectPaths);
        });
    });
})