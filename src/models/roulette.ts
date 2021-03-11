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

    subMode: {
        type: Boolean,
        default: false,
    },

    followMode: {
        type: Boolean,
        default: true,
    },

    colorIndex: {
        type: Number,
        default: 0,
    },

    defaultRouletteActive: {
        type: Boolean,
        default: true,
    },

});

export default mongoose.model('Roulette', Roulette);