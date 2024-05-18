import React from "react";
import Footer from "../components/common/Footer";
import ContactDetails from "../components/ContactPage/ContactDetails";
import ContactForm from "../components/ContactPage/ContactForm";
import ReviewSlider from "../components/common/ReviewSlider";

const Contact = () => {
  return (
    <div>
      <div className="flex mx-auto mt-20 w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white lg:flex-row">
        {/* left part */}
        <div className="lg:w-[40%]">
          <ContactDetails />
        </div>

        {/* right part */}
        <div className="lg:w-[60%]">
          <ContactForm />
        </div>
      </div>

      {/* review slider  */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        <h1 className="text-white text-center text-4xl mt-8">
          Reviews from other learners
          {/* ReviewSlider */}
        </h1>
        <ReviewSlider />
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
