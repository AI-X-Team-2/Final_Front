import React from 'react'
import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
const Info = ({ category, step, detail, isButton }) => {
    const navigate = useNavigate();

    return (
        <div className='w-[30rem] h-[8rem] bg-custom-blue-gradient flex  justify-between items-center rouded rounded-2xl  '>
            <div className='flex-col  '>
                 <div className='ml-5 font-semibold text-white text-lg'>
                <p> {category}
                    {step && ` - Step ${step}`}</p>

            </div>
            <div className='ml-5 font-extrabold text-white text-xl text-shadow-lg'>
                <p>{detail}</p>
            </div>

            </div>
           

            {step && isButton && (
                <div className='flex justify-center items-center mr-5'>
                    <div className="w-px h-10 bg-white mx-4"></div>


                    <ChevronDoubleRightIcon className="w-8 h-8 text-white" onClick={() => navigate(`/basic/step/${step}`)} />

                </div>


            )

            }


        </div>

    )
}

export default Info
