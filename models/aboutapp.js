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
    createdAt:{
        type: Date,
        default: Date.now(),
    }
    
})

export const AboutApp = mongoose.model("AboutApp",schema);