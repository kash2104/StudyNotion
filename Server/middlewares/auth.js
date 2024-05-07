const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//authentication -> by verifying the jwt token
exports.auth = async (req, res, next) => {
  try {
    //extracting the token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");

    //if token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    //verifying the token using jwt secret key
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      //   console.log("decoded token is: ", decodedToken);

      //req ke andar bhi humne decodedToken ko add kar diya
      req.user = decodedToken;
    } catch (error) {
      //verification issue
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

//isStudent
exports.isStudent = async (req, res, next) => {
  //verifying the role only

  //decodedToken me humare pass role aa jayega from Auth.js controller bcz jab humne token banaya tha uske payload ke andar humne role ko add kiya tha. To use this we can verify directly from the request that we have done in Authorization and authentication project

  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message:
          "This is protected route for Students only. You are not a student",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
  //verifying the role only

  //decodedToken me humare pass role aa jayega from Auth.js controller bcz jab humne token banaya tha uske payload ke andar humne role ko add kiya tha. To use this we can verify directly from the request that we have done in Authorization and authentication project

  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message:
          "This is protected route for Instructor only. You are not an instructor",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
  //verifying the role only

  //decodedToken me humare pass role aa jayega from Auth.js controller bcz jab humne token banaya tha uske payload ke andar humne role ko add kiya tha. To use this we can verify directly from the request that we have done in Authorization and authentication project

  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Admin only. You are not an admin",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};
