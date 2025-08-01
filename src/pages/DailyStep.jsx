import React from 'react'
import StageButton from '../component/StageButton'
import { Link } from 'react-router-dom'

const DailyStep = () => {
    return (
        <div className='flex flex-col justify-center items-center h-screen gap-10'>
            <Link to="/daily/step/1"><StageButton step={1} status={"current"} ></StageButton></Link>

            <Link to="/daily/step/2"><StageButton step={2} status={"current"} ></StageButton></Link>

            <Link to="/daily/step/3"><StageButton step={3} status={"current"} ></StageButton></Link>

        </div>
    )
}

export default DailyStep
