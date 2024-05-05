const { default: mongoose, mongo } = require("mongoose");
const Category = require("../models/Category");

//to create a category
exports.createCategory = async (req, res) => {
  try {
    //data fetch from req ki body
    const { name, description } = req.body;

    //validation
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    //create entry in db
    const CategorysDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategorysDetails);

    //return success response
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    console.log("INSIDE SHOW ALL CATEGORIES");
    //find function marenge to show all tags
    //koi bhi criteria nhi laga rhe to get the tags but jo bhi tags chahiye usme compulsory name and description hona chahiye
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    );

    //return success response
    res.status(200).json({
      success: true,
      data: allCategorys,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//category page details - HW done with different way
exports.categoryPageDetails = async (req, res) => {
  try {
    //get category id
    const { categoryId } = req.body;

    //uss category id ke corresponding jitne bhi courses hai voh le aao
    const selectedCategory = await Category.findById(categoryId)
      .populate("course")
      .exec();

    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    //get courses for different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("course")
      .exec();

    //get top selling courses - HW
    //select courses, count(student) as total group by courses order by total desc limit 10;
    try {
      const topTenCourses = await Category.aggregate([
        {
          $unwind: "$course", //makes a new doc for each element of the array course i.e. breaks the array into single elements so that they are easy to access
        },

        {
          $group: {
            _id: "$course",
            totalStudentsEnrolled: { $sum: "$course.studentsEnrolled.length" },
          },
        },

        {
          $sort: {
            totalStudentsEnrolled: -1, //to sort the it in desc order
          },
        },

        {
          $limit: 10,
        },
      ]);

      if (topTenCourses.length > 0) {
        return res.status(200).json({
          success: true,
          message: "These are the top selling courses",
          topTenCourses,
        });
      }

      //no rating exists
      return res.status(200).json({
        success: true,
        message: "We are analysing the top selling courses",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
