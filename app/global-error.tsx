'use client'

// global-error.tsx replaces the root layout when a root-level error occurs,
// so it must render its own <html> and <body>. Without them Next.js renders
// broken, unstyled HTML at the worst possible moment for the user.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Critical Error</h1>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <p className="text-gray-500 mb-4">A critical error occurred. Please refresh the page or contact support if the problem persists.</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              type="button"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
