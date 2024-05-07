import React, { useState } from "react";
import { useForm } from "react-hook-form";
import IconBtn from "../../../../common/IconBtn";
import { GrAddCircle } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { BiRightArrow } from "react-icons/bi";
import {
  setCourse,
  setEditCourse,
  setStep,
} from "../../../../../slices/courseSlice";
import toast from "react-hot-toast";
import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI";
import NestedView from "./NestedView";

const CourseBuilderForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [editSectionName, setEditSectionName] = useState(null);

  //button beside the IconBtn to cancel the edit
  const cancelEdit = () => {
    //mark the flag as null
    setEditSectionName(null);

    //using the forms so set its value to be emtpy
    setValue("sectionName", "");
  };

  const { course } = useSelector((state) => state.course);

  const dispatch = useDispatch();
  //going back to the previous step function i.e. step 1 so the we will be editing the course in step1 and not creating the course
  const goBack = () => {
    dispatch(setStep(1));
    dispatch(setEditCourse(true));
  };

  //going to the next step i.e. I want to go to step3. I can go to step3 only when I have created 1 section and 1 video lecture(subsection)
  const gotToNext = () => {
    if (course.courseContent.length === 0) {
      toast.error("Please add atleast 1 section");
      return;
    }

    //section ke andar subSection ki length 0 ho gayi
    if (
      course.courseContent.some((section) => section.subSection.length === 0)
    ) {
      toast.error("Please add atleast 1 lecture in each subsection");

      return;
    }

    //if everything is good, go to step3
    dispatch(setStep(3));
  };

  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  //for submitting the form i.e. create section or edit section button. It will create as well as update the section based on the editSectionName flag.
  const onSubmit = async (data) => {
    console.log("CREATE SECTION DATA", data);
    setLoading(true);
    let result;

    if (editSectionName) {
      //we are editing the section
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        token
      );
    } else {
      result = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        token
      );
    }

    //update the values
    if (result) {
      //upar section add/update kiya toh course ki value change hui hogi
      console.log("create section: ", result);
      dispatch(setCourse(result));
      setEditSectionName(null);
      setValue("sectionName", "");
    }

    setLoading(false);
  };

  //NestedView me jab edit vale button pe click karte hain tab upar ka jo create/edit section ka button and input field banaya voh change ho rha hain
  const handleChangeEditSectionName = (sectionId, sectionName) => {
    //toggle kar rhe hain. input field me kabhi values aa rhi hain toh kabhi values ja rhi hain.
    if (editSectionName === sectionId) {
      cancelEdit();
      return;
    }
    setEditSectionName(sectionId);
    setValue("sectionName", sectionName);
  };

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">
            Section Name <sup className="text-pink-200">*</sup>
          </label>

          <input
            id="sectionName"
            placeholder="Add section to build your course"
            disabled={loading}
            {...register("sectionName", { required: true })}
            style={{ boxShadow: "inset 0px -1px 0px rgba(255,255,255,0.18)" }}
            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-12 text-richblack-5"
          />

          {errors.sectionName && (
            <span className="ml-1 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>

        <div className="flex items-end gap-x-4">
          {/* if we are editing then, the iconbtn shows Edit section or else it shows create section */}
          <IconBtn
            type="submit"
            text={editSectionName ? "Edit Section Name" : "Create Section"}
            outline={true}
            customClasses={"text-white mt-5"}
          >
            <GrAddCircle className="text-yellow-50" size={20} />
          </IconBtn>

          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* course -> courseContent(section) -> subSection(videoLectures) */}
      {course.courseContent.length > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}

      {/* back and next button */}
      <div className="flex justify-end gap-x-3 mt-10">
        <button
          onClick={goBack}
          className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
        >
          Back
        </button>

        <IconBtn text="Next" onclick={gotToNext}>
          <BiRightArrow />
        </IconBtn>
      </div>
    </div>
  );
};

export default CourseBuilderForm;
