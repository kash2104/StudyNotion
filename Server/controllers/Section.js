const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async(req, res) => {
    try {
        //data fetch
        const{sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            })
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section's object id -> HW : use populate to replace section/subsectoin both in updatedCourseDetails
        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $push:{
                courseContent:newSection._id,
            }
        },{new:true}).populate(
            {
                path:'courseContent', 
                populate:{path:'subSection'},
            }).exec();

        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourse,
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:'Unable to create the section. Please try again',
            error:error.message,
        })
    }
}

exports.updateSection = async(req, res) => {
    try {
        //data fetch
        const{sectionName, sectionId} = req.body;

        //data validation
        // if(!sectionName || !sectionId){
        //     return res.status(400).json({
        //         success:false,
        //         message:'Missing Properties',
        //     })
        // }

        //update data using id
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return resp
        return res.status(200).json({
            success:true,
            message:section,
        })
    } 
    catch (error) {
        console.error('Error updating section: ', error);
        return res.status(500).json({
            success:false,
            message:'Unable to update the section. Please try again',
            error:error.message,
        })
    }
}

exports.deleteSection = async(req, res) => {
    try {
        //get id from params
        //HW -> test it with req.params
        const {sectionId,courseId} = req.body;

        //HW - delete the section from course also
        await Course.findByIdAndUpdate(courseId,
            {
            $pull: {
                courseContent: sectionId,
            },
            }
        )
        //use findbyIdandDelete in section
        await Section.findByIdAndDelete(sectionId);

        //return response
        return res.status(200).json({
            success:true,
            message:'Section deleted successfully',
        })
    } 
    catch (error) {
        console.error('Error while deleting section: ', error);
        return res.status(500).json({
            success:false,
            message:'Unable to delete the section. Please try again',
            error:error.message,
        })
    }
}