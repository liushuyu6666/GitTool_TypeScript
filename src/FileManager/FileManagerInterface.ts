export interface FileManagerInterface {
    objectPath: string;

    getLooseFilePaths(): string[]

    getPackedFilePaths(): string[]
} 