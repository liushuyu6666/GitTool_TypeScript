import { Fanout } from "../../src/archive/Fanout";
import { readFileSync } from 'fs';
import path from 'path';

// TODO: Archive this class as all logic had been moved to PackedObjectsGenerator
// TODO: re-organize testCases/example/info/ to keep these intermediate variables.

describe("Test the offset in the Fanout class:", () => {
    let fanout: Fanout;
    
    // TODO: these variables are used in multiple test cases.
    // The location of the info directory.
    const infoRoot = 'testCases/example/info'; // The location of the example test case info.
    const infoPackedFilePaths = path.join(infoRoot, 'packedFilePaths.json');
    const infoOffset = path.join(infoRoot, 'offset.json');
    const packedFilePaths = JSON.parse(readFileSync(infoPackedFilePaths, 'utf8'));
    const expectedOffsets: Record<string, Record<string, number>> = JSON.parse(readFileSync(infoOffset, 'utf8'));

    describe("The fanout table in the first .idx file", () => {
        const packedFilePath: string = packedFilePaths[0];
        const hash = packedFilePath.substring(packedFilePath.lastIndexOf('/') + 1);
        const content = readFileSync(`${packedFilePath}.idx`);

        beforeAll(() => {
            fanout = new Fanout(content);
        });
    
        test("should be the same as the one in testCases/example/info/offset.json.", () => {
            expect(fanout.offsets).toEqual(expectedOffsets[hash]);
        })
    });

    describe("The fanout table in the second .idx file", () => {
        const packedFilePath: string = packedFilePaths[1];
        const hash = packedFilePath.substring(packedFilePath.lastIndexOf('/') + 1);
        const content = readFileSync(`${packedFilePath}.idx`);

        beforeAll(() => {
            fanout = new Fanout(content);
        });
    
        test("should be the same as the one in testCases/example/info/offset.json.", () => {
            expect(fanout.offsets).toEqual(expectedOffsets[hash]);
        })
    });
    
})