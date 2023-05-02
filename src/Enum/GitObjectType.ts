export enum GitObjectType {
    BLOB = 'blob',
    TREE = 'tree',
    COMMIT = 'commit',
    TAG = 'tag',
    BLOB_DELTA = 'blob_delta',
    TREE_DELTA = 'tree_delta',
    COMMIT_DELTA = 'commit_delta',
    TAG_DELTA = 'tag_delta',
    OFS_DELTA = 'ofs_delta',
    REF_DELTA = 'ref_delta',
    UNDEFINED = 'undefined',
  }