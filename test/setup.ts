import { readFileSync } from "fs";
import { GitObject } from "../src/GitObject/GitObject";
import { GitObjectType } from "../src/Enum/GitObjectType";

export default function() {
    // TODO: should be configured in the .env
    const fakeObjects = JSON.parse(readFileSync('test/fixture/mock_objects.json', 'utf8'));

    (global as any).fakeBlobDelta = getFakeObject(fakeObjects['blob_delta']);
    (global as any).fakeTreeDelta = getFakeObject(fakeObjects['tree_delta']);
    (global as any).fakeCommitDelta = getFakeObject(fakeObjects['commit_delta']);
    (global as any).fakeDeltifiedBlob = getFakeObject(fakeObjects['deltified_blob']);
    (global as any).fakeDeltifiedTree = getFakeObject(fakeObjects['deltified_tree']);
    (global as any).fakeDeltifiedCommit = getFakeObject(fakeObjects['deltified_commit']);

    (global as any).objectBlobDelta = generateGitObject(fakeObjects['blob_delta']);
    (global as any).objectTreeDelta = generateGitObject(fakeObjects['tree_delta']);
    (global as any).objectCommitDelta = generateGitObject(fakeObjects['commit_delta']);
    (global as any).objectDeltifiedBlob = generateGitObject(fakeObjects['deltified_blob']);
    (global as any).objectDeltifiedTree = generateGitObject(fakeObjects['deltified_tree']);
    (global as any).objectDeltifiedCommit = generateGitObject(fakeObjects['deltified_commit']);

}

interface FakeObject {
    hash: string;
    size: number;
    type: GitObjectType;
    baseHash?: string;
    filePath: string;
    startIdx: number;
    endIdx: number;
}
function getFakeObject (object: FakeObject) {
    const filePath = object.filePath;
    const startIdx = object.startIdx;
    const endIdx = object.endIdx;
    const content = readFileSync(filePath);
    return content.subarray(startIdx, endIdx);
}

function generateGitObject (object: FakeObject) {
    return new GitObject(
        object.hash,
        object.type,
        object.size,
        object.baseHash,
        object.filePath,
        object.startIdx,
        object.endIdx
    )
}