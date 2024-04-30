const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },

    otp:{
        type:String,
        required:true,
    },

    createdAt:{
        type:Date,
        default:Date.now,
        expires: 60*5, // the otp will be automatically deleted after 5 minutes of its creation time
    }
})

//function -> for sending otp to user via email
async function sendVerificationEmail(email, otp){
    try {
        //create a transporter to send emails and also define the options
        const mailResponse = await mailSender(
            email,
            'Verification Email',
            emailTemplate(otp)
        )

        console.log('Email sent successfully: ', mailResponse.response);
    } 
    catch (error) {
        console.log('error occured while sending mails', error);
        throw error;
    }
}


//db me entry create karne se pehle mail bhejo, that's why pre middleware.
OTPSchema.pre('save', async function(next){
    console.log('New document saved to db');

    //send the mail only when new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp)
    }
    
    next();
})

module.exports = mongoose.model('OTP', OTPSchema); 