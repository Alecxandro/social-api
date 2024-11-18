import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes:[
        {   
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    ],
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    ],
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Post', postSchema)