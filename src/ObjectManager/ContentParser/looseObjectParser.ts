import { readFileSync } from "fs";
import { GitObject } from "../../GitObject/GitObject";
import { isLooseObject } from "../../utils/getGitObjectType";
import { inflateSync } from "zlib";
import treeParser, { GitTreeObjectFileEntry } from "./treeParser";
import commitParser, { CommitObjectInfo } from "./commitParser";
import { GitObjectType } from "../../Enum/GitObjectType";
import blobParser from "./blobParser";

export function looseObjectParser(gitObject: GitObject): string | GitTreeObjectFileEntry[] | CommitObjectInfo | undefined {
    if (!isLooseObject(gitObject.gitObjectType!)) return;

    const content = readFileSync(gitObject.filePath!);
    const decryptedBuf = inflateSync(content);
    const body = decryptedBuf.subarray(gitObject.startIdx, gitObject.endIdx);

    switch (gitObject.gitObjectType) {
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