"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-400 mb-4">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={() => reset()}
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
