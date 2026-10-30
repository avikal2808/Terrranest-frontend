import React from 'react'

export default function MapView({ properties, selectedPropertyId, onSelectProperty }) {
  // Format price for the map bubble in Indian numbering (Cr/L)
  const formatMapPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString('en-IN')}`
  }

  return (
    <div className="w-full lg:w-[70%] h-[50vh] lg:h-full relative border-b lg:border-b-0 lg:border-r border-outline-variant bg-surface-container">
      {/* Map Background image - Centered on Delhi Grid */}
      <div className="absolute inset-0 bg-surface-container overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center opacity-40" 
          style={{ 
            backgroundImage: "url('https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern+minimalistic+city+map+grid+of+New+Delhi+India+cartographic+style+clean+lines+emerald+and+white+theme&image_size=landscape_16_9')" 
          }}
        ></div>
        {/* Abstract grids overlays to look high-tech/cartographic */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,108,73,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,108,73,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button className="bg-surface-container-lowest border border-outline-variant p-2 rounded-lg shadow-sm hover:bg-surface-container-low transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="bg-surface-container-lowest border border-outline-variant p-2 rounded-lg shadow-sm hover:bg-surface-container-low transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button className="bg-surface-container-lowest border border-outline-variant p-2 rounded-lg shadow-sm hover:bg-surface-container-low transition-colors mt-2 text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>

      {/* Dynamic Map Pins */}
      {properties.map((property) => {
        const isSelected = selectedPropertyId === property.id
        const formattedPrice = formatMapPrice(property.price)
        
        return (
          <div 
            key={property.id}
            onClick={() => onSelectProperty(property.id)}
            style={{ 
              top: property.latOffset, 
              left: property.lngOffset 
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10 active:scale-95 transition-transform"
          >
            {/* Price Tag Bubble */}
            <div 
              className={`font-data-mono text-xs px-2 py-1 rounded shadow-md font-semibold whitespace-nowrap transition-colors duration-200 ${
                isSelected 
                  ? 'bg-inverse-surface text-on-error font-bold ring-2 ring-primary-container' 
                  : 'bg-primary text-on-primary group-hover:bg-primary-container group-hover:text-on-primary-container'
              }`}
            >
              {formattedPrice}
            </div>
            
            {/* Pointer triangle */}
            <div 
              className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] transition-colors duration-200 ${
                isSelected ? 'border-t-inverse-surface' : 'border-t-primary group-hover:border-t-primary-container'
              }`}
            ></div>
            
            {/* Center dot */}
            <div 
              className={`w-3 h-3 rounded-full border-2 border-surface-container-lowest shadow-sm mt-[-2px] transition-colors duration-200 ${
                isSelected ? 'bg-inverse-surface scale-125' : 'bg-primary group-hover:bg-primary-container'
              }`}
            ></div>
          </div>
        )
      })}
    </div>
  )
}
