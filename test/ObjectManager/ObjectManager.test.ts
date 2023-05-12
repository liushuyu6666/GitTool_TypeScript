import { readFileSync } from "fs";
import { ObjectManager } from "../../src/ObjectManager/ObjectManager"

describe("Test ObjectManager class", () => {
    let objectManager: ObjectManager;

    describe("upon prod repository.", () => {
        beforeAll(() => {
            const looseFilePaths: string[] = JSON.parse(readFileSync('testCases/prodExample/info/looseFilePaths.json', 'utf8'));
            const packedFilePaths: string[] = JSON.parse(readFileSync('testCases/prodExample/info/packedFilePaths.json', 'utf8'));
            const outObjectDir: string = 'outDir/objects';
            objectManager = new ObjectManager(looseFilePaths, packedFilePaths, outObjectDir);
        });

        test("generateGitObjects method should generate all gitObjects properly.", () => {
            objectManager.generateGitObjects();
            expect(objectManager.gitObjects.length).toBe(16901);
        });

        // objectManager.gitObjects.length != objectManager.packMap.size
        // because there are some duplicated entries in the gitObjects.
        test("generatePackMap method should generate PackMap for further process.", () => {
            objectManager.generatePackMap();
            expect(objectManager.packMap.size).toBe(16287);
        });

        test("generateEntrance method should generate a entrance with 16 entranceFiles", () => {
            objectManager.generateEntrance();
            expect(objectManager.entrance.entranceFiles.length).toBe(16);
        });

        test("parseContent method should parse all objects properly and store them in the right folder.", () => {
            objectManager.parsePackedObjects();
        });
    });
})