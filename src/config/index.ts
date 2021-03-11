import dotenv from 'dotenv';

// Set NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (process.env.NODE_ENV == 'development') {
    if (envFound.error) throw new Error("Coudln't find .env files");
}


// @TODO Handle undefined string (remove || '').

export default {
    /**
     * Your favorite port
     */
    port: parseInt(process.env.PORT || '', 10),

    /**
     * DB URL from mongo atlas
     */
    databaseURL: process.env.MONGODB_URI || '',

    /**
     * Folder to store uploaded images
     */
    uploadsFolder: process.env.UPLOADS_FOLDER || './uploads/',

    /**
     * JWT Things
     */
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiration: process.env.JWT_EXPIRATION || '',

    /**
     * Used by winston logger
     */
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },

    /**
     * API configs
     */
    api: {
        prefix: '/api',
    },

    /**
     * TMI configs
     */
    tmi: {
        debug: ( process.env.TMI_DEBUG == "true" ) || false,
    },

    /**
     * TWITCH configs
     */
    twitch: {
        client: process.env.TWITCH_CLIENT_ID || '',
        secret: process.env.TWITCH_CLIENT_SECRET || '',
        redirect_uri: process.env.TWITCH_REDIRECT_URI
    },

    /**
     * CLOUDINARY configs
     */
    cloudinary: {
        name: process.env.CLOUDINARY_NAME,
        key: process.env.CLOUDINARY_KEY,
        secret: process.env.CLOUDINARY_SECRET,
    }
}