import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken';

import config from '../../config';
import {IToken} from "../../interfaces/IToken";

export const validateJWT = (req: Request, res: Response, next: NextFunction) => {

    try {

        const token = req.header('x-token');

        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'Token not send.'
            });
        }

        const decoded = jwt.verify( token, config.jwtSecret);

        req._id = (decoded as IToken)._id;
        req.twitchId = (decoded as IToken).twitchId;
        req.twitchName = (decoded as IToken).twitchName;
        req.twitchAccessToken = (decoded as IToken).twitchAccessToken;
        req.twitchRefreshToken = (decoded as IToken).twitchRefreshToken;

        next();
    } catch (e) {
        return res.status(401).json({
            ok: false,
            msg: 'Token not valid.'
        });
    }

}