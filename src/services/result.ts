import {Container, Inject, Service} from "typedi";
import {Logger} from "winston";
import Database from "./database";
import {ObjectId} from "mongoose";


@Service()
export default class ResultService {
    constructor(@Inject('logger') private logger: Logger) {
    }

    public async createResult(winner: string, uid: string, user: ObjectId) {
        try {
            const databaseInstance = Container.get(Database);
            await databaseInstance.createResult(winner, uid, user);
        } catch (e) {
            this.logger.error(e);
            throw e;
        }

    }
}