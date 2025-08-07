import React from 'react'
import { Outlet } from 'react-router-dom'
import FooterBar from './FooterBar'
const Layout = () => {
  return (
    <div className='bg-customGray w-[50rem] h-screen relative'>
      <div className='overflow-y-auto scrollbar-hide pb-20 max-h-screen'>
        <Outlet />


      </div>
      
      <FooterBar className="fixed bottom-0 left-0 w-[50rem]"/>

    </div>
  )
}

export default Layout
