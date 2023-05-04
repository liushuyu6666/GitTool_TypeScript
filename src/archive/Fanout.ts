export interface Offset {
    hex: string;
    offset: number;
}

// TODO: Archive this class as all logic had been moved to PackedObjectsGenerator

  
export interface FanoutInterface {
    entrySize: number;

    layer1: Record<number, number>;

    layer2: string[];
  
    layer3: Buffer;
  
    offsets: Record<string, number>;
    
    parseLayer1(content: Buffer): [Record<number, number>, number, number];
    
    parseLayer2(content: Buffer, startBytes: number, entrySize: number): [string[], number];
    
    parseLayer3(content: Buffer, startBytes: number, entrySize: number): [Buffer, number];
    
    parseLayer4(content: Buffer, startBytes: number, entrySize: number, layer2: string[]): [Record<string, number>, number];
}
  
export class Fanout implements FanoutInterface {
    entrySize: number;
    
    layer1: Record<number, number>;
    
    layer2: string[];
    
    layer3: Buffer;
    
    offsets: Record<string, number>;
    
    constructor(idxContent: Buffer) {
        const content = idxContent.subarray(8, idxContent.length - 20);
        let startBytes: number = 0;
        [this.layer1, this.entrySize, startBytes] = this.parseLayer1(content);
        [this.layer2, startBytes] = this.parseLayer2(content, startBytes, this.entrySize);
        [this.layer3, startBytes] = this.parseLayer3(content, startBytes, this.entrySize);
        [this.offsets, startBytes] = this.parseLayer4(content, startBytes, this.entrySize, this.layer2);
    }
  
    // layer 1: [0, 1024), 256 entries, each has 4 bytes.
    parseLayer1(content: Buffer): [Record<number, number>, number, number] {
        const accumulation: Record<number, number> = {};
        const endBytes = 1024;
        const layer1: Record<number, number> = {};
        // [0, 1024) bytes
        for (let i = 0; i < 256; i++) {
            accumulation[i] = content.readUInt32BE(i * 4);
        }
        for (let i = 255; i >= 0; i--) {
            layer1[i] =
                i > 0 ? accumulation[i] - accumulation[i - 1] : accumulation[0];
        }
        const entrySize = accumulation[255];
        return [layer1, entrySize, endBytes];
    }
  
    // layer 2: [1024, 1024 + 20 * entrySize)
    parseLayer2(content: Buffer, startBytes: number, entrySize: number): [string[], number] {
        const endBytes = startBytes + 20 * entrySize;
        const layer2: string[] = [];
        for (let i = 0; i < entrySize; i++) {
            layer2.push(
                content
                    .subarray(startBytes + 20 * i, startBytes + 20 * (i + 1))
                    .toString('hex'),
            );
        }
  
        return [layer2, endBytes];
    }
  
    // layer 3: [startBytes, startBytes + 4 * entrySize)
    parseLayer3(content: Buffer, startBytes: number, entrySize: number): [Buffer, number] {
        const endBytes = startBytes + 4 * entrySize;
        const layer3 = content.subarray(startBytes, endBytes);
    
        return [layer3, endBytes];
    }
  
    // layer 4: [startBytes, startBytes + 4 * entrySize)
    parseLayer4(content: Buffer, startBytes: number, entrySize: number, layer2: string[]): [Record<string, number>, number] {
        const endBytes = startBytes + 4 * entrySize;
        const offsetsTemp: Record<string, number> = {};
        for (let i = 0; i < layer2.length; i++) {
            const temp = content.subarray(
                startBytes + 4 * i,
                startBytes + 4 * (i + 1),
            );
            offsetsTemp[layer2[i]] = temp.readUInt32BE();
        }
  
        // sort offsets
        const offsets = this.sortRecords(offsetsTemp);
    
        return [offsets, endBytes];
    }
  
    // TODO: layer5

    private sortRecords(records: Record<string, number>): Record<string, number> {
        const array: Array<[string, number]> = Object.keys(records).map((key) => [key, records[key]]);
  
        array.sort((prev, next) => prev[1] - next[1]);
        
        const result: Record<string, number> = {};
        array.forEach((ele) => {
            result[ele[0]] = ele[1];
        })

        return result;
    }
    
    
  }