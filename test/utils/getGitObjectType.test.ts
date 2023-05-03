import getGitObjectType, { GitPackObjectType } from "../../src/utils/getGitObjectType"

describe("Test getGitObjectType function", () => {
    describe("when the type of the input parameter is a number,", () => {
        test("it should return the right type", () => {
            for(let typeNumber of Object.keys(GitPackObjectType)) {
                expect(getGitObjectType(Number(typeNumber))).toBe(GitPackObjectType[Number(typeNumber)]);
            }
        })
    })
})