const buffershift = require('buffershift');

export const BYTE_POWER = Math.pow(2, 8);

/**
 * This is for extract variable length integer from bytes.
 * 
 * If there are two binary variable, variable_a = 10100 and variable_b = 1100011.
 * 
 * For BE (isBE is true): The former variable will be more significant. So, variable_a will be
 * put in front of variable_b. The answer becomes 0000(1010, 01100011).
 * 
 * 
 * For LE (isBE is false): The latter variable will be more significant. So, variable_b will be
 * put in front of variable_a, The answer becomes 0000(1100, 01110100).
 */
export interface BufferManipulationInterface {
    stock: Buffer;

    /*
      If isBE = true: shuttle stores from left to right.
      If isBE = false: shuttle stores from right to left.
    */
    shuttle: number;

    capacityOfShuttle: number;

    /*
      true: For byte1, byte2, byte3, it stores as (Big) byte1 byte2 byte3.
      false: For byte1, byte2, byte3, it stores as (Big) byte3 byte2 byte1.
    */
    isBE: boolean;

    cleanTheShuttleTail(): void;

    assertShuttleIsByte(): void;

    fill(value: number, startIndex: number, endIndex: number): void;

    finish(): void;

    clean(): void;

    readIntBE(): number;
}

// TODO: need setter and getter
export class BufferManipulation implements BufferManipulationInterface {
    stock: Buffer;

    shuttle: number;

    capacityOfShuttle: number;

    isBE: boolean;

    constructor(isBE: boolean) {
        this.stock = Buffer.alloc(0);

        this.shuttle = 0x00; // one byte

        this.capacityOfShuttle = 8;

        this.isBE = isBE;
    }

    cleanTheShuttleTail() {
        // precedent:
        // >> or <<
        // & or |
        this.shuttle = this.isBE
            ? (((this.shuttle >> this.capacityOfShuttle) & 0x0ff) <<
                this.capacityOfShuttle) &
                0xff
            : (((this.shuttle << this.capacityOfShuttle) & 0x0ff) >>
                this.capacityOfShuttle) &
                0xff;
    }

    assertShuttleIsByte() {
        if (this.shuttle > 0xff)
        throw new Error(
            '[ManipulateBuffer error]: shuttle contains more that one byte',
        );
    }

    // start from 0 and end at 8.
    // startIndex is inclusive and endIndex is exclusive.
    fill(value: number, startIndex: number, endIndex: number) {
        if (startIndex > endIndex || startIndex < 0 || endIndex > 8) {
        throw new Error(
            `[ManipulateBuffer error]: startIndex or endIndex is illegal`,
        );
        }

        const validSize = endIndex - startIndex;

        // clear value
        value = this.isBE
            ? // value should be left alignment, like xxxxx000 (x is the valid bit).
                (((value >> (8 - endIndex)) & 0xff) << (8 - endIndex + startIndex)) &
                0xff
            : // value should be right alignment, like 000xxxxx (x is the valid bit).
                (((value << startIndex) & 0xff) >> (8 - endIndex + startIndex)) & 0xff;
        value = value & 0xff; // ensure only lowest 8 bits are left.

        // bits left after loading
        const toBeLeft = this.isBE
            ? (value << this.capacityOfShuttle) & 0xff // toBeLeft should be left alignment, like xxx00000 (x is the valid bit).
            : (value >> this.capacityOfShuttle) & 0xff; // toBeLeft should be right alignment, like 00000xxx (x is the valid bit).
        const newValidSize = Math.max(0, validSize - this.capacityOfShuttle); // no bit left if it is 0

        this.cleanTheShuttleTail();

        // load value to the shuttle
        const toBeLoaded =
        (this.isBE
            ? value >> (8 - this.capacityOfShuttle)
            : value << (8 - this.capacityOfShuttle)) & 0xff;
        this.shuttle = this.shuttle | toBeLoaded;
        this.capacityOfShuttle = Math.max(0, this.capacityOfShuttle - validSize); // new capacity size

        this.cleanTheShuttleTail();

        this.assertShuttleIsByte();

        // append shuttle to the stock if necessary and build new shuttle
        if (this.capacityOfShuttle === 0) {
            const uint8 = new Uint8Array([this.shuttle]);
            this.stock = this.isBE
                ? Buffer.concat([this.stock, uint8], this.stock.length + uint8.length) // stock grows from left to right.
                : Buffer.concat([uint8, this.stock], this.stock.length + uint8.length); // stock grows from right to left.
            this.shuttle = toBeLeft;
            this.capacityOfShuttle = 8 - newValidSize;
        }
    }

    clean() {
        this.stock = Buffer.alloc(0);
        this.shuttle = 0b00000000;
        this.capacityOfShuttle = 8;
    }

    finish() {
        const rightLeft = this.capacityOfShuttle;
        this.fill(0b00000000, 0, this.capacityOfShuttle);

        if (this.isBE) {
            buffershift.shr(this.stock, rightLeft);
        }
    }

    readIntBE(): number {
        let final: number = 0;
        for (const [_, value] of this.stock.entries()) {
            final = final * BYTE_POWER + value;
        }
        return final;
    }
}

