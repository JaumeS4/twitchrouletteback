import {NextFunction, Request, Response} from "express";
import {isCelebrateError} from "celebrate";


export const errorHandling = (err: any, req: Request, res: Response, next: NextFunction) => {
    const errorBody = err.details.get('body');
    const { details: [errorDetails] } = errorBody;

    if (isCelebrateError(err)) {
        return res.send({
            statusCode: 400,
            ok: false,
            error: true,
            message: errorDetails
        })
    }

}