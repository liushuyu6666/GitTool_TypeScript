import { GitObjectType } from "../Enum/GitObjectType";

export default function (type: string | number): GitObjectType {
    if (typeof type === 'string') {
        switch (type) {
            case GitObjectType.BLOB:
                return GitObjectType.BLOB;
            case GitObjectType.TREE:
                return GitObjectType.TREE;
            case GitObjectType.COMMIT:
                return GitObjectType.COMMIT;
            case GitObjectType.TAG:
                return GitObjectType.TAG;
            case GitObjectType.OFS_DELTA:
                return GitObjectType.OFS_DELTA;
            case GitObjectType.REF_DELTA:
                return GitObjectType.REF_DELTA;
            default:
                throw new Error(`Can\'t find the GitObjectType: ${type}`);
        }
    } else if (typeof type === 'number') {
        // if it is number, then it should come from pack file
        return GitPackObjectType[type];
    } else {
        throw new Error(`getGitObjectType error!`);
    }
}

export const GitPackObjectType: Record<number, GitObjectType> = {
    1: GitObjectType.COMMIT_DELTA,
    2: GitObjectType.TREE_DELTA,
    3: GitObjectType.BLOB_DELTA,
    4: GitObjectType.TAG_DELTA,
    6: GitObjectType.OFS_DELTA,
    7: GitObjectType.REF_DELTA,
};

const looseType: Array<GitObjectType> = [
    GitObjectType.BLOB,
    GitObjectType.TREE,
    GitObjectType.COMMIT,
    GitObjectType.TAG,
];
  
const undeltifiedType: Array<GitObjectType> = [
    GitObjectType.BLOB_DELTA,
    GitObjectType.TREE_DELTA,
    GitObjectType.COMMIT_DELTA,
    GitObjectType.TAG_DELTA,
]

const deltifiedType: Array<GitObjectType> = [
    GitObjectType.OFS_DELTA,
    GitObjectType.REF_DELTA,
];

export function isLooseObject(type: GitObjectType): boolean {
    return looseType.includes(type);
}

export function isUndeltifiedObject(type: GitObjectType): boolean {
    return undeltifiedType.includes(type);
}

export function isDeltifiedObject(type: GitObjectType): boolean {
    return deltifiedType.includes(type);
}