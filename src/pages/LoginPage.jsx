import React, { useState } from 'react'
import { apiService } from '../services/api'

export default function LoginPage({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (isRegisterMode) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        // The backend enforces a minimum of 8 characters; check it here so the
        // user gets an inline message instead of a raw 400 response.
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
        await apiService.register(email, password)
        alert('Account created successfully! Please sign in.')
        setIsRegisterMode(false)
        setPassword('')
        setConfirmPassword('')
      } else {
        const userData = await apiService.login(email, password)
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen flex antialiased w-full">
      {/* Left Side: Map Visual (Hidden on mobile viewports) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80')" 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container-lowest/50"></div>
        {/* Abstract overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,108,73,0.05),transparent_70%)]"></div>
        
        {/* Overlay branding card */}
        <div className="absolute bottom-margin-lg left-margin-lg z-10">
          <div className="bg-surface-container-lowest/90 backdrop-blur-md p-margin-sm rounded-lg border border-outline-variant shadow-[0_4px_12px_rgba(15,23,42,0.08)] max-w-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-unit">Institutional Intelligence</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Advanced geospatial analytics for high-stakes real estate portfolios. Uncover market velocity and valuation trends with precision.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-margin-sm sm:px-margin-md md:px-margin-lg xl:px-24 py-8">
        
        {/* Logo and Brand Heading */}
        <div className="mb-margin-md flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-lg">domain</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary">TerraNest</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Tab Control Toggle Group */}
          <div className="flex p-1 bg-surface-container-low rounded-lg mb-margin-md">
            <button 
              onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
              className={`flex-1 py-2 text-center rounded-md font-label-md text-label-md transition-all ${
                !isRegisterMode 
                  ? 'bg-surface-container-lowest shadow-[0_2px_4px_rgba(15,23,42,0.04)] text-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
              className={`flex-1 py-2 text-center rounded-md font-label-md text-label-md transition-all ${
                isRegisterMode 
                  ? 'bg-surface-container-lowest shadow-[0_2px_4px_rgba(15,23,42,0.04)] text-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-margin-md">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              {isRegisterMode ? 'Get Started' : 'Welcome Back'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isRegisterMode ? 'Create a secure analyst account.' : 'Enter your credentials to access your portfolio.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-unit" htmlFor="name">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">person</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-DEFAULT bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-0 input-glow transition-all" 
                    id="name" 
                    placeholder="John Doe" 
                    required 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-[20px]">mail</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-DEFAULT bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-0 input-glow transition-all" 
                  id="email" 
                  placeholder="analyst@firm.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-unit">
                <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                {!isRegisterMode && (
                  <a className="font-label-md text-label-md text-primary hover:underline" href="#">Forgot Password?</a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-[20px]">lock</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-10 py-2 border border-outline-variant rounded-DEFAULT bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-0 input-glow transition-all" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-unit" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">lock</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-DEFAULT bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-0 input-glow transition-all" 
                    id="confirmPassword" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!isRegisterMode && (
              <div className="flex items-center pt-2">
                <input 
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded-sm cursor-pointer" 
                  id="remember-me" 
                  type="checkbox"
                />
                <label className="ml-2 block font-body-md text-body-md text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <button 
              className="w-full mt-6 bg-primary hover:bg-[#005a3c] text-on-primary font-label-md text-label-md py-3 px-4 rounded-DEFAULT transition-colors flex justify-center items-center gap-2 active:scale-95 duration-100 disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Social Sign-in Divider */}
          <div className="mt-8 mb-6 relative">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Third Party OAuth buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => alert('Social authentication triggers OAuth redirect callback...')}
              className="flex justify-center items-center gap-2 w-full px-4 py-2 border border-outline-variant rounded-DEFAULT bg-surface-container-lowest hover:bg-surface-container-low font-label-md text-label-md text-secondary transition-colors" 
              type="button"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button 
              onClick={() => alert('Social authentication triggers OAuth redirect callback...')}
              className="flex justify-center items-center gap-2 w-full px-4 py-2 border border-outline-variant rounded-DEFAULT bg-surface-container-lowest hover:bg-surface-container-low font-label-md text-label-md text-secondary transition-colors" 
              type="button"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 11.46c-.02-2.33 1.9-3.46 1.98-3.51-1.08-1.58-2.77-1.8-3.37-1.82-1.44-.15-2.8.85-3.54.85-.73 0-1.85-.82-3.05-.8-1.57.02-3.02.91-3.83 2.32-1.64 2.85-.42 7.07 1.18 9.38.78 1.12 1.69 2.37 2.91 2.32 1.18-.04 1.63-.76 3.06-.76 1.43 0 1.84.76 3.08.74 1.27-.02 2.07-1.15 2.83-2.27.88-1.29 1.25-2.54 1.27-2.6-.03-.01-2.43-.93-2.45-3.66zM15.42 6.55c.65-.79 1.09-1.89.97-2.98-.94.04-2.1.63-2.77 1.42-.59.7-.12 1.84.05 2.91 1.04.08 2.08-.55 2.75-1.35z"></path>
              </svg>
              Apple
            </button>
          </div>

          {/* Footer Guidelines links */}
          <div className="mt-8 text-center">
            <p className="font-label-md text-label-md text-on-surface-variant">
              By signing in, you agree to our{' '}
              <a className="text-primary hover:underline" href="#">Terms of Service</a> and{' '}
              <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
