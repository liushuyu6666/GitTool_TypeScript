import { BufferVarint } from '../../src/Buffer/BufferVarint';

describe('Test BufferVarint class', () => {
    let bufferVarint: BufferVarint;

    describe('in the BE mode:', () => {
        beforeEach(() => {
            bufferVarint = new BufferVarint();
        });

        test('The getOffset function should return the right value.', () => {
            expect(bufferVarint.getOffset(1)).toBe(0);
            expect(bufferVarint.getOffset(2)).toBe(128);
            expect(bufferVarint.getOffset(3)).toBe(16512);
            expect(bufferVarint.getOffset(4)).toBe(2113664);
            expect(bufferVarint.getOffset(5)).toBe(270549120);
        });

        test('The getFirstVarintWithType function should return the right type and a 4-bit variable-length integer with the end index for a 1-byte buffer.', () => {
            const buf = Buffer.from([0b00111101]); // type: 011; data: 1101
            const [[size, idx], type] =
                bufferVarint.getFirstVarintWithType(buf);
            expect(size).toEqual(13);
            expect(idx).toEqual(1);
            expect(type).toEqual(3);
        });

        test('The getFirstVarintWithType function should return the right type and a variable-length integer with the end index', () => {
            const buf = Buffer.from([
                0b10111101, 0b11010010, 0b10110110, 0b00111001,
            ]); // type: 011; data: 00000001 10110100 10011011 00111001
            const [[size, idx], type] =
                bufferVarint.getFirstVarintWithType(buf);
            expect(size).toEqual(28613433);
            expect(idx).toEqual(4);
            expect(type).toEqual(3);
        });

        test('The get getAddInstruction function should transfer the content.', () => {
            const buf = Buffer.from([
                0b00000101,
                0b01101000,
                0b01100101,
                0b01101100,
                0b01101100,
                0b01101111,
            ]);
            const [content, endIdx] = bufferVarint.getAddInstruction(buf);
            expect(content).toBe("hello");
            expect(endIdx).toBe(6);
        });
    });

    describe('In the LE mode:', () => {
        beforeEach(() => {
            bufferVarint = new BufferVarint(false);
        });

        test('The getCopyInstruction function should work when the header is 0b11111111', () => {
            const copyInstruction = Buffer.from([
                0b11111111, 0b11001101, 0b00100110, 0b10101010, 0b00111111,
                0b00000100, 0b01000000, 0b00100111,
            ]);
            const [offset, size, endIdx] =
                bufferVarint.getCopyInstruction(copyInstruction);
            expect(offset).toBe(1068115661);
            expect(size).toBe(2572292);
            expect(endIdx).toBe(8);
        });

        test('The getCopyInstruction function should work when the header is 0b10101001', () => {
            const copyInstruction = Buffer.from([
                0b10101001, 0b11001101, 0b10101010, 0b00111111,
            ]);
            // header = 0b1 010 (size) 1001 (offset)
            const [offset, size, endIdx] =
                bufferVarint.getCopyInstruction(copyInstruction);
            expect(offset).toBe(2852126925);
            expect(size).toBe(16128);
            expect(endIdx).toBe(4);
        });

        test('The getCopyInstruction function should work when the header is 0b00000000', () => {
            const copyInstruction = Buffer.from([0b10000000]);
            // header = 0b1 010 (size) 1001 (offset)
            const [offset, size, endIdx] =
                bufferVarint.getCopyInstruction(copyInstruction);
            expect(offset).toBe(0);
            expect(size).toBe(0x10000);
            expect(endIdx).toBe(1);
        });
    });
});
