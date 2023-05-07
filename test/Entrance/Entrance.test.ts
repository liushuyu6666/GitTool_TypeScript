import { Entrance } from "../../src/Entrance/Entrance";
import { GitObjectType } from "../../src/Enum/GitObjectType"
import { GitObject } from "../../src/GitObject/GitObject"

// TODO: move to json file or have a test configuration file.
const fakeGitObject1 = new GitObject(
    'object1',
    GitObjectType.BLOB_DELTA,
    12,
    undefined,
    'file1',
    3,
    5
);
const fakeGitObject2 = new GitObject(
    'object2',
    GitObjectType.OFS_DELTA,
    12,
    'object1',
    'file1',
    3,
    5
);
const fakeGitObject3 = new GitObject(
    'object3',
    GitObjectType.OFS_DELTA,
    12,
    'object2',
    'file2',
    3,
    5
);
const fakeGitObject4 = new GitObject(
    'object4',
    GitObjectType.COMMIT_DELTA,
    12,
    undefined,
    'file2',
    3,
    5
);
const fakeGitObject5 = new GitObject(
    'object5',
    GitObjectType.OFS_DELTA,
    12,
    'object4',
    'file2',
    3,
    5
);
const fakeGitObject6 = new GitObject(
    'object6',
    GitObjectType.OFS_DELTA,
    12,
    'object5',
    'file1',
    3,
    5
);
const fakeGitObject7 = new GitObject(
    'object1',
    GitObjectType.BLOB_DELTA,
    12,
    undefined,
    'file3',
    3,
    5
);
const fakeGitObject8 = new GitObject(
    'object8',
    GitObjectType.BLOB_DELTA,
    12,
    'object1',
    'file3',
    3,
    5
);

describe("Test the Entrance class", () => {
    let entrance: Entrance;

    beforeAll(() => {
        entrance = new Entrance();
    });

    test("for inserting into one undeltified object.", () => {
        entrance.insertGitObject(fakeGitObject1);

        expect(entrance.entranceFiles[0].filePath).toBe('file1');
        expect(entrance.entranceFiles[0].nextNodes[0].hash).toEqual('object1');
        expect(entrance.entranceFiles[0].nextNodes[0].nextNodes).toEqual([]);
        expect(entrance.entranceFiles.length).toBe(1);
    });

    /**
     *   entranceFiles[0] ---+--- entranceFiles[1]
     *                       |
     *                entranceNode['object1'] -> (inflations[0], inflations[1])
     *                       |
     *                entranceNode['object8']
     */
    test("for inserting two duplicated nodes and their next node.", () => {
        entrance.insertGitObject(fakeGitObject7);
        entrance.insertGitObject(fakeGitObject8);

        // The duplicated gitObject 'object1' were stored in two entranceFiles.
        expect(entrance.entranceFiles.length).toBe(2);
        expect(entrance.entranceFiles[0].filePath).toBe('file1');
        expect(entrance.entranceFiles[1].filePath).toBe('file3');
        expect(entrance.entranceFiles[0].nextNodes[0]).toBe(entrance.entranceFiles[1].nextNodes[0]);
        expect(entrance.entranceFiles[0].nextNodes[0].inflations[0].filePath).toBe('file1');
        expect(entrance.entranceFiles[0].nextNodes[0].inflations[1].filePath).toBe('file3');
        expect(entrance.entranceFiles[0].nextNodes[0].hash).toBe('object1');
        expect(entrance.entranceFiles[1].nextNodes[0].hash).toBe('object1');
        expect(entrance.entranceFiles[1].nextNodes[0].nextNodes[0].hash).toBe('object8');
    });

    /**
     *    file1 ---+--- file3   file2
     *             |              |
     *          object1        object4
     *             |              |
     *        +----+----+      object5
     *        |         |         |
     *     object8   object2   object6
     *                  |                                        
     *               object3
     */
    test("for inserting multiple nodes.", () => {
        entrance.insertGitObject(fakeGitObject2);
        entrance.insertGitObject(fakeGitObject3);
        entrance.insertGitObject(fakeGitObject4);
        entrance.insertGitObject(fakeGitObject5);
        entrance.insertGitObject(fakeGitObject6);

        expect(entrance.entranceFiles.length).toBe(3);
        expect(entrance.entranceFiles[0].filePath).toBe('file1');
        expect(entrance.entranceFiles[1].filePath).toBe('file3');
        expect(entrance.entranceFiles[2].filePath).toBe('file2');
        expect(entrance.entranceFiles[0].nextNodes[0].hash).toBe('object1');
        expect(entrance.entranceFiles[2].nextNodes[0].hash).toBe('object4');
        expect(entrance.entranceFiles[0].nextNodes[0].nextNodes[0].hash).toBe('object8');
        expect(entrance.entranceFiles[0].nextNodes[0].nextNodes[1].hash).toBe('object2');
        expect(entrance.entranceFiles[2].nextNodes[0].nextNodes[0].hash).toBe('object5');
        expect(entrance.entranceFiles[0].nextNodes[0].nextNodes[0].nextNodes).toEqual([]);
        expect(entrance.entranceFiles[0].nextNodes[0].nextNodes[1].nextNodes[0].hash).toBe('object3');
        expect(entrance.entranceFiles[2].nextNodes[0].nextNodes[0].nextNodes[0].hash).toBe('object6');
    })
})