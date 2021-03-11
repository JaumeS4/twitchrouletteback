import mongoose from "mongoose";


const Key = new mongoose.Schema({

    __v: {
        type: Number,
        select: false,
    },

    key: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },

    used: {
        type: Boolean,
        default: false,
    },

    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

});

export default mongoose.model('Key', Key);