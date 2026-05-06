import React, { createContext, useContext, useRef } from 'react'

// Context untuk menyimpan data gambar di memori (RAM)
// Tidak ada batas ukuran seperti sessionStorage
const AppContext = createContext(null)

export function AppProvider({ children }) {
  // useRef agar tidak trigger re-render saat data berubah
  const imageDataRef    = useRef(null)  // ImageData object dari Canvas
  const imageUrlRef     = useRef(null)  // Object URL untuk preview
  const settingsRef     = useRef({      // Konfigurasi Enigma
    rotors:         [null, null, null],
    positions:      [0, 0, 0],
    plugboardPairs: [],
  })

  const store = {
    // Simpan gambar
    setImage: (imageData, imageUrl) => {
      imageDataRef.current = imageData
      imageUrlRef.current  = imageUrl
    },
    // Ambil gambar
    getImage: () => ({
      imageData: imageDataRef.current,
      imageUrl:  imageUrlRef.current,
    }),
    // Simpan settings
    setSettings: (settings) => {
      settingsRef.current = settings
    },
    // Ambil settings
    getSettings: () => settingsRef.current,
    // Reset semua
    reset: () => {
      imageDataRef.current = null
      imageUrlRef.current  = null
      settingsRef.current  = { rotors:[null,null,null], positions:[0,0,0], plugboardPairs:[] }
    },
  }

  return (
    <AppContext.Provider value={store}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook untuk akses context
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}