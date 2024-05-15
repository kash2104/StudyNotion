const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
//thumbnail ke pic ko upload karne ke liye
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const courseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");

//create course handler function
exports.createCourse = async (req, res) => {
  try {
    //fetch data from req ki body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      status,
      instructions,
    } = req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !thumbnail ||
      !category ||
      !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!status || status === undefined) {
      status = "Draft";
    }

    //get the instructor id which is to be stored in course schema that's why we have to get the instructor details
    //yaha par mere pas instructor ki user id(user schema ki id) hai but object id(instructor schema ki khud ki id) nhi hai, that's why we created instructorDetails
    //here userId and instructorDetails.id can be the same IMP IMP IMP IMP IMP
    //checking if the person creating the course is instructor or not
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });
    console.log("Instructor Details: ", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    //check the given category is valid or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details not found",
      });
    }

    //upload image of thumbnail to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    console.log("Image is: ", thumbnailImage);

    //creating entry for new course in db
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price: price,
      tag: tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions: instructions,
    });

    //add the new course to the user schema of instructor i.e. instructor ke course list me yeh course ko add kar do in the array
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //update the tag schema  --> check this code
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

    console.log("Added course into a category..", categoryDetails2);

    //return response along with new course
    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create the course",
      error: error.message,
    });
  }
};

//edit course details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);

    //if the courseId is not found
    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    //if thumbnail image is found, update it
    if (req.files) {
      console.log("Thumbnail Update");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );

      course.thumbnail = thumbnailImage.secure_url;
    }

    //update the fields that present in req body and not any other fields
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.log("Error while updating the course...", error);
    res.status(500).json({
      success: false,
      message: "Error while updating the course. Internal server error",
      error: error.message,
    });
  }
};

//get all courses
exports.getAllCourses = async (req, res) => {
  try {
    //saare courses dekhne hai toh find call maro and jo jo chahiye usko true mark karo
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    //return response
    return res.status(200).json({
      success: true,
      message: "Data found for all the courses successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannnot fetch all the courses",
      error: error.message,
    });
  }
};

//get course details
exports.getCourseDetails = async (req, res) => {
  try {
    //get id
    const { courseId } = req.body;

    //find the course details
    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor", //instructor is stored as reference so have to use path to populate it.
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec();

    //validation
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ${courseId}`,
      });
    }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    //return res
    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: {
        courseDetails,
        totalDuration,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get all the details of a particular course
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    let courseProgressCount = await courseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("courseProgressCount: ", courseProgressCount);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//to get the list of courses of a particular instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    console.log(
      "Error while getting courses of particular instructor..",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

//deleting a course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    //find the course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found. So cannot be deleted",
      });
    }

    //unenroll all the students from the course which we are deleting
    const studentsEnrolled = course.studentsEnrolled;

    for (const studentId of studentsEnrolled) {
      await User.findByIdAndDelete(studentId, {
        $pull: { courses: courseId },
      });
    }

    //deleting the sections and subSections of that course
    const courseSections = course.courseContent;

    for (const sectionId of courseSections) {
      const section = await Section.findById(sectionId);

      if (section) {
        //deleting the subsections
        const subSections = section.subSection;

        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }
      //delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    //deleting the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting the course..", error);
    return res.status(500).json({
      success: false,
      message:
        "Error while deleting the course so cannot delete the course. Server error",
      error: error.message,
    });
  }
};
