import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet icon issue
import 'leaflet/dist/leaflet.css'

// Custom Marker Component to handle panning/zooming to selection
function MapController({ selectedProperty }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedProperty) {
      map.setView([selectedProperty.latitude, selectedProperty.longitude], 15, {
        animate: true,
        duration: 1.0
      })
    }
  }, [selectedProperty, map])
  
  return null
}

export default function MapView({ properties, selectedPropertyId, onSelectProperty }) {
  const selectedProperty = properties.find(p => p.id === selectedPropertyId)

  // Format price for the map bubble in Indian numbering (Cr/L)
  const formatMapPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`
    return `₹${price.toLocaleString('en-IN')}`
  }

  // Create a custom div icon for the pins
  const createCustomIcon = (property, isSelected) => {
    const formattedPrice = formatMapPrice(property.price)
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="flex flex-col items-center group cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
          <div class="font-data-mono text-[10px] px-1.5 py-0.5 rounded shadow-md font-bold whitespace-nowrap transition-all duration-200 
            ${isSelected 
              ? 'bg-inverse-surface text-on-error ring-2 ring-primary-container z-50 scale-110' 
              : 'bg-primary text-on-primary group-hover:bg-primary-container group-hover:text-on-primary-container'}">
            ${formattedPrice}
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] 
            ${isSelected ? 'border-t-inverse-surface' : 'border-t-primary group-hover:border-t-primary-container'}">
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    })
  }

  // Calculate center of all properties
  const center = properties.length > 0 
    ? [properties[0].latitude, properties[0].longitude] 
    : [28.6139, 77.2090] // Delhi default

  return (
    <div className="w-full lg:w-[70%] h-[50vh] lg:h-full relative border-b lg:border-b-0 lg:border-r border-outline-variant bg-surface-container overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <ZoomControl position="topright" />
        <MapController selectedProperty={selectedProperty} />

        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createCustomIcon(property, selectedPropertyId === property.id)}
            eventHandlers={{
              click: () => onSelectProperty(property.id),
            }}
          />
        ))}
      </MapContainer>

      {/* High-tech overlay to maintain consistency with the app's aesthetic */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(0,108,73,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,108,73,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    </div>
  )
}
