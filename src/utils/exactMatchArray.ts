/**
 * 
 * @param string The string to check.
 * @param patterns A pattern array.
 * @returns True if the string match one of the pattern array; otherwise, false.
 */
export default function (string: string, patterns: RegExp[]): boolean {
    for (const pattern of patterns) {
        if (exactMatch(string, pattern)) {
            return true;
        }
    }
    return false;
}

export function exactMatch(string: string, pattern: RegExp): boolean {
    const match = string.match(pattern);
    if (match) {
        return string === match[0]
    } else {
        return false;
    }
}