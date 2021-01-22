import tmi from 'tmi.js';
import {Container} from "typedi";

import TwitchService from "../services/twitch";
import config from '../config';

const opts: tmi.Options = {
    options: {
        debug: config.tmi.debug
    },
    connection: {
        reconnect: true,
    },
    channels: config.tmi.channels
}

const twitchService = Container.get(TwitchService);

const client = new tmi.client(opts);
client.on('message', twitchService.onMessageHandler);

const twitchClientLoader = async() => await client.connect();

export default twitchClientLoader;