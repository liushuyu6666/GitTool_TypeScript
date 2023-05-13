// import { readFileSync, writeFileSync } from "fs";
// import { isLooseObject } from "../../utils/getGitObjectType";
// import { inflateSync } from "zlib";
// import treeParser, { GitTreeObjectFileEntry } from "./treeParser";
// import commitParser, { CommitObjectInfo } from "./commitParser";
// import { GitObjectType } from "../../Enum/GitObjectType";
// import blobParser from "./blobParser";
// import { GitObject } from "../../GitObject/GitObject";
// import path from 'path';

// export default function (gitObject: GitObject, outObjectDir?: string): string | GitTreeObjectFileEntry[] | CommitObjectInfo | undefined {
//     const type = gitObject.gitObjectType!;

//     if (!isLooseObject(type)) return;

//     const content = readFileSync(gitObject.filePath!);
//     const decryptedBuf = inflateSync(content);
//     const body = decryptedBuf.subarray(gitObject.startIdx!, gitObject.endIdx!);

//     let data: string | GitTreeObjectFileEntry[] | CommitObjectInfo | undefined;
//     switch (type) {
//         case GitObjectType.BLOB: {
//             data = blobParser(body);
//             break;
//         }
//         case GitObjectType.TREE: {
//             data = treeParser(body);
//             break;
//         }
//         case GitObjectType.COMMIT: {
//             data = commitParser(body);
//             break;
//         }
//         default: {
//             return;
//         }
//     }

//     if(outObjectDir) {
//         const outFile = path.join(outObjectDir, gitObject.hash);
//         writeFileSync(outFile, JSON.stringify(data));
//     }

//     return data;
// }