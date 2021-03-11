
import { Application } from 'express';

import Logger from './logger';
import mongooseLoader from './mongoose';
import dependencyInjectorLoader from './dependencyInjector';
import expressLoader from './express';
import socketIOLoader from './socket-io';
import tmiClientLoader from "./tmi";
import cloudinaryLoader from './cloudinary';
import {Server} from "http";

export default async ({ expressApp, httpServer }: { expressApp: Application, httpServer: Server }) => {
    await mongooseLoader();
    Logger.info('DB loaded and connected!');

    await expressLoader({ app: expressApp });
    Logger.info('Express Initialized');

    const ioClient = await socketIOLoader({ server: httpServer });
    Logger.info('SocketIO Initialized');

    Logger.info('Loading Dependency Injector');
    await dependencyInjectorLoader({ ioClient: ioClient });
    Logger.info('Dependency Injector loaded');

    await tmiClientLoader();
    Logger.info('tmiClient Initialized');

    await cloudinaryLoader();
    Logger.info('Cloudinary Initialized');


}
