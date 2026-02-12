import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { ConditionalFooter } from "@/components/layout/conditional-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ParthSarthi Knowledge Hub - Career Mentorship & Guidance",
  description:
    "DPIIT Certified startup. Connect with expert mentors, alumni network, access courses, and build your career with personalized guidance.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  )
}
