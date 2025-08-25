// api/practice.js
import axios from "axios";

export async function fetchStudyReviews(token) {
  const res = await axios.get("https://youum.kro.kr/api/reviews", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log("fetchStudyReviews response:", res.data);
  return res.data
}
