import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import config from '../config';
import {IToken} from "../interfaces/IToken";


export const createJWT = async (_id: mongoose.Schema.Types.ObjectId, twitchId: string, twitchName: string, twitchProfileImageUrl: string, twitchAccessToken: string, twitchRefreshToken: string,) => {
    return jwt.sign({
        _id,
        twitchId,
        twitchName,
        twitchProfileImageUrl,
        twitch_access_token: twitchAccessToken,
        twitch_refresh_token: twitchRefreshToken,
    }, config.jwtSecret, {expiresIn: config.jwtExpiration});
}


export const validateJWT = (token: string) =>{
    try {
        const decoded = jwt.verify( token, config.jwtSecret );
        return {
            ok: true,
            id: (decoded as IToken)._id
        }
    } catch (err) {
        return {
            ok: false,
            id: null
        }
    }
}

export const renewJWT = async (token: string) => {
    const decoded = jwt.verify(token, config.jwtSecret);
    const {_id, twitchId, twitchName, twitchProfileImageUrl, twitchAccessToken, twitchRefreshToken} = decoded as IToken;

    const oneDay = new Date().getTime() + (24 * 60 * 60 * 1000);
    const expDate = new Date((decoded as IToken).iat).getTime();

    if (oneDay > expDate) {
        const newToken = await createJWT(_id, twitchId, twitchName, twitchProfileImageUrl, twitchAccessToken, twitchRefreshToken);
        return {
            _id,
            newToken,
            twitchId,
            twitchName,
            twitchProfileImageUrl,
        }
    }

    return {
        _id,
        twitchId,
        twitchName,
        twitchProfileImageUrl,
    };
}