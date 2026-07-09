import axios from "axios";
// this code is for post all userdetails to the api server 


export const postUserDetails = async(userData: any) => {
  console.log("Before userData:",userData);
    try {
      const response = await axios.post(
        "https://infogreen.in/api/infogreen_app_user_details.php",
        userData,
        { timeout: 20000 },
      );
      console.log("response",response.data);
    return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("postUserDetails failed", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      } else {
        console.log("postUserDetails failed", error);
      }
      throw error;
    }
};

