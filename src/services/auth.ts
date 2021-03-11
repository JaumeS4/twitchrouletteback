import {Container, Inject, Service} from "typedi";
import {Logger} from "winston";
import {getTwitchToken, getTwitchUser} from "../helpers/Axios";
import Database from "./database";
import {createJWT, renewJWT} from "../helpers/jwt";
import {IUser} from "../interfaces/IUser";
import UserService from "./user";
import {ObjectId} from "mongoose";
import KeyService from "./key";
import TmiService from "./tmi";

@Service()
export default class AuthService {
    constructor(@Inject('logger') private logger: Logger) {
    }

    public async SignIn(code: string):Promise<{ token: string, verified: boolean, userId: ObjectId, twitchId: string, twitchName: string, twitchProfileImageUrl: string, rouletteToken: string }> {
        try {
            const databaseInstance = Container.get(Database);
            const tokens = await getTwitchToken(code);
            let token;
            const userData = await getTwitchUser(tokens.access_token);
            const userRecord: IUser = await databaseInstance.getUserWithTwitchId(userData.id);

            let createdUser;

            if (!userRecord) {
                createdUser = await databaseInstance.createUser(userData.id, userData.login, userData.profile_image_url);
                await databaseInstance.createSettings(createdUser._id);
                await databaseInstance.createRoulette(createdUser._id);
                token = await createJWT(
                    createdUser._id, userData.id, userData.login, userData.profile_image_url,
                    tokens.access_token, tokens.refresh_token
                );
            } else {
                await databaseInstance.updateUser(userRecord._id, userData.login, userData.profile_image_url);
                token = await createJWT(
                    userRecord._id, userData.id, userData.login, userData.profile_image_url,
                    tokens.access_token, tokens.refresh_token
                );
            }

            return {
                token,
                verified: (userRecord ? userRecord.verified : createdUser.verified),
                userId: (userRecord ? userRecord._id : createdUser._id),
                twitchId: userData.id,
                twitchName: userData.login,
                twitchProfileImageUrl: userData.profile_image_url,
                rouletteToken: (userRecord ? userRecord.rouletteToken : ''),
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }

    }

    public async ValidateToken(token: string): Promise<{ token: string | undefined, userId: ObjectId, verified: boolean, twitchId: string, twitchName: string, twitchProfileImageUrl: string, rouletteToken: string }> {

        try {
            const { _id, newToken, twitchId, twitchName, twitchProfileImageUrl } = await renewJWT(token);

            const userInstance = Container.get(UserService);
            const { rouletteToken, verified } = await userInstance.getUser(_id);
            return {
                token: newToken,
                verified,
                userId: _id,
                twitchId,
                twitchName,
                twitchProfileImageUrl,
                rouletteToken
            }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }

    }

    public async VerifyAccount(key: string, mongoUserId: ObjectId) {

        try {
            const keyInstance = Container.get(KeyService);
            await keyInstance.verifyAccount(key, mongoUserId);
        } catch (e) {
            this.logger.error(e);
            throw e;
        }

    }
}

