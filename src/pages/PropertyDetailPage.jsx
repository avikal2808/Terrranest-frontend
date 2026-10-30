import React from 'react'
import { buildPropertyInsights } from '../services/api'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

// Bars read left-to-right, so a high score is always the good outcome. The
// water-logging risk and safety rating are inverted bands (low risk is good),
// so they get their own tone lookup.
const scoreTone = (score) => {
  if (score >= 75) return { text: 'text-primary', bar: 'bg-primary', stroke: 'stroke-primary' }
  if (score >= 55) return { text: 'text-tertiary', bar: 'bg-tertiary-container', stroke: 'stroke-tertiary-container' }
  return { text: 'text-error', bar: 'bg-error', stroke: 'stroke-error' }
}

const riskTone = {
  Low: 'bg-primary-container/25 text-on-primary-container',
  Moderate: 'bg-tertiary-container/30 text-on-tertiary-container',
  High: 'bg-error-container text-on-error-container',
}

const ratingTone = {
  High: 'bg-primary-container/25 text-on-primary-container',
  Moderate: 'bg-tertiary-container/30 text-on-tertiary-container',
  Low: 'bg-error-container text-on-error-container',
}

function Fact({ label, value }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-5 py-4">
      <p className="text-[10px] uppercase tracking-wider text-secondary">{label}</p>
      <p className="text-sm font-semibold text-on-surface mt-1 font-mono">{value}</p>
    </div>
  )
}

export default function PropertyDetailPage({ property, onBack }) {
  const insights = buildPropertyInsights(property)
  const { crime, waterLogging } = insights

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const overallTone = scoreTone(insights.overallScore)

  return (
    <div className="h-screen flex flex-col bg-background text-on-background overflow-hidden">
      {/* Detail header */}
      <header className="h-16 shrink-0 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-4 px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-sm font-medium">Back to dashboard</span>
        </button>
        <div className="h-6 w-px bg-outline-variant"></div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">home_work</span>
          <span className="text-sm font-semibold tracking-wide">TerraNest</span>
        </div>
        <span className="ml-auto text-xs text-secondary font-mono">Listing #{property.id}</span>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Hero: the same listing image, full width */}
          <div className="relative h-[340px] lg:h-[400px] rounded-xl overflow-hidden border border-outline-variant bg-surface-container">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-block px-2 py-0.5 rounded bg-primary-container text-on-primary-container text-[10px] uppercase tracking-wider font-semibold mb-2">
                  {property.type}
                </span>
                <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{property.title}</h1>
                <p className="text-sm text-white/80 mt-1">{property.address}</p>
              </div>
              <div className="lg:text-right shrink-0">
                <p className="text-2xl lg:text-3xl font-bold text-white font-mono">{formatPrice(property.price)}</p>
                <p className="text-xs text-white/70 mt-1 font-mono">
                  {property.sqft ? `${property.sqft.toLocaleString('en-IN')} sqft` : 'Area on request'}
                </p>
              </div>
            </div>
          </div>

          {/* Livability score + breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-wider text-secondary">Livability Score</p>
              <div className="relative w-40 h-40 mt-3">
                <svg viewBox="0 0 140 140" className="w-40 h-40 -rotate-90">
                  <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="12" className="stroke-surface-container" />
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(insights.overallScore / 100) * circumference} ${circumference}`}
                    className={overallTone.stroke}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold font-mono ${overallTone.text}`}>{insights.overallScore}</span>
                  <span className="text-[10px] uppercase tracking-wider text-secondary mt-1">out of 100</span>
                </div>
              </div>
              <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${ratingTone[insights.overallRating]}`}>
                {insights.overallRating} livability
              </span>
            </section>

            <section className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h2 className="text-base font-semibold text-on-surface">Score Breakdown</h2>
              <p className="text-xs text-secondary mt-1">
                Weighted from crime, drainage, air quality and infrastructure signals within 1.5 km.
              </p>

              <div className="mt-5 space-y-4">
                {insights.breakdown.map((item) => {
                  const tone = scoreTone(item.score)
                  return (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-on-surface">{item.label}</span>
                        <span className={`text-sm font-semibold font-mono ${tone.text}`}>{item.score}/100</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${item.score}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Crime rate + water logging */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                  <h2 className="text-base font-semibold text-on-surface">Crime Rate</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ratingTone[crime.safetyRating]}`}>
                  {crime.safetyRating} safety
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-on-surface">{crime.ratePerThousand}</span>
                <span className="text-xs text-secondary">reported incidents per 1,000 residents / year</span>
              </div>

              <p className="text-[10px] uppercase tracking-wider text-secondary mt-6 mb-2">
                Recent reports within 1.5 km
              </p>
              <ul className="divide-y divide-surface-container">
                {crime.recentIncidents.map((incident, index) => (
                  <li key={index} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-on-surface">{incident.type}</span>
                    <span className="flex items-center gap-4 text-xs text-secondary font-mono">
                      <span>Severity {incident.severity}/10</span>
                      <span>{incident.distanceMeters} m</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">water_drop</span>
                  <h2 className="text-base font-semibold text-on-surface">Water Logging</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskTone[waterLogging.risk]}`}>
                  {waterLogging.risk} risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-secondary">Drainage capacity</p>
                  <p className="text-xl font-bold font-mono text-on-surface mt-1">
                    {waterLogging.drainageCapacity}/100
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-secondary">Reports last monsoon</p>
                  <p className="text-xl font-bold font-mono text-on-surface mt-1">
                    {waterLogging.reportsLastMonsoon}
                  </p>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-surface-container overflow-hidden mt-4">
                <div
                  className={`h-full rounded-full ${scoreTone(waterLogging.drainageCapacity).bar}`}
                  style={{ width: `${waterLogging.drainageCapacity}%` }}
                ></div>
              </div>

              <p className="text-sm text-secondary mt-5 leading-relaxed">{waterLogging.note}</p>
            </section>
          </div>

          {/* Listing facts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <Fact label="Property Type" value={property.type} />
            <Fact label="Area" value={property.sqft ? `${property.sqft.toLocaleString('en-IN')} sqft` : '—'} />
            <Fact label="Status" value={property.status} />
            <Fact
              label="Coordinates"
              value={`${property.latitude.toFixed(4)}, ${property.longitude.toFixed(4)}`}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
