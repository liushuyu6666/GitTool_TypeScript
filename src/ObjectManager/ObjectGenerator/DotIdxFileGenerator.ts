import { Fanout } from "./Fanout";
import { readFileSync } from 'fs';

// TODO: Archive this class as all logic had been moved to PackedObjectsGenerator
export interface DotIdxFileGeneratorInterface {
    byteSize: number;
    
    header: number[];
    
    versionNumber: number;
  
    fanout: Fanout;
  
    parseHeader(content: Buffer): [number, number, number, number];
  
    parseVersionNumber(content: Buffer): number
  
}
  
export class DotIdxFileGenerator implements DotIdxFileGeneratorInterface {
    // size by bytes
    byteSize: number;
  
    header: number[];
  
    versionNumber: number;
  
    fanout: Fanout;
  
    constructor(filePath: string) {  
        const content = readFileSync(filePath);
        this.byteSize = content.length;
        this.header = this.parseHeader(content);
        this.versionNumber = this.parseVersionNumber(content);
        this.fanout = new Fanout(content);
    }
  
    parseHeader(content: Buffer): [number, number, number, number] {
        // [0, 3] bytes
        return [
            content.readUInt8(0),
            content.readUInt8(1),
            content.readUInt8(2),
            content.readUInt8(3),
        ];
    }
  
    parseVersionNumber(content: Buffer): number {
        return content.readUInt32BE(4);
    }
  }