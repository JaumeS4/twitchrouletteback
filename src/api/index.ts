import { Router } from 'express';
import auth from "./routes/auth";
import settings from "./routes/settings";
import upload from "./routes/upload";
import roulette from "./routes/roulette";


export default () => {
    const app = Router();
    auth(app);
    settings(app);
    upload(app);
    roulette(app);

    return app;
}