import React from 'react'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className='bg-white w-[50rem] min-h-screen'>
      <Outlet />
    </div>
  )
}

export default Layout
