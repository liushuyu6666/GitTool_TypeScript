export interface PersonalInfo {
    name: string;
    email: string;
    timestamp: string;
    timezone: string;
}

export interface CommitHash {
    hash: string;
    treeHash: string;
    parentHashes: string[];
}

export interface CommitInfo {
    author: PersonalInfo;
    committer: PersonalInfo;
    message: string;
}

export interface CommitObjectInfo {
    hashes: CommitHash;
    info: CommitInfo;
}

export default function(body: Buffer, hash: string): CommitObjectInfo {
    const content = body.toString();

    // get tree object hash
    const treeHashTemp = content.match(new RegExp('tree ([0-9a-f]{40})\n'));
    const treeHash = treeHashTemp ? treeHashTemp[1] : '';

    // get parent hash
    const parentHashesTemp = [
        ...content.matchAll(new RegExp(/parent ([0-9a-f]{40})/g)),
    ];
    const parentHashes = parentHashesTemp.map(
        (parentHashesTemp) => parentHashesTemp[1],
    );

    // get author info
    const authorNameTemp = content.match(
        new RegExp(
            'author ([^<]+) <[a-zA-Z0-9@.]+> [0-9]{10} [+-]{0,1}[0-9]{4}',
        ),
    );
    const authorName = authorNameTemp ? authorNameTemp[1] : '';
    const authorEmailTemp = content.match(
        new RegExp(
            'author [^<]+ <([a-zA-Z0-9@.]+)> [0-9]{10} [+-]{0,1}[0-9]{4}',
        ),
    );
    const authorEmail = authorEmailTemp ? authorEmailTemp[1] : '';
    const authorTimestampTemp = content.match(
        new RegExp(
            'author [^<]+ <[a-zA-Z0-9@.]+> ([0-9]{10}) [+-]{0,1}[0-9]{4}',
        ),
    );
    const authorTimestamp = authorTimestampTemp ? authorTimestampTemp[1] : '';
    const authorTimezoneTemp = content.match(
        new RegExp(
            'author [^<]+ <[a-zA-Z0-9@.]+> [0-9]{10} ([+-]{0,1}[0-9]{4})',
        ),
    );
    const authorTimezone = authorTimezoneTemp ? authorTimezoneTemp[1] : '';

    // get author name and email
    const committerNameTemp = content.match(
        new RegExp(
            'committer ([^<]+) <[a-zA-Z0-9@.]+> [0-9]{10} [+-]{0,1}[0-9]{4}',
        ),
    );
    const committerName = committerNameTemp ? committerNameTemp[1] : '';
    const committerEmailTemp = content.match(
        new RegExp(
            'committer [^<]+ <([a-zA-Z0-9@.]+)> [0-9]{10} [+-]{0,1}[0-9]{4}',
        ),
    );
    const committerEmail = committerEmailTemp ? committerEmailTemp[1] : '';
    const committerTimestampTemp = content.match(
        new RegExp(
            'committer [^<]+ <[a-zA-Z0-9@.]+> ([0-9]{10}) [+-]{0,1}[0-9]{4}',
        ),
    );
    const committerTimestamp = committerTimestampTemp
        ? committerTimestampTemp[1]
        : '';
    const committerTimezoneTemp = content.match(
        new RegExp(
            'committer [^<]+ <[a-zA-Z0-9@.]+> [0-9]{10} ([+-]{0,1}[0-9]{4})',
        ),
    );
    const committerTimezone = committerTimezoneTemp
        ? committerTimezoneTemp[1]
        : '';

    // message
    const messageTemp = content.match(new RegExp('\n\n(.+)\n'));
    const message = messageTemp ? messageTemp[1] : '';

    return {
        hashes: {
            treeHash,
            parentHashes,
            hash
        },
        info: {
            author: {
                name: authorName,
                email: authorEmail,
                timestamp: authorTimestamp,
                timezone: authorTimezone,
            },
            committer: {
                name: committerName,
                email: committerEmail,
                timestamp: committerTimestamp,
                timezone: committerTimezone,
            },
            message,
        }
    };
}
