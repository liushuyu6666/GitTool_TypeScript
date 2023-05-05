import getMarginValue from "../utils/getMarginValue";
import { BufferManipulation } from "./BufferManipulation";

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

    public getFirstVarintWithType(buffer: Buffer): [[number, number], number] {
        const typeNumber = (buffer[0] & 0b01110000) >> 4 & 0b00000111;
        return [this._concatenate(buffer, 4), typeNumber];
    }

    public getFirstVarintWithoutType(buffer: Buffer): [number, number] {
        const [negativeBeforeMarginValue, startIndex] = this._concatenate(buffer, 1);
        const marginValue = getMarginValue(startIndex);
        const negative = negativeBeforeMarginValue + marginValue;
        return [negative, startIndex];
    }
}