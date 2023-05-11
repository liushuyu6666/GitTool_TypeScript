import { GitObjectType } from "../../src/Enum/GitObjectType";
import { Entrance } from "../../src/ObjectManager/Entrance"

describe("Test the Entrance class:", () => {
    let entrance: Entrance;

    describe("with three undeltified objects and three deltified objects,", () => {
        beforeAll(() => {
            entrance = new Entrance();
            entrance.insertGitObject((global as any).objectBlobDelta);
            entrance.insertGitObject((global as any).objectDeltifiedBlob);
            entrance.insertGitObject((global as any).objectTreeDelta);
            entrance.insertGitObject((global as any).objectDeltifiedTree);
            entrance.insertGitObject((global as any).objectCommitDelta);
            entrance.insertGitObject((global as any).objectDeltifiedCommit);
        });
    
        test("to build the Entrance properly.", () => {
            expect(entrance.entranceFiles.length).toBe(3);
            expect(entrance.entranceFiles.map(enf => enf.filePath)).toEqual([
                "testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack",
                "testCases/prodExample/git/objects/pack/pack-25f18e15f9f7da53f70b8a7e724678e1e028a4a2.pack",
                "testCases/prodExample/git/objects/pack/pack-b4156662b80c15137b9186ec1a170d80307d9b2a.pack"
            ]);
        });
    
        test("to parse the Entrance properly without error.", () => {
            // TODO: configurable
            entrance.parse('test/ObjectManager/__snapshots__');
        });
    });

    describe("with a duplicated undeltified object,", () => {
        /**
         *                   Entrance
         *                      |
         *             +--------+--------+
         *             |                 |
         *      entranceFile1     entranceFile2
         *             |                 |
         *             +--------+--------+
         *                      |
         *                 entranceNode
         */
        beforeAll(() => {
            entrance = new Entrance();
            entrance.insertGitObject((global as any).duplicatedTreeDelta1);
            entrance.insertGitObject((global as any).duplicatedTreeDelta2);
        });

        test("to build the Entrance with 2 entranceFiles and 1 entranceNode properly.", () => {
            expect(entrance.entranceFiles.length).toBe(2);
            expect(entrance.entranceFiles[0].nextNodes.length).toBe(1);
            expect(entrance.entranceFiles[1].nextNodes.length).toBe(1);
            expect(entrance.entranceFiles[0].nextNodes[0]).toBe(entrance.entranceFiles[1].nextNodes[0]);
        });

        test("to parse the Entrance properly without error.", () => {
            // TODO: configurable
            entrance.parse('test/ObjectManager/__snapshots__');
        })
    });

    describe("with a duplicated undeltified object and its ref_delta child,", () => {
        /**
         *                   Entrance
         *                      |
         *             +--------+--------+
         *             |                 |
         *      entranceFile1     entranceFile2
         *             |                 |
         *             +--------+--------+
         *                      |
         *            entranceNode (tree_delta)
         *                      |
         *            entranceNode (ref_delta)
         */
        beforeAll(() => {
            entrance = new Entrance();
            entrance.insertGitObject((global as any).duplicatedTreeDelta1);
            entrance.insertGitObject((global as any).duplicatedTreeDelta2);
            entrance.insertGitObject((global as any).refDelta);
        });

        test("to build the Entrance with 2 entranceFiles and 2 entranceNode properly.", () => {
            expect(entrance.entranceFiles.length).toBe(2);
            expect(entrance.entranceFiles[0].nextNodes.length).toBe(1);
            expect(entrance.entranceFiles[1].nextNodes.length).toBe(1);
            expect(entrance.entranceFiles[0].nextNodes[0]).toBe(entrance.entranceFiles[1].nextNodes[0]);
            expect(entrance.entranceFiles[0].nextNodes[0].nextNodes[0].hash).toBe('a3f9482f80267d75bfc46517c5e76f00ebf0e8e6');
            expect(entrance.entranceFiles[0].nextNodes[0].nextNodes[0].distributions[0].type).toBe(GitObjectType.REF_DELTA);
        });

        test("to parse the Entrance properly without error.", () => {
            // TODO: configurable
            entrance.parse('test/ObjectManager/__snapshots__');
        });
    })
});