import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import MainButton from '../component/MainButton';
import { useAuthStore } from '../store/useAuthSotre'; 
import Modal from 'react-modal';



const Login = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', isSuccess: false });

  const navigate = useNavigate();
 const setToken = useAuthStore((state) => state.setToken);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { mutate} = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
     
      setToken(data.access.token);
      setModalContent({ title: '로그인 성공', message: '환영합니다!', isSuccess: true });
      setModalIsOpen(true); 
     
    },
    onError: (err) => {
      setModalContent({
        title: '로그인 실패',
        message: err?.response?.data?.message || '아이디 또는 비밀번호가 일치하지 않습니다.',
        isSuccess: false,
      });
      setModalIsOpen(true);
      
      console.log(err.response?.data?.message)
      navigate('/');
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  
  const closeModal = () => {
    setModalIsOpen(false);
    if (modalContent.isSuccess) {
      navigate('/main');
    }
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-custom-blue-gradient rounded-lg shadow-lg p-6 max-w-sm mx-auto mt-40 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2
          className={`text-lg font-bold mb-4 
          text-white`}
        >
          {modalContent.title}
        </h2>
        <p className="mb-6 text-white">{modalContent.message}</p>
        <button
          onClick={closeModal}
          className="w-full py-2  rounded bg-white text-custom_blue"
        >
          확인
        </button>
      </Modal>
    </div>
  );
};

export default Login;
