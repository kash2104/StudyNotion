const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//writing it for doing multiple payments
exports.capturePayment = async (req, res) => {
  //on clicking buy now, an order is created

  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.json({
      success: false,
      message: "Please provide course id",
    });
  }

  //calculating the total amount of all the courses inside the cart
  let totalAmount = 0;
  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);

      if (!course) {
        return res.status(200).json({
          success: false,
          message: "Could not find the course",
        });
      }

      //checking if the user is already enrolled or not
      const uid = new mongoose.Types.ObjectId(userId);

      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "The student is already enrolled",
        });
      }

      totalAmount += course.price;
    } catch (error) {
      console.log(
        "Error while calculating the totalAmount of the courses...",
        totalAmount
      );
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //creating options for the order
  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  //creating the order
  try {
    const paymentResponse = await instance.orders.create(options);

    res.json({
      success: true,
      message: paymentResponse,
    });
  } catch (error) {
    console.log("Error while creating the order", error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate the order",
      error: error.message,
    });
  }
};

//verifying the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;

  const razorpay_payment_id = req.body?.razorpay_payment_id;

  const razorpay_signature = req.body?.razorpay_signature;

  const courses = req.body?.courses;

  const userId = req.user.id;

  //validation
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({
      success: false,
      message: "Payment failed",
    });
  }

  //the below is from the razorpay documentation
  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  //comparing the signature
  if (expectedSignature === razorpay_signature) {
    //enroll the student if signature matches
    await enrollStudents(courses, userId, res);

    //return res
    return res.status(200).json({
      success: true,
      message: "Payment Verfied",
    });
  }
  return res.status(200).json({
    success: false,
    message: "Payment failed because signature do not match",
  });
};

//function for enrolling the student
const enrollStudents = async (courses, userId, res) => {
  //validation
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "courses or userId missing for enrolling the student",
    });
  }

  //there are multiple courses so in each course I have to enroll the student
  for (const courseId of courses) {
    try {
      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        {
          _id: courseId,
        },
        {
          $push: { studentsEnrolled: userId },
        },
        {
          new: true,
        }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course Not found for enrolling the student",
        });
      }

      //find the student and add the course to their list of enrolld courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );

      //sending the mail to students for successfull enrollment in the course
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log("Email sent successfully after enrollment", emailResponse);
    } catch (error) {
      console.log("Error while enrolling the student", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

//the below code works only for single payment but we have to do multiple payments so need to modify that

// //capture the payment and initiate the razopay order
// exports.capturePayment = async(req, res) => {
//     //get the courseId and UserId
//     const{course_id} = req.body;
//     const userId = req.user.id;

//     //validation of course id
//     if(!course_id){
//         return res.json({
//             success:false,
//             message:'Please provide valid course id',
//         })
//     }

//     //VALIDATION STARTS
//     //valid course detail
//     let course;
//     try {
//         course = await Course.findById(course_id);
//         if(!course){
//             return res.json({
//                 success:false,
//                 message:'Could not find the course',
//             })
//         }

//         //user already pay for the same course check it
//         const uid = new mongoose.Types.ObjectId(userId); //convert id from string to objectid bcz in course model we have stored user id as object id

//         if(course.studentsEnrolled.includes(uid)){
//             return res.status(200).json({
//                 success:false,
//                 message:'Student is already enrolled',
//             })
//         }
//     }
//     catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//         })
//     }
//     //VALIDATION ENDS

//     //order create
//     const amount = course.price;
//     const currency = 'INR';

//     //options -> need for order creation
//     const options = {
//         amount:amount * 100, //mandatory
//         currency, //mandatory
//         receipt:Math.random(Date.now()).toString(),
//         notes:{
//             courseId:course_id,
//             userId,
//         }
//     }

//     try {
//         //initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);

//         //return response
//         return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail:course.thumbnail,
//             orderId: paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount,

//         })
//     }
//     catch (error) {
//         console.error(error);
//         res.json({
//             success:false,
//             message:'Could not initiate the order',
//         })
//     }

// }

// //verify signature of razorpay and server
// exports.verifySignature = async(req, res) => {
//     //matching of server ke andar ka secret and razorpay ne jo secret bheja hai
//     const webhookSecret = '12345678'; //server ka secret

//     const signature = req.headers['x-razorpay-signature'];

//     //converting webhooksecret to digest i.e. converting the webhooksecret to the hashed secret so that we can verify the razorpay secret with our webhook secret.
//     /*step1:*/const shasum = crypto.createHmac('sha256',webhookSecret);

//     //converting the shasum to string
//     /*step2:*/shasum.update(JSON.stringify(req.body));

//     //hashing algo run karne ke bad jo o/p aata hai usko digest kehte hai which is basically in hexadecimal format
//     /*step3:*/const digest = shasum.digest('hex');

//     //Authorization is completed
//     if(signature === digest){
//         console.log('Payment is authorized');

//         //found the courseid and userid from the notes jo humne upar vale function me likha
//         const{courseId, userId} = req.body.payload.payment.entity.notes;

//         try {
//             //find the course and enroll the student in it
//             const enrolledCourse = await Course.findOneAndUpdate({_id:courseId}, {
//                 $push:{
//                     studentsEnrolled:userId
//                 }
//             },{new:true})

//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success:false,
//                     message:'Course not found',
//                 })
//             }
//             console.log('Course in which the student has enrolled is: ',enrolledCourse);

//             //find the student and add the course in their course purchased list
//             const enrolledStudent = await User.findOneAndUpdate({_id:userId},{
//                 $push:{
//                     courses:courseId,
//                 }
//             },{new:true});

//             console.log(enrolledStudent);

//             //enrolled successfull ka mail bhejna hai
//             const emailResponse = await mailSender(enrolledStudent.email, 'Enrollment Successfull', 'Congragulations for enrolling yourself in our course');

//             console.log(emailResponse);

//             //return res
//             return res.status(200).json({
//                 success:true,
//                 message:'Signature verified and Course added',
//             })
//         }
//         catch (error) {
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             })
//         }
//     }
//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         })
//     }
// }
