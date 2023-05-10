import { GitObjectType } from "../Enum/GitObjectType";
import blobParser from "../ObjectManager/ContentParser/blobParser";
import commitParser, { CommitObjectInfo } from "../ObjectManager/ContentParser/commitParser";
import tagParser, { TagObjectInfo } from "../ObjectManager/ContentParser/tagParser";
import treeParser, { GitTreeObjectFileEntry } from "../ObjectManager/ContentParser/treeParser";

export function undeltifiedParser(
    decryptedBuf: Buffer,
    type: GitObjectType,
):
    | string
    | GitTreeObjectFileEntry[]
    | CommitObjectInfo
    | TagObjectInfo
    | undefined {
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
