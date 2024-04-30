const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//resetPasswordToken - yaha par token generate kiya, user ki entry me save kiya and baad me issi token ka use karke pw ko update kar pau
exports.resetPasswordToken = async(req, res) => {
    try {
        //get email from req ki body
        const email = req.body.email;
    
        //check if email exists or not -> validation
        const user = await User.findOne({email:email});
    
        if(!user){
            return res.json({
                success:false,
                message:`Your email ${email} is not registered with us`,
            })
        }
    
        //generate token 
        const token = crypto.randomBytes(20).toString('hex');
    
        //update the user by adding token and expiration time in the user schema
        //new:true karne par mujhe response me updated document milega. If not written, we will get the old document only.
        const updatedDetails = await User.findOneAndUpdate({email:email},{
            token:token,
            resetPasswordExpires:Date.now() + 3600000,
        }, {new:true});
        console.log('Details: ', updatedDetails);
    
        //create url
        //UI pe kya dikhega? Sabke liye alag-alag link hogi which is dependent on token
        const url = `http://localhost:3000/update-password/${token}`
    
        //send mail containing the link to reset the pw
        await mailSender(email, 'Password Reset', `Please click this ${url} to reset your password`);
    
        //return successfull response
        return res.json({
            success:true,
            message:'Email sent successfully. Please check your email and change your password'
        })
        
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending the reset password mail',
        })
    }
}

//resetPassword -> actually pw reset kar rhe hai. db me update karne ke liye.
//3 things aayegi -> newtoken, pw, confirmpw
exports.resetPassword = async(req, res) => {
    try {
        //data fetch
        const{password, confirmPassword, token} = req.body;
    
        //validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:'Password not matching. Please enter same password in both fields',
            })
        }
    
        //get userdetails from db using token generated above
        const userDetails = await User.findOne({token:token})
    
        //if no entry found, then the token is invalid or the token time has expired(check token time)
        if(!userDetails){
            return res.json({
                success:false,
                message:'Token is invalid',
            })
        }
    
        if(!(userDetails.resetPasswordExpires > Date.now())){
            return res.status(403).json({
                success:false,
                message:'Token is expired. Your session has timed out. Please regenerate your token to reset password',
            })
        }    
    
        //new password hash
        const hashedPassword = await bcrypt.hash(password, 10);
    
        //password update
        await User.findOneAndUpdate({token:token}, {
            password:hashedPassword,
        }, {new:true});
    
        //return response
        return res.json({
            success:true,
            message:'Password reset successfull',
        })
        
    } 
    catch (error) {
        console.log(error);
        return res.json({
            success:false,
            message:'Something went wrong while resetting the password',
        })
    }
}