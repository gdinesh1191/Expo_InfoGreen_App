import axios from "axios";

export const postLoadDetails = async (loadDetails: unknown[]) => {
  const response = await axios.post(
    "https://infogreen.in/api/infogreen_app_load_details.php",
    { loadDetails },
    { timeout: 20000 },
  );
  return response.data;
};
