// src/component/FooterBar.jsx
import React from 'react'
import {
  HomeIcon,
  StarIcon,
  PencilIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { name: '단어', icon: HomeIcon,   path: '/main',    activePaths: ['/main'] },
  // ★ 게임: 랭킹으로 이동, 활성은 /ranking 과 /game 둘 다
  { name: '게임', icon: StarIcon,   path: '/ranking', activePaths: ['/ranking', '/game'] },
  { name: '연습', icon: PencilIcon, path: '/practice',activePaths: ['/practice'] },
  { name: '설정', icon: Cog6ToothIcon, path: '/settings', activePaths: ['/settings'] }
]

export default function FooterBar({ className = '' }) {
  const { pathname } = useLocation()
  const isActivePath = (paths) =>
    paths.some(p => pathname === p || pathname.startsWith(`${p}/`))

  return (
    <div className={`w-full h-20 bg-customBarGray ${className}`}>
      <hr className="w-full border-customLightGray border-t-4" />
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ name, icon: Icon, path, activePaths }) => {
          const isActive = isActivePath(activePaths)
          const colorClass = isActive ? 'text-white' : 'text-customLightGray'
          return (
            <Link to={path} key={name} className="select-none">
              <div className="flex flex-col items-center">
                <Icon className={`w-8 h-8 ${colorClass} transition-colors duration-200 ease-in-out`} />
                <span className={`text-base mt-1 font-semibold ${colorClass}`}>{name}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
