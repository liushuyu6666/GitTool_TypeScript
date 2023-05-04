import { readFileSync } from "fs";
import { ObjectManager } from "../../src/ObjectManager/ObjectManager"

describe("Test ObjectManager class", () => {
    let objectManager: ObjectManager;

    describe("upon prod repository.", () => {

        beforeAll(() => {
            const looseFilePaths: string[] = JSON.parse(readFileSync('testCases/prodExample/info/looseFilePaths.json', 'utf8'));
            const packedFilePaths: string[] = JSON.parse(readFileSync('testCases/prodExample/info/packedFilePaths.json', 'utf8'));
            objectManager = new ObjectManager(looseFilePaths, packedFilePaths);
        });

        test("ObjectManager should generate all gitObjects properly", () => {
            objectManager.generateGitObjects();
            expect(objectManager.gitObjects.length).toBe(16901);
        })
    });
})