import React, { useEffect, useState } from 'react';
import StageButton from "../component/StageButton";
import { useParams, useNavigate } from "react-router-dom";
import useProgressStore from '../store/useProgressStore';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Info from '../component/Info';
const BasicStep1 = () => {
    const { step } = useParams();
    const [stages, setStages] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);

    const progress = useProgressStore((state) => state.progress);
    const navigate = useNavigate();
    const stepLabels = [
        "양순음 + 쉬운 모음",
        "치조음 + 기본모음 중모음",
        "경구개음 + 중간~복합 모음",
        "연구개음 + 복합모음",
        "후음 + 복합모음",
    ];

    const stageDetails = {
        1: {
            1: "ㅂ + 쉬운 모음",
            2: "ㅍ + 쉬운 모음",
            3: "ㅁ + 쉬운 모음",
        },
        2: {
            1: "ㄷ + 기본모음 중모음",
            2: "ㄴ + 기본모음 중모음",
            3: "ㄹ + 기본모음 중모음",
            4: "ㅅ + 기본모음 중모음",
        },
        3: {
            1: "ㅈ + 중간~복합 모음",
            2: "ㅉ + 중간~복합 모음",
            3: "ㅊ + 중간~복합 모음",
        },
        4: {
            1: "ㄱ + 연구개음 + 복합모음",
            2: "ㅋ + 연구개음 + 복합모음",
            3: "ㅇ + 연구개음 + 복합모음",
        },
        5: {
            1: "ㅎ + 복합모음1",
            2: "ㅎ + 복합모음2",
        },
    };



    useEffect(() => {
        setStages(getStages(step));
    }, [step]);

    const getStages = (step) => {
        switch (step) {
            case "1": return ["1", "2", "3"];
            case "2": return ["1", "2", "3", "4"];
            case "3": return ["1", "2", "3"];
            case "4": return ["1", "2", "3"];
            case "5": return ["1", "2"];
            default: return [];
        }
    };

    const handleClick = (stageNum) => {
        setSelectedStage(stageNum);
        setShowPopup(true);
    };

    const handleConfirm = () => {
        setShowPopup(false);
        navigate(`/basic/step/${step}/${selectedStage}`);
    };

    return (
        <div className='flex flex-col h-screen gap-10 mt-5'>
            <div className="flex justify-center items-center">
                <Info category={"Basic"} step={step} detail={stepLabels[step - 1]} isButton={false} />

            </div>

            {stages.map((stage) => {
                const stepNum = Number(step);
                const stageNum = Number(stage);
                const isOpened = progress.basic[stepNum]?.opened?.includes(stageNum);
                const alignmentClass = stageNum % 2 === 1 ? 'justify-start pl-60' : 'justify-end pr-60';
                const fullLabel = stageDetails[stepNum]?.[stageNum] || "";
                const consonant = fullLabel.split(" ")[0];

                return (
                    <div key={stage} className={`flex w-full ${alignmentClass}`}>
                        <StageButton
                            step={`${step}-${stage}`}
                            status={isOpened ? "opened" : "locked"}
                            onClick={() => isOpened && handleClick(stageNum)}
                            isStage={consonant}
                        />
                    </div>
                );
            })}


            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="flex flex-col rounded-lg p-6 shadow-lg w-[30rem] bg-custom_blue"

                    >

                        <div className="flex justify-end">
                            <XMarkIcon
                                className="w-5 h-5 text-black cursor-pointer"
                                onClick={() => setShowPopup(false)}
                            />
                        </div>
                        <p className="mb-4 font-extrabold text-lg text-white text-shadow-lg">{stageDetails[step]?.[selectedStage]}</p>

                        <p className="mb-4 font-semibold text-base text-white">진행률</p>
                        <div className="flex justify-end gap-3">

                            <button
                                className="px-4 py-2  rounded-md bg-white text-custom_blue w-[30rem] font-bold"
                                onClick={handleConfirm}
                            >
                                학습 시작
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BasicStep1;
