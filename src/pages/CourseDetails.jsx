import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { buyCourse } from "../services/operations/StudentFeaturesAPI";
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI";
import GetAvgRating from "../utils/avgRating";
import Error from "./Error";
import ConfirmationModal from "../components/common/ConfirmationModal";
import RatingStars from "../components/common/RatingStars";
import formatDate from "../services/formatDate";
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard";
import { BiInfoCircle } from "react-icons/bi";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import ReactMarkdown from "react-markdown";
import Footer from "../components/common/Footer";
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar";

const CourseDetails = () => {
  const { user } = useSelector((state) => state.profile);

  const { token } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { courseId } = useParams();

  //kab konsa section dikhana hai. section opened hai toh uss section ke lecture dikhao
  const [isActive, setIsActive] = useState([]);

  //need the data of the whole course when the courseId changes
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const getCourseFullDetails = async () => {
      try {
        const result = await fetchCourseDetails(courseId);
        setCourseData(result);
      } catch (error) {
        console.log("Could not fetch course Details");
      }
    };
    getCourseFullDetails();
  }, [courseId]);

  //need avgReview count once you get the courseData
  const [avgReviewCount, setAverageReviewCount] = useState(0);
  useEffect(() => {
    const count = GetAvgRating(
      courseData?.data?.courseDetails.ratingAndReviews
    );

    setAverageReviewCount(count);
  }, [courseData]);

  //counting total no.of lectures once we get the courseData
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);
  useEffect(() => {
    let lectures = 0;
    courseData?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0;
    });

    setTotalNoOfLectures(lectures);
  }, [courseData]);

  const { loading } = useSelector((state) => state.auth);
  const { paymentLoading } = useSelector((state) => state.course);

  const [confirmationModal, setConfirmationModal] = useState(null);
  const handleBuyCourse = () => {
    if (token) {
      buyCourse(token, [courseId], user, navigate, dispatch);
      return;
    }

    //the user is not logged in
    setConfirmationModal({
      text1: "You are not logged in",
      text2: "Please login to purchase the course",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  if (loading || !courseData) {
    return (
      <div className="grid min-h-[calc(100vh - 3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!courseData.success) {
    return (
      <div>
        <Error />
      </div>
    );
  }

  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
  } = courseData.data?.courseDetails;

  //collapsing all sections
  // const [isActive, setIsActive] = useState([]);
  const handleActive = (id) => {
    setIsActive(
      //toggling the active
      !isActive.includes(id)
        ? isActive.concat(id)
        : isActive.filter((e) => e !== id)
    );
  };

  if (paymentLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  //whole path of how the payment works

  //BuyNow pe click -> handleBuyCourse -> operations -> StudentFeaturesAPI (buyCourse function) -> backend(capture payment -> initiates order) -> razorPay modal openUp -> success payment -> handler(1. successEmail function -> function using mailSender to send email, 2.verifyPayment function -> Backend(verifyPayment controller called to verify the payment i.e. signature && enroll the students in the course) -> navigate(enrolledCourses page));
  return (
    <>
      <div className={`relative w-full bg-richblack-800`}>
        {/* hero section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            <div className="relative block max-h-[30rem] lg:hidden">
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>

              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full"
              />
            </div>

            <div
              className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}
            >
              <div>
                <p className="text-4xl font-bold text-richblack-5 sm:text-[42px]">
                  {courseName}
                </p>
              </div>

              <p className="text-richblack-200">{courseDescription}</p>

              <div className="text-md flex flex-wrap items-center gap-2">
                <span className="text-yellow-25">{avgReviewCount}</span>

                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />

                <span>{`(${ratingAndReviews.length} reviews)`}</span>

                <span>{`(${studentsEnrolled.length} students enrolled)`}</span>
              </div>

              <div>
                <p className="">
                  Created by{" "}
                  {`(${instructor.firstName} ${instructor.lastName})`}
                </p>
              </div>

              <div className="flex flex-wrap gap-5 text-lg">
                <p className="flex items-center gap-2">
                  <BiInfoCircle /> Created at {formatDate(createdAt)}
                </p>

                <p className="flex flex-row  items-center gap-2">
                  {" "}
                  <HiOutlineGlobeAlt /> English
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
              <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-5">
                Rs.{price}
              </p>

              <button className="yellowButton" onClick={handleBuyCourse}>
                Buy Now
              </button>

              <button className="blackButton">Add to Cart</button>
            </div>
          </div>

          {/* courses card  */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute lg:block">
            <CourseDetailsCard
              course={courseData?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* what you will learn  */}
          <div className="my-8 border border-richblack-600 p-8">
            <p className="text-3xl font-semibold">What You Will Learn</p>

            <div className="mt-5">
              <ReactMarkdown>{whatYouWillLearn}</ReactMarkdown>
            </div>
          </div>

          {/* course content section */}
          <div className="max-w-[830px]">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold">Course Content</p>

              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>
                    {courseContent.length} {`section(s)`}
                  </span>

                  <span>
                    {totalNoOfLectures} {`lecture(s)`}
                  </span>

                  <span>{courseData.data?.totalDuration} total length</span>
                </div>

                {/* collapse section btn */}
                <div>
                  <button
                    className="text-yellow-25"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all sections
                  </button>
                </div>
              </div>
            </div>

            {/* course accordion */}
            <div className="py-4">
              {courseContent?.map((course, index) => {
                return (
                  <CourseAccordionBar
                    course={course}
                    key={index}
                    isActive={isActive}
                    handleActive={handleActive}
                  />
                );
              })}
            </div>

            {/* author Details */}
            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold">Author</p>

              <div className="flex items-center gap-4 py-4">
                <img
                  src={
                    instructor.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />

                <p className="text-lg">
                  {`${instructor.firstName} ${instructor.lastName}`}
                </p>
              </div>

              <p className="text-richblack-50">
                {instructor?.additionalDetails?.about}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
};

export default CourseDetails;
