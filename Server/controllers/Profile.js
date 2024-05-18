const { response } = require("express");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const {
      about = "",
      contactNumber,
      dateOfBirth = "",
      gender = "",
    } = req.body;

    //get userid -> we have added the decodedtoken in auth.js middleware inside the req.user
    // console.log('req.user is: ',req.user);
    const id = req.user.id;
    // console.log('user id: ',id);

    //update profile -> profile ki id nhi hai but we have user ki id hai and need to convert it into object id
    const userDetails = await User.findById(id);
    if (!userDetails) {
      console.log("user not found", id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // console.log('userDetails: ',userDetails);

    const profileId = userDetails.additionalDetails;
    if (!profileId) {
      console.log("profile not found", profileId);
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    // console.log('profile id: ', profileId);

    const profileDetails = await Profile.findById(profileId);
    if (!profileDetails) {
      console.log("Profile details not found:", profileId);
      return res.status(404).json({
        success: false,
        message: "Profile details not found",
      });
    }

    //update profile -> db me save karne 2 methods --->> 1. using create function 2. using save method. Here we have used save method
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.gender = gender;
    await profileDetails.save();

    //return resp
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating the Profile. Please try again",
      error: error.message,
    });
  }
};

//delete account
//explore -> how can we schedule this delete operation
exports.deleteAccount = async (req, res) => {
  try {
    //get id -> konsi id ko delete karna hai
    const id = req.user.id;

    //validation
    const user = await User.findById({ _id: id });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //delete the profile
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });

    //HW - unenroll the user from all enrolled courses
    await Course.updateMany(
      { studentsEnrolled: id },
      {
        $pull: {
          studentsEnrolled: id,
        },
      }
    );

    //delete the user
    await User.findByIdAndDelete({ _id: id });

    //return resp
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting the account",
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    //get id
    const id = req.user.id;

    //get userDetails
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    console.log("user details: ", userDetails);

    //return resp
    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while getting user details",
      error: error.message,
    });
  }
};

//to update the profile pic
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { default: mongoose } = require("mongoose");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const CourseProgress = require("../models/CourseProgress");
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    // console.log(req.user);
    const userId = req.user.id;
    // console.log(userId);
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    userDetails = userDetails.toObject();
    var SubsectionLength = 0;

    //iterating all the courses that the user is enrolled in
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0;
      SubsectionLength = 0;

      //iterating the sections of each and every course
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration),
          0
        );
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        );
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length;
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      });
      courseProgressCount = courseProgressCount?.completedVideos.length;
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier;
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//for creating the dashboard of the instructor
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id });

    const courseData = courseDetails.map((course, index) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length;

      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      //create an object with all the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      };

      return courseDataWithStats;
    });

    return res.status(200).json({
      courses: courseData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message:
        "Internal server error while fetching instructor dashboard details",
    });
  }
};
