
import { Application } from 'express';

import Logger from './logger';
import dependencyInjectorLoader from './dependencyInjector';
import expressLoader from './express';
import socketIOLoader from './socket-io';
import twitchClientLoader from "./tmi";
import {Server} from "http";

export default async ({ expressApp, httpServer }: { expressApp: Application, httpServer: Server }) => {

    await expressLoader({ app: expressApp });
    Logger.info('Express Initialized');

    const ioClient = await socketIOLoader({ server: httpServer });
    Logger.info('SocketIO Initialized');

    Logger.info('Loading Dependency Injector');
    await dependencyInjectorLoader({ ioClient: ioClient });
    Logger.info('Dependency Injector loaded');

    await twitchClientLoader();
    Logger.info('TwitchClient Initialized');
}
