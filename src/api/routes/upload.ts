import {NextFunction, Request, Response, Router} from "express";
import {celebrate, Joi} from "celebrate";
import {Logger} from "winston";

import UploadService from "../../services/upload";
import {validateJWT} from "../middlewares/validate-jwt";
import upload from "../middlewares/upload";
import multer from "multer";
import {Container} from "typedi";
import SettingsService from "../../services/settings";

const route = Router();

const uploadSingle = upload.single('file');

export default (app: Router) => {

    app.use('/upload', route);
    route.post(
        '/',
        [
            validateJWT,
        ],
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');
            uploadSingle(req, res, async function(err: any) {

                // Handle errors from Multer uploading file
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({ok: false, err: err.code, message: err.message});
                } else if (err) {
                    // Validate manually errors from upload middleware cause they dont come from MulterError.
                    if (err?.message === 'filetype-error') return res.status(400).json({ ok: false, err: 'invalid-file-type', message: 'Only allowed jpg, jpeg, png or gif.' });

                    if (err?.message === 'type-not-valid') return res.status(400).json({ ok:false, err: 'invalid-type', message: 'Valid types are image or song.'});

                    return res.status(500).json({ ok: false, message: 'Something wrong happened.' });
                }

                try {
                    const { type } = req.body;

                    const uploadServiceInstance = Container.get(UploadService);

                    const url = await uploadServiceInstance.uploadFile(req.file.path, type, req._id);

                    return res.json({
                        ok: true,
                        url
                    });
                } catch (e) {
                    logger.error(JSON.stringify(e));
                   return res.status(500).json({
                       ok: false,
                       message: 'Something went wrong.'
                   })
                }

            });
        }
    )

    route.delete(
        '/delete-image',
        validateJWT,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger:Logger = Container.get('logger');

            try {

                const uploadInstance = Container.get(UploadService);
                await uploadInstance.removeImage(req._id);

                return res.json({
                    ok: true,
                    msg: 'Image deleted'
                });

            } catch(e) {
                logger.error('error: %o', e);
                return res.status(500).json({
                    ok: false,
                    error: 'Cannot delete image'
                });
            }
        }
    )

}