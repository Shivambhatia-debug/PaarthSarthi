"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { mentorAPI, courseAPI, offerAPI, settingsAPI } from "@/lib/api"
import { HeroSection } from "@/components/home/HeroSection"
import { OffersSlideshow } from "@/components/home/OffersSlideshow"
import { ServicesSection } from "@/components/home/ServicesSection"
import { StartupIncubation } from "@/components/home/StartupIncubation"
import { HowItWorks } from "@/components/home/HowItWorks"
import { TrustSection } from "@/components/home/TrustSection"
import { CTASection } from "@/components/home/CTASection"

// --- Icons for Data ---
import {
  Users, GraduationCap, BookOpen, Rocket, Target,
  Cpu, Megaphone, BarChart3, Palette, TrendingUp
} from "lucide-react"

const SERVICES = [
  { icon: Users, title: "1-on-1 Mentorship", desc: "Personalized career guidance from verified industry experts.", href: "/mentorship", tag: "Popular", accent: "blue", gradient: "from-blue-500 to-cyan-500" },
  { icon: GraduationCap, title: "Admission", desc: "Coaching & course admissions — Physics Wallah, Unacademy & more.", href: "/admission", tag: "Admission", accent: "emerald", gradient: "from-emerald-500 to-green-500" },
  { icon: BookOpen, title: "Skill Courses", desc: "Hindi & English courses for career, tech, and communication.", href: "/courses", tag: "Learning", accent: "emerald", gradient: "from-emerald-500 to-green-500" },
  { icon: Rocket, title: "Startup Incubation", desc: "Full startup support — tech, marketing, strategy & mentoring.", href: "/startups", tag: "Startups", accent: "orange", gradient: "from-orange-500 to-amber-500" },
  { icon: Target, title: "Career Roadmaps", desc: "Strategic career planning with personalized growth plans.", href: "/mentorship", tag: "Strategy", accent: "cyan", gradient: "from-cyan-500 to-teal-500" },
]

const STARTUP_SERVICES = [
  { icon: Cpu, name: "Tech Dev", desc: "Web, Mobile, MVPs", color: "text-blue-400" },
  { icon: Megaphone, name: "Marketing", desc: "SEO, Ads, Social", color: "text-rose-400" },
  { icon: BarChart3, name: "Strategy", desc: "Growth & Plans", color: "text-emerald-400" },
  { icon: Palette, name: "Design", desc: "UI/UX & Brand", color: "text-amber-400" },
  { icon: TrendingUp, name: "Finance", desc: "Funding & Pitch", color: "text-violet-400" },
  { icon: Users, name: "Mentoring", desc: "1-on-1 Coaching", color: "text-cyan-400" },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export default function HomePage() {
  const [stats, setStats] = useState({ mentors: 0, alumni: 0, courses: 0 })
  const [offers, setOffers] = useState<any[]>([])
  const [tickerText, setTickerText] = useState("OFFER — Get admission now")
  const [visible, setVisible] = useState(false)
  const [atBottom, setAtBottom] = useState(false)

  // Scroll logic
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      setAtBottom(scrollTop + clientHeight >= scrollHeight - 80)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToEnd = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
    }
  }

  // InView hooks
  const servicesInView = useInView(0.1)
  const startupInView = useInView(0.1)
  const howItWorksInView = useInView(0.1)
  const trustInView = useInView(0.1)

  // Initial Fetches
  useEffect(() => {
    setVisible(true)
    const fetchStats = async () => {
      try {
        const [m, c] = await Promise.allSettled([
          mentorAPI.getAll("limit=1"), courseAPI.getAll("limit=1"),
        ])
        setStats({
          mentors: m.status === "fulfilled" ? m.value.pagination?.total || 0 : 0,
          alumni: 0,
          courses: c.status === "fulfilled" ? c.value.pagination?.total || 0 : 0,
        })
      } catch { }
    }
    fetchStats()
    offerAPI.getActive().then((r) => setOffers(r.offers || [])).catch(() => { })
    settingsAPI.getTicker().then((r) => setTickerText(r.ticker || "OFFER — Get admission now")).catch(() => { })
  }, [])

  return (
    <div className="min-h-screen bg-[#060a13]">
      {/* Moving ticker */}
      <div className="bg-emerald-600 text-white text-sm font-semibold py-1.5 overflow-hidden border-b border-emerald-500/30">
        <div className="flex animate-marquee whitespace-nowrap w-max">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="inline-block px-6">{tickerText}</span>
          ))}
        </div>
      </div>

      <HeroSection visible={visible} stats={stats} />

      <OffersSlideshow offers={offers} />

      <ServicesSection services={servicesInView} servicesData={SERVICES} />

      <StartupIncubation startup={startupInView} startupServices={STARTUP_SERVICES} />

      <HowItWorks howItWorks={howItWorksInView} />

      <TrustSection trust={trustInView} />

      <CTASection />

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={scrollToEnd}
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-colors"
        title={atBottom ? "Back to top" : "End tak jao"}
        aria-label={atBottom ? "Back to top" : "Scroll to end"}
      >
        {atBottom ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
    </div>
  )
}
