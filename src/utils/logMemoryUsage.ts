export default function() {
    const memUsage = process.memoryUsage();
    const toMB = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    console.log(`
        Heap used: ${toMB(memUsage.heapUsed)} MB. 
        Heap total: ${toMB(memUsage.heapTotal)} MB. 
        RSS: ${toMB(memUsage.rss)} MB.
    `);
}