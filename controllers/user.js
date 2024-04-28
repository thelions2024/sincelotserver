import { asyncError } from "../middlewares/error.js";
import { LotAppAbout } from "../models/lotappabout.js";
import { Promotion } from "../models/promotion.js";
// import { Promotion } from "../models/promotion.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri, sendEmail, sendToken } from "../utils/features.js";
import mongoose from "mongoose";
import fs from "fs";
import pathModule from "path";
import { WalletOne } from "../models/walletone.js";
import { WalletTwo } from "../models/wallettwo.js";

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!password) return next(new ErrorHandler("Please enter password", 400));
  if (!email) return next(new ErrorHandler("Please enter email", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Not Registered", 400));
  // console.log(password)
  // console.log(user)

  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Email or Password", 400));
  }

  sendToken(user, res, `Welcome Back, ${user.name}`, 200);

  // const token = user.generateToken()

  // // Below showing the response without cookie
  // res.status(200).json({
  //     success: true,
  //     message: `Welcome back ${user.name}`,
  //     token
  // })

  // Below showing the response with cookie
  // res.status(200)
  // .cookie("token",token{
  //     expires: new Date(Date.now() + 15 * 24 * 60 * 60 *1000),
  // })
  // .json({
  //     success: true,
  //     message: `Welcome back ${user.name}`,
  //     token
  // })
});

export const register = asyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Count existing users whose role is not admin
  let userCount = await User.countDocuments({ role: { $ne: "admin" } });

  // Generate userId starting from 1000
  const userId = 1000 + userCount;

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already exist", 400));

  // add cloudinary here

  user = await User.create({
    name,
    email,
    password,
    userId, // Add userId to the user object
  });

  sendToken(user, res, `Registered Successfully`, 201);

  // let user = await User.findOne({ email });

  // if (user) return next(new ErrorHandler("User Already exist", 400));

  // // add cloudinary here

  // user = await User.create({
  //   name,
  //   email,
  //   password,
  // });

  // sendToken(user, res, `Registered Successfully`, 201);

  //   res.status(201).json({
  //     success: true,
  //     message: "Registered Successfully",
  //   });
});

export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate("walletOne")
    .populate("walletTwo");

  res.status(200).json({
    success: true,
    user,
  });
});

export const getUserDetails = asyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate("walletOne")
    .populate("walletTwo");

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

// Update Wallet One
export const updateWalletOne = asyncError(async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const { balance, walletName, visibility } = req.body;

    // Validate input
    if (!balance || isNaN(balance)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid balance value" });
    }

    // Update wallet
    const updatedWallet = await WalletOne.findByIdAndUpdate(
      walletId,
      { balance, walletName, visibility },
      { new: true }
    );

    if (!updatedWallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found" });
    }

    res.status(200).json({ success: true, updatedWallet });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update Wallet Two
export const updateWalletTwo = asyncError(async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const { balance, walletName, visibility } = req.body;

    // Validate input
    if (!balance || isNaN(balance)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid balance value" });
    }

    // Update wallet
    const updatedWallet = await WalletTwo.findByIdAndUpdate(
      walletId,
      { balance, walletName, visibility },
      { new: true }
    );

    if (!updatedWallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found" });
    }

    res.status(200).json({ success: true, updatedWallet });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export const logout = asyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, contact } = req.body;

  if (name) user.name = name;
  // if (email) user.email = email;

  if (email) {
    let old_user = await User.findOne({ email });
    if (old_user) return next(new ErrorHandler("User Already exist", 400));
    user.email = email;
  }

  if (contact) {
    let old_user = await User.findOne({ contact });
    if (old_user) return next(new ErrorHandler("Contact Already exist", 400));
    user.contact = contact;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;

  // Checking the user have enter old and new password
  if (!oldPassword && !newPassword)
    return next(new ErrorHandler("Please enter old and new password", 400));

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Old Password", 400));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

// Upload Profile pic work is not completed i have to research something because i dont want to use cloundinay
export const updatePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  // req.file
  const file = getDataUri();

  // add cloundinary

  res.status(200).json({
    success: true,
    user,
  });
});

export const forgetPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("Incorrect email", 404));

  // Generating 6 digit otp
  // max,min 2000,10000
  // math.random()*(max-min)+min

  const randomSixDitgitNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomSixDitgitNumber);
  const otp_expire = 15 * 60 * 1000;

  // Adding to the user otp
  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);

  // console.log("OTP CODE :: " + otp);

  await user.save();

  // After Saving the otp we have to send a email
  // sendEmail()

  const message = `Your OTP For Reseting Password is ${otp}\nPlease ignore if you haven't requested this`;

  try {
    await sendEmail("OTP for resetting password", user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;

    await user.save();
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: `Verification code has been sent to ${user.email}`,
  });
});

export const resetPassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Incorrect OTP or OTP has been expired", 400));

  if (!password)
    return next(new ErrorHandler("Please enter new password ", 400));

  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully , you can login now",
  });
});

