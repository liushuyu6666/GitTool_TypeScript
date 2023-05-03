export default function(record: Record<string, number>, keyName: string, valueName: string): Array<any> {
    const array: Array<any> = [];
    for (const [key, val] of Object.entries(record)) {
        const element: any = {
            [keyName]: key,
            [valueName]: val
        };
        array.push(element);
    }
  
    return array;
}