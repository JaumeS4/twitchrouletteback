import tmi from 'tmi.js';
import {Container} from "typedi";

import TmiService from "../services/tmi";
import config from '../config';
import {ObjectId} from "mongoose";
import UserService from "../services/user";

const opts: tmi.Options = {
    options: {
        debug: config.tmi.debug
    },
    connection: {
        reconnect: true,
    },
}

const tmiInstance = Container.get(TmiService);

export const tmiClient = new tmi.client(opts);
tmiClient.on('chat', tmiInstance.onMessageHandler);

const tmiClientLoader = async() => {
    await tmiClient.connect();
    await tmiInstance.connectToChannels();
};

// TODO: Mover esto a tmi service
export const connectToNewChannel = async (mongoUserId: ObjectId) => {
    const userInstance = Container.get(UserService);
    const user = await userInstance.getUser(mongoUserId);
    await tmiClient.join(user.twitchName);
}

export default tmiClientLoader;