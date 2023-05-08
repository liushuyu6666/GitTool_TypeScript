import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';
import commitParser from '../../../src/ObjectManager/ContentParser/commitParser';

describe('Test commitParser function', () => {
    test('for parsing the loose commit object properly.', () => {
        const filePath =
            'testCases/prodExample/git/objects/03/ad3ec20a59305503cdcef6667e50fa94edc563';
        const startIdx = 11;
        const endIdx = 279;

        const content = readFileSync(filePath);
        const decryptedBuf = inflateSync(content);
        const body = decryptedBuf.subarray(startIdx, endIdx);
        const data = commitParser(body);

        expect(data.hash.treeHash).toBe('56d45faf43f5e5acd80836af1d00edddeb0bc8a2');
    });

    test('for parsing the packed commit object properly.', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-b4156662b80c15137b9186ec1a170d80307d9b2a.pack';
        const startIdx = 44230;
        const endIdx = 44445;

        const content = readFileSync(filePath);
        const body = content.subarray(startIdx, endIdx);
        const decryptedBuf = inflateSync(body);
        const data = commitParser(decryptedBuf);
        
        expect(data.hash.treeHash).toBe('d1b421f8873e2dcedabdec670428910ba1bc51d3');
    });
});
