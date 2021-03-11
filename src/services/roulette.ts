import {Container, Inject, Service} from "typedi";
import {Logger} from "winston";
import {ObjectId} from "mongoose";
import { v4 as uuid } from 'uuid';
import UserService from "./user";
import SettingsService from "./settings";
import {IUser} from "../interfaces/IUser";
import {ISettings} from "../interfaces/ISettings";
import Database from "./database";
import {IRoulette} from "../interfaces/IRoulette";



@Service()
export default class RouletteService {

    constructor(@Inject('logger') private logger: Logger) {
    }

    public async getRoulette(userId: ObjectId): Promise<IRoulette> {
        const databaseInstance = Container.get(Database);
        return await databaseInstance.getRoulette(userId);
    }

    public async generateToken(userId: ObjectId): Promise<string> {

        const userInstance = Container.get(UserService);
        const resp = await userInstance.updateRouletteToken(userId, uuid());
        if (!resp.rouletteToken) throw new Error('No rouletteToken');
        return resp.rouletteToken;

    }

    public async validateTokenRespData(token: string): Promise<{ user: IUser, settings: ISettings, roulette: IRoulette }> {

        const userInstance = Container.get(UserService);
        const user = await userInstance.getUserWithRouletteToken(token);

        if (!user) throw new Error('no-user-found');

        const settingsInstance = Container.get(SettingsService);
        const rouletteInstance = Container.get(RouletteService);
        const settings = await settingsInstance.getSettings(user._id);
        const roulette = await rouletteInstance.getRoulette(user._id);

        return {
            user,
            settings,
            roulette,
        }

    }

    public async validateToken(token: string): Promise<{ ok: boolean, id: ObjectId | null }> {
        const userInstance = Container.get(UserService);
        const user = await userInstance.getUserWithRouletteToken(token);
        if (!user) return { ok: false, id: null };

        return {
            ok: true,
            id: user._id
        };

    }

    public async resetRoulette(userId: ObjectId) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.resetRoulette(userId);
    }

    public async updateSubMode(userId: ObjectId, bool: boolean) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateSubMode(userId, bool);
    }

    public async addUserFromTwitch(channelName: string, user: any) {
        const userInstance = Container.get(UserService);
        const { _id } = await userInstance.getUserWithChannelName(channelName);
        return await this.addUser(_id, user);
    }

    public async addUser(userId: ObjectId, newUser: any) {
        const databaseInstance = Container.get(Database);
        const settingsInstance = Container.get(SettingsService);

        const { defaultRouletteActive, colorIndex, users, subMode } = await databaseInstance.getRoulette(userId);
        const { colors } = await settingsInstance.getSettings(userId);
        // TODO: Manejar if/else de una forma mas legible
        if (!newUser.fromMod) {

            if (users.find( (user) => user.name === newUser.name && !user.fromMod  )) return false;

            if (subMode) {

                if (newUser.subscriber) {
                    if ( defaultRouletteActive ) await databaseInstance.updateDefaultRouletteActive(userId, false);

                    await databaseInstance.incrementColorIndex(userId, colorIndex);
                    await databaseInstance.addUser(userId, newUser);

                    if (colorIndex >= colors.length -1) await databaseInstance.resetColorIndex(userId);
                    return true;
                }
            } else {
                if ( defaultRouletteActive ) await databaseInstance.updateDefaultRouletteActive(userId, false);

                await databaseInstance.incrementColorIndex(userId, colorIndex);
                await databaseInstance.addUser(userId, newUser);

                if (colorIndex >= colors.length -1) await databaseInstance.resetColorIndex(userId);
                return true;
            }

        } else {
            if ( defaultRouletteActive ) await databaseInstance.updateDefaultRouletteActive(userId, false);

            await databaseInstance.incrementColorIndex(userId, colorIndex);
            await databaseInstance.addUser(userId, newUser);

            if (colorIndex >= colors.length -1) await databaseInstance.resetColorIndex(userId);
            return true;
        }

    }

    public async removeUser(userId: ObjectId, userUid: string) {
        const databaseInstance = Container.get(Database);
        const { users } = await databaseInstance.getRoulette(userId);

        if (users.length <= 1) {
            await databaseInstance.resetRoulette(userId);
        } else {
            await databaseInstance.removeUser(userId, userUid);
        }
    }

    public async removeAllUsers(userId: ObjectId) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.removeAllUsers(userId);
    }

    public async updateDefaultRouletteActive(userId: ObjectId, bool: boolean) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateDefaultRouletteActive(userId, bool);
    }

    public async incrementColorIndex(userId: ObjectId, colorIndex: number) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.incrementColorIndex(userId, colorIndex);
    }

    public async resetColorIndex(userId: ObjectId) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.resetColorIndex(userId);
    }

    public async updateSubModeFromTwitch(channelName: string, bool: boolean) {
        const userInstance = Container.get(UserService);
        const databaseInstance = Container.get(Database);
        const { _id } = await userInstance.getUserWithChannelName(channelName);
        await databaseInstance.updateSubMode(_id, bool);
    }

}