import { GitObjectType } from "../Enum/GitObjectType";
import blobParser from "../ObjectManager/ContentParser/blobParser";
import commitParser, { CommitObjectInfo } from "../ObjectManager/ContentParser/commitParser";
import tagParser, { TagObjectInfo } from "../ObjectManager/ContentParser/tagParser";
import treeParser, { GitTreeObjectFileEntry } from "../ObjectManager/ContentParser/treeParser";

export function undeltifiedParser(
    decryptedBuf: Buffer,
    type: GitObjectType,
    hash: string
):
    | string
    | GitTreeObjectFileEntry[]
    | CommitObjectInfo
    | TagObjectInfo
    | undefined {
    switch (type) {
        case GitObjectType.BLOB:
        case GitObjectType.BLOB_DELTA: {
            return blobParser(decryptedBuf);
        }
        case GitObjectType.TREE:
        case GitObjectType.TREE_DELTA: {
            return treeParser(decryptedBuf);
        }
        case GitObjectType.COMMIT:
        case GitObjectType.COMMIT_DELTA: {
            return commitParser(decryptedBuf, hash);
        }
        case GitObjectType.TAG:
        case GitObjectType.TAG_DELTA: {
            return tagParser(decryptedBuf);
        }
        default: {
            return;
        }
    }
}
