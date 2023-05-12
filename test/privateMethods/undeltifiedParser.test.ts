import { inflateSync } from "zlib";
import { GitObjectType } from "../../src/Enum/GitObjectType";
import { undeltifiedParser } from "../../src/privateMethods/undeltifiedParser";
import { GitTreeObjectFileEntry } from "../../src/ObjectManager/ContentParser/treeParser";
import { CommitObjectInfo } from "../../src/ObjectManager/ContentParser/commitParser";

describe('Test the undeltifiedParser method in the Entrance class,', () => {
    test('for parsing blob_delta object', () => {
        const fakeBlobDelta: Buffer = (global as any).fakeBlobDelta;
        const decryptedBuf = inflateSync(fakeBlobDelta);
        const data = undeltifiedParser(decryptedBuf, GitObjectType.BLOB_DELTA) as any as string;

        expect(data.substring(0, 26)).toBe(`import 'isomorphic-fetch';`);
    });

    test('for parsing tree_delta object', () => {
        const fakeTreeDelta: Buffer = (global as any).fakeTreeDelta;
        const decryptedBuf = inflateSync(fakeTreeDelta);
        const data = undeltifiedParser(decryptedBuf, GitObjectType.TREE_DELTA) as any as GitTreeObjectFileEntry[];

        expect(data).toMatchSnapshot();
    });

    test('for parsing commit_delta object', () => {
        const fakeCommitDelta: Buffer = (global as any).fakeCommitDelta;
        const decryptedBuf = inflateSync(fakeCommitDelta);
        const data = undeltifiedParser(decryptedBuf, GitObjectType.COMMIT_DELTA) as any as CommitObjectInfo;

        expect(data).toMatchSnapshot();
    });
})