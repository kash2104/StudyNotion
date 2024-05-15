import copy from "copy-to-clipboard";
import React from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import { addToCart } from "../../../slices/cartSlice";
import { BsFillCaretRightFill } from "react-icons/bs";
import { FaShareSquare } from "react-icons/fa";

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { thumbnail: ThumbNailImage, price: CurrentPrice } = course;

  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an instructor. You cannot buy the course");
    }

    if (token) {
      dispatch(addToCart(course));
      return;
    }

    setConfirmationModal({
      text1: "You are not logged in",
      text2: "Please Login to add to cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleShare = () => {
    //onclick just copy the url
    copy(window.location.href);
    toast.success("Link Copied to clipboard");
  };

  return (
    <>
      <div
        className={`flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5`}
      >
        <img
          src={ThumbNailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] rounded-2xl overflow-hidden object-cover md:max-w-full"
        />

        <div className="px-4">
          <div className="space-x-3 pb-4 text-3xl font-semibold">
            Rs. {CurrentPrice}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={
                user && course?.studentsEnrolled.includes(user?._id)
                  ? () => navigate("/dashboard/enrolled-courses")
                  : handleBuyCourse
              }
              className="yellowButton"
            >
              {user && course?.studentsEnrolled.includes(user?._id)
                ? "Go To Course"
                : "Buy Now"}
            </button>

            {(!user || !course?.studentsEnrolled.includes(user?._id)) && (
              <button onClick={handleAddToCart} className="blackButton">
                Add to Cart
              </button>
            )}
          </div>

          <div>
            <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
              30 days money back guarantee
            </p>
          </div>

          <div className={``}>
            <p className="my-2 text-xl font-semibold">This course includes:</p>

            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
              {course?.instructions?.map((item, index) => {
                return (
                  <p key={index} className="flex gap-2">
                    <BsFillCaretRightFill />
                    <span>{item}</span>
                  </p>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleShare}
              className="mx-auto flex items-center gap-2 text-yellow-100 py-6"
            >
              <FaShareSquare size={15} />
              Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetailsCard;
