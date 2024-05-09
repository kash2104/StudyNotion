import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import RenderSteps from "../AddCourse/RenderSteps";
import { getFullCourseDetails } from "../../../../services/operations/courseDetailsAPI";
import { setCourse, setEditCourse } from "../../../../slices/courseSlice";

const EditCourse = () => {
  //renderSteps ke 3 steps use karne hai
  //all the data is prefilled so need to have the data of that particular course
  //we are editing, so the editFlag should be set to true

  const dispatch = useDispatch();

  //found the courseId from url
  const { courseId } = useParams();

  const { course } = useSelector((state) => state.course);

  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  //need all the data of the course on the first render
  useEffect(() => {
    const populateCourseDetails = async () => {
      setLoading(true);

      const result = await getFullCourseDetails(courseId, token);

      if (result?.courseDetails) {
        dispatch(setEditCourse(true));
        dispatch(setCourse(result?.courseDetails));
      }
      setLoading(false);
    };
    populateCourseDetails();
  }, []);

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">
        Edit Course
      </h1>

      <div className="mx-auto max-w-[600px]">
        {course ? (
          <RenderSteps />
        ) : (
          <p className="mt-14 text-center text-3xl font-semibold text-richblack-100">
            Course Not found!
          </p>
        )}
      </div>
    </div>
  );
};

export default EditCourse;
