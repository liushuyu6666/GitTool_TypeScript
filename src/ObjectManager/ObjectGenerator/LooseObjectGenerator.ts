import { readFileSync } from 'fs';
import { inflateSync } from 'zlib';
import path from 'path';
import getGitObjectType from '../../utils/getGitObjectType';
import { GitObject } from '../../GitObject/GitObject';

export class LooseObjectGenerator {
    private _filePath: string;

    constructor(filePath: string) {
        this._filePath = filePath;
    }

    private _splitHeaderAndBody(buffer: Buffer, delimiter=0x00): [Buffer, Buffer] {
        const idx = buffer.indexOf(delimiter);
        return [buffer.subarray(0, idx), buffer.subarray(idx + 1)];
    }

    generateGitObjects(): GitObject {
        const filePaths: string[] = this._filePath.split(path.sep);
        const suffix = filePaths.pop();
        const prefix = filePaths.pop();
        if (!suffix || !prefix) {
            throw new Error(
            `GitOriginalObjectGenerator: can\'t get prefix or suffix from the file path ${this._filePath}`,
            );
        }
        const hash = prefix + suffix;

        const decryptedBuf = inflateSync(readFileSync(this._filePath));
        const [header, _] = this._splitHeaderAndBody(decryptedBuf);
        const headerStr = header.toString();
        const size = parseInt(headerStr.split(' ')[1]);
        const type = getGitObjectType(headerStr.split(' ')[0]);

        const bodyOffsetStartIndex = header.length + 1;
        const bodyOffsetEndIndex = decryptedBuf.length;

        return new GitObject(
            hash,
            type,
            size,
            undefined,
            this._filePath,
            bodyOffsetStartIndex,
            bodyOffsetEndIndex
        )
    }
}