// load the script

import toast from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

//open razorPay modal need to create option object

//if option object success, uske andar jo bhi funciton likha hoga voh execute

//if payment success, then send the mail

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

//1. loading the script
function loadScript(src) {
  //if success, the code will run
  //returns a promise-> either resolve or reject
  return new Promise((resolve) => {
    const script = document.createElement("script");

    script.src = src;

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };

    //doc ke andar script ko attach kar diya
    document.body.appendChild(script);
  });
}

//2. buying the course
export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...");

  try {
    //loading the script
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("RazorPay SDK failed to load");
      return;
    }

    //initialise the order -> done using capturePayment
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!orderResponse?.data?.success) {
      throw new Error(orderResponse.data.message);
    }

    //creating the options
    const options = {
      key: process.env.RAZORPAY_KEY,
      currency: orderResponse.data.data.currency,
      amount: `${orderResponse.data.data.amount}`,
      order_id: orderResponse.data.data.id,
      name: "StudyNotion",
      description: "Thank You for purchasing the course",
      image: rzpLogo,
      prefill: {
        name: `${userDetails.firstName}`,
        email: userDetails.email,
      },
      handler: function (response) {
        //send the successfull mail
        sendPaymmentSuccessEmail(
          response,
          orderResponse.data.data.amount,
          token
        );

        //verify the payment
        verifyPayment({ ...response, courses }, token, navigate, dispatch);
      },
    };
  } catch (error) {
    console.log("PAYMENT API ERROR...", error);
    toast.error("Could not make the payment");
  }

  toast.dismiss(toastId);
}

async function sendPaymmentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,

        paymentId: response.razorpay_payment_id,

        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL API ERROR...", error);
  }
}

//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifyig Payment...");
  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment Successfull. Your are added to the course");

    navigate("/dashboard/enrolled-courses");

    dispatch(resetCart());
  } catch (error) {
    console.log("Payment Verify error...", error);

    toast.error("Could not verfiy the payment");
  }

  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}
