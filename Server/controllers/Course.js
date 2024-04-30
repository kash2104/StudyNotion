const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
//thumbnail ke pic ko upload karne ke liye
const {uploadImageToCloudinary} = require('../utils/imageUploader');

//create course handler function
exports.createCourse = async(req, res) => {
    try {
        //fetch data from req ki body
        let {courseName, courseDescription, whatYouWillLearn, price, tag,category,status,instructions,} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !category || !tag){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }
        if(!status || status === undefined){
            status = 'Draft';
        }

        //get the instructor id which is to be stored in course schema that's why we have to get the instructor details
        //yaha par mere pas instructor ki user id(user schema ki id) hai but object id(instructor schema ki khud ki id) nhi hai, that's why we created instructorDetails
        //here userId and instructorDetails.id can be the same IMP IMP IMP IMP IMP 
        //checking if the person creating the course is instructor or not
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {accountType:'Instructor',});
        console.log('Instructor Details: ', instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor details not found',
            })
        }

        //check the given category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'Category Details not found',
            })
        }

        //upload image of thumbnail to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        console.log('Image is: ', thumbnailImage);

        //creating entry for new course in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price:price,
            tag: tag,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        })

        //add the new course to the user schema of instructor i.e. instructor ke course list me yeh course ko add kar do in the array
        await User.findByIdAndUpdate({_id:instructorDetails._id}, {
            $push:{
                courses:newCourse._id,
            }
        }, {new: true})

        //update the tag schema  --> check this code
        await Category.findByIdAndUpdate({_id:category},{
            $push:{
                course: newCourse._id,
            }
        },{new:true});

        //return response along with new course
        return res.status(200).json({
            success:true,
            message:'Course created successfully',
            data:newCourse,
        })

    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create the course',
            error:error.message,
        })
    }
}

//get all courses
exports.getAllCourses = async(req, res) => {
    try {
        //saare courses dekhne hai toh find call maro and jo jo chahiye usko true mark karo
        const allCourses = await Course.find({},{
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).populate('instructor').exec();

        //return response
        return res.status(200).json({
            success:true,
            message:'Data found for all the courses successfully',
            data:allCourses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannnot fetch all the courses',
            error:error.message,
        })
    }
}

//get course details
exports.getCourseDetails = async(req, res) => {
    try {
        //get id
        const {courseId} = req.body;

        //find the course details
        const courseDetails = await Course.findById({_id:courseId})
        .populate(
            {
                path:'instructor', //instructor is stored as reference so have to use path to populate it.
                populate:{
                    path:'additionalDetails',
                }
            }
        )
        .populate('category')
        .populate('ratingAndReviews')
        .populate(
            {
                path:'courseContent',
                populate:{
                    path:'subSection',
                }
            }
        )
        .exec();

        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            })
        }

        //return res
        return res.status(200).json({
            success:true,
            message:'Course details fetched successfully',
            data:courseDetails,
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