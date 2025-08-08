import React from 'react'
import { Outlet } from 'react-router-dom'

const LoginRegisterLayout = () => {
    return (
        <div className="bg-customGray w-full max-w-[50rem] h-screen mx-auto flex flex-col">
          
            <div className="flex-1 overflow-y-auto pt-72 ">
                <Outlet />
            </div>
        </div>
    )
}

export default LoginRegisterLayout
