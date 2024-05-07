import React, { useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDropdownMenu } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import SubSectionModal from "./SubSectionModal";

import ConfirmationModal from "../../../../common/ConfirmationModal";
import {
  deleteSection,
  deleteSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";

const NestedView = ({ handleChangeEditSectionName }) => {
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  //3 flags for viewing lecture, adding lecture, editing lecture
  const [addSubSection, setAddSubSection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);

  //confirmatin modal data which will appear when I choose to delete a lecture
  const [confirmationModal, setConfirmationModal] = useState(null);

  //for deleting the section using modal when clicked on delete icon
  const handleDeleteSection = async (sectionId) => {
    const result = await deleteSection({
      sectionId,
      courseId: course._id,
      token,
    });

    if (result) {
      dispatch(setCourse(result));
    }
    //for closing the confirmationModal
    setConfirmationModal(null);
  };

  //for deleting the subSection using modal when clicked on delete icon
  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId, token });

    if (result) {
      //update the course
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      );

      const updatedCourse = { ...course, courseContent: updatedCourseContent };

      dispatch(setCourse(updatedCourse));
    }
    setConfirmationModal(null);
  };

  return (
    <>
      <div
        className="rounded-lg bg-richblack-700 p-6 px-8"
        id="nestedViewContainer"
      >
        {course?.courseContent?.map((section) => (
          // for each and every Section, there is  dropdown for creating subsection
          <details key={section._id} open>
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-richblack-50" />

                <p className="font-semibold text-richblack-50">
                  {section.sectionName}
                </p>
              </div>

              <div className="flex items-center gap-x-3">
                <button
                  onClick={() =>
                    handleChangeEditSectionName(
                      section._id,
                      section.sectionName
                    )
                  }
                >
                  <MdEdit className="text-xl text-richblack-300" />
                </button>

                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete this Section?",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleteSection(section._id),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                >
                  {/* oncicking this delete button a confirmation modal will open up which will ask whether you want to delete the section or not */}
                  <RiDeleteBin6Line className="text-xl text-richblack-300" />
                </button>

                {/* line separating */}
                <span className="font-medium text-richblack-300">|</span>

                {/* dropdown arrow */}
                <AiFillCaretDown className="text-xl text-richblack-300" />
              </div>
            </summary>

            {/* rendering all the subsections */}
            <div className="px-6 pb-4">
              {section.subSection.map((data) => {
                return (
                  <div
                    key={data?._id}
                    //jab kisi subsection pe click kiya toh view subSection vala modal aata hain
                    onClick={() => setViewSubSection(data)}
                    className="flex items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                  >
                    {/* section ka naam and icon */}
                    <div className="flex items-center gap-x-3 py-2">
                      <RxDropdownMenu className="text-2xl text-richblack-50" />
                      <p className="font-semibold text-richblack-50">
                        {data.title}
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-x-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* edit button */}
                      <button
                        //passed subSection ka data and section ki id in setEditSubSection
                        onClick={() =>
                          setEditSubSection({ ...data, sectionId: section._id })
                        }
                      >
                        <MdEdit className="text-xl text-richblack-300" />
                      </button>

                      <button
                        onClick={() =>
                          setConfirmationModal({
                            text1: "Delete this Sub Section",
                            text2: "Current Lecture will be deleted",
                            btn1Text: "Delete",
                            btn2Text: "Cancel",
                            btn1Handler: () =>
                              handleDeleteSubSection(data._id, section._id),
                            btn2Handler: () => setConfirmationModal(null),
                          })
                        }
                      >
                        <RiDeleteBin6Line className="text-xl text-richblack-300" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* for adding the lecture i.e. subSection  */}
              <button
                onClick={() => setAddSubSection(section._id)}
                className="mt-3 flex items-center gap-x-1 text-yellow-50"
              >
                <FaPlus className="text-lg" />
                <p>Add Lecture</p>
              </button>
            </div>
          </details>
        ))}
      </div>

      {/* subSectionModal display i.e. add, view, edit lecture modal */}
      {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      ) : viewSubSection ? (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : editSubSection ? (
        <SubSectionModal
          modalData={editSubSection}
          //setEditSubSection has data of subSection and sectionId
          setModalData={setEditSubSection}
          edit={true}
        />
      ) : (
        <></>
      )}

      {/* rendering the confirmationModal */}
      {confirmationModal ? (
        <ConfirmationModal modalData={confirmationModal} />
      ) : (
        <></>
      )}
    </>
  );
};

export default NestedView;
