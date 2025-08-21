// api/practice.js
import axios from "axios";

export async function fetchStudyReviews(token) {
  const res = await axios.get("http://localhost:8000/api/reviews", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data
}
