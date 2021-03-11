import {Container, Inject, Service} from "typedi";
import {Logger} from "winston";
import Database from "./database";
import {ObjectId} from "mongoose";
import {ISettings, ISettingsBasicDTO, ISettingsImageDTO, ISettingsSongDTO} from "../interfaces/ISettings";
import UserService from "./user";

@Service()
export default class SettingsService {
    constructor(@Inject('logger') private logger: Logger) {
    }

    public async getSettings(userId: ObjectId): Promise<ISettings> {
        const databaseInstance = Container.get(Database);
        return await databaseInstance.getSettings(userId);
    }

    public async getImage(userId: ObjectId): Promise<ISettingsImageDTO> {
        const databaseInstance = Container.get(Database);
        const settings: ISettings = await databaseInstance.getSettings(userId);
        return {imageUrl: settings.imageUrl, imagePublicId: settings.imagePublicId};
    }

    public async getSong(userId: ObjectId): Promise<ISettingsSongDTO> {
        const databaseInstance = Container.get(Database);
        const settings: ISettings = await databaseInstance.getSettings(userId);
        return {songUrl: settings.songUrl, songPublicId: settings.songPublicId}
    }

    public async updateBasicSettings(userId: ObjectId, settings: ISettingsBasicDTO): Promise<void> {
        const databaseInstance = Container.get(Database);
        await databaseInstance.setSettingsBasic(userId, settings);
    }

    public async saveImageUrl(userId: ObjectId, image: ISettingsImageDTO): Promise<void> {
        const databaseInstance = Container.get(Database);
        await databaseInstance.setImageUrl(userId, image);
    }

    public async saveSongUrl(userId: ObjectId, song: ISettingsSongDTO): Promise<void> {
        const databaseInstance = Container.get(Database);
        await databaseInstance.setSongUrl(userId, song);
    }

    public async updateSongBool(userId: ObjectId, bool: boolean): Promise<void> {
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateSongBool(userId, bool);
    }

    public async updateDefaultUsers(userId: ObjectId, users: Array<string>): Promise<void> {
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateDefaultUsers(userId, users);
    }

    public async updateColors(userId: ObjectId, colors: Array<string>): Promise<void> {
        const databaseInstance = Container.get(Database);
        await databaseInstance.updateColors(userId, colors);
    }
}