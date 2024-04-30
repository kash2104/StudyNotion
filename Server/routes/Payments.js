const express = require('express');
const router = express.Router();

//getting all the controller related to payment
const {capturePayment,verifySignature,} = require('../controllers/Payments');

//getting the middlewares 
const {auth,isStudent,isAdmin,isInstructor} = require('../middlewares/auth');

//creating the route for capturing the payment
router.post('/capturePayment',capturePayment);

//route for verifying the signature
router.post('/verfiySignature',verifySignature);


module.exports = router;
