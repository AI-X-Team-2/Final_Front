import React, { useState } from 'react'
import DailyLifeVoca from './DailyLifeVoca'
import FooterBar from '../component/FooterBar'
import Basic from './Basic'
import DailyStep from './DailyStep'
import useProgressStore from '../store/useProgressStore'
import Info from '../component/Info'

const Main = () => {
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
  const progress = useProgressStore((state) => state.progress);
  console.log(progress);


  return (
    <div className='relative w-full flex flex-col  h-screen '>



      <div className='flex flex-col flex-1 ] '>
        <div className="flex justify-center items-center mt-5">
          <Info category={infoContent.basic.category} step={selectedStep} detail={selectedLabel || infoContent.basic.detail} isButton={true}/>

        </div>

        <Basic opened={progress.basic.opened} onStepSelect={handleStepSelect} />

        <div className="flex items-center ">
          <div className="flex-grow border-t border-customLightGray"></div>
          
          <div className="flex-grow border-t border-customLightGray"></div>
        </div>



        <div className="flex justify-center items-center mt-5">
          <Info category={infoContent.daily.category} detail={infoContent.daily.detail} />

        </div>


         <div className='flex flex-col flex-1 pb-28'> 

      <DailyStep opened={progress.daily.opened} />
    </div>


      </div>

    </div>
  )
}

export default Main
