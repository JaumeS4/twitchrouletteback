import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import routes from '../api';
import config from '../config';
import {errorHandling} from "../helpers/errorHandler";


export default ({ app }: { app: express.Application }) => {

    // Logger for endpoint calls
    app.use( morgan('dev') );

    // Enable Cross Origin Resource Sharing to all origins by default (@TODO Config this).
    app.use( cors() );

    // Add helmet security
    app.use(helmet());

    // Middleware that transforms the raw input into json
    app.use( express.json() );

    // Load API routes
    app.use(config.api.prefix, routes());

    // Celebrate error handler
    app.use( errorHandling );

    // Error handlers
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
            }
        })
    });

}