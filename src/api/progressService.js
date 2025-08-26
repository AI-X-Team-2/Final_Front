// api/progressService.js
import axios from 'axios';

export async function fetchMyProgress(token) {
  try {
    const res = await axios.get(
      `http://15.165.141.230/api/progress/me`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return res.data; // axios는 응답 본문이 res.data
  } catch (err) {
    const status = err.response?.status ?? 'ERR';
    const msg = err.response?.data?.message || err.message || 'Unknown error';
    throw new Error(`(${status}) 진행도 조회 실패: ${msg}`);
  }
}
