import {ObjectId} from "mongoose";

interface User {
    name: string;
    uid: string;
    fromMod: boolean;
}

export interface IRoulette {
    user: ObjectId;
    users: Array<User>;
    subMode: boolean;
    followMode: boolean;
    colorIndex: number;
    defaultRouletteActive: boolean;
    spinning: boolean;
}