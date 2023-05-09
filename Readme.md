# Overview


# How to run



# Improvement
1. change the prod repository in the test.
2. for all tests, should have a configuration manager to organize all files and paths.
3. should have a test file to start priors to all other test files, for configuration purpose.
4. an option to not run the prod repository since it is time-consuming.
5. integrate `entranceFileParser`, `deltifiedParser` and `undeltifiedParser` into `Entrance` class.
6. Have a special data structure for all loose objects.



## `Entrance`
Each packed git object is either `undeltified` or `deltified`, where `deltified` objects have a delta content that depends on a base object for reconstruction. `Entrance` records the dependency relationship of all packed git objects to optimize parsing. 

The `Entrance` begins with multiple `EntranceFiles`, each of which records the path of one `.pack` file and its `undeltified` objects as child nodes in the `EntranceNode` data structure. Each `EntranceNode` records the necessary information for parsing, as well as its child nodes, which are also stored as `EntranceNode` data structures. Packed git objects are organized in this manner. Two things to note are that:
1. some git objects share the same hash but are distributed across different `.pack` files (known as duplicated `gitObject`) with different types, a `distributions` field is used to record all the distributions.
2. the delta of the `ref_delta` object may be stored differently from its base object.

The `Entrance` is designed to parse packed objects using minimal time and memory. To accomplish this, we should read the `.pack` file as less as possible. By observation, we know that
1. `connected`: If an object is connected to `EntranceFile_A`, it means that its grandparent is `EntranceFile_A`, and it can be parsed by starting from `EntranceFile_A`. However, one `deltified` object connected to `EntranceFile_A` might not be stored in `A.pack`. Meanwhile,
2. `stored`: a stored `deltified` object might not be connected to `EntranceFile_A`.
We should start from the `EntranceFile` and read its associated `.pack` file once, parsing all its connected objects stored in it. Then, we can read other `.pack` files to parse the rest. For objects with multiple distributions, we need to find the `shortestDistribution` stored in the current `.pack` file to avoid reading a new `.pack` file. A `parsedSet` set is also needed to record all parsed objects.



