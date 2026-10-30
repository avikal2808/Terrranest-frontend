import React, { useState } from 'react'

export default function PropertyCard({ property, isSelected, onOpen }) {
  const [bookmarked, setBookmarked] = useState(false)

  const handleBookmarkClick = (e) => {
    e.stopPropagation()
    setBookmarked(!bookmarked)
  }

  // Indian market, so format in rupees with lakh/crore digit grouping.
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(property.price)

  const isUnderContract = property.status === 'Under Contract'

  return (
    <div 
      onClick={() => onOpen(property)}
      className={`bg-surface-container-lowest border rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 ${
        isSelected 
          ? 'border-primary ring-2 ring-primary/20 shadow-md' 
          : 'border-outline-variant hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]'
      }`}
    >
      {/* Thumbnail */}
      <div className="h-32 relative overflow-hidden bg-surface-container-low">
        <img 
          alt="Property Image" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          src={property.image} 
        />
        {/* Status Badge */}
        <div 
          className={`absolute top-2 left-2 px-2 py-0.5 rounded font-label-md text-[10px] uppercase tracking-wider ${
            isUnderContract 
              ? 'bg-surface-variant text-on-surface-variant border border-outline-variant' 
              : 'bg-primary-container text-on-primary-container'
          }`}
        >
          {property.status}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-data-mono text-lg font-bold text-on-surface">
            {formattedPrice}
          </h3>
          <button 
            onClick={handleBookmarkClick}
            className={`transition-colors duration-200 ${
              bookmarked ? 'text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            <span 
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>
        
        <p className="font-body-md text-sm text-secondary truncate mb-3">
          {property.address}
        </p>

        {/* Dynamic lower attributes */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-container">
          <div className="flex flex-col">
            <span className="font-label-md text-[10px] text-secondary uppercase">Type</span>
            <span className="font-data-mono text-xs text-on-surface font-medium">{property.type}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="font-label-md text-[10px] text-secondary uppercase">
              {property.sqft ? 'SQFT' : 'Units'}
            </span>
            <span className="font-data-mono text-xs text-on-surface font-medium">
              {property.sqft ? property.sqft.toLocaleString() : property.units}
            </span>
          </div>

          {property.metrics && (
            <div className="flex flex-col">
              <span className="font-label-md text-[10px] text-secondary uppercase">
                {property.metrics.label}
              </span>
              <span className={`font-data-mono text-xs font-semibold ${
                property.metrics.label.includes('Rate') ? 'text-primary' : 'text-on-surface'
              }`}>
                {property.metrics.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
