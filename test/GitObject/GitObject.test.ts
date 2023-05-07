import { GitObjectType } from "../../src/Enum/GitObjectType";
import { GitObject } from "../../src/GitObject/GitObject"

describe("Test GitObject class", () => {
    let gitObject: GitObject;
    const hash = '0155eb4229851634a0f03eb265b69f5a2d56f341';
    const gitObjectType = GitObjectType.BLOB;
    const size = 20;
    const baseHash = '0155eb4229851634a0f03eb265b69f5a2d56f348';
    const filePath = '.git/objects/01/55eb4229851634a0f03eb265b69f5a2d56f348';
    const startIdx = 128;
    const endIdx = 821;

    describe("for its all properties, setter and getter:", () => {

        beforeAll(() => {
            gitObject = new GitObject(hash);
        });
    
        test("should return the right hash.", () => {
            expect(gitObject.hash).toBe(hash); 
        });
    
        test("should return the right gitObjectType.", () => {
            gitObject.gitObjectType = gitObjectType;
            expect(gitObject.gitObjectType).toBe(gitObjectType); 
        });
    
        test("should return the right size.", () => {
            gitObject.size = size;
            expect(gitObject.size).toBe(size); 
        });
    
        test("should return the right hashBase.", () => {
            gitObject.baseHash = baseHash;
            expect(gitObject.baseHash).toBe(baseHash); 
        });

        test("should return the right filePath.", () => {
            gitObject.filePath = filePath;
            expect(gitObject.filePath).toBe(filePath); 
        });

        test("should return the right startIdx.", () => {
            gitObject.startIdx = startIdx;
            expect(gitObject.startIdx).toBe(startIdx); 
        });

        test("should return the right endIdx.", () => {
            gitObject.endIdx = endIdx;
            expect(gitObject.endIdx).toBe(endIdx); 
        });
    })

    describe("for its all methods:", () => {
        beforeAll(() => {
            gitObject = new GitObject(
                hash, 
                gitObjectType, 
                size, 
                baseHash, 
                filePath, 
                startIdx, 
                endIdx
            );
        });

        test("toJson should return correct json string.", () => {
            const expectJson = {
                baseHash: baseHash,
                endIdx: endIdx,
                filePath: filePath,
                gitObjectType: gitObjectType,
                hash: hash,
                size: size,
                startIdx: startIdx,
            };
            expect(gitObject.toJson()).toEqual(expectJson);
        })
    })

    
})