import React from 'react'
import { Outlet } from 'react-router-dom'

const LoginRegisterLayout = () => {
  return (
    <div className='bg-customGray w-[50rem] h-screen relative'>
      
        <Outlet />


   
      
   

    </div>
  )
}

export default LoginRegisterLayout
