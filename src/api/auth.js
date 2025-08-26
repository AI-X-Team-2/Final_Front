import axios from 'axios';

const API = axios.create({
  baseURL: '', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (data) => {
  const res = await API.post('/api/users/login', data);
  return res.data;
};

export const signup = async (data) => {
  const res = await API.post('/api/users/signup', data);
  return res.data;
};

export const getUserInfo = async () => {
  const token = localStorage.getItem('auth-storage')
    ? JSON.parse(localStorage.getItem('auth-storage')).state.token
    : null;

  if (!token) throw new Error('토큰이 없습니다.');

  const res = await API.get('/api/progress/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};