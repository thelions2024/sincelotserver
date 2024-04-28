import express from "express";
import { config } from "dotenv";
import user from "./routes/user.js"
import result from "./routes/result.js"
import { errorMiddleware } from "./middlewares/error.js";
import cors from "cors"


config({
    path: "./data/config.env",
});


export const app = express();

// Using Cors 
app.use(cors({
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"],
    origin: [process.env.FRONTEND_URL_1,process.env.FRONTEND_URL_2]
}))

// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())

// Use Middleware 
app.use(express.json())

// for getting image
app.use(express.static('public'))


// Handeling Routes

app.get("/",(req,res,next) => {
    res.send("Namaste Codethenic")
})

app.use("/api/v1/user",user)
app.use("/api/v1/result",result)



// Using error midddle ware in the last 
app.use(errorMiddleware)