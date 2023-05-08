import { readFileSync } from "fs";
import { GitObjectType } from "../../../src/Enum/GitObjectType";
import { CommitObjectInfo } from "../../../src/ObjectManager/ContentParser/commitParser";
import { GitTreeObjectFileEntry } from "../../../src/ObjectManager/ContentParser/treeParser";
import undeltifiedParser from "../../../src/ObjectManager/ContentParser/undeltifiedParser";

describe('Test undeltifiedParser,', () => {
    test('for parsing blob_delta object', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack';
        const startIdx = 125383;
        const endIdx = 125954;
        const type = GitObjectType.BLOB_DELTA;

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);

        const data = undeltifiedParser(body, type) as any as string;

        expect(data.substring(0, 26)).toBe(`import 'isomorphic-fetch';`);
        expect(data.length).toBe(1392);
    });

    test('for parsing tree_delta object', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack';
        const startIdx = 4524;
        const endIdx = 4995;
        const type = GitObjectType.TREE_DELTA;

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);

        const data = undeltifiedParser(body, type) as any as GitTreeObjectFileEntry[];

        expect(data.length).toBe(14);
    });

    test('for parsing commit_delta object', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-b4156662b80c15137b9186ec1a170d80307d9b2a.pack';
        const startIdx = 44230;
        const endIdx = 44445;
        const type = GitObjectType.COMMIT_DELTA;

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);

        const data = undeltifiedParser(body, type) as any as CommitObjectInfo;

        expect(data.hash.treeHash).toBe('d1b421f8873e2dcedabdec670428910ba1bc51d3');
    })
})