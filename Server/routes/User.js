const express = require('express');
const router = express.Router();

//importing all the controllers

//getting all the from auth controller
const {sendOTP,signup,login,changePassword} = require('../controllers/Auth');

/* *******AUTHENTICATION ROUTES*********** */

//getting the reset password controller
const {resetPasswordToken,resetPassword} = require('../controllers/ResetPassword');

//getting the middleware
const {auth} = require('../middlewares/auth');

/* **********WRITING THE ROUTES ********** */

// login route
router.post('/login', login);

//signup route
router.post('/signup',signup);

//route for sending the otp
router.post('/sendotp', sendOTP);

//change password route
router.post('/changepassword',auth,changePassword);


/* *****PASSWORD RESETTING ROUTES ********** */

//generating the reset pw token
router.post('/reset-password-token',resetPasswordToken);

//resetting the user pw after verification
router.post('/reset-password',resetPassword);


module.exports = router;