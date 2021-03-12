import {Service} from "typedi";
import { ObjectId} from "mongoose";
import {
    ISettings,
    ISettingsBasicDTO,
    ISettingsImageDTO,
    ISettingsImageSettingsDTO,
    ISettingsSongDTO
} from "../interfaces/ISettings";
import {IUser} from "../interfaces/IUser";
import {IRoulette} from "../interfaces/IRoulette";

const UserModel = require('../models/user').default;
const SettingsModel = require('../models/settings').default;
const RouletteModel = require('../models/roulette').default;
const ResultModel = require('../models/result').default;
const KeyModel = require('../models/key').default;

@Service()
export default class Database {
    constructor() {
    }

    public async getAllUsersVerified(): Promise<IUser[]> {
        return UserModel.find({ verified: true });
    }

    public async getUserWithTwitchId(twitchId: string) {
        return UserModel.findOne({twitchId});
    }

    public async getUserWithMongoId(mongoId: ObjectId): Promise<IUser> {
        return UserModel.findById(mongoId);
    }

    public async getUserWithChannelName(channelName: string) {
        return UserModel.findOne({ twitchName: channelName });
    }

    public async getUserWithRouletteToken(rouletteToken: string) {
        return UserModel.findOne({ rouletteToken });
    }

    public updateRouletteToken(mongoId: ObjectId, rouletteToken: string): IUser {
        return UserModel.findByIdAndUpdate({_id: mongoId}, { rouletteToken }, { new: true });
    }

    public async createUser(twitchId: string, twitchName: string, twitchProfileImageUrl: string) {
        return await UserModel.create({twitchId, twitchName, twitchProfileImageUrl});
    }

    public async updateUser( mongoId: ObjectId, twitchName: string, twitchProfileImageUrl: string) {
        return UserModel.updateOne({_id: mongoId}, {twitchName, twitchProfileImageUrl});
    }

    public async createSettings(userId: ObjectId) {
        return await SettingsModel.create({user: userId});
    }

    public async getSettings(userId: ObjectId) {
        return SettingsModel.findOne({user: userId});
    }

    public async setSettingsBasic(userId: ObjectId, settings: ISettingsBasicDTO) {
        return SettingsModel.updateOne({ user: userId }, settings);
    }

    public async updateSettingsImage(userId: ObjectId, settings: ISettingsImageSettingsDTO) {
        return SettingsModel.updateOne({ user: userId }, settings);
    }

    public async setImageUrl(userId: ObjectId, image: ISettingsImageDTO) {
        return SettingsModel.updateOne({ user: userId }, image);
    }

    public async removeImageUrl(userId: ObjectId) {
        return SettingsModel.updateOne({ user: userId }, { imageUrl: null, imagePublicId: null });
    }

    public async setSongUrl(userId: ObjectId, song: ISettingsSongDTO) {
        return SettingsModel.updateOne({ user: userId }, song);
    }

    public async updateSongBool(userId: ObjectId, bool: boolean) {
        return SettingsModel.updateOne( { user: userId }, { song: bool } );
    }

    public async updateDefaultUsers(userId: ObjectId, users: Array<string>) {
        return SettingsModel.updateOne({ user: userId }, { defaultUsers: users });
    }

    public async updateColors(userId: ObjectId, colors: Array<string>) {
        return SettingsModel.updateOne({ user: userId }, { colors });
    }

    public async createRoulette(userId: ObjectId) {
        return await RouletteModel.create({user: userId});
    }

    public async getRoulette(userId: ObjectId): Promise<IRoulette> {
        return RouletteModel.findOne({user: userId});
    }

    public async resetRoulette(userId: ObjectId) {
        return RouletteModel.updateOne({ user: userId }, { users: [], colorIndex: 0, defaultRouletteActive: true, spinning: false });
    }

    public async updateSpinning(userId: ObjectId, bool: boolean) {
        return RouletteModel.updateOne({ user: userId }, { spinning: bool });
    }

    public async updateSubMode(userId: ObjectId, bool: boolean) {
        return RouletteModel.updateOne({ user: userId }, { subMode: bool });
    }

    public async updateFollowMode(userId: ObjectId, bool: boolean) {
        return RouletteModel.updateOne({ user: userId }, { followMode: bool });
    }

    public async addUser(userId: ObjectId, user: any) {
        return RouletteModel.updateOne({ user: userId }, { $push: { users: user } });
    }

    public async removeUser(userId: ObjectId, userUid: string) {
        return RouletteModel.updateOne({ user: userId }, { $pull: { users: { uid: userUid } } });
    }

    public async removeAllUsers(userId: ObjectId) {
        return RouletteModel.updateOne({ user: userId }, { users: [] } );
    }

    public async updateDefaultRouletteActive(userId: ObjectId, bool: boolean) {
        return RouletteModel.updateOne({ user: userId }, { defaultRouletteActive: bool });
    }

    public async incrementColorIndex(userId: ObjectId, colorIndex: number) {
        return RouletteModel.updateOne({ user: userId }, { colorIndex: colorIndex + 1 });
    }

    public async resetColorIndex(userId: ObjectId) {
        return RouletteModel.updateOne({ user: userId }, { colorIndex: 0 });
    }

    public async createResult(winner: string, uid: string, user: ObjectId) {
        return ResultModel.create({ winner, uid, user });
    }

    public async getKey(key: string) {
        return KeyModel.findOne({ key });
    }

    public async removeKey(keyId: ObjectId) {
        return KeyModel.findByIdAndDelete(keyId);
    }

    public async useKey(keyId: ObjectId, mongoUserId: ObjectId) {
        return KeyModel.findByIdAndUpdate(keyId, { used: true, usedBy: mongoUserId });
    }

    public async validateAccount(mongoUserId: ObjectId) {
        return UserModel.findByIdAndUpdate(mongoUserId, { verified: true });
    }
}