import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/error.js";
import { asyncError } from "./error.js";
import { User } from "../models/user.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) return next(new ErrorHandler("Invalid Token", 401));

  const bearer = bearerHeader.split(" ");
  const token = bearer[1];
  req.token = token;
  const decodedData = jwt.verify(req.token, process.env.JWT_SECRET);
  console.log("User :: " + decodedData._id);
  console.log("User Deata :: " + JSON.stringify(decodedData));

  req.user = await User.findById(decodedData._id);

  next();

  //   if (typeof bearerHeader !== "undefined") {
  //     const bearer = bearerHeader.split(" ");
  //     const token = bearer[1];
  //     req.token = token;
  //     // verifyToken(req, res, next);
  //     const decodedData = jwt.verify(req.token, process.env.JWT_SECRET);
  //     console.log("USer :: "+decodedData._id)

  //     req.user = await User.findById(decodedData._id);

  //     next();
  //   } else {
  //     // res.status(401).send({
  //     //   result: "missing token",
  //     // });
  //     next(new ErrorHandler("Invalid Token", 401));
  //   }

  //   next();
});

export const verifyToken = async (req, res, next) => {
  //   console.log(req);

  const decodedData = jwt.verify(
    req.token,
    process.env.JWT_SECRET,
    (err, authData) => {
      if (err) {
        next(new ErrorHandler("Invalid Token", 401));
      }
      // else {
      //     console.log("Response :: "+authData)
      //   next();
      // }
    }
  );

  //   req.user = await User.findById(decodedData._id);

  //   next();
};

export const isAdmin = asyncError(async (req,res,next) => {
  if(req.user.role !== "admin")
  {
    return next(new ErrorHandler("Only Admin allowed", 401))
  }

  next()
})
