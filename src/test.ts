import { PointIOHandler } from "./classes/IOHandlers/PointIOHandler";

let pointIO = new PointIOHandler("192.168.49.42");

pointIO.connect();

setTimeout(async () => {
    for(let i = 0; i < 4000; i++)
    {
        console.log("reading at: ", i);
        let res = await pointIO.read(i)
        console.log("received", res);
    }
}, 1000);