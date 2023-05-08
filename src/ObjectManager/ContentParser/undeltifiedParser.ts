import { isUndeltifiedObject } from "../../utils/getGitObjectType";
import { inflateSync } from "zlib";
import treeParser, { GitTreeObjectFileEntry } from "./treeParser";
import commitParser, { CommitObjectInfo } from "./commitParser";
import { GitObjectType } from "../../Enum/GitObjectType";
import blobParser from "./blobParser";

export default function (body: Buffer, type: GitObjectType): string | GitTreeObjectFileEntry[] | CommitObjectInfo | undefined {
    if (!isUndeltifiedObject(type)) return;

    const decryptedBuf = inflateSync(body);

    switch (type) {
        case GitObjectType.BLOB_DELTA: {
            return blobParser(decryptedBuf);
        }
        case GitObjectType.TREE_DELTA: {
            return treeParser(decryptedBuf);
        }
        case GitObjectType.COMMIT_DELTA: {
            return commitParser(decryptedBuf);
        }
        default: {
            return;
        }
    }
}