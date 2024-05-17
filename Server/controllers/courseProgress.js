const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");

exports.updateCourseProgress = async (req, res) => {
  //jab bhi course me enroll hue i.e. jaise hi payment successfull hui tab hume batana padega ki abhi uski progress = 0 hain
  const { courseId, subSectionId } = req.body;

  const userId = req.user.id;

  try {
    //check if the subsection is valid or not
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        error: "Invalid subSection",
      });
    }

    //is subSection ki entry pehle se exist karti hain ya nhi
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress does not exist",
      });
    } else {
      //courseProgress is valid

      //checking if video is already marked as complete or not
      if (courseProgress.completedVideos.includes(subSectionId)) {
        return res.status(400).json({
          success: false,
          error: "Subsection is already marked as complete",
        });
      }

      //push the video into completedVideo
      courseProgress.completedVideos.push(subSectionId);

      //need to save this updated state
      await courseProgress.save();

      return res.status(200).json({
        success: true,
        message: "Course Progress updated",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error:
        "Internal server error while updating the courseProgress completedVideos",
    });
  }
};
