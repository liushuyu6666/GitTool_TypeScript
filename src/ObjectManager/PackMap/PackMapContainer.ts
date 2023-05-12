import { GitObject } from '../GitObjectContainer/GitObjectContainer';

export interface PackMapItem {
    prevHash: string;
    nextHashes: Set<string>;
}

export class PackMapContainer {
    packMap: Map<string, PackMapItem>;

    constructor(gitObjects: GitObject[]) {
        this.packMap = new Map<string, PackMapItem>();

        this.generatePackMap(gitObjects);
    }

    generatePackMap(gitObjects: GitObject[]) {
        for (const gitObject of gitObjects) {
            const prevHash = gitObject.baseHash ?? '';
            const currHash = gitObject.hash;

            // update nextHashes
            if (prevHash && !this.packMap.has(prevHash)) {
                this.packMap.set(prevHash, {
                    prevHash: '',
                    nextHashes: new Set<string>([currHash]),
                });
            } else if (prevHash && this.packMap.has(prevHash)) {
                this.packMap.get(prevHash)!.nextHashes.add(currHash);
            }

            // update prevHash
            if (!this.packMap.has(currHash)) {
                this.packMap.set(currHash, {
                    prevHash: prevHash,
                    nextHashes: new Set<string>(),
                });
            } else {
                this.packMap.get(currHash)!.prevHash = prevHash;
            }
        }

        console.log(`${this.packMap.size} packMap are generated.`);
    }
}
