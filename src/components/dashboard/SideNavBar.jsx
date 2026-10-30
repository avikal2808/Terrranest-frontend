import React, { useState } from 'react'

export default function SideNavBar() {
  const [activeItem, setActiveItem] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'map', label: 'Map View', icon: 'map' },
    { id: 'portfolio', label: 'Portfolio', icon: 'domain' },
    { id: 'reports', label: 'Reports', icon: 'analytics' }
  ]

  return (
    <nav className="bg-surface border-r border-outline-variant w-[240px] flex-shrink-0 flex-col py-margin-sm hidden md:flex">
      {/* Nav List */}
      <ul className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = activeItem === item.id
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveItem(item.id)}
                className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-all active:scale-95 ${
                  isActive
                    ? 'text-primary font-bold bg-surface-container-low'
                    : 'text-secondary hover:bg-surface-container-high'
                }`}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="font-body-md text-sm">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
