import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { WalletOne } from "./walletone.js";
import { WalletTwo } from "./wallettwo.js";


const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: [true, "user already exists"],
  },
  contact: {
    type: String,
    unique: [true, "contact already exists"],
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minLength: [6, "Password must be atleast 6 characters long"],
    select: false,
  },
  walletOne: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletOne' },
  walletTwo: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTwo' },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  loginType: {
    type: String,
    enum: ['Google', 'manual'],
    default: 'manual'
},
  avatar: {
    public_id: String,
    url: String,
  },
  otp: Number,
  otp_expire: Date,
  userId: Number,
  createdAt:{
    type: Date,
    default: Date.now(),
}
});



// Before Saving the USER Run Below funcation
// We are encrypting user password before saving it in database

// Here scheme is a object so we can get it value by using this keyword
// schema.pre("save", async function (next) {
// //   console.log(this.password);
//   if (!this.isModified("password")) next();
//   this.password = await bcrypt.hash(this.password, 10);
// });

schema.pre("save", async function (next) {
  // if (!this.isNew || !this.isModified("password")) {
  //   // If the document is not new or password is not modified, skip wallet creation
  //   next();
  //   return;
  // }

  if (!this.isNew && this.isModified("password")) {
    // If the document is not new or password is not modified, skip wallet creation
    this.password = await bcrypt.hash(this.password, 10);
    return;
  }

  if (this.isNew) {
    // If the document is not new or password is not modified, skip wallet creation
    try {

      this.password = await bcrypt.hash(this.password, 10);

      const walletOne = await WalletOne.create({
          userId: this._id,
          walletName: 'Wallet One',
          visibility: true
      });
  
      const walletTwo = await WalletTwo.create({
          userId: this._id,
          walletName: 'Wallet Two',
          visibility: true
      });
  
      this.walletOne = walletOne._id;
      this.walletTwo = walletTwo._id;
  
      next();
    } catch (error) {
      next(error);
    }
    return;
  }

  if (!this.isNew) {
    // If the document is not new or password is not modified, skip wallet creation
    next();
    return;
  }

  if (!this.isModified("password")) {
    // If the document is not new or password is not modified, skip wallet creation
    next();
    return;
  }

  


  // // Encrypt the password before saving
  // this.password = await bcrypt.hash(this.password, 10);

  // try {
  //   const walletOne = await WalletOne.create({
  //       userId: this._id,
  //       walletName: 'Wallet One',
  //       visibility: true
  //   });

  //   const walletTwo = await WalletTwo.create({
  //       userId: this._id,
  //       walletName: 'Wallet Two',
  //       visibility: true
  //   });

  //   this.walletOne = walletOne._id;
  //   this.walletTwo = walletTwo._id;

  //   next();
  // } catch (error) {
  //   next(error);
  // }

});


// During login , checking password and the hash pasword in the database is matched or not
// schema.methods.comparePassword =  async function(enteredPassword){
//   return await bcrypt.compare(enteredPassword, this.password);
// }

schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create a method to generate token which i can use authorization
schema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

// schema.methods.generateToken = function () {
//     jwt.sign({_id:this._id},process.env.JWT_SECRET,{
//         expiresIn: "7d"
//     })
// }

export const User = mongoose.model("User", schema);
