import React, { useEffect, useRef } from 'react'
import PropertyCard from './PropertyCard'

export default function PropertyList({ properties, loading, error, selectedPropertyId, onSelectProperty, onOpenProperty }) {
  const listContainerRef = useRef(null)

  // Scroll to active card when selectedPropertyId changes
  useEffect(() => {
    if (selectedPropertyId) {
      const activeElement = document.getElementById(`property-${selectedPropertyId}`)
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [selectedPropertyId])

  return (
    <div className="w-full lg:w-[30%] h-[50vh] lg:h-full bg-surface-bright flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-10 flex justify-between items-end">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Available Assets</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>
        <button className="flex items-center gap-1 text-primary font-label-md text-label-md hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">sort</span>
          Sort
        </button>
      </div>

      {/* Scrollable List */}
      <div 
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-secondary">
            <span className="material-symbols-outlined text-4xl mb-2 animate-spin">progress_activity</span>
            <p className="text-sm">Loading assets...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-error text-center px-4">
            <span className="material-symbols-outlined text-4xl mb-2">cloud_off</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-secondary">
            <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
            <p className="text-sm">No assets match your search</p>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} id={`property-${property.id}`}>
              <PropertyCard
                property={property}
                isSelected={selectedPropertyId === property.id}
                onOpen={onOpenProperty}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
