import { BufferVarint } from "../../src/Buffer/BufferVarint"

describe("Test BufferVarint class", () => {
    let bufferVarint: BufferVarint;

    describe("in the BE mode:", () => {
        beforeEach(() => {
            bufferVarint = new BufferVarint();
        });

        test("The getFirstVarintWithType function should return the right type and a 4-bit variable-length integer with the end index for a 1-byte buffer.", () => {
            const buf = Buffer.from([0b00111101]); // type: 011; data: 1101
            const [[size, idx], type] = bufferVarint.getFirstVarintWithType(buf);
            expect(size).toEqual(13);
            expect(idx).toEqual(1);
            expect(type).toEqual(3);
        });

        test("The getFirstVarintWithType function should return the right type and a variable-length integer with the end index", () => {
            const buf = Buffer.from(
                [
                    0b10111101, 
                    0b11010010, 
                    0b10110110, 
                    0b00111001
                ]
            ); // type: 011; data: 00000001 10110100 10011011 00111001
            const [[size, idx], type] = bufferVarint.getFirstVarintWithType(buf);
            expect(size).toEqual(28613433);
            expect(idx).toEqual(4);
            expect(type).toEqual(3);
        });
    })
})