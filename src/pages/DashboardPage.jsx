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
  const [showComingSoon, setShowComingSoon] = useState(false)
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
    setShowComingSoon(true)
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

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          ></div>
          <div className="relative bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-2">Advanced Analytics</h3>
            <p className="font-body-md text-secondary mb-8">
              Deep-dive valuation and ROI prediction features will be available very soon.
            </p>
            <button 
              onClick={() => setShowComingSoon(false)}
              className="w-full py-3 px-6 bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
