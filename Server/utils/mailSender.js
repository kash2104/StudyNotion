//otp ko mail me send karne liye

const nodemailer = require('nodemailer');

const mailSender = async(email, title, body) => {
    try {
        //creating transporter
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })
        
        //sending mail from the transporter
        let info = await transporter.sendMail({
            from:'StudyNotion || Kavish Parikh',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        })
        console.log('mail info is: ',info);
        return info;
    } 
    catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;