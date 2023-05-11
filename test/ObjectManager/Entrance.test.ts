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
            expect(entrance).toMatchSnapshot();
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
            expect(entrance).toMatchSnapshot();
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
         *       entranceFile1     entranceFile2
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
            expect(entrance).toMatchSnapshot()
        });

        test("to parse the Entrance properly without error.", () => {
            // TODO: configurable
            entrance.parse('test/ObjectManager/__snapshots__');
        });
    });

    describe("with a tag object and its 2 ofs_delta childs,", () => {
        /**
         *                   Entrance
         *                      |
         *                 entranceFile
         *                      |
         *                 entranceNode
         *             +--------+--------+
         *             |                 |
         *       entranceNode       entranceNode
         *
         */
        beforeAll(() => {
            entrance = new Entrance();
            entrance.insertGitObject((global as any).tagDelta);
            entrance.insertGitObject((global as any).deltifiedTag1);
            entrance.insertGitObject((global as any).deltifiedTag2);
        });

        test("to build the Entrance with 1 entranceFiles and 3 entranceNode properly.", () => {
            expect(entrance).toMatchSnapshot()
        });

        test("to parse the Entrance properly without error.", () => {
            // TODO: configurable
            entrance.parse('test/ObjectManager/__snapshots__');
        });
    });
});