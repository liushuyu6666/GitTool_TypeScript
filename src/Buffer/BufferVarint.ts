import { BufferManipulation } from "./BufferManipulation";

const BYTE_POWER = Math.pow(2, 8);

export class BufferVarint {
    private _bufferManipulation: BufferManipulation;

    constructor() {
        this._bufferManipulation = new BufferManipulation(true);
    }

    private _concatenate(buffer: Buffer, startIdx: number): [number, number] {
        let msb: boolean = buffer[0] >= 0b10000000;
        let index = 1;
        this._bufferManipulation.fill(buffer[0], startIdx, 8);

        while (msb) {
            this._bufferManipulation.fill(buffer[index], 1, 8);
            msb = buffer[index] >= 0b10000000
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
        const typeNumber = (buffer[0] & 0b01110000) >> 4 & 0b00000111;
        return [this._concatenate(buffer, 4), typeNumber];
    }

    public getOffsetEncoding(buffer: Buffer): [number, number] {
        const [negativeBeforeMarginValue, startIndex] = this._concatenate(buffer, 1);
        const marginValue = this.getOffset(startIndex);
        const negative = negativeBeforeMarginValue + marginValue;
        return [negative, startIndex];
    }
}