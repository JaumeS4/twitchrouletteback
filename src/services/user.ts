import {Container, Inject, Service} from "typedi";
import {Logger} from "winston";
import {ObjectId} from "mongoose";
import Database from "./database";
import {IUser} from "../interfaces/IUser";

@Service()
export default class UserService {
    constructor(@Inject('logger') private logger: Logger) {
    }

    public async getTwitchUserNameFromVerified(): Promise<string[]> {
        const databaseInstance = Container.get(Database);
        const users = await databaseInstance.getAllUsersVerified();
        return users.map( user => user.twitchName );
    }

    public async getUser(mongoId: ObjectId): Promise<IUser> {
        const databaseInstance = Container.get(Database);
        return databaseInstance.getUserWithMongoId(mongoId);
    }

    public async getUserWithChannelName(channelName: string): Promise<IUser> {
        const databaseInstance = Container.get(Database);
        return databaseInstance.getUserWithChannelName(channelName);
    }

    public async getUserWithRouletteToken(rouletteToken: string): Promise<IUser | undefined> {
        const databaseInstance = Container.get(Database);
        return databaseInstance.getUserWithRouletteToken(rouletteToken);
    }

    public async updateRouletteToken(mongoId: ObjectId, token: string): Promise<IUser> {
        const databaseInstance = Container.get(Database);
        return databaseInstance.updateRouletteToken(mongoId, token);
    }

    public async checkVerified(mongoId: ObjectId): Promise<boolean> {
        const databaseInstance = Container.get(Database);
        const user = await databaseInstance.getUserWithMongoId(mongoId);

        return user.verified;
    }

}