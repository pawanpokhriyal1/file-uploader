const net = require("net");
const fs = require("node:fs/promises")
const server = net.createServer(() => {

})

server.on("connection", (socket) => {
    let fileHandle, fileWriteStream;
    console.log("new connection");


    socket.on("data", async (data) => {

        if (!fileHandle) {
            socket.pause();// no longer received the data from the client

            const indexofDivider = data.indexOf("-------");
            const fileName = data.subarray(10, indexofDivider).toString("utf-8");

            fileHandle = await fs.open(`storage/${fileName}`, "w");
            fileWriteStream = fileHandle.createWriteStream();

            //writing to our destination file
            fileWriteStream.write(data.subarray(indexofDivider + 7));

            socket.resume();//resume receiving data from the client
            fileWriteStream.on("drain", () => {
                socket.resume();
            })
        }
        else {
            if (!fileWriteStream.write(data)) {
                socket.pause();

            }
        }
    })

    socket.on("end", () => {
        console.log("Connection ended");
        if (fileHandle) fileHandle.close();
        fileHandle = undefined;
        fileWriteStream = undefined;
    })
})


server.listen(5050, "172.31.42.2", () => {
    console.log("uploader server opened on ", server.address());
})