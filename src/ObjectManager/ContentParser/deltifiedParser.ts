import { BufferVarint } from "../../Buffer/BufferVarint";

/**
 * 
 * @param body The compressed delta data
 */
export default function(body: Buffer, baseContent: string): [number, number, string] {
    // Get the size of the base object.
    const bv1 = new BufferVarint(false);
    const [baseObjectSize, endIdx1] = bv1.getSizeEncoding(body, 1);

    // Get the size of the deltified object.
    const bv2 = new BufferVarint(false);
    const remain = body.subarray(endIdx1);
    const [deltifiedObjectSize, endIdx2] = bv2.getSizeEncoding(remain, 1);

    // Get the instructions
    let startIdx = endIdx1 + endIdx2;
    let instructions = body.subarray(startIdx);
    let finalContent = '';
    while(instructions.length > 0) {
        let flag = instructions[0] & 0b10000000;
        const bv = new BufferVarint(false);
        if(flag) {
            // copy
            const [offset, size, endIdx] = bv.getCopyInstruction(instructions);
            startIdx += endIdx;
            // TODO: The offset and size parameters should be applied to bytes instead according to the official documentation.
            finalContent += baseContent.substring(offset, offset + size);
            instructions = body.subarray(startIdx);
        } else {
            // add
            const [newSnippet, endIdx] = bv.getAddInstruction(instructions);
            startIdx += endIdx;
            finalContent += newSnippet;
            instructions = body.subarray(startIdx);
        }
    }

    return [baseObjectSize, deltifiedObjectSize, finalContent];
}