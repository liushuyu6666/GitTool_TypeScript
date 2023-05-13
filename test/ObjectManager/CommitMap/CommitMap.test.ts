import { CommitMap } from '../../../src/ObjectManager/CommitMap/CommitMap';
import { CommitObjectInfo } from '../../../src/ObjectManager/ContentParser/commitParser';

describe('Test the CommitMap class', () => {
    let commitMap: CommitMap;

    /**
     *                           +-> commit2.1 -> commit2.3 -+
     *                           |                           |
     *  commitHeader -> commit1 -+                           +--> commit3
     *                           |                           |
     *                           +-> commit2.2 --------------+
     *
     */
    beforeAll(() => {
        commitMap = new CommitMap();
        const fakeCommits = (global as any).fakeCommits as CommitObjectInfo[];
        for (const commit of fakeCommits) {
            commitMap.insertCommitObjectInfo(commit);
        }
    });

    test('on the insertCommitObjectInfo method', () => {
        expect(commitMap.commitHeader).toMatchSnapshot();
        expect(commitMap.commitHeader.firstNode).toMatchSnapshot();
        expect(commitMap.commitInfoMap).toMatchSnapshot();
        expect(
            commitMap.commitHeader.firstNode[0].nextNodes[0].nextNodes[0]
                .nextNodes[0] ===
                commitMap.commitHeader.firstNode[0].nextNodes[1].nextNodes[0],
        ).toBe(true);
    });
});
