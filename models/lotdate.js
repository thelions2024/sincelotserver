import mongoose from "mongoose";

const schema = new mongoose.Schema({
    lotdate: {
        type: String,
        required: [true,"Please enter date"]
    },
    lottime:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LotTime",
        required: [true,"please enter time id"]
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
})

export const LotDate = mongoose.model("LotDate",schema);