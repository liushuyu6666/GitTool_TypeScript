export default function(records: Record<string, number>): Record<number, string> {
    const swap: Record<number, string> = {};
    Object.keys(records).forEach((hash) => {
        swap[records[hash]] = hash;
    })

    return swap;
}