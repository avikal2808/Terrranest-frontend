import React from 'react'

export default function MapView({ properties = [], selectedPropertyId, onSelectProperty }) {
  // Format price for the map bubble in Indian numbering (Cr/L)
  const formatMapPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString('en-IN')}`
  }

  // Local Delhi map image served from the public folder
  const mapImageUrl = '/delhi-map.jpg';

  return (
    <div className="w-full lg:w-[70%] h-[50vh] lg:h-full relative border-b lg:border-b-0 lg:border-r border-outline-variant bg-surface-container overflow-hidden">
      {/* Static Map Background */}
      <div className="absolute inset-0 w-full h-full bg-surface-container-low">
        <img 
          src={mapImageUrl} 
          alt="Delhi Map View" 
          className="w-full h-full object-cover"
        />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)]"></div>
      </div>

      {/* High-tech Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(0,108,73,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,108,73,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Property Markers Overlay */}
      <div className="absolute inset-0 z-20">
        {properties.map((property) => {
          // These offsets are calculated in api.js:withMapOffsets
          if (!property.latOffset || !property.lngOffset) return null;
          
          const isSelected = selectedPropertyId === property.id;
          const formattedPrice = formatMapPrice(property.price);

          return (
            <div
              key={property.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectProperty(property.id);
              }}
              style={{
                top: property.latOffset,
                left: property.lngOffset,
                transform: 'translate(-50%, -100%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 ${isSelected ? 'z-50' : 'z-20 hover:z-40'}`}
            >
              <div className="flex flex-col items-center group">
                <div className={`font-data-mono text-[10px] px-2 py-1 rounded shadow-xl font-bold whitespace-nowrap transition-all duration-200 
                  ${isSelected 
                    ? 'bg-inverse-surface text-on-error ring-2 ring-primary scale-110 shadow-primary/20' 
                    : 'bg-primary text-on-primary group-hover:bg-primary-container group-hover:text-on-primary-container shadow-md'}`}>
                  {formattedPrice}
                </div>
                
                {/* Marker Pin Point */}
                <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] transition-colors
                  ${isSelected ? 'border-t-inverse-surface' : 'border-t-primary group-hover:border-t-primary-container'}`}>
                </div>
                
                {/* Location Dot */}
                <div className={`w-2 h-2 rounded-full mt-[-4px] transition-all duration-300 ${
                  isSelected 
                    ? 'bg-primary ring-4 ring-primary/20 animate-pulse' 
                    : 'bg-primary/40 group-hover:bg-primary/60'
                }`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mock Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant rounded-lg p-1 shadow-md flex flex-col">
          <button className="p-2 hover:bg-surface-container-low text-secondary transition-colors rounded-md">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <div className="h-[1px] bg-outline-variant mx-1"></div>
          <button className="p-2 hover:bg-surface-container-low text-secondary transition-colors rounded-md">
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
        </div>
        <button className="bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant rounded-lg p-2 shadow-md text-secondary hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>

      {/* Coordinate Legend */}
      <div className="absolute bottom-4 left-4 z-30 bg-surface-container-lowest/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant text-[10px] font-data-mono text-secondary flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-primary/60">LAT:</span> 28.6139° N
        </div>
        <div className="flex items-center gap-1">
          <span className="text-primary/60">LNG:</span> 77.2090° E
        </div>
      </div>
    </div>
  )
}
