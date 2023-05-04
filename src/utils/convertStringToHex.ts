export default function(hexString: string): Buffer {
    return Buffer.from(hexString, "hex");
}