import { Git } from "../../src/Git/Git"

// TODO: THIS IS NOT A TEST FILE, just for debug the break of the size of gitObjects and packMap.
// gitObjects = 16901, packMap = 16287
describe("Test Git class", () => {
    let git: Git;

    describe("upon prod repository.", () => {
        beforeAll(() => {
            git = new Git('testCases/prodExample/git', '');
        });

        test("The method saveGitObjectToMongodb should save objects into mongodb", async () => {
            await git.saveGitObjectToMongodb();
            await git.savePackMapToMongodb();
        })
    })
})