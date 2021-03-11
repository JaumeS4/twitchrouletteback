import mongoose from "mongoose";

export interface IUser {
    _id: mongoose.Schema.Types.ObjectId;
    verified: boolean;
    twitchId: string;
    twitchName: string;
    twitchProfileImageUrl: string;
    rouletteToken: string;
}