import mongoose from "mongoose";

const schema = new mongoose.Schema({
    
    aboutTitle: {
        type: String,
        default: ""
    },
    aboutDescription: {
        type: String,
        default: ""
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
    
})

export const LotAppAbout = mongoose.model("LotAppAbout",schema);