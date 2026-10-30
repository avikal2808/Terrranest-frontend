import React, { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { apiService, session } from './services/api'

export default function App() {
  // Restore the session so a page reload keeps the authenticated dashboard
  // instead of dropping the user back to the sign-in screen.
  const [user, setUser] = useState(() => session.getUser())
  const [currentPage, setCurrentPage] = useState(() => (session.getToken() ? 'dashboard' : 'login'))

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    apiService.logout()
    setUser(null)
    setCurrentPage('login')
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans bg-background text-on-background select-none">
      {currentPage === 'login' ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}
