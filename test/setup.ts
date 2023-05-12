import { readFileSync } from "fs";
import { GitObjectType } from "../src/Enum/GitObjectType";
import { GitObject } from "../src/ObjectManager/GitObjectContainer/GitObjectContainer";

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

    (global as any).duplicatedTreeDelta1 = generateGitObject(fakeObjects['duplicated_tree_delta_1']);
    (global as any).duplicatedTreeDelta2 = generateGitObject(fakeObjects['duplicated_tree_delta_2']);
    (global as any).refDelta = generateGitObject(fakeObjects['ref_delta']);

    (global as any).tagDelta = generateGitObject(fakeObjects['tag_delta']);
    (global as any).deltifiedTag1 = generateGitObject(fakeObjects['deltified_tag_1']);
    (global as any).deltifiedTag2 = generateGitObject(fakeObjects['deltified_tag_2']);


    const fakeFilePaths = JSON.parse(readFileSync('test/fixture/mock_file_paths.json', 'utf8'));
    const looseFilePaths = fakeFilePaths['looseFileSamples'];
    const packedFilePaths = fakeFilePaths['packedFilePaths'];
    const prodLooseFilePaths = fakeFilePaths['looseFilePaths'];
    const outDir = fakeFilePaths['outFile'];

    (global as any).fakeBlobFilePath = looseFilePaths['blob'];
    (global as any).fakeTreeFilePath = looseFilePaths['tree'];
    (global as any).fakeCommitFilePath = looseFilePaths['commit'];
    (global as any).fakePackedFilePaths = packedFilePaths;
    (global as any).fakeLooseFilePaths = prodLooseFilePaths;
    (global as any).outDir = outDir;
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