import {Container, Inject, Service} from 'typedi';
import {Logger} from "winston";
import { v2 as cloudinary } from 'cloudinary';
import {ObjectId} from "mongoose";
import fs from 'fs';
import SettingsService from "./settings";
import Database from "./database";

@Service()
export default class UploadService {

    constructor(@Inject('logger') private logger: Logger) {
    }

    public async uploadFile(filePath: string, type: string, userId: ObjectId) {

        if (type === 'image') {
            return this.uploadImage(filePath, userId);
        } else if (type === 'song') {
            return this.uploadSong(filePath, userId)
        } else {
            throw new Error('No valid type.');
        }

    }

    public async removeImage(userId: ObjectId) {
        try {
            const databaseInstance = Container.get(Database);
            const { imagePublicId } = await databaseInstance.getSettings(userId);

            await cloudinary.uploader.destroy(imagePublicId);

            await databaseInstance.removeImageUrl(userId);
        } catch (e) {
            throw new Error(e);
        }
    }

    private async uploadImage(filePath: string, userId: ObjectId) {
        try {
            const resp = await cloudinary.uploader.upload(filePath, {folder: 'images', resource_type: 'image'});

            const settingsInstance = Container.get(SettingsService);
            const {imageUrl, imagePublicId} = await settingsInstance.getImage(userId);

            if (imageUrl && imagePublicId) await cloudinary.uploader.destroy(imagePublicId);

            await settingsInstance.saveImageUrl(userId, {imageUrl: resp.secure_url, imagePublicId: resp.public_id});

            fs.unlinkSync(filePath);

            return resp.secure_url;

        } catch (e) {
            fs.unlinkSync(filePath);
            throw new Error(e);
        }
    }

    private async uploadSong(filePath: string, userId: ObjectId) {
        try {
            const resp = await cloudinary.uploader.upload(filePath, {folder: 'songs', resource_type: 'video'});

            const settingsInstance = Container.get(SettingsService);
            const {songUrl, songPublicId} = await settingsInstance.getSong(userId);

            if (songUrl && songPublicId) await cloudinary.uploader.destroy(songPublicId, { resource_type: 'video' });

            await settingsInstance.saveSongUrl(userId, {songUrl: resp.secure_url, songPublicId: resp.public_id});

            fs.unlinkSync(filePath);

            return resp.secure_url;

        } catch (e) {
            fs.unlinkSync(filePath);
            throw new Error(e);
        }
    }

}