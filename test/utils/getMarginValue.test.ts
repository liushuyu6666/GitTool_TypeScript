import getMarginValue from "../../src/utils/getMarginValue";

describe('Try to get right margin value base on the number of bytes', () => {
    test('For 1 byte, we should get 0', () => {
        const byteNumber = 1;
        const marginValue = getMarginValue(byteNumber);

        expect(marginValue).toBe(0);
    });

    test('For 2 byte, we should get 128', () => {
        const byteNumber = 2;
        const marginValue = getMarginValue(byteNumber);

        expect(marginValue).toBe(128);
    });

    test('For 3 byte, we should get 128', () => {
        const byteNumber = 3;
        const marginValue = getMarginValue(byteNumber);

        expect(marginValue).toBe(16512);
    });

    test('For 4 byte, we should get 2113664', () => {
        const byteNumber = 4;
        const marginValue = getMarginValue(byteNumber);

        expect(marginValue).toBe(2113664);
    });

    test('For 5 byte, we should get 270549120', () => {
        const byteNumber = 5;
        const marginValue = getMarginValue(byteNumber);

        expect(marginValue).toBe(270549120);
    });
})