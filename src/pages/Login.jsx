import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import MainButton from '../component/MainButton';

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { mutate } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      alert('로그인 성공');
      // localStorage.setItem('token', data.token);
      // navigate('/home');
    },
    onError: (err) => {
      if (err.response?.status === 401) {
        alert(err.response?.data?.message || err.response?.data?.detail || '아이디 또는 비밀번호가 잘못되었습니다.');
      } else {
        alert('로그인 실패: ' + (err.response?.data?.message || '서버 오류'));
      }
      navigate('/');
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <h2 className="text-center text-xl font-bold mb-6 text-white">로그인</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col items-center justify-center">
        {/* 아이디 */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 text-white">아이디</label>
          <input
            type="text"
            {...register('username', {
              required: '아이디를 입력해 주세요',
            })}
            placeholder="아이디를 입력해 주세요"
            className="w-96 p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 text-white">비밀번호</label>
          <input
            type="password"
            {...register('password', {
              required: '비밀번호를 입력해 주세요',
            })}
            placeholder="비밀번호를 입력해 주세요"
            className="w-96 p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <MainButton label="로그인" type="submit" />
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => navigate('/register')}
          className="text-sm text-white underline"
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Login;
