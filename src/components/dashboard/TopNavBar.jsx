import React, { useState } from 'react'

export default function TopNavBar({ user, onSearch, onFilterChange, onAnalyze, onLogout }) {
  const [searchVal, setSearchVal] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  
  // Custom Filters Options
  const filters = {
    propertyType: ['All', 'Commercial', 'Multi-Fam', 'Office', 'Retail'],
    bhkConfig: ['Any BHK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'],
    metroDistance: ['Any Distance', '< 500m', '< 1km', '< 2km'],
    gentrification: ['Any Potential', 'High', 'Medium', 'Low']
  }

  const [selectedFilters, setSelectedFilters] = useState({
    propertyType: 'All',
    bhkConfig: 'Any BHK',
    metroDistance: 'Any Distance',
    gentrification: 'Any Potential'
  })

  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(name)
    }
  }

  const selectFilterOption = (filterKey, value) => {
    const updated = { ...selectedFilters, [filterKey]: value }
    setSelectedFilters(updated)
    setActiveDropdown(null)
    if (onFilterChange) {
      onFilterChange(updated)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchVal)
    }
  }

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value)
    if (onSearch) {
      onSearch(e.target.value)
    }
  }

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 w-full z-50 flex flex-col px-margin-sm md:px-margin-md h-auto shadow-none py-3 gap-3">
      <div className="flex items-center justify-between w-full h-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              real_estate_agent
            </span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary">TerraNest</span>
        </div>
        
        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
          <div className="relative flex items-center w-full h-10 rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary border border-outline-variant overflow-hidden">
            <div className="grid place-items-center h-full w-12 text-secondary">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="peer h-full w-full outline-none text-sm text-on-surface bg-transparent pr-2 focus:ring-0 border-none placeholder-secondary/50" 
              id="search" 
              placeholder="Search properties, locations, or IDs..." 
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
            />
          </div>
        </form>

        {/* Header Utilities */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant cursor-pointer active:opacity-80 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-container rounded-full"></span>
          </button>
          
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant cursor-pointer active:opacity-80">
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          {/* User Profile / Logout Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('profile')}
              className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer flex items-center justify-center active:scale-95 transition-transform"
            >
              <img 
                alt="User profile avatar" 
                className="h-full w-full object-cover" 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
              />
            </button>
            {activeDropdown === 'profile' && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-surface-container">
                  <p className="text-xs text-secondary font-label-md uppercase">Signed in as</p>
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {user?.email || 'Unknown user'}
                  </p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/20 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between w-full gap-4 pt-1">
        <div className="flex items-center gap-3">
          {/* Property Type Dropdown */}
          <div className="relative">
            <div 
              onClick={() => toggleDropdown('propertyType')}
              className="relative flex items-center px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <span className="text-body-md text-on-surface-variant mr-2">
                Type: {selectedFilters.propertyType}
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">expand_more</span>
            </div>
            {activeDropdown === 'propertyType' && (
              <ul className="absolute left-0 mt-1 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl py-1 z-50">
                {filters.propertyType.map(opt => (
                  <li 
                    key={opt}
                    onClick={() => selectFilterOption('propertyType', opt)}
                    className="px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* BHK Config Dropdown */}
          <div className="relative">
            <div 
              onClick={() => toggleDropdown('bhkConfig')}
              className="relative flex items-center px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <span className="text-body-md text-on-surface-variant mr-2">
                {selectedFilters.bhkConfig}
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">expand_more</span>
            </div>
            {activeDropdown === 'bhkConfig' && (
              <ul className="absolute left-0 mt-1 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl py-1 z-50">
                {filters.bhkConfig.map(opt => (
                  <li 
                    key={opt}
                    onClick={() => selectFilterOption('bhkConfig', opt)}
                    className="px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Max Distance to DMRC Metro */}
          <div className="relative">
            <div 
              onClick={() => toggleDropdown('metroDistance')}
              className="relative flex items-center px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <span className="text-body-md text-on-surface-variant mr-2">
                Metro: {selectedFilters.metroDistance}
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">expand_more</span>
            </div>
            {activeDropdown === 'metroDistance' && (
              <ul className="absolute left-0 mt-1.5 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl py-1 z-50">
                {filters.metroDistance.map(opt => (
                  <li 
                    key={opt}
                    onClick={() => selectFilterOption('metroDistance', opt)}
                    className="px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Gentrification Potential */}
          <div className="relative">
            <div 
              onClick={() => toggleDropdown('gentrification')}
              className="relative flex items-center px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <span className="text-body-md text-on-surface-variant mr-2">
                Gentrification: {selectedFilters.gentrification}
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">expand_more</span>
            </div>
            {activeDropdown === 'gentrification' && (
              <ul className="absolute left-0 mt-1.5 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl py-1 z-50">
                {filters.gentrification.map(opt => (
                  <li 
                    key={opt}
                    onClick={() => selectFilterOption('gentrification', opt)}
                    className="px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <button 
          onClick={onAnalyze}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md font-bold hover:bg-[#005a3c] transition-colors active:scale-95 duration-150"
        >
          Analyze
        </button>
      </div>
    </header>
  )
}
