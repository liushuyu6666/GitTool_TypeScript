import { readFileSync } from "fs";
import { DotPackFileGenerator } from "../../src/archive/DotPackFileGenerator"
import path from 'path';

// TODO: Archive this class as all logic had been moved to PackedObjectsGenerator
// TODO: re-organize testCases/example/info/ to keep these intermediate variables.

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

        test("entries should be deciphered correctly", () => {
            expect(dotPackFileGenerator.entries).toEqual(entry);
        })
    });

    describe("upon pack-13db2d43ae1f4fdae2330a69de993bbc2c619246e.", () => {
        const filePath = packedFilePaths[0];
        const offsets = expectedOffsets['pack-13db2d43ae1f4fdae2330a69de993bbc2c619246'];
        const entry = entries['pack-13db2d43ae1f4fdae2330a69de993bbc2c619246'];

        beforeAll(() => {
            dotPackFileGenerator = new DotPackFileGenerator(`${filePath}.pack`, offsets);
        });

        test("entries should be deciphered correctly", () => {
            expect(dotPackFileGenerator.entries).toEqual(entry);
        });
    });
});

describe("Test DotPackFileGenerator class upon the product repository,", () => {
    let dotPackFileGenerator: DotPackFileGenerator;

    beforeEach(() => {
        const offsetFilePath = 'testCases/prodExample/info/offset.json';
        const offsets = JSON.parse(readFileSync(offsetFilePath, 'utf8'));
        const filePath = 'testCases/prodExample/git/objects/pack/pack-6525f361652375f49c5cbd639d3f18d9dc780dcc.pack';
        dotPackFileGenerator = new DotPackFileGenerator(filePath, offsets);
    });

    test("the parseLayer4 method should return an Entry array", () => {
        const entries = dotPackFileGenerator.entries;
        const expectEntries = JSON.parse(readFileSync('testCases/prodExample/info/entries.json', 'utf8'));
        expect(entries).toEqual(expectEntries);
    });

    test("the generateGitObjects method should return an GitObject array", () => {
        const gitObjects = dotPackFileGenerator.generateGitObjects();
        const expectGitObjects = JSON.parse(readFileSync('testCases/prodExample/info/gitObjects.json', 'utf8'));
        expect(gitObjects).toEqual(expectGitObjects);
    })
});