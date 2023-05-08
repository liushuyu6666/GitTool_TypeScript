import { GitObjectType } from "../../../src/Enum/GitObjectType";
import { CommitObjectInfo } from "../../../src/ObjectManager/ContentParser/commitParser";
import looseParser from "../../../src/ObjectManager/ContentParser/looseParser";
import { GitTreeObjectFileEntry } from "../../../src/ObjectManager/ContentParser/treeParser";

describe('Test looseObjectParser,', () => {
    test('for parsing blob object', () => {
        const filePath =
            'testCases/prodExample/git/objects/6e/2e2f807d5beb52bab4d672e335495b30dcb9ee';
        const startIdx = 9;
        const endIdx = 449;
        const type = GitObjectType.BLOB;

        const data = looseParser(filePath, startIdx, endIdx, type) as any as string;

        expect(data.substring(0, 20)).toBe('// eslint-disable-ne');
    });

    test('for parsing tree object', () => {
        const filePath =
            'testCases/prodExample/git/objects/f3/6108462c88b76aa014a4a298c7def1ac5fd572';
        const startIdx = 8;
        const endIdx = 37;
        const type = GitObjectType.TREE;

        const data = looseParser(filePath, startIdx, endIdx, type) as any as GitTreeObjectFileEntry[];

        expect(data[0].hash).toBe('ea155cab231708e49c486f23fadf1eda5b7c46d4');
    });

    test('for parsing commit object', () => {
        const filePath =
            'testCases/prodExample/git/objects/03/ad3ec20a59305503cdcef6667e50fa94edc563';
        const startIdx = 11;
        const endIdx = 279;
        const type = GitObjectType.COMMIT;

        const data = looseParser(filePath, startIdx, endIdx, type) as any as CommitObjectInfo;

        expect(data.hash.treeHash).toBe('56d45faf43f5e5acd80836af1d00edddeb0bc8a2');
    })
})