import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiConnector } from "../../services/apiconnector";
import { contactusEndpoint } from "../../services/apis";
import CountryCode from "../../data/countrycode.json";

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const submitContactForm = async (data) => {
    console.log("contactUs data: ", data);

    try {
      setLoading(true);

      // const response = await apiConnector('POST', contactusEndpoint.CONTACT_US_API, data);

      const response = { status: "OK" };

      console.log("contactUs response: ", response);

      setLoading(false);
    } catch (error) {
      console.log("Error while contacting", error.message);

      setLoading(false);
    }
  };

  //once the form is submitted successfully, reset the entire form. In the dependency we have added reset bcz we want to reset every field inside the form i.e. on selecting some option the form may change so we want to reset that changed form also.
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        message: "",
        phoneNo: "",
      });
    }
  }, [reset, isSubmitSuccessful]);
  return (
    <form
      onSubmit={handleSubmit(submitContactForm)}
      className="flex flex-col gap-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* firstname */}
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="firstname" className="lable-style">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Enter first name"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
            //is state ko register kar diya.StateName = firstname, validation = true
            {...register("firstname", { required: true })}
          />
          {/* error handling for stateName = firstname */}
          {errors.firstname && (
            <span className="-mt-1 text-[12px] text-yellow-100">
              Please enter your name
            </span>
          )}
        </div>

        {/* lastname */}
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="lastname" className="lable-style">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Enter last name"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
            //is state ko register kar diya.StateName = firstname, validation = true
            {...register("lastname")}
          />
        </div>
      </div>
      {/* email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="label-style">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter email address"
          style={{ boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
          className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
          {...register("email", { required: true })}
        />
        {/* error handling for email */}
        {errors.email && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            Please enter your email
          </span>
        )}
      </div>

      {/* phone number */}
      <div className="flex flex-col gap-2">
        <label htmlFor="phonenumber" className="label-style">
          Phone Number
        </label>

        {/* dropdown and phoneNumber */}
        <div className="flex flex-row gap-5">
          {/* dropdown */}
          <div className="w-[100px]">
            <select
              name="dropdown"
              id="dropdown"
              {...register("countrycode", { required: true })}
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
            >
              {CountryCode.map((element, index) => {
                return (
                  <option key={index} value={element.code}>
                    {element.code} {element.country}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-[calc(100%-110px)]">
            <input
              type="tel"
              name="phonenumber"
              id="phonenumber"
              placeholder="12345 6789"
              {...register("phoneNo", {
                required: {
                  value: true,
                  message: "Please enter your mobile number",
                },
                //setting the max and min length of the phoneNumber. if it is not according to that, then the message given will be displayed.
                maxLength: {
                  value: 10,
                  message: "Invalid phone number",
                },
                minLength: {
                  value: 8,
                  message: "Invalid phone number",
                },
              })}
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
            />
          </div>
        </div>
        {/* error handling */}
        {errors.phoneNo && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            {/* upar jo message specify kiya hain voh */}
            {errors.phoneNo.message}
          </span>
        )}
      </div>

      {/* message box */}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="lable-style">
          Message
        </label>

        <textarea
          name="message"
          id="message"
          cols="30"
          row="7"
          placeholder="Enter your message here"
          style={{ boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
          className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
          {...register("message", { required: true })}
        />
        {/* error handling for message */}
        {errors.message && (
          <span className="-mt-1 text-12px text-yellow-100">
            Please enter your message
          </span>
        )}
      </div>

      {/* submit button */}
      <button
        type="submit"
        className={`rounded-md bg-yellow-50 px-6 py-3 text-center text-[16px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)]`}
      >
        Send Message
      </button>
    </form>
  );
};

export default ContactUsForm;
