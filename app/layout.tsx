import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Sans_Devanagari } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { ConditionalFooter } from "@/components/layout/conditional-footer"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const deva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-deva",
  display: "swap",
})

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
      <body className={`${inter.className} ${inter.variable} ${deva.variable}`}>
        <Header />
        <main>{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  )
}
