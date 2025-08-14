import React, { useEffect, useState } from 'react'
import DailyLifeVoca from './DailyLifeVoca'
import FooterBar from '../component/FooterBar'
import Basic from './Basic'
import DailyStep from './DailyStep'
import Info from '../component/Info'
import { useProgressStore } from '../store/useProgressStore'


const Main = () => {
    const { hydrate, loading, error, progress } = useProgressStore();

  const [selectedStep, setSelectedStep] = useState(null)

  const [selectedLabel, setSelectedLabel] = useState('');

  const handleStepSelect = (step, label) => {
    setSelectedStep(step);
    setSelectedLabel(label);
  };
  const infoContent = {
    basic: {
      category: 'Baic',
      detail: '기본 발화 학습',
    },
    daily: {
      category: 'Daily',
      detail: '생활 속 단어 학습',
    },
  }
// 로그인 후 최초 렌더링 시 한 번만 서버에서 불러와 스토어에 저장
  useEffect(() => {
    hydrate(); // 내부에서 자체적으로 중복 호출 방지(_hydratedFromServer)
  }, [hydrate]);

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className='relative w-full flex flex-col  h-screen '>



      <div className='flex flex-col flex-1 ] '>
        <div className="flex justify-center items-center mt-5">
          <Info category={infoContent.basic.category} step={selectedStep} detail={selectedLabel || infoContent.basic.detail} isButton={true}/>

        </div>

        <Basic onStepSelect={handleStepSelect} />

        <div className="flex items-center ">
          <div className="flex-grow border-t border-customLightGray"></div>
          
          <div className="flex-grow border-t border-customLightGray"></div>
        </div>



        <div className="flex justify-center items-center mt-5">
          <Info category={infoContent.daily.category} detail={infoContent.daily.detail} />

        </div>


         <div className='flex flex-col flex-1 pb-28'> 

      <DailyStep />
    </div>


      </div>

    </div>
  )
}

export default Main