// For uploading profile pic
// export const updateProfilePic = asyncError(async (req, res, next) => {
//   const user = await User.findById(req.user._id);

//   // const { name, email } = req.body;
//   // Using this We can access the file
//   // req.file

//   // if (user.avatar.url) {
//   //   // Construct the path to the previous image
//   //   // const previousImagePath = pathModule.join(__dirname, '..', 'public', 'uploads', user.avatar.url);
//   //   // console.log("previous image path :: "+previousImagePath)
//   //   // Delete the previous image from the server
//   //   fs.unlinkSync(`./public/uploads/${user.avatar.url}`);
//   // }

//   console.log(req.file);

//   const { filename, path, mimetype } = req.file;

//   const file = getDataUri(req.file);

//   user.avatar = {
//     public_id: req.user._id,
//     url: filename,
//   };

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Profile Pic Updated Successfully",
//   });
// });

// For uploading profile pic
// export const updateProfilePic = asyncError(async (req, res, next) => {
//   const user = await User.findById(req.user._id);

//   // Check if a file is provided in the request
//   if (!req.file) {
//     return res.status(400).json({
//       success: false,
//       message: "No file uploaded",
//     });
//   }

//   const { filename } = req.file;

//   // If user already has an avatar, delete the previous image
//   if (user.avatar && user.avatar.url) {
//     // Construct the path to the previous image
//     const previousImagePath = pathModule.join(__dirname, '..', 'public', 'uploads', user.avatar.url);
//     try {
//       // Delete the previous image from the server
//       fs.unlinkSync(previousImagePath);
//     } catch (err) {
//       console.error("Error deleting previous image:", err);
//     }
//   }

//   console.log(req.file);

//   const file = getDataUri(req.file);

//   user.avatar = {
//     public_id: req.user._id,
//     url: filename,
//   };

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Profile Pic Updated Successfully",
//   });
// });

// For uploading profile pic
export const updateProfilePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  // Check if a file is provided in the request
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const { filename } = req.file;

  // Get the directory name of the current module using import.meta.url
  const currentDir = pathModule.dirname(new URL(import.meta.url).pathname);

  // If user already has an avatar, delete the previous image
  if (user.avatar && user.avatar.url) {
    // Construct the path to the previous image
    const previousImagePath = pathModule.join(
      currentDir,
      "..",
      "public",
      "uploads",
      user.avatar.url
    );
    try {
      // Delete the previous image from the server
      fs.unlinkSync(previousImagePath);
    } catch (err) {
      console.error("Error deleting previous image:", err);
    }
  }

  console.log(req.file);

  const file = getDataUri(req.file);

  user.avatar = {
    public_id: req.user._id,
    url: filename,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Pic Updated Successfully",
  });
});

// For uploading profile pic
export const getProfilePic = asyncError(async (req, res, next) => {
  // await User.findById(req.user._id);
  const users = await User.find();

  res.status(200).json({
    success: true,
    message: users,
  });
});

// For Promtions

// export const addPromotion = asyncError(async (req, res, next) => {
//   console.log(req.file);

//   const { filename, path, mimetype } = req.file;

//   const uniqueFilename = `${Date.now()}${filename}`;

//   // // Assuming you want to save public_id and url of the image in the database
//   // const promotionData = {
//   //   url: uniqueFilename,
//   //   // visibility: req.body.visibility, // Assuming you're passing visibility in the request body
//   // };

//   // // Create a new promotion record in the database
//   // await Promotion.create(promotionData);

//   const promotion = new Promotion({
//     promotionimage: {
//       public_id: Date.now(),
//       url: uniqueFilename,
//     },
//     visibility: req.body.visibility || true,
//   });

//   try {
//     const newPromotion = await promotion.save();
//     // res.status(201).json(newPromotion);
//     res.status(201).json({
//       success: true,
//       message: "Promotions Added Successfully",
//       newPromotion
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }

// });

export const addPromotion = asyncError(async (req, res, next) => {
  console.log(req.file);

  const { filename, path, mimetype } = req.file;

  // const uniqueFilename = `${Date.now()}${filename}`;



  // Assuming you want to save public_id and url of the image in the database
  const promotionData = {
    url: filename,
    // visibility: req.body.visibility, // Assuming you're passing visibility in the request body
  };

  // Create a new promotion record in the database
  await Promotion.create(promotionData);

  res.status(200).json({
    success: true,
    message: "Promotions Added Successfully",
  });
});

// export const addPromotion = asyncError(async (req, res, next) => {
//   console.log(req.file);

//   const { filename, path, mimetype } = req.file;

//   const uniqueFilename = `${Date.now()}${filename}`; // Append timestamp to the filename

//   const file = getDataUri(req.file);

//   // Assuming you want to save public_id and url of the image in the database
//   const promotionData = {
//     url: uniqueFilename,
//     // visibility: req.body.visibility, // Assuming you're passing visibility in the request body
//   };

//   // Create a new promotion record in the database
//   await Promotion.create(promotionData);

