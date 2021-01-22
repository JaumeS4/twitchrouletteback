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
        channels: process.env.TMI_CHANNELS?.split(' ')
    }
}