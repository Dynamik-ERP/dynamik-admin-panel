'use client'

import { useState, useEffect, useCallback } from 'react'

export default function PwaUpdateBanner() {
  const [showBanner, setShowBanner] = useState(false)

  const handleReload = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const onControllerChange = () => {
      setShowBanner(true)
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-xl border border-[#FF6B00] bg-[#1a1b1e] px-5 py-3 shadow-2xl max-w-[90vw]"
    >
      <span className="text-sm text-gray-300">
        A new version is available.
      </span>
      <button
        type="button"
        onClick={handleReload}
        className="rounded-lg bg-[#FF6B00] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#e55f00] transition-colors whitespace-nowrap"
      >
        Reload
      </button>
      <button
        type="button"
        onClick={() => setShowBanner(false)}
        aria-label="Dismiss"
        className="text-gray-500 hover:text-gray-300 text-lg leading-none px-1 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
