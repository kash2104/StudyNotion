import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import IconBtn from "../../common/IconBtn";
import { IoIosArrowBack } from "react-icons/io";
import { BsChevronDown } from "react-icons/bs";

const VideoDetailsSidebar = ({ setReviewModal }) => {
  //at a time only 1 section opens up
  const [activeStatus, setActiveStatus] = useState("");

  //jo video dekh rhe hai voh sidebar me highlighted hoga
  const [videoBarActive, setVideoBarActive] = useState("");

  //back button se enrolled-courses vale page par jayenge
  const navigate = useNavigate();

  const { sectionId, subSectionId } = useParams();

  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse);

  const location = useLocation();

  //enrolled-courses se jab video dekhne aayenge toh by default ek video highlighted hi mark hogi
  useEffect(() => {
    const setActiveFlags = () => {
      //section length is 0
      if (!courseSectionData.length) {
        return;
      }

      //finding the index of current section. we have sectionId from useParams(). Will helpful in highlighting the current section
      const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
      );

      //finding the index of current subSection inside the current Section
      const currentSubSectionIndex = courseSectionData?.[
        currentSectionIndex
      ]?.subSection.findIndex((data) => data._id === subSectionId);

      //finding currentActiveSubSection i.e. jispe click kiya hain and jiski video visible hain, uss video ki id kya hain toh accordingly we can highlight that particular video i.e. jo bhi lecture abhi khula hua hain uski id lekar aa gaye
      const activeSubSectionId =
        courseSectionData[currentSectionIndex]?.subSection?.[
          currentSubSectionIndex
        ]?._id;

      //current section ki id mark kar diya
      setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);

      //current subSection ki id mark kar diya
      setVideoBarActive(activeSubSectionId);
    };

    setActiveFlags();
  }, [courseSectionData, courseEntireData, location.pathname]);

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
        {/* buttons and heading*/}
        <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
          {/* buttons */}
          <div className="flex w-full items-center justify-between">
            {/* back button */}
            <div
              onClick={() => navigate("/dashboard/enrolled-courses")}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
              title="back"
            >
              <IoIosArrowBack size={30} />
            </div>

            {/* add review button */}
            {/* setReviewModal true hone par CourseReviewModal visible ho jayega */}
            <IconBtn
              text="Add Review"
              onclick={() => setReviewModal(true)}
              customClasses="ml-auto"
            />
          </div>

          {/* heading */}
          <div className="flex flex-col">
            <p>{courseEntireData?.courseName}</p>

            <p className="text-sm font-semibold text-richblack-500">
              {completedLectures?.length} / {totalNoOfLectures}
            </p>
          </div>
        </div>

        {/* for sections and subsections */}
        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
          {courseSectionData.map((section, index) => {
            return (
              //top level div pe click karne pe sirf section vala flag active hoga & video vala flag active NHI HOGA.
              <div
                onClick={() => setActiveStatus(section?._id)}
                key={index}
                className="mt-2 cursor-pointer text-sm text-richblack-5"
              >
                {/* section code  */}
                <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                  <div className="w-[70%] font-semibold">
                    {section?.sectionName}
                  </div>
                  {/* arrow icons and rotate logic */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`${
                        activeStatus === section?.sectionName
                          ? "rotate-0"
                          : "rotate-180"
                      } transition-all duration-500`}
                    >
                      <BsChevronDown />
                    </span>
                  </div>
                </div>

                {/* subsections will be seen  only of the active section and not of all the sections*/}
                {activeStatus === section?._id && (
                  <div className="transition-[height] duration-500 ease-in-out">
                    {section.subSection.map((topic, index) => {
                      //jis video ki id = videoBarActive hogi, uska color yellow
                      return (
                        <div
                          key={index}
                          className={`flex gap-3 px-5 py-2 ${
                            videoBarActive === topic._id
                              ? "bg-yellow-200 text-richblack-800 font-semibold"
                              : "hover: bg-richblack-900 "
                          }`}
                          onClick={() => {
                            //kisi bhi lecture pe click kiya toh voh active lecture ban gaya and uss lecture ki video dikhani padegi i.e. route pe jana padega /section/:sectionId/subSection/:subSectionId
                            navigate(
                              `/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`
                            );

                            setVideoBarActive(topic?._id);
                          }}
                        >
                          {/* checkbox and lectureName */}

                          {/* if the lecture is present in the completedLectures list, then only tick the checkbox or else it will be unticked */}
                          <input
                            type="checkbox"
                            checked={completedLectures.includes(topic?._id)}
                            onChange={() => {}}
                          />

                          <span>{topic?.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default VideoDetailsSidebar;
