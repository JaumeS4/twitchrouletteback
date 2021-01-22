import { Inject, Service } from "typedi";
import { Server } from "socket.io";


@Service()
export default class SocketService {

    constructor(
        @Inject('ioClient') private ioClient: Server
    ) {
        // this.listenSocketEvents();
    }



    // private listenSocketEvents() {
    //     this.ioClient.on('connection', (socket: Socket) => {
    //         console.log('User connected');
    //     });
    //
    // }

    public addUserEvent(name: string, fromMod: boolean) {
        this.ioClient.emit('addUser', { name, fromMod });
    }

}