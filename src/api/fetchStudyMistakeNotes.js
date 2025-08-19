// api/practice.js
import axios from "axios";

export async function fetchStudyMistakeNotes(token) {
  const res = await axios.get("http://localhost:8000/api/study-mistake-notes", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data.study_mistake_notes; 
}
