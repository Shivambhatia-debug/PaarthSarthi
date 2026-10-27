"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InstitutionsPage() {
  const router = useRouter()
  useEffect(() => { router.replace("/placement-os") }, [router])
  return <div className="min-h-screen flex items-center justify-center bg-[#0d1117]"><p className="text-gray-500 text-sm">Opening Placement OS…</p></div>
}
