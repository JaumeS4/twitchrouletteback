import mongoose from "mongoose";


const Result = new mongoose.Schema({

    __v: {
        type: Number,
        select: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    winner: {
        type: String,
        required: true,
    },

    uid: {
        type: String,
        required: true,
    },



}, { timestamps: true });

export default mongoose.model('Result', Result);