export default function(records: Record<string, number>): Record<string, number> {
    const array: Array<[string, number]> = Object.keys(records).map((key) => [key, records[key]]);

    array.sort((prev, next) => prev[1] - next[1]);
    
    const result: Record<string, number> = {};
    array.forEach((ele) => {
        result[ele[0]] = ele[1];
    })

    return result;
}