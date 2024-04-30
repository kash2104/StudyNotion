const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailSender');
const {passwordUpdated} = require('../mail/templates/passwordUpdate');
require('dotenv').config();

//sendOTP -> function for otp generation while signing up
exports.sendOTP = async(req, res) => {

    try {
        //fetch email from req.body
        const {email} = req.body;
        
        //check if user already exists
        const checkUserPresent = await User.findOne({email});
        
        //if user already exists, then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }

        //generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })
        console.log('OTP generated: ', otp);

        //check unique otp or not -> 
        //second vale jo otp hai uske corresponding agar mujhe db me se koi entry mil rhi tab tak mein new otp generate karta rahunga
        const result = await OTP.findOne({otp:otp});

        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            })
            result = await OTP.findOne({otp:otp});
        }

        //otp entry in db
        const otpPayload = {email, otp};
        const otpBody = await OTP.create(otpPayload);
        console.log('OTP body is: ',otpBody);

        //return successful response
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


//signup
exports.signup = async(req,res) => {
    try {
        
        //data fetch from requrest ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;
    
        //validate karo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:'All fields are required',
            })
        }
    
        //pw and confirm pw ko match karlo
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password and Confirm Password do not match. Please try again',
            })
        }
    
        //check if user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User is already registered. Sign in to continue',
            })
        }
    
        //find the most recent otp stored for the user
        const recentOtp = await OTP.findOne({email}).sort({createdAt: -1}).limit(1);
    
        console.log('recent OTP is: ',recentOtp);
    
        //validate otp
        if(!recentOtp){
            //otp not found
            return res.status(400).json({
                success:false,
                message:'OTP not found',
            })
        }
        else if(otp !== recentOtp.otp){
            //invalid otp entered
            return res.status(400).json({
                success:false,
                message:'Invalid OTP entered',
            })
        }
    
        //hash pw
        const hashedPassword = await bcrypt.hash(password,10);

        //creating the student user
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);
    
        //db entry -> upar jo bhi data aaya hai and humne jo profile model create kiya tha voh bhi db me dalna toh padega
    
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType:accountType,
            approved:approved,
            //profile ki jo bhi id aayegi usko save kar lenge
            additionalDetails:profileDetails._id,
    
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
    
        //return res
        return res.status(200).json({
            success:true,
            message:'User is registered successfully',
            user,
        })
    } 
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'User cannot be registered. Please try again'
        })
    }


}

//login
exports.login = async(req,res) => {
    try {
        //get data from req ki body
        const {email, password} = req.body;
    
        //data validation
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'All fields are required, please try again',
            })
        }
    
        //check if user exist or not
        const user = await User.findOne({email}).populate('additionalDetails');
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User is not registered. Please sign up first',
            })
        }
    
        //check if password matches
        if(await bcrypt.compare(password, user.password)){
            //password matches -> create jwt token
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET, {
                expiresIn:'24h',
            })
            
            //saving the token to user document in database
            user.token = token;
            user.password = undefined;
    
            //create cookie -> pass the jwt token via cookie
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
    
            res.cookie('token', token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            })
        }
        
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failed. Please try again',
        })
    }

}

//change Pasword
exports.changePassword = async(req,res) => {
    try {
        //get all the user data
        const userDetails = await User.findById(req.user.id);
    
        //get oldpw, newPw, confirmPw from req body
        const{oldPassword, newPassword, confirmNewPassword} = req.body;
    
        //validate the oldpw with pw entered using bcrypt as it will be encrypted
        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
    
        //the old password doesn't match so return resp
        if(!isPasswordMatch){
            return res.status(401).json({
                success:false,
                message:'The password is incorrect',
            })
        }
    
        //checking the newpw and confirm new pw
        if(newPassword !== confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:'The password and confirm password do not match. Please enter correctly.',
            })
        }
    
        //update the pw in db
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,{
            password:hashedNewPassword,
        },{new:true});
    
        //send mail that pw is updated
        try {
            const emailResponse = await mailSender(updatedUserDetails.email, passwordUpdated(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            ))    
    
            console.log('Email sent successfully: ', emailResponse.response);
        } 
        catch (error) {
            //there is an error in sending the mail
            console.error('Error occured while sending the mail: ', error);
            return res.status(500).json({
                success:false,
                message:'Error occured while sending the mail',
                error:error.message,
            })
        }
        
        //response return
        res.status(200).json({
            success:true,
            message:'Your password has been updated successfully',
        })
        
    } 
    catch (error) {
        //error while updating the password
        console.error('Error occurred while updating password: ',error);
        return res.status(500).json({
            success:false,
            message:'Error occured while updating the password',
            error:error.message,
        })
    }
}