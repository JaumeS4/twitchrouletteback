import { Router } from 'express';
import auth from "./routes/auth";
import settings from "./routes/settings";
import upload from "./routes/upload";
import roulette from "./routes/roulette";
import user from "./routes/user";


export default () => {
    const app = Router();
    auth(app);
    user(app);
    settings(app);
    upload(app);
    roulette(app);

    return app;
}