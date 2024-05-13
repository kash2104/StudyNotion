import React from "react";
import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { catalogData } from "../apis";

export const getCatalogPageData = async (categoryId) => {
  const toastId = toast.loading("Loading...");

  let result = [];

  try {
    //getting the data of a particular category
    const response = await apiConnector(
      "POST",
      catalogData.CATALOGPAGEDATA_API,
      {
        categoryId: categoryId,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Could not fetch category fetch data");
    }

    result = response?.data;
  } catch (error) {
    console.log("CATALOG PAGE API ERROR....", error);
    toast.error(error.message);

    result = error.response?.data;
    console.log("CatalogPage result: ", result);
  }

  toast.dismiss(toastId);

  return result;
};
