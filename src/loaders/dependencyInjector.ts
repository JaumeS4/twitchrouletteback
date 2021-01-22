import {Container} from "typedi";
// import TwitchClient from "./twitch";
import LoggerInstance from "./logger";
import {Server, Socket} from "socket.io";

export default ({ ioClient }: { ioClient: Server }) => {
    try {
        Container.set('logger', LoggerInstance);
        Container.set('ioClient', ioClient);

    } catch (e) {
        LoggerInstance.error('Error on dependency injector loader: %o', e);
        throw e;
    }
}