import { BufferVarint } from "../../src/Buffer/BufferVarint"

describe("Test BufferVarint class", () => {
    let bufferVarint: BufferVarint;

    describe("in the BE mode:", () => {
        beforeEach(() => {
            bufferVarint = new BufferVarint();
        });

        test("The getFirstVarintWithType function should return the right type and a 4-bit variable-length integer with the end index for a 1-byte buffer.", () => {
            const expBuf = Buffer.from([0b00111101]); // type: 011; data: 1101
            const [[actualBuf, idx], type] = bufferVarint.getFirstVarintWithType(expBuf);
            expect(actualBuf).toEqual(Buffer.from([0b00001101]));
            expect(idx).toEqual(1);
            expect(type).toEqual(3);

            // expect: 208 =          11010000
            // receive: 6 128 =  00000110 10000000
        });

        test("The getFirstVarintWithType function should return the right type and a variable-length integer with the end index", () => {
            const expBuf = Buffer.from(
                [
                    0b10111101, 
                    0b11010010, 
                    0b10110110, 
                    0b00111001
                ]
            ); // type: 011; data: 00000001 10110100 10011011 00111001
            const [[actualBuf, idx], type] = bufferVarint.getFirstVarintWithType(expBuf);
            expect(actualBuf).toEqual(Buffer.from([0b00000001, 0b10110100, 0b10011011, 0b00111001]));
            expect(idx).toEqual(4);
            expect(type).toEqual(3);
        });
    })
})