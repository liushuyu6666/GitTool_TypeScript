import { GitObjectContainer } from "../../../src/ObjectManager/GitObjectContainer/GitObjectContainer"

describe("Test the GitObjectContainer class,", () => {
    let gitObjectContainer: GitObjectContainer;

    describe("upon loose file path:", () => {
        beforeEach(() => {
            gitObjectContainer = new GitObjectContainer();
        });

        test("to generate a blob object.", () => {
            gitObjectContainer.generateLooseObject((global as any).fakeBlobFilePath);
            expect(gitObjectContainer.looseObjectsContainer).toMatchSnapshot();
        });

        test("to generate a tree object.", () => {
            gitObjectContainer.generateLooseObject((global as any).fakeTreeFilePath);
            expect(gitObjectContainer.looseObjectsContainer).toMatchSnapshot();
        });

        test("to generate a commit object.", () => {
            gitObjectContainer.generateLooseObject((global as any).fakeCommitFilePath);
            expect(gitObjectContainer.looseObjectsContainer).toMatchSnapshot();
        });
    });
    
    describe("upon packed file path:", () => {
        beforeEach(() => {
            gitObjectContainer = new GitObjectContainer();
        });

        test("to generate packed objects from one file.", () => {
            const fakePackedFilePaths = (global as any).fakePackedFilePaths;
            const fakePackedFilePath1: string = fakePackedFilePaths[0];

            gitObjectContainer.generatePackedObjects(fakePackedFilePath1);

            expect(gitObjectContainer.packedObjectsContainer).toMatchSnapshot();
        });
    })
})