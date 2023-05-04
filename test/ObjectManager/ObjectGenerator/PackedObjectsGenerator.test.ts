import { readFileSync } from "fs";
import { PackedObjectsGenerator } from "../../../src/ObjectManager/ObjectGenerator/PackedObjectsGenerator"

describe("Test PackedObjectsGenerator class", () => {
    let packedObjectsGenerator: PackedObjectsGenerator;

    describe("upon the test case.", () => {
        // TODO: fill in configuration.
        const expectPath = 'testCases/example/info/pack-5fec731b51ec842da6351423114d4bbee41e7aee.json';
        const objectRoot = 'testCases/example/git/objects/pack/pack-5fec731b51ec842da6351423114d4bbee41e7aee';

        beforeAll(() => {
            packedObjectsGenerator = new PackedObjectsGenerator(objectRoot);
        });

        test("The generateGitObjects method should generate all gitObjects in the pack-5fec731b51ec842da6351423114d4bbee41e7aee", () => {
            const actuals = packedObjectsGenerator.generateGitObjects();
            expect(actuals).toEqual(JSON.parse(readFileSync(expectPath, 'utf8')));
        });
    });

    describe("upon the prod repository.", () => {
        // TODO: fill in configuration.
        const expectPath = 'testCases/prodExample/info/pack-6525f361652375f49c5cbd639d3f18d9dc780dcc.json';
        const objectRoot = 'testCases/prodExample/git/objects/pack/pack-6525f361652375f49c5cbd639d3f18d9dc780dcc';

        beforeAll(() => {
            packedObjectsGenerator = new PackedObjectsGenerator(objectRoot);
        });

        test("The generateGitObjects method should generate all gitObjects in the pack-6525f361652375f49c5cbd639d3f18d9dc780dcc", () => {
            const actuals = packedObjectsGenerator.generateGitObjects();
            expect(actuals).toEqual(JSON.parse(readFileSync(expectPath, 'utf8')));
        })
    })
});