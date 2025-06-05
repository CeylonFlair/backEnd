import axios from "axios";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:5001";

export const getUserById = async (userId, token) => {
  console.log(`Fetching user info for ID: ${userId} from ${USER_SERVICE_URL}`);
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user info");
  }
};
