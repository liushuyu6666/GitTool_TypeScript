export interface TagObjectInfo {
    commitHash: string;
    type: string;
    tagNumber: string;
    taggerInfo: TaggerInfo;
    message: string;
}

export interface TaggerInfo {
    name: string;
    email: string;
    timestamp: string;
    timezone: string;
}

export default function(body: Buffer): TagObjectInfo {
    const content = body.toString();
    const segs = content.split('\n');
    
    // object <commit_hash>
    const seg1 = segs[0].split(' ');
    const commitHash = seg1[1];

    // type <type_name>
    const seg2 = segs[1].split(' ');
    const type = seg2[1];

    // tag <tag_number>
    const seg3 = segs[2].split(' ');
    const tagNumber = seg3[1];

    // tagger <tagger> <email> <timestamp> <timezone>
    const seg4 = segs[3].split(' ');
    const taggerInfo: TaggerInfo = {
        name: seg4[1],
        email: seg4[2],
        timestamp: seg4[3],
        timezone: seg4[4]
    };

    const message = segs[5]; 

    return {
        commitHash,
        type,
        tagNumber,
        taggerInfo,
        message
    };
}