import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { signup } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import MainButton from '../component/MainButton';
import Modal from 'react-modal';


const Register = () => {
  const navigate = useNavigate();

   const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    isSuccess: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const { mutate } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
       setModalContent({
        title: '회원가입 성공',
        message: '환영합니다! 이제 로그인해 주세요.',
        isSuccess: true,
      });
       setModalIsOpen(true);        
     
    },
    onError: (err) => {
      setModalContent({
        title: '회원가입 실패',
        message: '회원가입에 실패했습니다',
        isSuccess: false,
      });
      setModalIsOpen(true);
      console.log('회원가입 실패: ' + err.response?.data?.message || '서버 오류');
    },
  });

  
  const closeModal = () => {
    setModalIsOpen(false);
    if (modalContent.isSuccess) {
      navigate('/');
    }
  };

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-white">
      <h2 className="text-center text-xl font-bold mb-6">회원가입</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col items-center">

        {/* 아이디 */}
        <div>
          <label className="block text-sm mb-1">아이디</label>
          <input
            {...register('username', {
              required: '아이디를 입력해 주세요',
              pattern: {
                value: /^[^\s]{3,8}$/, // 공백 없이 3~8자
                message: '아이디는 공백 없이 3~8자여야 합니다',
              },
            })}
            className="w-96 p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="아이디를 입력해 주세요"
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm mb-1">비밀번호</label>
          <input
            type="password"
            {...register('password', {
              required: '비밀번호를 입력해 주세요',
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|]).{6,12}$/,
                message: '비밀번호는 6~12자, 대문자 및 특수문자 포함해야 합니다',
              },
            })}
            className="w-96 p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="비밀번호를 입력해 주세요"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="block text-sm mb-1">비밀번호 확인</label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: '비밀번호 확인을 입력해 주세요',
              validate: (value) => value === password || '비밀번호가 일치하지 않습니다',
            })}
            className="w-96 p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="비밀번호를 다시 입력해 주세요"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm mb-1">이메일</label>
          <input
            type="email"
            {...register('email', {
              required: '이메일을 입력해 주세요',
              pattern: {
                value: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/, // .은 @ 뒤에 오도록
                message: '올바른 이메일 형식이 아닙니다',
              },
            })}
            className="w-96 p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="이메일을 입력해 주세요"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <MainButton label="회원가입" type="submit" />
      </form>

      <div className="text-center mt-4">
        <button onClick={() => navigate('/')} className="text-sm text-white underline">
          로그인
        </button>
      </div>

        {/* 모달 */}
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

export default Register;
