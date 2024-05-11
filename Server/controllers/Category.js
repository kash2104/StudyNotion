const { default: mongoose, mongo } = require("mongoose");
const Category = require("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

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
    const allCategorys = await Category.find({});

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
      .populate({
        path: "course",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    //validation
    if (!selectedCategory) {
      console.log("Category not found!");
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // when there are no courses
    if (selectedCategory.course.length === 0) {
      console.log("No courses found for the selected category");

      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category",
      });
    }

    //get courses for different categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "course",
        match: { status: "Published" },
      })
      .exec();

    //get top selling courses - HW
    //select courses, count(student) as total group by courses order by total desc limit 10;
    const allCategories = await Category.find()
      .populate({
        path: "course",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();

    const allCourses = allCategories.flatMap((category) => category.course);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching categoryPageDetails",
      error: error.message,
    });
  }
};
