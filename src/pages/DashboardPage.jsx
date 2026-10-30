import React, { useState, useEffect } from 'react'
import TopNavBar from '../components/dashboard/TopNavBar'
import SideNavBar from '../components/dashboard/SideNavBar'
import MapView from '../components/dashboard/MapView'
import PropertyList from '../components/dashboard/PropertyList'
import PropertyDetailPage from './PropertyDetailPage'
import { apiService } from '../services/api'

export default function DashboardPage({ user, onLogout }) {
  const [properties, setProperties] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState(null)
  const [detailProperty, setDetailProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    propertyType: 'All',
    bhkConfig: 'Any BHK',
    metroDistance: 'Any Distance',
    gentrification: 'Any Potential'
  })

  // Load properties based on search and filters
  useEffect(() => {
    let cancelled = false

    async function loadProperties() {
      setLoading(true)
      setError('')

      try {
        const data = await apiService.fetchProperties({ search, ...filters })
        if (cancelled) return

        setProperties(data)
        // Keep the current selection if it survived the filter, else fall back
        // to the first result.
        setSelectedPropertyId((prev) => (
          prev && data.some((p) => p.id === prev) ? prev : (data[0]?.id ?? null)
        ))
      } catch (err) {
        if (cancelled) return

        // The backend has no authenticationEntryPoint configured, so a missing
        // or expired JWT comes back as 403 rather than 401. Either way the
        // session is unusable and cannot be recovered from here.
        if (err.status === 401 || err.status === 403) {
          onLogout()
          return
        }

        setProperties([])
        setSelectedPropertyId(null)
        setError(err.message || 'Failed to load properties')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProperties()
    return () => { cancelled = true }
  }, [search, filters, onLogout])

  const handleSearch = (query) => {
    setSearch(query)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleAnalyze = () => {
    alert('Initiating real estate valuation analysis for the active listings grid...')
  }

  // Opening a listing replaces the dashboard with its own full-screen page.
  if (detailProperty) {
    return <PropertyDetailPage property={detailProperty} onBack={() => setDetailProperty(null)} />
  }

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden text-on-background select-none">
      {/* Top Navigation */}
      <TopNavBar 
        user={user}
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange}
        onAnalyze={handleAnalyze}
        onLogout={onLogout}
      />
      
      {/* Main Content Layout */}
      <main className="flex-1 flex mt-[112px] overflow-hidden">
        {/* Sidebar */}
        <SideNavBar />
        
        {/* Core Layout Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-surface-bright">
          <MapView 
            properties={properties} 
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={setSelectedPropertyId}
          />
          
          <PropertyList 
            properties={properties} 
            loading={loading}
            error={error}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={setSelectedPropertyId}
            onOpenProperty={setDetailProperty}
          />
        </div>
      </main>
    </div>
  )
}
