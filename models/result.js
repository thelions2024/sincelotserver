import mongoose from "mongoose";

const schema = new mongoose.Schema({
    resultNumber:{
        type: String,
        required: [true, "Please enter result"]
    },
    lotdate:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LotDate",
        required: [true,"please enter date id"]
    },
    lottime:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LotTime",
        required: [true,"please enter Time id"]
    },
    lotlocation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LotLocation",
        required: [true,"please enter Location id"]
    },
    nextresulttime:{
        type: String,
        required: [true,"please enter next result time"]
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
})

export const Result = mongoose.model("Result",schema);


// Basic Starting Syntex

// import mongoose from "mongoose";

// const schema = new mongoose.Schema({})

// export const Results = mongoose.model("Result",schema);