import {NextFunction, Request, Response, Router} from "express";
import {validateJWT} from "../middlewares/validate-jwt";
import {celebrate, Joi} from "celebrate";
import {Logger} from "winston";
import {Container} from 'typedi';
import AuthService from "../../services/auth";
import SettingsService from "../../services/settings";
import _ from 'lodash';
import {ISettingsBasicDTO, ISettingsImageSettingsDTO, ISettingsSongDTO} from "../../interfaces/ISettings";

const route = Router();

export default (app: Router) => {

    app.use('/settings', route);

    route.get(
        '/',
        validateJWT,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {
                const settingsServiceInstance = Container.get(SettingsService);
                const { rouletteDuration, rouletteLaps, rouletteWinnerDuration, song, defaultUsers, colors, songUrl, imageUrl, imageHeight, imageWidth, imageBackgroundSize, radioRoulette, marginTextRoulette } = await settingsServiceInstance.getSettings(req._id);
                return res.status(200).json({
                    ok: true,
                    settings: {
                        rouletteDuration,
                        rouletteLaps,
                        rouletteWinnerDuration,
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
                    }
                })
            } catch (e) {
                logger.error('error: %o', e);
                return res.status(401).json({
                    ok: false,
                    error: 'Cannot get settings'
                });
            }

        }
    );

    route.post(
        '/',
        [
            validateJWT,
            celebrate({
                body: Joi.object({
                    rouletteDuration: Joi.number(),
                    rouletteLaps: Joi.number(),
                    rouletteWinnerDuration: Joi.number(),
                    song: Joi.boolean(),
                    radioRoulette: Joi.number(),
                    marginTextRoulette: Joi.number(),
                })
            })
        ],
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {

                const { rouletteDuration,  rouletteLaps, rouletteWinnerDuration, song, radioRoulette, marginTextRoulette } = req.body;

                // Remove undefined and null values (not false) to allow endpoint to change only one property if needed.
                const settingsObject: ISettingsBasicDTO = _.pickBy({ rouletteDuration, rouletteLaps, rouletteWinnerDuration, song, radioRoulette, marginTextRoulette }, _.negate(_.isNil));

                if (Object.keys(settingsObject).length === 0) {
                    return res.status(400).json({
                        ok: false,
                        error: 'At least one property required.'
                    });
                }

                const settingsServiceInstance = Container.get(SettingsService);
                await settingsServiceInstance.updateBasicSettings(req._id, settingsObject);

                return res.status(200).json({
                    ok: true,
                    msg: 'Basic settings updated'
                });

            } catch (e) {
                logger.error('error: %o', e);
                return res.status(500).json({
                    ok: false,
                    error: 'Cannot update settings'
                });
            }
        }
    )

    route.post(
        '/image',
        [
            validateJWT,
            celebrate({
                body: Joi.object({
                    imageHeight: Joi.number(),
                    imageWidth: Joi.number(),
                    imageBackgroundSize: Joi.number(),
                })
            })
        ],
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {

                const { imageHeight, imageWidth, imageBackgroundSize } = req.body;

                // Remove undefined and null values (not false) to allow endpoint to change only one property if needed.
                const settingsObject: ISettingsImageSettingsDTO = _.pickBy({ imageHeight, imageWidth, imageBackgroundSize }, _.negate(_.isNil));

                if (Object.keys(settingsObject).length === 0) {
                    return res.status(400).json({
                        ok: false,
                        error: 'At least one property required.'
                    });
                }

                const settingsServiceInstance = Container.get(SettingsService);
                await settingsServiceInstance.updateImageSettings(req._id, settingsObject);

                return res.status(200).json({
                    ok: true,
                    msg: 'Image settings updated'
                });

            } catch (e) {
                logger.error('error: %o', e);
                return res.status(500).json({
                    ok: false,
                    error: 'Cannot update settings'
                });
            }
        }
    )

    route.post(
        '/update-default-users',
        [
            validateJWT,
            celebrate({
                body: Joi.object({
                    users: Joi.array().required().not().empty()
                })
            })
        ],
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {

                const { users } = req.body;

                const settingsServiceInstance = Container.get(SettingsService);
                await settingsServiceInstance.updateDefaultUsers(req._id, users);

                return res.json({
                    ok: true,
                    msg: 'Default users updated'
                })

            } catch(e) {
                logger.error('error: %o', e);
                return res.status(500).json({
                    ok: false,
                    error: 'Cannot update default users'
                });
            }
        }
    )

    route.post(
        '/update-colors',
        [
            validateJWT,
            celebrate({
                body: Joi.object({
                    colors: Joi.array().required().not().empty()
                })
            })
        ],
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {

                const { colors } = req.body;

                const settingsServiceInstance = Container.get(SettingsService);
                await settingsServiceInstance.updateColors(req._id, colors);

                return res.json({
                    ok: true,
                    msg: 'Colors updated'
                })

            } catch(e) {
                logger.error('error: %o', e);
                return res.status(500).json({
                    ok: false,
                    error: 'Cannot update colors'
                });
            }
        }
    )
}