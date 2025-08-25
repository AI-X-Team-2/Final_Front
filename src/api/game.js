import axios from "axios";
import { useAuthStore } from '../store/useAuthStore'; 


const token = useAuthStore.getState()?.token;
console.log(token)
export async function createLeaderboardEntry(points) {
  const res = await axios.post(
    "http://15.165.141.230/api/leaderboard/create",
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

  const res = await axios.get(
    "http://localhost:8000/api/leaderboard/leaderboard",
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