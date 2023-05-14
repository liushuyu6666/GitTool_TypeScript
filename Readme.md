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


# Chatgpt answer
Yes, you can develop a desktop application using a monolithic architecture. In fact, many desktop applications are developed using this approach.

To implement this approach, you can use a desktop application framework like Electron or NW.js to create a desktop application that includes both the frontend and backend code. This framework allows you to package your application into a standalone executable that can be installed and run on a user's desktop, just like a native application.

Here's an example of how you could implement this:

Create a Node.js backend using a web framework like Express.js or Nest.js. This backend should include the code that generates the Git commit map, as well as the code that serves the frontend.

Create a React (or another frontend framework) user interface that displays the Git commit map in a visual format. This could be done using a library like D3.js or React-Vis.

Use a desktop application framework like Electron or NW.js to create a desktop application that includes both the frontend and backend code. This framework allows you to package your application into a standalone executable that can be installed and run on a user's desktop, just like a native application.

In the desktop application, generate the HTML content that includes both the frontend and backend code. You can use a templating engine like Handlebars or Pug to generate the HTML.

Serve the generated HTML to the client when the user requests the page. This will include both the frontend and backend code in a single page, allowing them to work together seamlessly.

By following this approach, you can create a desktop application that includes both the frontend and backend code in a single package. This can simplify the deployment process and make it easier to maintain the application over time, as everything is packaged together in a single unit. However, it can also make the application harder to scale and may lead to performance issues if the application grows too large.

