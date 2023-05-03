import { BufferManipulation } from "../../src/Buffer/BufferManipulation";

describe("Test BufferManipulation class", () => {
    let bufferManipulation: BufferManipulation;

    describe("in the BE mode (read from left to right):", () => {
        beforeEach(() => {
            bufferManipulation = new BufferManipulation(true);
        });

        test('The cleanTheShuttleTail method should wipe out 2 rightmost bits and return 0b11001100.', () => {
            bufferManipulation.shuttle = 0b11001111; // TODO: need setter and getter
            bufferManipulation.capacityOfShuttle = 2;
        
            bufferManipulation.cleanTheShuttleTail();
        
            expect(bufferManipulation.shuttle).toBe(0b11001100);
        });
      
        test('The fill method should leave all valid bits in the shuttle when the shuttle is not full.', () => {
            bufferManipulation.fill(0b11011111, 2, 5);
        
            expect(bufferManipulation.shuttle).toBe(0b01100000); // left alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(5);
        });

        test('The fill method should leave the shuttle empty and load all valid bits to the stock when there are exactly 8 valid bits in the shuttle.', () => {
            bufferManipulation.fill(0b00001111, 0, 8);
        
            expect(bufferManipulation.shuttle).toBe(0b00000000);
            expect(bufferManipulation.capacityOfShuttle).toBe(8);
            expect(bufferManipulation.stock).toEqual(Buffer.from([0b00001111]));
        });
    
        test('The fill method should leave all valid bits in the shuttle when the total valid bits of multiple input variables is less than 8.', () => {
            bufferManipulation.fill(0b01001111, 1, 6); // x10011xx
            bufferManipulation.fill(0b10101111, 2, 4); // xx10xxxx
        
            expect(bufferManipulation.shuttle).toBe(0b10011100); // left alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(1);
        });
    
        test('The fill method should load 8 leftmost bits to the stock when the total valid bits of multiple input variables is larger than 8.', () => {
            bufferManipulation.fill(0b01001111, 1, 6); // x10011xx
            bufferManipulation.fill(0b10101111, 2, 6); // xx1011xx
        
            expect(bufferManipulation.shuttle).toBe(0b10000000);
            expect(bufferManipulation.capacityOfShuttle).toBe(7);
            expect(bufferManipulation.stock).toEqual(Buffer.from([0b10011101]));
        });
    
        test('The fill method should work well when there are multiple input variables.', () => {
            bufferManipulation.fill(0b10100111, 3, 8); // 0bxxx00111 new stock: null    , shuttle: 00111xxx.
            bufferManipulation.fill(0b01010101, 1, 8); // 0bx1010101 new stock: 00111101, shuttle: 0101xxxx.
            bufferManipulation.fill(0b10010100, 1, 7); // 0bx001010x new stock: 01010010, shuttle: 10xxxxxx.
            bufferManipulation.fill(0b11111101, 0, 8); // 0b11111101 new stock: 10111111, shuttle: 01xxxxxx.
            bufferManipulation.fill(0b01010101, 3, 5); // 0bxxx10xxx new stock: null    , shuttle: 0110xxxx.
        
            // [00111101, 01010010, 10111111]
        
            expect(bufferManipulation.shuttle).toBe(0b01100000); // left alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(4);
            expect(bufferManipulation.stock).toEqual(
                Buffer.from([0b00111101, 0b01010010, 0b10111111]),
            );
        });

        test('The finish method should load the shuttle to the stock and right shift the stock when the shuttle is not full', () => {
            bufferManipulation.fill(0b10101101, 4, 8); // 0bxxxx1101
            bufferManipulation.finish();

            expect(bufferManipulation.shuttle).toBe(0b00000000);
            expect(bufferManipulation.stock).toEqual(Buffer.from([0b00001101]));
        })
    
        test('The finish method should load all left valid bits in the shuttle to the stock.', () => {
            bufferManipulation.fill(0b10100111, 3, 8); // 0bxxx00111
            bufferManipulation.fill(0b01010101, 1, 8); // 0bx1010101
            bufferManipulation.fill(0b10010100, 1, 7); // 0bx001010x
            bufferManipulation.fill(0b11111101, 0, 8); // 0b11111101
            bufferManipulation.fill(0b01010101, 3, 5); // 0bxxx10xxx
            bufferManipulation.finish();
        
            // [00000011, 11010101, 00101011,11110110]
        
            expect(bufferManipulation.shuttle).toBe(0b00000000); // left alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(8);
            expect(bufferManipulation.stock).toEqual(
                Buffer.from([0b00000011, 0b11010101, 0b00101011, 0b11110110])
            );
        });
    
        test('The readIntBE should read from the stock.', () => {
            bufferManipulation.fill(0b10100111, 3, 8); // 0bxxx00111
            bufferManipulation.fill(0b01010101, 1, 8); // 0bx1010101
            bufferManipulation.fill(0b10010100, 1, 7); // 0bx001010x
            bufferManipulation.fill(0b11111101, 0, 8); // 0b11111101
            bufferManipulation.fill(0b01010101, 3, 5); // 0bxxx10xxx
            bufferManipulation.finish();
        
            expect(bufferManipulation.readIntBE()).toBe(
                Buffer.from(
                    [
                        0b00000011,
                        0b11010101, 
                        0b00101011, 
                        0b11110110,
                    ]).readInt32BE(),
            ); // left alignment
        });
    });

    describe('in the LE mode (read from right to left):', () => {
        beforeEach(() => {
            bufferManipulation = new BufferManipulation(false);
        });
    
        test('The cleanTheShuttleTail method should wipe out 2 leftmost bits and return 0b00001111.', () => {
            bufferManipulation.shuttle = 0b11001111; // TODO: need setter and getter
            bufferManipulation.capacityOfShuttle = 2;
        
            bufferManipulation.cleanTheShuttleTail();
        
            expect(bufferManipulation.shuttle).toBe(0b00001111);
        });
    
        test('The fill method should leave all valid bits in the shuttle when the shuttle is not full.', () => {
            bufferManipulation.fill(0b11011111, 2, 5); // 0bxx011xxx
        
            expect(bufferManipulation.shuttle).toBe(0b00000011); // right alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(5);
        });
    
        test('The fill method should leave the shuttle empty and load all valid bits to the stock when there are exactly 8 valid bits in the shuttle.', () => {
            bufferManipulation.fill(0b00001111, 0, 8);
        
            expect(bufferManipulation.shuttle).toBe(0b00000000);
            expect(bufferManipulation.capacityOfShuttle).toBe(8);
            expect(bufferManipulation.stock).toEqual(Buffer.from([0b00001111]));
        });
    
        test('The fill method should leave all valid bits in the shuttle when the total valid bits of multiple input variables is less than 8.', () => {
            bufferManipulation.fill(0b01001111, 1, 6); // x10011xx
            bufferManipulation.fill(0b10101111, 2, 4); // xx10xxxx
        
            expect(bufferManipulation.shuttle).toBe(0b01010011); // right alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(1);
        });
    
        test('The fill method should load 8 rightmost bits to the stock when the total valid bits of multiple input variables is larger than 8.', () => {
            bufferManipulation.fill(0b01001111, 1, 6); // x10011xx
            bufferManipulation.fill(0b10101111, 2, 6); // xx1011xx
        
            expect(bufferManipulation.shuttle).toBe(0b00000001);
            expect(bufferManipulation.capacityOfShuttle).toBe(7);
            expect(bufferManipulation.stock).toEqual(Buffer.from([0b01110011]));
        });
    
        test('The fill method should work well when there are multiple input variables.', () => {
            bufferManipulation.fill(0b10100111, 3, 8); // 0bxxx00111
            bufferManipulation.fill(0b01010101, 1, 8); // 0bx1010101
            bufferManipulation.fill(0b10010100, 1, 7); // 0bx001010x
            bufferManipulation.fill(0b11111101, 0, 8); // 0b11111101
            bufferManipulation.fill(0b01010101, 3, 5); // 0bxxx10xxx
        
            expect(bufferManipulation.shuttle).toBe(0b00001011); // right alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(4);
            expect(bufferManipulation.stock).toEqual(
                Buffer.from([0b11110100, 0b10101010, 0b10100111]), // 00001011, 11110100, 10101010, 10100111
            );
        });
    
        test('The finish method should load all left valid bits in the shuttle to the stock.', () => {
            bufferManipulation.fill(0b10100111, 3, 8); // 0bxxx00111
            bufferManipulation.fill(0b01010101, 1, 8); // 0bx1010101
            bufferManipulation.fill(0b10010100, 1, 7); // 0bx001010x
            bufferManipulation.fill(0b11111101, 0, 8); // 0b11111101
            bufferManipulation.fill(0b01010101, 3, 5); // 0bxxx10xxx
            bufferManipulation.finish();
        
            expect(bufferManipulation.shuttle).toBe(0b00000000); // right alignment
            expect(bufferManipulation.capacityOfShuttle).toBe(8);
            expect(bufferManipulation.stock).toEqual(
                Buffer.from([0b00001011, 0b11110100, 0b10101010, 0b10100111]),
            );
        });
    
        test('The readIntBE should read from the stock.', () => {
            bufferManipulation.fill(0b10100111, 3, 8); // 0bxxx00111
            bufferManipulation.fill(0b01010101, 1, 8); // 0bx1010101
            bufferManipulation.fill(0b10010100, 1, 7); // 0bx001010x
            bufferManipulation.fill(0b11111101, 0, 8); // 0b11111101
            bufferManipulation.fill(0b01010101, 3, 5); // 0bxxx10xxx
            bufferManipulation.finish();
        
            expect(bufferManipulation.readIntBE()).toBe(
                Buffer.from(
                    [
                        0b00001011, 
                        0b11110100, 
                        0b10101010, 
                        0b10100111,
                    ]).readInt32BE()
            ); // right alignment
        });
    });
})