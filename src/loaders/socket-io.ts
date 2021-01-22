import socketIO from "socket.io";
import {Server} from "http";

export default ({ server }: { server: Server }) => {

    return new socketIO.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        serveClient: false,
    });

}
