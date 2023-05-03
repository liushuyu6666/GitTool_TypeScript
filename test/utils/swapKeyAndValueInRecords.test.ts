import swapKeyAndValueInRecords from '../../src/utils/swapKeyAndValueInRecords';

describe("The swapKeyAndValueInRecords function", () => {
    test("should swap the key and value", () => {
        const records: Record<string, number> = {
            "123": 123456,
            "345": 345678,
            "456": 456789
        };
        const swapRecords = swapKeyAndValueInRecords(records);
        
        expect(swapRecords).toEqual({
            123456: "123",
            345678: "345",
            456789: "456"
        });

    })
})