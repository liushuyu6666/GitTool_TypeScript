import { GitObjectType } from "../Enum/GitObjectType";
import { GitObjectInterface } from "./GitObjectInterface";

export class GitObject implements GitObjectInterface {
    private _hash: string;
    public get hash(): string {
        return this._hash;
    }
    public set hash(value: string) {
        this._hash = value;
    }
  
    private _gitObjectType: GitObjectType | undefined;
    public get gitObjectType(): GitObjectType | undefined {
        return this._gitObjectType;
    }
    public set gitObjectType(value: GitObjectType | undefined) {
        this._gitObjectType = value;
    }
  
    private _size: number | undefined;
    public get size(): number | undefined {
        return this._size;
    }
    public set size(value: number | undefined) {
        this._size = value;
    }
  
    private _baseHash: string | undefined;
    public get baseHash(): string | undefined {
        return this._baseHash;
    }
    public set baseHash(value: string | undefined) {
        this._baseHash = value;
    }

    private _filePath: string | undefined;
    public get filePath(): string | undefined {
        return this._filePath;
    }
    public set filePath(value: string | undefined) {
        this._filePath = value;
    }

    private _startIdx: number | undefined;
    public get startIdx(): number | undefined {
        return this._startIdx;
    }
    public set startIdx(value: number | undefined) {
        this._startIdx = value;
    }

    private _endIdx: number | undefined;
    public get endIdx(): number | undefined {
        return this._endIdx;
    }
    public set endIdx(value: number | undefined) {
        this._endIdx = value;
    }

    constructor(
        hash: string, 
        gitObjectType?: GitObjectType,
        size?: number,
        baseHash?: string,
        filePath?: string,
        startIdx?: number,
        endIdx?: number
    ) {
        this._hash = hash;

        this._gitObjectType = gitObjectType;

        this._size = size;

        this._baseHash = baseHash;

        this._filePath = filePath;

        this._startIdx = startIdx;

        this._endIdx = endIdx;
    }
    
    public toJson(): string {
        const json: any = {};
        for (const key of Object.keys(this)) {
            const keyWithoutUnderscore = key.replace('_', ''); // remove the underscore
            json[keyWithoutUnderscore] = (this as any)[key];
        }
        return JSON.stringify(json);
    }
}