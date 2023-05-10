import { Entrance } from "../../src/ObjectManager/Entrance"

describe("Test the Entrance class,", () => {
    let entrance: Entrance;

    beforeAll(() => {
        entrance = new Entrance();
    });

    test("to build the Entrance properly.", () => {
        entrance.insertGitObject((global as any).objectBlobDelta);
        entrance.insertGitObject((global as any).objectDeltifiedBlob);
        entrance.insertGitObject((global as any).objectTreeDelta);
        entrance.insertGitObject((global as any).objectDeltifiedTree);
        entrance.insertGitObject((global as any).objectCommitDelta);
        entrance.insertGitObject((global as any).objectDeltifiedCommit);

        expect(entrance.entranceFiles.length).toBe(3);
        expect(entrance.entranceFiles.map(enf => enf.filePath)).toEqual([
            "testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack",
            "testCases/prodExample/git/objects/pack/pack-25f18e15f9f7da53f70b8a7e724678e1e028a4a2.pack",
            "testCases/prodExample/git/objects/pack/pack-b4156662b80c15137b9186ec1a170d80307d9b2a.pack"
        ]);
    });

    test("to parse the Entrance properly without error.", () => {
        entrance.parse('test/ObjectManager/__snapshots__');
    })
})