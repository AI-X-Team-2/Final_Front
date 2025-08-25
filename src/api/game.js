import axios from "axios";
import { useAuthStore } from '../store/useAuthStore'; 



export async function createLeaderboardEntry(points) {
  const token = useAuthStore.getState()?.token;
  const res = await axios.post(
    "process.env.REACT_APP_API_URL/api/leaderboard/create",
    { points },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("createLeaderboardEntry response:", res.data);
  return res.data;
}

export async function fetchLeaderboard() {
  const token = useAuthStore.getState()?.token;
  const res = await axios.get(
    "process.env.REACT_APP_API_URL.141.230/api/leaderboard/leaderboard",
    {
      headers: {
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    }
  );
  console.log("랭킹 response:", res.data);
  return res.data; 
}