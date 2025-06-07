import axios from "axios"; 
import 'dotenv/config';


const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:5001";


export const checkParticipantsExist = async (participantIds, token) => {
  const checkResults = await Promise.allSettled(
    participantIds.map((id) =>
      axios
        .get(`${USER_SERVICE_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(function (err)  {  
          console.error(`Error checking user ${id}:`, err.message);
        })
    )
  );
  return !checkResults.some((r) => !r.value || r.value.status === 404);
};
