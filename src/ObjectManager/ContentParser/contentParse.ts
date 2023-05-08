import { readFileSync, writeFileSync } from "fs";
import { GitObject } from "../../GitObject/GitObject";
import { isLooseObject } from "../../utils/getGitObjectType";
import { inflateSync } from "zlib";
import blobParser from "./blobParser";
import { GitObjectType } from "../../Enum/GitObjectType";
import treeParser, { GitTreeObjectFileEntry } from "./treeParser";
import commitParser, { CommitObjectInfo } from "./commitParser";
import path from 'path';

export function LooseObjectParser(gitObject: GitObject, storeInFile: string) {
    if(!isLooseObject(gitObject.gitObjectType!)) return;
    
    const content = readFileSync(gitObject.filePath!);
    const decryptedBuf = inflateSync(content);
    const body = decryptedBuf.subarray(gitObject.startIdx, gitObject.endIdx);
    const outFile = path.join(storeInFile, gitObject.hash);

    let data: string | GitTreeObjectFileEntry[] | CommitObjectInfo;
    switch(gitObject.gitObjectType) {
        case GitObjectType.BLOB: {
            data = blobParser(body);
            writeFileSync(outFile, data);
            break;
        }
        case GitObjectType.TREE: {
            data = treeParser(body);
            writeFileSync(outFile, JSON.stringify(data));
            break;
        }
        case GitObjectType.COMMIT: {
            data = commitParser(body);
            writeFileSync(outFile, JSON.stringify(data));
            break;
        }
        default: {
            data = '';
            break;
        }
    }
}