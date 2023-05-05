import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';
import treeParser from '../../../src/ObjectManager/ContentParser.ts/treeParser';

describe('Test treeParser function', () => {
    test('for parsing the loose tree object properly.', () => {
        const filePath =
            'testCases/prodExample/git/objects/f3/6108462c88b76aa014a4a298c7def1ac5fd572';
        const startIdx = 8;
        const endIdx = 37;

        const content = readFileSync(filePath);
        const decryptedBuf = inflateSync(content);
        const body = decryptedBuf.subarray(startIdx, endIdx);
        const data = treeParser(body);

        expect(data[0].hash).toBe('ea155cab231708e49c486f23fadf1eda5b7c46d4');
    });

    test('for parsing the packed tree object properly.', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack';
        const startIdx = 4524;
        const endIdx = 4995;

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);
        const decryptedBuf = inflateSync(body);
        const data = treeParser(decryptedBuf);
        
        expect(data.length).toBe(14);
    });
});
