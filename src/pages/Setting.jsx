import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import MainButton from '../component/MainButton';
const Setting = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['userInfo'],
        queryFn: getUserInfo,
    });



    const handleLogout = () => {
        logout(); // Zustand 상태 초기화
        localStorage.removeItem('auth-storage'); // persist 저장된 토큰 제거
        navigate('/'); // 로그인 페이지로 이동
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div>유저 정보를 불러오지 못했습니다.</div>;
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <h2>사용자 설정</h2>
            <h3>아이디: {data?.username}</h3>
            <h3>이메일: {data?.email}</h3>

            <div className="mt-6">
                <MainButton
                    label="로그아웃"
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600"
                />
            </div>
        </div>
    );

}

export default Setting
