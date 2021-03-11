import * as mongoose from "mongoose";


const User = new mongoose.Schema({

    __v: {
        type: Number,
        select: false
    },

    verified: {
        type: Boolean,
        default: false,
    },

    twitchId: {
        type: String,
        unique: true,
        index: true
    },

    twitchName: {
        type: String,
        unique: true,
    },

    twitchProfileImageUrl: {
        type: String,
    },

    rouletteToken: {
        type: String,
        default: '',
    },
});

export default mongoose.model('User', User);