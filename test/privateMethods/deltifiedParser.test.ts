import { inflateSync } from 'zlib';
import { GitObjectType } from '../../src/Enum/GitObjectType';
import { undeltifiedParser } from '../../src/privateMethods/undeltifiedParser';
import { deltifiedParser } from '../../src/privateMethods/deltifiedParser';

describe('Test the deltifiedParser methods in the Entrance class,', () => {
    test('for deltified_blob object, the newBuffer should be parsed by the undeltifiedParser properly', () => {
        const baseBuffer: Buffer = inflateSync((global as any).fakeBlobDelta);
        const fakeDeltifiedBlob: Buffer = (global as any).fakeDeltifiedBlob;
        const decryptedBuf = inflateSync(fakeDeltifiedBlob);
        const [_, __, newBuffer] = deltifiedParser(decryptedBuf, baseBuffer);

        const data = undeltifiedParser(newBuffer, GitObjectType.BLOB_DELTA);

        expect(data).toMatchSnapshot();
    });

    test('for deltified_tree object, the newBuffer should be parsed by the undeltifiedParser properly', () => {
        const baseBuffer: Buffer = inflateSync((global as any).fakeTreeDelta);
        const fakeDeltifiedTree: Buffer = (global as any).fakeDeltifiedTree;
        const decryptedBuf = inflateSync(fakeDeltifiedTree);
        const [_, __, newBuffer] = deltifiedParser(decryptedBuf, baseBuffer);

        const data = undeltifiedParser(newBuffer, GitObjectType.TREE_DELTA);

        expect(data).toMatchSnapshot();
    });

    test('for deltified_commit object, the newBuffer should be parsed by the undeltifiedParser properly', () => {
        const baseBuffer: Buffer = inflateSync((global as any).fakeCommitDelta);
        const fakeDeltifiedCommit: Buffer = (global as any).fakeDeltifiedCommit;
        const decryptedBuf = inflateSync(fakeDeltifiedCommit);
        const [_, __, newBuffer] = deltifiedParser(decryptedBuf, baseBuffer);

        const data = undeltifiedParser(newBuffer, GitObjectType.COMMIT_DELTA);

        expect(data).toMatchSnapshot();
    });
});
