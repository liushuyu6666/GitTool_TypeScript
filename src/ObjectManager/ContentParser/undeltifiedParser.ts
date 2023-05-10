import { isUndeltifiedObject } from "../../utils/getGitObjectType";
import { inflateSync } from "zlib";
import treeParser, { GitTreeObjectFileEntry } from "./treeParser";
import commitParser, { CommitObjectInfo } from "./commitParser";
import { GitObjectType } from "../../Enum/GitObjectType";
import blobParser from "./blobParser";
import tagParser, { TagObjectInfo } from "./tagParser";

export default function (decryptedBuf: Buffer, type: GitObjectType): string | GitTreeObjectFileEntry[] | CommitObjectInfo | TagObjectInfo | undefined {
    if (!isUndeltifiedObject(type)) return;

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
        case GitObjectType.TAG_DELTA: {
            return tagParser(decryptedBuf);
        }
        default: {
            return;
        }
    }
}