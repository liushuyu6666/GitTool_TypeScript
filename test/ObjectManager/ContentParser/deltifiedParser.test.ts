import { readFileSync } from "fs";
import { inflateSync } from "zlib";
import deltifiedParser from "../../../src/ObjectManager/ContentParser.ts/deltifiedParser";

describe('Test blobParser function,', () => {
    let baseContent: string;
    beforeAll(() => {
        baseContent = JSON.parse(readFileSync('testCases/prodExample/info/bbc679138a183e60ea3f2c15d84f4f536b70c16e', 'utf8'));
    });

    test('to get the base object size and deltified object size properly', () => {
        // console.log(baseContent);
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack';
        const startIdx = 22696;
        const endIdx = 22761;
        // baseHash = 'bbc679138a183e60ea3f2c15d84f4f536b70c16e';
        // hash = '4327b9e2fc5fc324892732a6017f347519306191'

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);
        const decryptedBuf = inflateSync(body);
        const [baseObjectSize, deltifiedObjectSize, deltifiedContent] = deltifiedParser(decryptedBuf, baseContent);

        expect(baseObjectSize).toBe(1392);
        expect(deltifiedObjectSize).toBe(1464);
        expect(deltifiedContent.substring(0, 26)).toBe("import 'isomorphic-fetch';");
    })
})