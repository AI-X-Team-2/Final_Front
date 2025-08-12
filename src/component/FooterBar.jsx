import React from 'react'
import {
  HomeIcon,
  StarIcon,
  PencilIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid'
import { Link , useLocation } from 'react-router-dom'


const navItems = [
  { name: '단어', icon: HomeIcon, path: '/main' },
  { name: '게임', icon: StarIcon, path: '/game' },
  { name: '연습', icon: PencilIcon, path: '/practice' },
  { name: '설정', icon: Cog6ToothIcon, path: '/settings' }
]


const FooterBar = () => {
  const location = useLocation();

  return (
    <div className='w-[50rem] h-20  fixed bottom-0 bg-customBarGray'>
      <hr className='w-full border-customLightGray border-t-4'/>
    
      
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ name, icon: Icon, path }) => {
          const isActive = location.pathname === path
          const colorClass = isActive ? 'text-white' : 'text-customLightGray'

          return (
            <Link to={path} key={name}>
            <div className="flex flex-col items-center">
              <Icon className={`w-8 h-8 ${colorClass} transition-colors duration-200 ease-in-out` } />
              <span className={`text-base mt-1 font-semibold ${colorClass}`}>
                {name}
              </span>
            </div>
            </Link>
            
          )
        })}
      </div>
    </div>
  )
}

export default FooterBar
