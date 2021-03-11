import {NextFunction, Request, Response, Router} from "express";
import {Logger} from "winston";
import {Container} from "typedi";
import AuthService from "../../services/auth";
import {celebrate, Joi} from "celebrate";
import {validateJWT} from "../middlewares/validate-jwt";
import UserService from "../../services/user";

const route = Router();

export default (app: Router) => {

    app.use('/auth', route);

    route.post(
        '/signin',
        celebrate({
            body: Joi.object({
                code: Joi.string().required()
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {
                const { code } = req.body;
                const authServiceInstance = Container.get(AuthService);
                const { token, verified, userId, twitchId, twitchName, twitchProfileImageUrl, rouletteToken } = await authServiceInstance.SignIn(code);

                return res.status(200).json({
                    ok: true,
                    userId,
                    token,
                    verified,
                    twitchId,
                    twitchName,
                    twitchProfileImageUrl,
                    rouletteToken
                });
            } catch (e) {
                logger.error('error: %o', e);
                return res.status(401).json({
                    ok: false,
                    error: 'Cannot login'
                });
            }

        }
    )

    route.get(
        '/validate-token',
        validateJWT,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {

                const authServiceInstance = Container.get(AuthService);
                const { token, verified, userId, twitchId, twitchName, twitchProfileImageUrl, rouletteToken } = await authServiceInstance.ValidateToken(req.header('x-token') || '');

                return res.status(200).json({
                    ok: true,
                    token,
                    verified,
                    userId,
                    twitchId,
                    twitchName,
                    twitchProfileImageUrl,
                    rouletteToken
                });

            } catch (e) {
                logger.error('error: %o', e);
                return res.status(401).json({
                    ok: false,
                    error: 'Cannot validate token'
                });
            }
        }
    )

    route.post(
        '/verify-account',
        [
            celebrate({
                body: Joi.object({
                    key: Joi.string().required()
                }),
            }),
            validateJWT
        ],
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {
                const { key } = req.body;
                const userInstance = Container.get(UserService);
                const verified = await userInstance.checkVerified(req._id);

                if (verified) {
                    return res.send({
                        ok: true,
                        msg: 'Already verified'
                    });
                }

                const authInstance = Container.get(AuthService);
                await authInstance.VerifyAccount(key, req._id);

                return res.send({
                    ok: true
                });

            } catch (e) {
                if (e.message === 'no-key-found' || e.message === 'key-already-used'  ) {
                    return res.status(401).json({
                        ok: false,
                    });
                }

                logger.error('error: %o', e);
                return res.status(500).json({
                    ok: false,
                    error: 'Cannot verify account'
                })
            }


        }
    )

}