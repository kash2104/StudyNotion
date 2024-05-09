const mongoose = require("mongoose");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subSectionId } = req.body;

  const userId = req.user.id;

  try {
    //check if the subSection is valid
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        error: "Invalid subSection while updatingCourseProgress",
      });
    }

    //find the courseProgress document for the user and that particular course course
    let courseProgress = await CourseProgress.find({
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course Progress does not exist",
      });
    } else {
      //checking if the subSection is completed or not
      if (courseProgress.completedVideos.includes(subSectionId)) {
        return res.status(400).json({
          error: "subSection is already completed",
        });
      }
    }

    //adding the subSection to completedVideos
    courseProgress.completedVideos.push(subSectionId);

    await courseProgress.save();

    return res.status(200).json({
      message: "Course Progress updated",
      data: courseProgress,
    });
  } catch (error) {
    console.log("Error while updating the courseProgress...", error);
    return res.status(500).json({
      error: "Error while updating the courseProgress. Internal server error.",
    });
  }
};
