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
import {Server} from "socket.io";
import SocketService from "./socket";



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

    public async updateManualMode(userId: ObjectId, bool: boolean) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateManualMode(userId, bool);
    }

    public async updateSpinning(userId: ObjectId, spinning: boolean) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateSpinning(userId, spinning);
    }

    public async addUserFromTwitch(channelName: string, user: any) {
        const userInstance = Container.get(UserService);
        const databaseInstance = Container.get(Database);

        const { _id } = await userInstance.getUserWithChannelName(channelName);
        const userDB = await databaseInstance.findUserWaiting(_id, user.name);

        if (userDB.length >= 1) return false;

        return await this.addUser(_id, user);
    }

    public async addUser(userId: ObjectId, newUser: any) {

        const databaseInstance = Container.get(Database);
        const settingsInstance = Container.get(SettingsService);

        const { defaultRouletteActive, colorIndex, users, subMode, manualMode } = await databaseInstance.getRoulette(userId);
        const { colors } = await settingsInstance.getSettings(userId);
        const subscriber = newUser.subscriber;
        delete newUser.subscriber;
        // TODO: Manejar if/else de una forma mas legible
        if (!newUser.fromMod) {

            if (manualMode) return;

            if (users.find( (user) => user.name === newUser.name && !user.fromMod  )) return false;

            if (subMode) {

                if (subscriber) {
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

    public async addUsers(userId: ObjectId, usersArr: [{ uid: string, name: string }], ioClient: Server, twitchName: string) {
        const databaseInstance = Container.get(Database);
        const settingsInstance = Container.get(SettingsService);

        const { defaultRouletteActive, colorIndex } = await databaseInstance.getRoulette(userId);
        const { colors } = await settingsInstance.getSettings(userId);

        if ( defaultRouletteActive ) await databaseInstance.updateDefaultRouletteActive(userId, false);

        await databaseInstance.updateLoadingManualUsers(userId, true);
        for (const user of usersArr) {
            await databaseInstance.incrementColorIndex(userId, colorIndex);
            await databaseInstance.addUser(userId, user);

            if (colorIndex >= colors.length -1) await databaseInstance.resetColorIndex(userId);

            // TODO: Cambiar el emit del socket de roulette y llevarlo a socket.ts?
            ioClient.to(twitchName).emit('add-user-roulette', user);
            ioClient.to(twitchName).emit('add-user-state', user);
        }
        await databaseInstance.updateLoadingManualUsers(userId, false);

        return true;
    }

    public async removeUser(userId: ObjectId, userUid: string) {
        const databaseInstance = Container.get(Database);
        const { users } = await databaseInstance.getRoulette(userId);

        if (users.length <= 1) {
            await databaseInstance.resetRoulette(userId);
            return true;
        } else {
            await databaseInstance.removeUser(userId, userUid);
            return false;
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
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateSubMode(userId, bool);
    }

    public async updateManualModeFromTwitch(channelName: string, bool: boolean) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateManualMode(userId, bool);
    }

    public async updateSongFromTwitch(channelName: string, bool: boolean) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateSongBool(userId, bool);
    }

    public async resetRouletteFromTwitch(channelName: string) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        await databaseInstance.resetRoulette(userId);
    }

    public async canAddUser(channelName: string) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        const { spinning, loadingManualUsers, loadingWaitingUsers } = await databaseInstance.getRoulette(userId);

        if (spinning || loadingManualUsers || loadingWaitingUsers) return false;
        return true;
    }

    public async getLoadingUserWithTwitchName(channelName: string) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        const { loadingManualUsers } = await databaseInstance.getRoulette(userId);
        return loadingManualUsers;
    }

    public async getSpinningWithTwitchName(channelName: string) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        const { spinning } = await databaseInstance.getRoulette(userId);
        return spinning;
    }

    public async updateSpinningWithTwitchName(channelName: string, spinning: boolean) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateSpinning(userId, spinning);
    }

    private async getUserIdWithTwitchName(channelName: string) {
        const userInstance = Container.get(UserService);
        const { _id } = await userInstance.getUserWithChannelName(channelName);
        return _id;
    }

    public async addUserWaitingToDB(channelName: string, user: any) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        let userAlreadyWaiting = false;
        let userAlreadyIn = false;

        if (user.fromMod) {
            await databaseInstance.addUserWaiting(userId, user);
            return;
        }

        const usersRoulette: [{ name: string, fromMod: boolean, uid: string, subscriber: boolean }] = await databaseInstance.getUsersRoulette(userId);

        usersRoulette.some( userRoulette => {
            if (userRoulette.name === user.name && !userRoulette.fromMod) {
                userAlreadyIn = true;
                return;
            }
        } )


        const usersWaiting: [{ name: string, fromMod: boolean, uid: string, subscriber: boolean }] = await databaseInstance.getUsersWaiting(userId);

        usersWaiting.some( userWaiting => {
            if (userWaiting.name === user.name && !userWaiting.fromMod) {
                userAlreadyWaiting = true;
                return;
            };
        });

        if (!userAlreadyWaiting && !userAlreadyIn) await databaseInstance.addUserWaiting(userId, user);
    }

    public async resetWaitingUsers(userId: ObjectId) {
        const databaseInstance = Container.get(Database);
        await databaseInstance.resetUsersWaiting(userId);
        await databaseInstance.updateLoadingWaitingUsers(userId, false);
    }

    public async resetWaitingUsersWithTwitchName(channelName: string) {
        const userId = await this.getUserIdWithTwitchName(channelName);
        const databaseInstance = Container.get(Database);
        await databaseInstance.resetUsersWaiting(userId);
        await databaseInstance.updateLoadingWaitingUsers(userId, false);
    }

    public async addUsersWaitingToRoulette (userId: ObjectId, twitchName: string, ioClient: Server) {
        const databaseInstance = Container.get(Database);
        const usersWaiting = await databaseInstance.getUsersWaiting(userId);

        if (usersWaiting.length <= 0) return;

        ioClient.to(twitchName).emit('update-loading-waiting-users', true);
        await databaseInstance.updateLoadingWaitingUsers(userId, true);

        for (const user of usersWaiting) {
            await this.addUser(userId, user);
            ioClient.to(twitchName).emit('add-user-roulette', user);
            ioClient.to(twitchName).emit('add-user-state', user);
        }
        await databaseInstance.updateLoadingWaitingUsers(userId, false);
        await databaseInstance.resetUsersWaiting(userId);
        ioClient.to(twitchName).emit('update-loading-waiting-users', false);

    }

}