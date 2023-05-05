// TODO: should have a constant file to store this kind of value.
const BYTE_POWER = Math.pow(2, 8);

export default function (byteNumber: number) {
    if (byteNumber <= 1) return 0; 

    let sum = 0;
    for (let i = 0; i < byteNumber - 1; i++) {
        const octet = Math.pow(2, 7 - i);
        const newSeg = octet * Math.pow(BYTE_POWER, i);
        sum += newSeg;
    }

return sum;
}