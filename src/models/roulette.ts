import mongoose from "mongoose";


const Roulette = new mongoose.Schema({

    __v: {
        type: Number,
        select: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    users: {
        type: Array,
        default: [],
    },

    usersWaiting: {
        type: Array,
        default: [],
    },

    subMode: {
        type: Boolean,
        default: false,
    },

    followMode: {
        type: Boolean,
        default: true,
    },

    manualMode: {
        type: Boolean,
        default: false,
    },

    colorIndex: {
        type: Number,
        default: 0,
    },

    defaultRouletteActive: {
        type: Boolean,
        default: true,
    },

    spinning: {
        type: Boolean,
        default: false,
    },

    loadingManualUsers: {
        type: Boolean,
        default: false,
    },

    loadingWaitingUsers: {
        type: Boolean,
        default: false,
    }

});

export default mongoose.model('Roulette', Roulette);