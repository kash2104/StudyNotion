import React, { useEffect, useState } from "react";
import Footer from "../components/common/Footer";
import { useParams } from "react-router-dom";
import { apiConnector } from "../services/apiconnector";
import { categories } from "../services/apis";
import { getCatalogPageData } from "../services/operations/pageAndComponentData";
const Catalog = () => {
  const { catalogName } = useParams();
  //   console.log("CatalogName: ", catalogName);

  const [catalogPageData, setCatalogPageData] = useState(null);

  //which category is clicked in dropdown
  const [categoryId, setCategoryId] = useState("");

  //fetch all the categories i.e. jab bhi categories pe click karenge toh new url banta hai toh different category ke liye re-render hona chahiye
  useEffect(() => {
    const getCategories = async () => {
      //fetching all the categories
      const res = await apiConnector("GET", categories.CATEGORIES_API);
      console.log("getAllCategories result: ", res);

      //found the id of current selected category
      const category_id = res?.data?.data?.filter(
        (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
      )[0]._id;

      setCategoryId(category_id);
    };

    getCategories();
  }, [catalogName]);

  //runs when category id values changes
  useEffect(() => {
    //getting the data of a particular catalog
    const getCategoryDetails = async () => {
      console.log("CategoryID: ", categoryId);
      try {
        const res = await getCatalogPageData(categoryId);
        console.log("Printing result of particular category...", res);

        setCatalogPageData(res);
      } catch (error) {
        console.log(
          "ERROR WHILE GETTING THE DATA OF A PARTICULAR CATEGORY...",
          error
        );
      }
    };

    if (categoryId) {
      getCategoryDetails();
    }
  }, [categoryId]);

  //for most Popular and New colour change
  const [active, setActive] = useState(1);

  return (
    <>
      <div className=" box-content bg-richblack-800 px-4">
        <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent ">
          <p className="text-sm text-richblack-300">
            {`Home / Catalog / `}
            <span className="text-yellow-25">
              {catalogPageData?.data?.selectedCategory?.name}
            </span>
          </p>

          <p className="text-3xl text-richblack-5">
            {catalogPageData?.data?.selectedCategory?.name}
          </p>

          <p className="max-w-[870px] text-richblack-200">
            {catalogPageData?.data?.selectedCategory?.description}
          </p>
        </div>
      </div>

      {/* section1 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="section_heading">Courses to get you started</div>

        <div className="my-4 flex border-b border-b-richblack-600 text-sm">
          <p
            className={`px-4 py-2 ${
              active === 1
                ? "border-b border-b-yellow-25 text-yellow-25"
                : "text-richblack-50"
            } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </p>

          <p
            className={`px-4 py-2 ${
              active === 2
                ? "border-b border-b-yellow-25 text-yellow-25"
                : "text-richblack-50"
            } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>

        <div>
          <CourseSlider
            Courses={catalogPageData?.data?.selectedCategory?.course}
          />
        </div>
      </div>

      {/* section2 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="section_heading">
          Top Courses in {catalogPageData?.data?.selectedCategory?.name}
        </div>

        <div className="py-8">
          <CourseSlider
            Courses={catalogPageData?.data?.differentCategory?.course}
          />
        </div>
      </div>

      {/* section3 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="section_heading">Frequently Bought</div>

        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {catalogPageData?.data?.mostSellingCourses
              ?.slice(0, 4)
              .map((course, index) => {
                return (
                  <Course_Card
                    course={course}
                    key={index}
                    Height={"h-[400px]"}
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* footer */}
      <Footer />
    </>
  );
};

export default Catalog;
