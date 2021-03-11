import mongoose from "mongoose";

declare global {
    namespace Express {
        interface Request {
            _id: mongoose.Schema.Types.ObjectId,
            twitchId: string,
            twitchName: string,
            twitchAccessToken: string,
            twitchRefreshToken: string,
            fileLimitError: boolean,

        }
    }
}