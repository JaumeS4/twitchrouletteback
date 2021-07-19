import {NextFunction, Request, Response, Router} from "express";
import {validateJWT} from "../middlewares/validate-jwt";
import {Logger} from "winston";
import {Container} from "typedi";
import UserService from "../../services/user";

const route = Router();

export default (app: Router) => {

    app.use('/user', route);

    // Al tener novedades, hay que actualizar manualmente el campo "viewedNews"
    // de todos los usuarios en la base de datos.
    // Desde la shell de mongo:
    // use name_db
    // db.users.updateMany({}, {$set: {"viewedNews": false}})

    route.post('/viewed-news', validateJWT, async (req: Request, res: Response, next: NextFunction) => {
        const logger:Logger = Container.get('logger');

        try {
            const userServiceInstance = Container.get(UserService);
            await userServiceInstance.updateViewedNews(req._id, true);

            return res.status(200).json({
                ok: true
            });

        }  catch (e) {
        logger.error('error: %o', e);
        return res.status(401).json({
            ok: false,
            error: 'Cannot validate token'
        });
    }
    })

}