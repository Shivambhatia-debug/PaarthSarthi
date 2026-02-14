"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AlumniRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/admission") }, [router])
  return null
}
