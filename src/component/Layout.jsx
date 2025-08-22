import React from 'react'
import { Outlet } from 'react-router-dom'
import FooterBar from './FooterBar'
const Layout = () => {
  return (
    <div className='bg-customGray w-[50rem] h-screen relative '>
      <div className='overflow-y-auto scrollbar-hide  max-h-screen'>
        <Outlet />


      </div>
      
      <FooterBar className="absolute bottom-0 left-0 right-0"/>

    </div>
  )
}

export default Layout
