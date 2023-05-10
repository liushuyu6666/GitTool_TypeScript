import { readFileSync } from 'fs';
// import { inflateSync } from 'zlib';
import { inflateSync } from 'zlib';
import deltifiedParser from '../../../src/ObjectManager/ContentParser/deltifiedParser';
import treeParser from '../../../src/ObjectManager/ContentParser/treeParser';

describe('Test deltifiedParser function,', () => {
    test('to parse the deltified blob object.', () => {
        const baseContent = JSON.parse(
            readFileSync(
                'testCases/prodExample/info/bbc679138a183e60ea3f2c15d84f4f536b70c16e',
                'utf8',
            ),
        );
        const baseContentBuf = Buffer.from(baseContent);
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-13995ffd6c5efdbeb96104a3c58d178c73a77926.pack';
        const startIdx = 22696;
        const endIdx = 22761;
        // baseHash = 'bbc679138a183e60ea3f2c15d84f4f536b70c16e';
        // hash = '4327b9e2fc5fc324892732a6017f347519306191'

        const content = readFileSync(filePath);
        const deltaBody = content.subarray(startIdx, endIdx);
        const decryptedDeltaBody = inflateSync(deltaBody);
        const [baseObjectSize, deltifiedObjectSize, finalBuffer] =
            deltifiedParser(decryptedDeltaBody, baseContentBuf);

        expect(baseObjectSize).toBe(1392);
        expect(deltifiedObjectSize).toBe(1464);
        expect(finalBuffer.toString().substring(0, 26)).toBe(
            "import 'isomorphic-fetch';",
        );
    });

    test('to pares the deltified tree object', () => {
        const filePath =
            'testCases/prodExample/git/objects/pack/pack-25f18e15f9f7da53f70b8a7e724678e1e028a4a2.pack';
        const currDotPack = readFileSync(filePath);
        const baseBody = currDotPack.subarray(223375, 223847);
        const baseContentBuf = inflateSync(baseBody);
        // console.log(treeParser(baseContentBuf.subarray(0, 445)));

        const deltaBody = currDotPack.subarray(224356, 224428);
        const decryptedDeltaBody = inflateSync(deltaBody);
        const [_, __, finalBuffer] = deltifiedParser(decryptedDeltaBody, baseContentBuf);

        const treeObjects = treeParser(finalBuffer); 

        // TODO: store in a file.
        const file1 = treeObjects.find((item) => item.pointer === 'services');
        expect(file1?.hash).toBe('475571f009d6def727ea01db9e6a5e3882fe0cb0');

        const file2 = treeObjects.find((item) => item.pointer === 'test');
        expect(file2?.hash).toBe('82b8b611e989ff5f0eef8cfd1d35b17a5930b4e9');

        const file3 = treeObjects.find((item) => item.pointer === 'utils');
        expect(file3?.hash).toBe('e1e0063367663e034d3517f3e78cb9c2d2a85410');
    });
});
