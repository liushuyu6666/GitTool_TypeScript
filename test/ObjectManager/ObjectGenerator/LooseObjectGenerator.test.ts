import { GitObjectType } from "../../../src/Enum/GitObjectType";
import { GitObject } from "../../../src/GitObject/GitObject";
import { LooseObjectGenerator } from "../../../src/ObjectManager/ObjectGenerator/LooseObjectGenerator"

describe("Test LooseObjectGenerator class", () => {
    let looseObjectGenerator: LooseObjectGenerator;
    let gitObject : GitObject;

    describe("upon 00fea2f4d78299c796a53ecbd9b59938a97e6d67.", () => {
        beforeAll(() => {
            const filePath = 'testCases/example/git/objects/00/fea2f4d78299c796a53ecbd9b59938a97e6d67';
            looseObjectGenerator = new LooseObjectGenerator(filePath);
            gitObject = looseObjectGenerator.generateGitObjects();
        });

        test("It should return the right hash.", () => {
            expect(gitObject.hash).toBe('00fea2f4d78299c796a53ecbd9b59938a97e6d67');
        });

        test("It should return the right start index and end index.", () => {
            expect(gitObject.startIdx).toBe(8);
            expect(gitObject.endIdx).toBe(85);
        });

        test("It should return the right type.", () => {
            expect(gitObject.gitObjectType).toBe(GitObjectType.BLOB);
        });
    });

    describe("upon 7c556ca93b467f8f8247acf522915f2f9e048eb5.", () => {
        beforeAll(() => {
            const filePath = 'testCases/example/git/objects/7c/556ca93b467f8f8247acf522915f2f9e048eb5';
            looseObjectGenerator = new LooseObjectGenerator(filePath);
            gitObject = looseObjectGenerator.generateGitObjects();
        });

        test("It should return the right hash.", () => {
            expect(gitObject.hash).toBe('7c556ca93b467f8f8247acf522915f2f9e048eb5');
        });

        test("It should return the right start index and end index.", () => {
            expect(gitObject.startIdx).toBe(11);
            expect(gitObject.endIdx).toBe(253);
        });

        test("It should return the right type.", () => {
            expect(gitObject.gitObjectType).toBe(GitObjectType.COMMIT);
        });
    });
})