import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { setEditCourse } from "../../../../../slices/courseSlice";

const RequirementField = ({
  name,
  label,
  register,
  errors,
  setValue,
  getValues,
}) => {
  const [requirement, setRequirement] = useState("");
  const [requirementsList, setRequirementsList] = useState([]);

  const { course, editCourse } = useSelector((state) => state.course);

  const handleAddRequirement = () => {
    if (requirement) {
      //   console.log("list: ", ...requirementsList);
      setRequirementsList([...requirementsList, requirement]);
      setRequirement("");
      console.log("list: ", requirementsList);
    }
  };

  const handleRemoveRequirement = (index) => {
    const updatedRequirementList = [...requirementsList];
    updatedRequirementList.splice(index, 1);
    setRequirementsList(updatedRequirementList);
  };

  //will register on the first render
  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions);
    }
    register(name, { required: true, validate: (value) => value.length > 0 });
  }, []);

  //initially upar jitne bhi fields hai uski value set karke baithe hain. If they get updated, we have to register that as well
  useEffect(() => {
    setValue(name, requirementsList);
  }, [requirementsList]);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label}
        <sup className="text-pink-200">*</sup>
      </label>

      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          style={{ boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
          className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
        />

        <button
          onClick={handleAddRequirement}
          type="button"
          className="font-semibold text-yellow-50"
        >
          Add
        </button>
      </div>

      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-richblack-5">
              <span>{requirement}</span>

              <button
                onClick={() => handleRemoveRequirement(index)}
                className="text-xs text-pure-greys-300"
              >
                Clear
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
};

export default RequirementField;
