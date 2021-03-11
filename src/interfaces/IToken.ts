import mongoose from "mongoose";


export interface IToken {
    _id: mongoose.Schema.Types.ObjectId,
    verified: boolean,
    twitchId: string,
    twitchName: string,
    twitchProfileImageUrl: string,
    twitchAccessToken: string
    twitchRefreshToken: string,
    iat: number,
    exp: number,
};