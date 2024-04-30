const{instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const{courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');

//capture the payment and initiate the razopay order
exports.capturePayment = async(req, res) => {
    //get the courseId and UserId
    const{course_id} = req.body;
    const userId = req.user.id;

    //validation of course id
    if(!course_id){
        return res.json({
            success:false,
            message:'Please provide valid course id',
        })
    }

    //VALIDATION STARTS
    //valid course detail
    let course;
    try {
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:'Could not find the course', 
            })
        }    
        
        //user already pay for the same course check it
        const uid = new mongoose.Types.ObjectId(userId); //convert id from string to objectid bcz in course model we have stored user id as object id

        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled',
            })
        }
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    //VALIDATION ENDS

    //order create
    const amount = course.price;
    const currency = 'INR';

    //options -> need for order creation
    const options = {
        amount:amount * 100, //mandatory
        currency, //mandatory
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    }

    try {
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);   
        
        //return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId: paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,

        })
    } 
    catch (error) {
        console.error(error);
        res.json({
            success:false,
            message:'Could not initiate the order',
        })
    }

}

//verify signature of razorpay and server
exports.verifySignature = async(req, res) => {
    //matching of server ke andar ka secret and razorpay ne jo secret bheja hai
    const webhookSecret = '12345678'; //server ka secret

    const signature = req.headers['x-razorpay-signature'];

    //converting webhooksecret to digest i.e. converting the webhooksecret to the hashed secret so that we can verify the razorpay secret with our webhook secret.
    /*step1:*/const shasum = crypto.createHmac('sha256',webhookSecret);

    //converting the shasum to string
    /*step2:*/shasum.update(JSON.stringify(req.body));

    //hashing algo run karne ke bad jo o/p aata hai usko digest kehte hai which is basically in hexadecimal format
    /*step3:*/const digest = shasum.digest('hex');

    //Authorization is completed
    if(signature === digest){
        console.log('Payment is authorized');
        
        //found the courseid and userid from the notes jo humne upar vale function me likha
        const{courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate({_id:courseId}, {
                $push:{
                    studentsEnrolled:userId
                }
            },{new:true}) 
            
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:'Course not found',
                })
            }
            console.log('Course in which the student has enrolled is: ',enrolledCourse);

            //find the student and add the course in their course purchased list
            const enrolledStudent = await User.findOneAndUpdate({_id:userId},{
                $push:{
                    courses:courseId,
                }
            },{new:true});

            console.log(enrolledStudent);

            //enrolled successfull ka mail bhejna hai
            const emailResponse = await mailSender(enrolledStudent.email, 'Enrollment Successfull', 'Congragulations for enrolling yourself in our course');

            console.log(emailResponse);

            //return res
            return res.status(200).json({
                success:true,
                message:'Signature verified and Course added',
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
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        })
    }
}