//   res.status(200).json({
//     success: true,
//     message: "Promotions Added Successfully",
//   });
// });

export const getAllPromotions = asyncError(async (req, res, next) => {
  const promotions = await Promotion.find({});
  res.status(200).json({
    success: true,
    promotions,
  });
});

export const deletePromotion = asyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the promotion by ID and delete it
  const deletedPromotion = await Promotion.findByIdAndDelete(id);

  if (!deletedPromotion) {
    return res.status(404).json({
      success: false,
      message: "Promotion not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Promotion deleted successfully",
    deletedPromotion,
  });
});

export const updatePromotion = asyncError(async (req, res, next) => {
  const { visibility } = req.body;

  const promotion = await Promotion.findById(req.params.id);

  if (!promotion) return next(new ErrorHandler("Promotion not found", 404));

  console.log("Existing visibility:", promotion.visibility);
  console.log("New visibility:", visibility);

  promotion.visibility = visibility;

  await promotion.save();

  res.status(200).json({
    success: true,
    message: "Promotion Updated Successfully",
    promotion,
  });
});

export const updateAnyUserUserId = asyncError(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const newUserId = req.body.newUserId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    if (!newUserId) {
      return res
        .status(400)
        .json({ success: false, message: "New userid missing" });
    }

    // Check if the new userId is unique and not used by any other user
    const existingUser = await User.findOne({ userId: newUserId });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "New userId is already taken." });
    }

    // Find the user by the provided userId
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Update the userId of the user
    user.userId = newUserId;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "User userId updated successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

// For Admin

// ####################
// ALL USER
// ####################

export const getAllUser = asyncError(async (req, res, next) => {
  const users = await User.find({})
    .populate("walletOne")
    .populate("walletTwo")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
});

// All user who have register in last 24 hour

export const getAllUserRegisterInLastOneDay = asyncError(
  async (req, res, next) => {
    // Get the current date and time in UTC
    const currentDate = new Date();
    const currentUTCDate = new Date(currentDate.toISOString());

    // Subtract 24 hours from the current date to get the date/time 24 hours ago
    const twentyFourHoursAgo = new Date(
      currentUTCDate.getTime() - 24 * 60 * 60 * 1000
    );

    // Find users created within the last 24 hours
    const users = await User.find({ createdAt: { $gte: twentyFourHoursAgo } })
      .populate("walletOne")
      .populate("walletTwo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  }
);

// #############################
//  About us Section
// #############################

// About us update

export const updateAbout = asyncError(async (req, res, next) => {
  const about = await LotAppAbout.findById(req.params.id);

  if (!about) return next(new ErrorHandler("about not found", 404));

  const { aboutTitle, aboutDescription } = req.body;

  if (aboutTitle) about.aboutTitle = aboutTitle;
  if (aboutDescription) about.aboutDescription = aboutDescription;

  await about.save();

  res.status(200).json({
    success: true,
    message: "Updated Successfully",
  });
});

// Create Abuut app content
export const createAbout = asyncError(async (req, res, next) => {
  const { aboutTitle, aboutDescription } = req.body;
  // if (!result) return next(new ErrorHandler("Result not found", 404))
  await LotAppAbout.create({ aboutTitle, aboutDescription });

  res.status(200).json({
    success: true,
    message: "Successfully added about us",
  });
});

export const deleteAbout = asyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the promotion by ID and delete it
  const deletedAbout = await LotAppAbout.findByIdAndDelete(id);

  if (!deletedAbout) {
    return res.status(404).json({
      success: false,
      message: "About not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Successfully Deleted",
    deleteAbout,
  });
});

// Get all About Us
export const getAllAbout = asyncError(async (req, res, next) => {
  const aboutus = await LotAppAbout.find({});

  res.status(200).json({
    success: true,
    aboutus,
  });
});

// Get All WalletOne
export const getAllWalletOne = asyncError(async (req, res, next) => {
  const wallets = await WalletOne.find({});

  res.status(200).json({
    success: true,
    wallets,
  });
});

// Get All WalletTwo
export const getAllWalletTwo = asyncError(async (req, res, next) => {
  const wallets = await WalletTwo.find({});

  res.status(200).json({
    success: true,
    wallets,
  });
});

// Update Wallet name
// Controller function to update wallet names in all data
export const updateAllWalletNameOne = asyncError(async (req, res, next) => {
  const walletName = req.body.walletName; // Assuming you pass new wallet name in the request body

  // Update wallet names in all data
  await WalletOne.updateMany({}, { $set: { walletName: walletName } });

  res.status(200).json({
    success: true,
    message: "Wallet names updated successfully in all data.",
  });
});

// Update Wallet name
// Controller function to update wallet names in all data
export const updateAllWalletNameTwo = asyncError(async (req, res, next) => {
  const walletName = req.body.walletName; // Assuming you pass new wallet name in the request body

  // Update wallet names in all data
  await WalletTwo.updateMany({}, { $set: { walletName: walletName } });

  res.status(200).json({
    success: true,
    message: "Wallet names updated successfully in all data.",
  });
});
