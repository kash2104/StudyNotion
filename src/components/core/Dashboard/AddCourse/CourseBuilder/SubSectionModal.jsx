import React, { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  createSubSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import { RxCross1 } from "react-icons/rx";
import Upload from "../Upload";
import IconBtn from "../../../../common/IconBtn";

const SubSectionModal = ({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);

  //video, title, description seen in modal so will set them on the first render
  useEffect(() => {
    //the subSection is already created
    if (view || edit) {
      setValue("lectureTitle", modalData.title);
      setValue("lectureDesc", modalData.description);
      setValue("lectureVideo", modalData.videoUrl);
    }
  }, []);

  //whether we have updated the form or not
  const isFormUpdated = () => {
    const currentValues = getValues();

    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    ) {
      return true;
    } else {
      return false;
    }
  };

  //editing the subSection when the form is submitted
  const handleEditSubSection = async () => {
    const currentValues = getValues();

    const formData = new FormData();

    formData.append("sectionId", modalData.sectionId);
    formData.append("subSectionId", modalData._id);

    //if the form has been updated
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle);
    }

    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc);
    }

    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo);
    }

    setLoading(true);
    //api call
    const result = await updateSection(formData, token);

    if (result) {
      //update the course structure
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      );

      const updatedCourse = { ...course, courseContent: updatedCourseContent };

      dispatch(setCourse(updatedCourse));
    }
    setModalData(null);
    setLoading(false);
  };
  //on submitting the form
  const onSubmit = async (data) => {
    if (view) {
      //no option available for submitting or saving or editing
      return;
    }

    if (edit) {
      //there is no updation of form
      if (!isFormUpdated) {
        toast.error("No changes made to the form");
      } else {
        //the form has been editted
        handleEditSubSection();
      }
      return;
    }

    //data collect -> api call -> if anything needs to be updated -> go to next step
    //we are adding a lecture so in NestedView.jsx, while addSubSection calling in SubSectionModal we have passed the sectionId as modalData
    const formData = new FormData();

    //the modalData has sectionId from NestedView.jsx in addSubSection part

    //what all to append in the formData? for this which api is called and see what all values it needs.
    formData.append("sectionId", modalData);
    formData.append("title", data.lectureTitle);
    formData.append("description", data.lectureDesc);
    formData.append("video", data.lectureVideo);

    setLoading(true);

    //api call -> addSubSection
    const result = await createSubSection(formData, token);

    if (result) {
      //update the course
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData ? result : section
      );

      const updatedCourse = { ...course, courseContent: updatedCourseContent };

      dispatch(setCourse(updatedCourse));
    }

    setModalData(null);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* modal type -> adding, editing, viewing lecture */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>

          {/* close the modal */}
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross1 className="text-2xl text-richblack-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-8 py-10"
        >
          {/* video section */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            //agar view and edit false hoga toh drag and drop zone vala dikhega or else you will see the video
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />

          {/* title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title
              {!view && <span className="text-pink-200">*</span>}
            </label>

            <input
              id="lectureTitle"
              placeholder="Enter lecture title"
              {...register("lectureTitle", { required: true })}
              disabled={view || loading}
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
            />

            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Title is required
              </span>
            )}
          </div>

          {/* description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description{" "}
              {!view && <sup className="text-pink-200">*</sup>}
            </label>

            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 resize-none min-h-[130px]"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Description is required
              </span>
            )}
          </div>

          {/* button -> not present when we are viewing the subSection */}
          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Loading..." : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubSectionModal;
