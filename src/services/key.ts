import {Container, Inject, Service} from "typedi";
import {Logger} from "winston";
import {ObjectId} from "mongoose";
import Database from "./database";
import {connectToNewChannel} from "../loaders/tmi";

@Service()
export default class KeyService {
    constructor(@Inject('logger') private logger: Logger) {
    }

    public async verifyAccount(key: string, mongoUserId: ObjectId) {
        try {
            const databaseInstance = Container.get(Database);
            const keyResult = await databaseInstance.getKey(key);

            if (!keyResult) throw new Error('no-key-found');
            if (keyResult.used) throw new Error('key-already-used');

            await databaseInstance.validateAccount(mongoUserId);
            await databaseInstance.useKey(keyResult._id, mongoUserId);

            await connectToNewChannel(mongoUserId);

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
}