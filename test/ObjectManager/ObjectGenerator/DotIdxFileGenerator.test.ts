import { DotIdxFileGenerator } from "../../../src/ObjectManager/ObjectGenerator/DotIdxFileGenerator";
import { readFileSync } from 'fs';
import path from 'path';

// TODO: Archive this class as all logic had been moved to PackedObjectsGenerator
// TODO: re-organize testCases/example/info/ to keep these intermediate variables.


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
});

describe("Test DotIdxFileGenerator class upon the product repository,", () => {
    let dotIdxFileGenerator: DotIdxFileGenerator;

    beforeEach(() => {
        const filePath = 'testCases/prodExample/git/objects/pack/pack-6525f361652375f49c5cbd639d3f18d9dc780dcc.idx';
        dotIdxFileGenerator = new DotIdxFileGenerator(filePath);
    })

    test("The offset should be generated properly.", () => {
        const offsets = dotIdxFileGenerator.fanout.offsets;
        expect(Object.keys(offsets).length).toBe(118);
    })
})