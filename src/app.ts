import 'reflect-metadata';

import express from 'express';
import http from 'http';
import {Container} from "typedi";

import config from './config';
import Logger from './loaders/logger';
import SocketService from "./services/socket";

async function startServer(): Promise<void> {
    const app = express();
    const httpServer = new http.Server(app);

    await require('./loaders').default({ expressApp: app, httpServer: httpServer });

    Container.get(SocketService);

    httpServer.listen(config.port, () => {
        Logger.info(`
        ################################################
         🛡️  Server listening on port: ${config.port} 🛡️
        ################################################
      `);
    }).on('error', err => {
        Logger.error(err);
        process.exit(1);
    });


}

process.on('unhandledRejection', (error, promise) => {
    Logger.error(' Oh Lord! We forgot to handle a promise rejection here: ', promise);
    Logger.error(' The error was: ', error );
});

export default startServer;