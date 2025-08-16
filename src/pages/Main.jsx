import React, { useEffect } from 'react'

import DailyStep from './DailyStep'
import Info from '../component/Info'
import { useProgressStore } from '../store/useProgressStore'


const Main = () => {
    const { hydrate, loading, error } = useProgressStore();


  const infoContent = {
   
    daily: {
      category: 'Daily',
      detail: '생활 속 단어 학습',
    },
  }

  useEffect(() => {
    hydrate(); 
  }, [hydrate]);

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className='relative w-full flex flex-col  h-screen '>



      <div className='flex flex-col flex-1 ] '>



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
