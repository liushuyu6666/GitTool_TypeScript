import exactMatchArray, { exactMatch } from '../../src/utils/exactMatchArray';

describe("Test exactMatch and exactMatchArray functions.", () => {
    describe("Test exactMatch function:", () => {
        test("exactMatch should be false.", () => {
            const string = 'pack';
            const pattern = new RegExp(/^info$/);
            expect(exactMatch(string, pattern)).toBe(false);
        });

        test("exactMatch should be true.", () => {
            const string = 'pack';
            const pattern = new RegExp(/^pack$/);
            expect(exactMatch(string, pattern)).toBe(true);
        })
    });

    describe("Test exactMatchArray function:", () => {
        test("exactMatchArray should be false.", () => {
            const string = 'pack';
            const pattern = [new RegExp(/^info$/), new RegExp(/^object$/)];
            expect(exactMatchArray(string, pattern)).toBe(false);
        });

        test("exactMatchArray should be true.", () => {
            const string = 'pack';
            const pattern = [new RegExp(/^info$/), new RegExp(/^pack$/)];
            expect(exactMatchArray(string, pattern)).toBe(true);
        });
    });
})