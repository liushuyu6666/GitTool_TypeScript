import { readFileSync, writeFileSync } from 'fs';
import { EntranceFile, EntranceNode } from '../../Entrance/Entrance';
import deltifiedParser from './deltifiedParser';
import undeltifiedParser from './undeltifiedParser';
import path from 'path';

export default function(entranceFile: EntranceFile, outObjectDir: string) {
    const currDotPackPath = entranceFile.filePath;
    const currDotPack = readFileSync(currDotPackPath);
    console.log(`${entranceFile.filePath} is starting...`);
    for(const node of entranceFile.nextNodes) {
        dfsParser(node, currDotPackPath, currDotPack, outObjectDir);
    }
    console.log(`${entranceFile.filePath} has been parsed and saved.`);
}

// TODO: Try to optimize it.
export function dfsParser(
    node: EntranceNode,
    currDotPackPath: string,
    currDotPack: Buffer,
    outObjectDir: string,
    baseContent?: string
) {
    // Get the compressed data (body)
    let shortestDistribution = node.distributions.find(
        (distribution) => distribution.filePath === currDotPackPath,
    );
    let body: Buffer;
    if (!shortestDistribution) {
        // No shortest inflation
        shortestDistribution = node.distributions[0];
        body = readFileSync(shortestDistribution.filePath).subarray(
            shortestDistribution.bodyStartIdx,
            shortestDistribution.bodyEndIdx,
        );
    } else {
        // Get the shortest inflation
        body = currDotPack.subarray(
            shortestDistribution.bodyStartIdx,
            shortestDistribution.bodyEndIdx
        );
    }

    // Parse the content of this current node
    let newContent: string;
    if(!baseContent) {
        const data = undeltifiedParser(body, shortestDistribution.type!);
        newContent = JSON.stringify(data);
    } else {
        newContent = deltifiedParser(body, baseContent)[2];
    }
    const outFile = path.join(outObjectDir, node.hash);
    if(!newContent) {
        console.log(`newContent is undefined 
            ${node.hash}, 
            ${node.distributions.length}, 
            ${shortestDistribution.type}, 
            ${body.length},
            ${baseContent}`
        );
    }
    writeFileSync(outFile, newContent);

    // Next node
    for(const nextNode of node.nextNodes) {
        dfsParser(nextNode, currDotPackPath, currDotPack, outObjectDir, newContent);
    }

    return;
}
