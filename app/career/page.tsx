"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CareerPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/mentorship")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to Mentorship...</p>
    </div>
  )
}
