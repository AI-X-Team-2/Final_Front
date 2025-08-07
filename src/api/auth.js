import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // 백엔드 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (data) => {
  const res = await API.post('/login', data);
  return res.data;
};

export const signup = async (data) => {
  const res = await API.post('/signup', data);
  return res.data;
};