import { ObjectManager } from '../../src/ObjectManager/ObjectManager';
import path from 'path';

describe('Test ObjectManager class', () => {
    let objectManager: ObjectManager;

    describe('upon prod repository.', () => {
        beforeAll(() => {
            const outObjectDir: string = path.join(
                (global as any).outDir,
                'objects',
            );
            objectManager = new ObjectManager(
                (global as any).fakeLooseFilePaths,
                (global as any).fakePackedFilePaths,
                outObjectDir,
            );
        });

        test('16901 gitObjects should be generated properly.', () => {
            expect(
                objectManager.gitObjectContainer.allObjectsContainer.length,
            ).toBe(16901);
        });

        // objectManager.gitObjects.length != objectManager.packMap.size
        // because there are some duplicated entries in the gitObjects.
        test('16287 packMap should be generated properly.', () => {
            expect(objectManager.packMapContainer.packMap.size).toBe(16287);
        });

        test('16 entranceFiles should be generated properly.', () => {
            expect(objectManager.entrance.entranceFiles.length).toBe(16);
        });

        test('all objects are parsed and stored, the commitMap is generated.', () => {
            objectManager.parseObjects();
            expect(objectManager.commitMap.commitHeader.firstNode.length).toBe(1);
            expect(objectManager.commitMap.commitHeader.firstNode[0].hash).toBe("c498716c1d2906ce9d54e50ee56d05bc64f543ba");
            expect(objectManager.commitMap.commitInfoMap.size).toBe(2210);
        });
    });
});
