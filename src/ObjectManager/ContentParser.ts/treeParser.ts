export interface GitTreeObjectFileEntry {
    pointer: string;
    mode: string; // TODO: import { Mode } from "./enum";
    hash: string;
}

function convertTreeObjectBodyToArray(body: Buffer): Buffer[] {
    const buffer: Buffer[] = [];
    let curr: Buffer = body;
    let idx: number;
    while (curr.length > 0) {
        idx = curr.indexOf(0x00) + 21; // need to point to the end of the 20BytesHex
        buffer.push(curr.subarray(0, idx));
        curr = curr.subarray(idx);
    }

    return buffer;
}

/**
 * @param entry The deflated entry of the tree, format should be:
 * `${modeNumber}0x20${fileName}0x00${20bytesHex}`
 *
 * @returns The `GitTreeObjectFileEntry`
 */
export function parseTreeEntry(entry: Buffer): GitTreeObjectFileEntry {
    const first = entry.indexOf(0x20); // separate mode and others
    const second = entry.indexOf(0x00); // separate file name and hex

    const mode = entry.subarray(0, first).toString('ascii');
    const pointer = entry.subarray(first + 1, second).toString('ascii');
    const hash = entry.subarray(second + 1).toString('hex');

    return {
        mode,
        pointer,
        hash,
    };
}

/**
 *
 * @param body The deflated body of the GitTreeObject.
 * The format: `${modeNumber}0x20${fileName}0x00${20bytesHex}${modeNumber}0x20${fileName}0x00${20bytesHex}`
 * @returns An `GitTreeObjectFileEntry` array.
 */
export default function(body: Buffer): GitTreeObjectFileEntry[] {
    const fileBufferArray = convertTreeObjectBodyToArray(body);
    return fileBufferArray.map((file) => parseTreeEntry(file));
}
