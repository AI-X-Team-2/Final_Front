import React, { useState } from 'react'
import StageButton from '../component/StageButton'

import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/solid';
const DailyStep = ({ opened }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);
    const navigate = useNavigate();

    const handleClick = (stageNum) => {
        if (!opened.includes(stageNum)) return; // 잠긴 스테이지 클릭 무시 또는 팝업 띄워도 됨
        setSelectedStage(stageNum);
        setShowPopup(true);
    };

    const handleConfirm = () => {
        setShowPopup(false);
        navigate(`/daily/step/${selectedStage}`);
    };


    return (
        <>
            <div className='flex flex-col justify-center items-center gap-10 mt-20'>
                {[1, 2].map((step) => (
                    <div key={step} className={`flex w-full cursor-pointer ${step % 2 === 1 ? 'justify-start pl-60' : 'justify-end pr-60'}`} onClick={() => handleClick(step)}>
                        <StageButton step={step} status={opened.includes(step) ? "opened" : "locked"} />

                    </div>
                ))}
            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="flex flex-col rounded-lg p-6 shadow-lg w-[30rem] bg-custom_blue">
                        <div className="flex justify-end">
                            <XMarkIcon
                                className="w-5 h-5 text-black cursor-pointer"
                                onClick={() => setShowPopup(false)}
                            />

                        </div>
                        <p className="font-extrabold text-lg text-white text-shadow-lg">DAILY - {selectedStage} STAGE {selectedStage === 1
                            ? "쉬운 단어"
                            : selectedStage === 2
                                ? "심화 단어"
                                : ""}</p>


                        <p className="mb-4 font-semibold text-base text-white">진행률</p>




                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-md bg-white text-custom_blue w-full font-bold"
                                onClick={handleConfirm}
                            >
                                학습 시작
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DailyStep
