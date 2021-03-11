import mongoose from "mongoose";


const Settings = new mongoose.Schema({

    __v: {
        type: Number,
        select: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    rouletteDuration: {
        type: Number,
        default: 6
    },

    rouletteLaps: {
        type: Number,
        default: 3,
    },

    rouletteWinnerDuration: {
        type: Number,
        default: 3
    },

    song: {
        type: Boolean,
        default: false,
    },

    defaultUsers: {
        type: Array,
        default: ['Leo', 'Julia', 'Luis', 'Sandra', 'Simon', 'Maria', 'Raul']
    },

    colors: {
        type: Array,
        default: ['#AE9BE8', '#F896A8', '#FDD1A2', '#A7D1FF', '#C8F2E0', '#7500EA', '#B780E6']
    },

    songUrl: {
        type: String,
        default: null,
    },

    songPublicId: {
        type: String,
        default: null,
    },

    imageUrl: {
        type: String,
        default: null,
    },
    imagePublicId: {
        type: String,
        default: null,
    }
});

export default mongoose.model('Settings', Settings);