import convertRecordToArray from "../../src/utils/convertRecordToArray";

describe("Test convertRecordToArray function", () => {
    test("the function should convert a record to an array", () => {
        const record: Record<string, number> = 
        {
            "7c556ca93b467f8f8247acf522915f2f9e048eb5": 12,
            "d44f8c06583e525e7885ec701c04a067e061bd94": 174
        };
        const array = [
            {
                hash: "7c556ca93b467f8f8247acf522915f2f9e048eb5",
                offset: 12
            },
            {
                hash: "d44f8c06583e525e7885ec701c04a067e061bd94",
                offset: 174
            }
        ];
        expect(convertRecordToArray(record, "hash", "offset")).toEqual(array);
    })
})