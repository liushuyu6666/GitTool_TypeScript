import { DotIdxFileGenerator } from "../../../src/ObjectManager/ObjectGenerator/DotIdxFileGenerator";
import { readFileSync } from 'fs';
import path from 'path';

describe("Test DotIdxFileGenerator class:", () => {
    let dotIdxFileGenerator: DotIdxFileGenerator;

    // TODO: these variables are used in multiple test cases.
    // The location of the info directory.
    const infoRoot = 'testCases/example/info'; // The location of the example test case info.
    const infoPackedFilePaths = path.join(infoRoot, 'packedFilePaths.json');
    const infoOffset = path.join(infoRoot, 'offset.json');
    const packedFilePaths = JSON.parse(readFileSync(infoPackedFilePaths, 'utf8'));
    const expectedOffsets: Record<string, string[]> = JSON.parse(readFileSync(infoOffset, 'utf8'));

    describe("The first .idx file", () => {
        const packedFilePath: string = packedFilePaths[0];
        const hash = packedFilePath.substring(packedFilePath.lastIndexOf('/') + 1);

        beforeAll(() => {
            dotIdxFileGenerator = new DotIdxFileGenerator(`${packedFilePath}.idx`);
        });
    
        test("should have the same fanout offset as the one in testCases/example/info/offset.json.", () => {
            expect(dotIdxFileGenerator.fanout.offsets).toEqual(expectedOffsets[hash]);
        });

        test("should have version 2", () => {
            expect(dotIdxFileGenerator.versionNumber).toBe(2);
        });

        test("should have [255, 116, 79, 99] in the header", () => {
            expect(dotIdxFileGenerator.header).toEqual([255, 116, 79, 99]);
        });
    });

    describe("The second .idx file", () => {
        const packedFilePath: string = packedFilePaths[1];
        const hash = packedFilePath.substring(packedFilePath.lastIndexOf('/') + 1);

        beforeAll(() => {
            dotIdxFileGenerator = new DotIdxFileGenerator(`${packedFilePath}.idx`);
        });
    
        test("should have the same fanout offset as the one in testCases/example/info/offset.json.", () => {
            expect(dotIdxFileGenerator.fanout.offsets).toEqual(expectedOffsets[hash]);
        });

        test("should have version 2", () => {
            expect(dotIdxFileGenerator.versionNumber).toBe(2);
        });

        test("should have [255, 116, 79, 99] in the header", () => {
            expect(dotIdxFileGenerator.header).toEqual([255, 116, 79, 99]);
        });
    });
})