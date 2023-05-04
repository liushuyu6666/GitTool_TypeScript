import sortRecords from "../../src/utils/sortRecords";

describe("Test sortRecords function,", () => {
    test("the function should sort the record by its key.", () => {
        const records: Record<string, number> = {
            "fourth": 4,
            "second": 2,
            "first": 1,
            "third": 3,
            "sixth": 6,
        };
        const expects: Record<string, number> = {
            "first": 1,
            "second": 2,
            "third": 3,
            "fourth": 4,
            "sixth": 6
        };

        const sorted = sortRecords(records);
        expect(sorted).toEqual(expects);
    })
})