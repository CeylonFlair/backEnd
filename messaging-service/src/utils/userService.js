import axios from "axios"; 
import 'dotenv/config';

export const checkParticipantsExist = async (participantIds, token) => {
  const checkResults = await Promise.allSettled(
    participantIds.map((id) =>
      axios
        .get(`${process.env.USER_SERVICE_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(function (err)  {  
          console.error(`Error checking user ${id}:`, err.message);
        })
    )
  );
  return !checkResults.some((r) => !r.value || r.value.status === 404);
};
