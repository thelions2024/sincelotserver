import mongoose from "mongoose";

const schema = new mongoose.Schema({
    lotlocation: {
        type: String,
        required: [true,"Please enter location name"]
    },
    locationTitle: {
        type: String,
        default: ""
    },
    locationDescription: {
        type: String,
        default: ""
    },
    maximumRange: {
        type: String,
        required: [true,"Please enter maximum range"]
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
    
})

export const LotLocation = mongoose.model("LotLocation",schema);