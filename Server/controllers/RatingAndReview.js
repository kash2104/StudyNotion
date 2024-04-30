const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');

//create Rating
exports.createRating = async(req, res) => {
    try {
        //get user id
        const userId = req.user.id;

        //fetch the rating and review from req body
        const {rating, review, courseId} = req.body;

        //check that whether the student giving the review is enrolled in this course or not
        const courseDetails = await Course.findOne(
            {
                _id:courseId,
                //just checking whether this student is enrolled in the course or not
                studentsEnrolled:{$elemMatch:{$eq:userId}},
            },

        )
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in this course',
            })
        }

        //check if the user has not already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        })
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:'User has already reviewed the course',
            })
        }

        //create the rating and review
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId,
        })

        //update the course with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            {_id:courseId}, 
            {
                $push:{
                    ratingAndReviews:ratingReview._id,
                }
            },
            {new:true}
        );
        console.log(updatedCourseDetails);

        //return res
        return res.status(200).json({
            success:true,
            message:'Rating and Review created successfully',
            ratingReview,
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

//get average rating
exports.getAverageRating = async(req, res) => {
    try {
        //get the course id
        const courseId = req.body.courseId;

        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                //ek aisi entry find karke do jisme course ki field ke andar courseId padi ho
                $match:{
                    //here we have used types.objectId bcz initially the courseId is in string and we have to convert it into objectId
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },

            {
                //course ke andar bohot saari entry aa gayi hai toh ab sabko group karo
                $group:{
                    //kiske basis pe group karna hai?
                    //we don't know so we set it NULL toh jitni bhi entries aayi thi un sabko ek hi me wrap kar diya
                    _id:null,
                    averageRating:{$avg:'$rating'},
                }
            }
        ])

        //return avg rating
        if(result.length > 0){
            //aggregate funciton returns an array and the ans is stored at the 0th index
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }

        //no rating exists
        return res.status(200).json({
            success:true,
            message:'Average Rating 0, no ratings given till now',
            averageRating:0,
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

//get all rating and reviews
exports.getAllRating = async(req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
        .sort({rating:'desc'})
        .populate({
            path:'user',
            //select means user ke andar konse fields ko mujhe populate karna hai
            select:'firstName lastName email image',
        })
        .populate({
            path:'course',
            select:'courseName',
        })
        .exec();

        return res.status(200).json({
            success:true,
            message:'All reviews fetched successfully',
            data:allReviews,
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