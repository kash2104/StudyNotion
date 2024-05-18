const express = require("express");
const router = express.Router();

//getting the controllers
const {
  updateProfile,
  deleteAccount,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} = require("../controllers/Profile");

//get the middleware
const { auth, isInstructor } = require("../middlewares/auth");

/* ********** USER PROFILE ROUTES *************** */

//deleting the user profile
router.delete("/deleteProfile", auth, deleteAccount);

//updating the user profile
router.put("/updateProfile", auth, updateProfile);

//get the user details
router.get("/getUserDetails", auth, getAllUserDetails);

//update the profile pic
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

//get the courses in which the user is enrolled
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

//instructor dashboard
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
