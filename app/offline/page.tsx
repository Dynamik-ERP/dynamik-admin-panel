'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0C0E] px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#FF6B00]/30 bg-[#FF6B00]/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      <h1 className="mb-3 text-2xl font-bold text-white">
        You are offline
      </h1>
      <p className="mb-8 max-w-sm text-gray-400 text-sm leading-relaxed">
        It looks like you&apos;ve lost your internet connection. Check your
        network and try again.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-[#FF6B00] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e55f00] transition-colors"
      >
        Try again
      </button>

      <p className="mt-12 text-xs text-gray-600">
        Dynamik Admin Panel
      </p>
    </div>
  )
}
