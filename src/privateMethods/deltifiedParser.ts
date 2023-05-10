import { BufferVarint } from "../Buffer/BufferVarint";

export function deltifiedParser(decryptedDeltaBuf: Buffer, baseBuffer: Buffer): [number, number, Buffer] {
    // Get the size of the base object.
    const bv1 = new BufferVarint(false);
    const [baseObjectSize, endIdx1] = bv1.getSizeEncoding(decryptedDeltaBuf, 1);

    // Get the size of the deltified object.
    const bv2 = new BufferVarint(false);
    const remain = decryptedDeltaBuf.subarray(endIdx1);
    const [deltifiedObjectSize, endIdx2] = bv2.getSizeEncoding(remain, 1);

    // Get the instructions
    let startIdx = endIdx1 + endIdx2;
    let instructions = decryptedDeltaBuf.subarray(startIdx);

    let finalBuffer = Buffer.from([]);
    while(instructions.length > 0) {
        let flag = instructions[0] & 0b10000000;
        const bv = new BufferVarint(false);
        if(flag) {
            // copy
            const [offset, size, endIdx] = bv.getCopyInstruction(instructions);
            startIdx += endIdx;
            // TODO: The offset and size parameters should be applied to bytes instead according to the official documentation.
            finalBuffer = Buffer.concat([finalBuffer, baseBuffer.subarray(offset, offset + size)]) ;
            instructions = decryptedDeltaBuf.subarray(startIdx);
        } else {
            // add
            const [newSnippet, endIdx] = bv.getAddInstruction(instructions);
            startIdx += endIdx;
            finalBuffer = Buffer.concat([finalBuffer, newSnippet]);
            instructions = decryptedDeltaBuf.subarray(startIdx);
        }
    }

    return [baseObjectSize, deltifiedObjectSize, finalBuffer];
}