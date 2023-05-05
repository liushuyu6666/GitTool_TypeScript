import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';
import blobParser from '../../../src/ObjectManager/ContentParser.ts/blobParser';

describe('Test blobParser function', () => {
    test('for parsing the loose blob object properly.', () => {
        const filePath =
            'testCases/prodExample/git/objects/6e/2e2f807d5beb52bab4d672e335495b30dcb9ee';
        const startIdx = 9;
        const endIdx = 449;

        const content = readFileSync(filePath);
        const decryptedBuf = inflateSync(content);
        const body = decryptedBuf.subarray(startIdx, endIdx);
        const data = blobParser(body);

        expect(data.substring(0, 20)).toBe('// eslint-disable-ne');
    });

    test('for parsing the packed blob object properly.', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack';
        const startIdx = 125383;
        const endIdx = 125954;

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);
        const decryptedBuf = inflateSync(body);
        const data = blobParser(decryptedBuf);
        
        expect(data.substring(0, 26)).toBe(`import 'isomorphic-fetch';`);
    });
});
