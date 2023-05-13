import { FileManager } from '../../src/FileManager/FileManager';
import { MongoClient } from 'mongodb';

// TODO: all test files need to be re-organized
describe('Test FileManager class', () => {
    let fileManager: FileManager;

    describe('upon the example test cases', () => {
        // The location of the example test case.
        const inDir = 'testCases/prodExample/git';
        const outDir = 'outDir';

        beforeAll(() => {
            fileManager = new FileManager(inDir, outDir);
        });

        test('should have all loose file paths and packed file paths.', () => {
            expect(fileManager.inDir.looseFilePaths).toMatchSnapshot();
            expect(fileManager.inDir.packedFilePaths).toMatchSnapshot();
        });

        test('should save json file into the local mongodb', async () => {
            const json = [
                {
                    id: 'test1',
                    fruits: ['apple', 'banana'],
                    timestamp: new Date()
                },
                {
                    id: 'test2',
                    fruits: ['pineapple', 'hotdog'],
                    timestamp: new Date()
                }
            ];
            // TODO: should move to configuration
            // TODO: should check if we need a wrapper function to wrap all functions which need to use the mongodb.
            const mongoUri = process.env.MONGO_URI ?? '';
            const mongoClient = await MongoClient.connect(mongoUri);
            await fileManager.saveJsonToMongodb(mongoClient, 'test', json);
        });
    });
});
