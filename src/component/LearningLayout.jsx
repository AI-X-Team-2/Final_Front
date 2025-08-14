import React from 'react'
import { Outlet } from 'react-router-dom'

const LearningLayout = () => {
  return (

<div className="bg-customGray w-full max-w-[50rem] min-w-0 h-screen mx-auto flex flex-col">
  <div className="flex-1 pt-72 overflow-y-auto min-w-0">
    <Outlet />
  </div>
</div>

  )
}

export default LearningLayout
