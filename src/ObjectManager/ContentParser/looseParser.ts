import { readFileSync } from "fs";
import { isLooseObject } from "../../utils/getGitObjectType";
import { inflateSync } from "zlib";
import treeParser, { GitTreeObjectFileEntry } from "./treeParser";
import commitParser, { CommitObjectInfo } from "./commitParser";
import { GitObjectType } from "../../Enum/GitObjectType";
import blobParser from "./blobParser";

export default function (filePath: string, startIdx: number, endIdx: number, type: GitObjectType): string | GitTreeObjectFileEntry[] | CommitObjectInfo | undefined {
    if (!isLooseObject(type)) return;

    const content = readFileSync(filePath);
    const decryptedBuf = inflateSync(content);
    const body = decryptedBuf.subarray(startIdx, endIdx);

    switch (type) {
        case GitObjectType.BLOB: {
            return blobParser(body);
        }
        case GitObjectType.TREE: {
            return treeParser(body);
        }
        case GitObjectType.COMMIT: {
            return commitParser(body);
        }
        default: {
            return;
        }
    }
}