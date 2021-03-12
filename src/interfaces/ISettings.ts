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
    imageWidth: number,
    imageHeight: number,
    imageBackgroundSize: number,
    radioRoulette: number,
    marginTextRoulette: number,
}

interface User {
    uid: string,
    name: string,
}

export interface ISettingsBasicDTO {
    rouletteDuration?: number,
    rouletteLaps?: number,
    rouletteWinnerDuration?: number,
    radioRoulette?: number,
    marginTextRoulette?: number,
};

export interface ISettingsImageSettingsDTO {
    imageWidth?: number,
    imageHeight?: number,
    imageBackgroundSize?: number,
}

export interface ISettingsImageDTO {
    imageUrl: string,
    imagePublicId: string,
}

export interface ISettingsSongDTO {
    songUrl: string,
    songPublicId: string,
}