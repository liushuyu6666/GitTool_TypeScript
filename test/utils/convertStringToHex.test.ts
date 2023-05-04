import convertStringToHex from "../../src/utils/convertStringToHex";

describe("Test convertStringToHex function,", () => {
    test("it should return a byte array.", () => {
        const hexString = '530c0df30bbf796ec9fa97c06c8fbee732e97d70';
        const hex = convertStringToHex(hexString);
        expect(hex.length).toEqual(20);
    })
})