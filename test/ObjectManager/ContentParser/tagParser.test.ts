import { readFileSync } from "fs";
import { inflateSync } from "zlib";
import tagParser from "../../../src/ObjectManager/ContentParser/tagParser";

describe('Test tagParser function', () => {
    test('for parsing the packed tag object properly.', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-25f18e15f9f7da53f70b8a7e724678e1e028a4a2.pack';
        const startIdx = 9865;
        const endIdx = 10004;

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);
        const decryptedBuf = inflateSync(body);
        const tagObjectInfo = tagParser(decryptedBuf);
        
        expect(tagObjectInfo.commitHash).toBe('9315f57de8a9410b4458f7db2b0633c30735806f');
        expect(tagObjectInfo.tagNumber).toBe('v20211229_1.24');
        expect(tagObjectInfo.message).toBe('New Release');
    });
});