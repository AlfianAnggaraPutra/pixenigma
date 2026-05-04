import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SplashScreen  from './components/SplashScreen'
import LoadingScreen from './components/LoadingScreen'
import LandingPage   from './pages/LandingPage'
import UploadPage    from './pages/UploadPage'
import SettingsPage  from './pages/SettingsPage'
import ResultPage    from './pages/ResultPage'

const SPLASH_KEY = 'px_splash_shown'

function AppScreens() {
  const [screen, setScreen] = useState(() =>
    sessionStorage.getItem(SPLASH_KEY) ? 'app' : 'splash'
  )

  const handleSplashDone  = () => setScreen('loading')
  const handleLoadingDone = () => {
    sessionStorage.setItem(SPLASH_KEY, '1')
    setScreen('app')
  }

  if (screen === 'splash')  return <SplashScreen  onComplete={handleSplashDone}  />
  if (screen === 'loading') return <LoadingScreen onComplete={handleLoadingDone} />

  return (
    <Routes>
      <Route path="/"         element={<LandingPage  />} />
      <Route path="/upload"   element={<UploadPage   />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/result"   element={<ResultPage   />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppScreens />
    </BrowserRouter>
  )
}