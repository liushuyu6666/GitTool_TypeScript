import { BufferManipulation } from './BufferManipulation';

const BYTE_POWER = Math.pow(2, 8);

export class BufferVarint {
    private _bufferManipulation: BufferManipulation;

    constructor(isBE?: boolean) {
        this._bufferManipulation = new BufferManipulation(isBE ?? true);
    }

    public getSizeEncoding(buffer: Buffer, startIdx: number): [number, number] {
        let msb: boolean = buffer[0] >= 0b10000000;
        let index = 1;
        this._bufferManipulation.fill(buffer[0], startIdx, 8);

        while (msb) {
            this._bufferManipulation.fill(buffer[index], 1, 8);
            msb = buffer[index] >= 0b10000000;
            index++;
        }
        this._bufferManipulation.finish();

        return [this._bufferManipulation.readIntBE(), index];
    }

    public getOffset(byteNumber: number) {
        if (byteNumber <= 1) return 0;

        let sum = 0;
        for (let i = 0; i < byteNumber - 1; i++) {
            const octet = Math.pow(2, 7 - i);
            const newSeg = octet * Math.pow(BYTE_POWER, i);
            sum += newSeg;
        }

        return sum;
    }

    public getFirstVarintWithType(buffer: Buffer): [[number, number], number] {
        const typeNumber = ((buffer[0] & 0b01110000) >> 4) & 0b00000111;
        return [this.getSizeEncoding(buffer, 4), typeNumber];
    }

    public getOffsetEncoding(buffer: Buffer): [number, number] {
        const [negativeBeforeMarginValue, startIndex] = this.getSizeEncoding(
            buffer,
            1,
        );
        const marginValue = this.getOffset(startIndex);
        const negative = negativeBeforeMarginValue + marginValue;
        return [negative, startIndex];
    }

    public getCopyInstruction(buffer: Buffer): [number, number, number] {
        let header = buffer[0];
        let pointer = 1;
        for (let i = 0; i < 4; i++) {
            const flag = (header >> i) & 0x01;
            const currOffset = buffer[pointer] & 0xff;
            if (!flag) {
                this._bufferManipulation.fill(0b00000000, 0, 8);
            } else {
                this._bufferManipulation.fill(currOffset, 0, 8);
                pointer++;
            }
        }
        const offset = this._bufferManipulation.stock.readUint32BE();

        this._bufferManipulation.clean();

        // size
        for (let i = 4; i < 7; i++) {
            const flag = (header >> i) & 0x01;
            const currSize = buffer[pointer] & 0xff;
            if (!flag) {
                this._bufferManipulation.fill(0b00000000, 0, 8);
            } else {
                this._bufferManipulation.fill(currSize, 0, 8);
                pointer++;
            }
        }
        this._bufferManipulation.fill(0b00000000, 0, 8);
        const size =
            this._bufferManipulation.stock.readUint32BE() !== 0
                ? this._bufferManipulation.stock.readUint32BE()
                : 0x10000;

        return [offset, size, pointer];
    }

    public getAddInstruction(buffer: Buffer): [Buffer, number] {
        const size = buffer.subarray(0, 1).readUInt8();
        const contentBuf = buffer.subarray(1, size + 1);
        return [contentBuf, size + 1];
    }
}
