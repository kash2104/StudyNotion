const express = require('express');
const router = express.Router();

//getting the controllers of course
const {createCourse,getAllCourses,getCourseDetails} = require('../controllers/Course');

//getting the controllers of sections
const {createSection,updateSection,deleteSection} = require('../controllers/Section');

//getting the controllers of sub-sections
const {createSubSection,updateSubSection,deleteSubSection} = require('../controllers/Subsection');

//getting the controllers of category
const {createCategory,showAllCategories,categoryPageDetails} = require('../controllers/Category');

//getting the controllers of ratings
const {createRating,getAverageRating,getAllRating} = require('../controllers/RatingAndReview');

//getting the middlewares
const {auth,isStudent,isInstructor,isAdmin} = require('../middlewares/auth');

//WRITTING THE ROUTES

/*************** COURSE ROUTES************************/

//course can be created by instructor only
router.post('/createCourse',auth,isInstructor,createCourse);

//adding a section
router.post('/createSection',auth,isInstructor,createSection);

//updating a section
router.post('/updateSection',auth,isInstructor,updateSection);

//delete a section
router.post('/deleteSection',auth,isInstructor,deleteSection);

//adding a subsection
router.post('/addSubSection',auth,isInstructor,createSubSection);

//updating a subsection
router.post('/updateSubSection',auth,isInstructor,updateSubSection);

//delete subsection
router.post('/deleteSubSection',auth,isInstructor,deleteSubSection);

//get all registered courses
router.post('/getAllCourses',getAllCourses);

//get details of specific course
router.post('/getCourseDetails',getCourseDetails);


/*********CATEGORY ROUTES CREATED BY ADMIN ONLY *******************/

//create category
router.post('/createCategory',auth,isAdmin,createCategory);

//show all the categories available
router.get('/showAllCategories',showAllCategories);

//get category page details -> check this*******
router.get('/getCategoryPageDetails',categoryPageDetails);


/************** RATINGS AND REVIEWS ROUTES ********************/

//adding a rating
router.post('/createRating',auth,isStudent,createRating);

//getting the average rating
router.get('/getAverageRating',getAverageRating);

//get all the ratings
router.get('/getReviews',getAllRating);


module.exports = router;
