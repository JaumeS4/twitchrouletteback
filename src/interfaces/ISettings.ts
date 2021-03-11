import {IUser} from "./IUser";

export interface ISettings {
    user: IUser,
    rouletteDuration: number,
    rouletteLaps: number,
    rouletteWinnerDuration: number,
    song: boolean,
    defaultUsers: Array<string>,
    colors: Array<string>,
    songUrl: string,
    songPublicId: string,
    imageUrl: string,
    imagePublicId: string,
}

interface User {
    uid: string,
    name: string,
}

export interface ISettingsBasicDTO {
    rouletteDuration?: number,
    rouletteLaps?: number,
    rouletteWinnerDuration?: number,
};

export interface ISettingsImageDTO {
    imageUrl: string,
    imagePublicId: string,
}

export interface ISettingsSongDTO {
    songUrl: string,
    songPublicId: string,
}