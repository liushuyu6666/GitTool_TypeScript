import { readFileSync } from "fs";
import { DotPackFileGenerator } from "../../../src/ObjectManager/ObjectGenerator/DotPackFileGenerator"
import path from 'path';

describe("Test DotPackFileGenerator class", () => {
    let dotPackFileGenerator: DotPackFileGenerator;

    // TODO: these variables are used in multiple test cases.
    // The location of the info directory.
    const infoRoot = 'testCases/example/info'; // The location of the example test case info.
    const infoPackedFilePaths = path.join(infoRoot, 'packedFilePaths.json');
    const entryPath = path.join(infoRoot, 'entry.json');
    const packedFilePaths = JSON.parse(readFileSync(infoPackedFilePaths, 'utf8'));
    const entries = JSON.parse(readFileSync(entryPath, 'utf8'));
    const infoOffset = path.join(infoRoot, 'offset.json');
    const expectedOffsets: Record<string, Record<string, number>> = JSON.parse(readFileSync(infoOffset, 'utf8'));

    describe("upon pack-5fec731b51ec842da6351423114d4bbee41e7aee.", () => {
        const filePath = packedFilePaths[1];
        const offsets = expectedOffsets['pack-5fec731b51ec842da6351423114d4bbee41e7aee'];
        const entry = entries['pack-5fec731b51ec842da6351423114d4bbee41e7aee'];

        beforeAll(() => {
            dotPackFileGenerator = new DotPackFileGenerator(`${filePath}.pack`, offsets);
        });

        test("Layer 1 should be PACK", () => {
            expect(dotPackFileGenerator.layer1).toBe('PACK');
        });

        test("Layer 2 should be 2", () => {
            expect(dotPackFileGenerator.layer2).toBe(2);
        });

        test("Layer 4 should be deciphered correctly", () => {
            expect(dotPackFileGenerator.layer4).toEqual(entry);
        })
    });

    describe("upon pack-13db2d43ae1f4fdae2330a69de993bbc2c619246e.", () => {
        const filePath = packedFilePaths[0];
        const offsets = expectedOffsets['pack-13db2d43ae1f4fdae2330a69de993bbc2c619246'];
        const entry = entries['pack-13db2d43ae1f4fdae2330a69de993bbc2c619246'];

        beforeAll(() => {
            dotPackFileGenerator = new DotPackFileGenerator(`${filePath}.pack`, offsets);
        });

        test("Layer 1 should be PACK", () => {
            expect(dotPackFileGenerator.layer1).toBe('PACK');
        });

        test("Layer 2 should be 2", () => {
            expect(dotPackFileGenerator.layer2).toBe(2);
        });

        test("Layer 4 should be deciphered correctly", () => {
            expect(dotPackFileGenerator.layer4).toEqual(entry);
        });
    })
})