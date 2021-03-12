import {NextFunction, Request, Response, Router} from "express";
import {validateJWT} from "../middlewares/validate-jwt";
import {Container} from "typedi";
import RouletteService from "../../services/roulette";
import {celebrate, Joi} from "celebrate";
import {Logger} from "winston";
import SettingsService from "../../services/settings";

const route = Router();

export default (app: Router) => {

    app.use('/roulette', route);

    route.get(
        '',
        validateJWT,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {
                const rouletteInstance = Container.get(RouletteService);
                const { users, followMode, subMode, colorIndex, defaultRouletteActive } = await rouletteInstance.getRoulette(req._id);
                return res.status(200).json({
                    ok: true,
                    roulette: {
                        users,
                        followMode,
                        subMode,
                        colorIndex,
                        defaultRouletteActive,
                    }
                });
            } catch (e) {
                logger.error('error: %o', e);
                return res.status(401).json({
                    ok: false,
                    error: 'Cannot get roulette'
                });
            }
        }
    )

    route.post(
        '/generate-token',
        validateJWT,
        async (req: Request, res: Response, next: NextFunction) => {

            try {

                const rouletteInstance = Container.get(RouletteService);
                const rouletteToken = await rouletteInstance.generateToken(req._id);
                await rouletteInstance.resetRoulette(req._id);

                return res.json({
                    ok: true,
                    rouletteToken,
                });

            } catch (e) {

                return res.status(500).json({
                    ok: false,
                    msg: 'Something went wrong.'
                });

            }

        }
    )

    route.post(
        '/validate-token',
        celebrate({
            body: Joi.object({
                token: Joi.string().required()
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {

            try {
                const { token } = req.body;
                const rouletteInstance = Container.get(RouletteService);
                const {
                    user: { twitchId, twitchName, twitchProfileImageUrl, rouletteToken },
                    settings: { rouletteDuration, rouletteLaps, song, defaultUsers, colors, songUrl, imageUrl, imageHeight, imageWidth, imageBackgroundSize, radioRoulette, marginTextRoulette },
                    roulette: { users, subMode, followMode, colorIndex, defaultRouletteActive }
                } = await rouletteInstance.validateTokenRespData(token);

                return res.json({
                    ok: true,
                    user: {
                        twitchId,
                        twitchName,
                        twitchProfileImageUrl,
                        rouletteToken,
                    },
                    settings: {
                        rouletteDuration,
                        rouletteLaps,
                        song,
                        defaultUsers,
                        colors,
                        songUrl,
                        imageUrl,
                        imageHeight,
                        imageWidth,
                        imageBackgroundSize,
                        radioRoulette,
                        marginTextRoulette
                    },
                    roulette: {
                        users,
                        subMode,
                        followMode,
                        colorIndex,
                        defaultRouletteActive
                    }
                });

            } catch(e) {

                if (e.message === 'no-user-found') {
                    return res.status(400).json({
                        ok: false,
                        msg: 'No user found',
                    });
                }

                return res.status(500).json({
                    ok: false,
                    msg: 'Something wrong happened'
                });

            }

        }
    )

}