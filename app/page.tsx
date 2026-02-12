"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, BookOpen, Users, GraduationCap, Rocket,
  Star, Shield, Zap, Code, Megaphone, BarChart3, Lightbulb,
  CheckCircle, ArrowUpRight, Sparkles, Play, TrendingUp,
  Globe, Award, Target, Cpu, Palette
} from "lucide-react"
import Link from "next/link"
import { mentorAPI, alumniAPI, courseAPI } from "@/lib/api"

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

const SERVICES = [
  { icon: Users, title: "1-on-1 Mentorship", desc: "Personalized career guidance from verified industry experts.", href: "/mentorship", tag: "Popular", accent: "blue", gradient: "from-blue-500 to-cyan-500" },
  { icon: GraduationCap, title: "Alumni Network", desc: "Connect with successful professionals & get real-world advice.", href: "/alumni", tag: "Network", accent: "violet", gradient: "from-violet-500 to-purple-500" },
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

export default function HomePage() {
  const [stats, setStats] = useState({ mentors: 0, alumni: 0, courses: 0 })
  const [visible, setVisible] = useState(false)
  const services = useInView(0.1)
  const startup = useInView(0.1)
  const howItWorks = useInView(0.1)
  const trust = useInView(0.1)

  useEffect(() => {
    setVisible(true)
    const fetchStats = async () => {
      try {
        const [m, a, c] = await Promise.allSettled([
          mentorAPI.getAll("limit=1"), alumniAPI.getAll("limit=1"), courseAPI.getAll("limit=1"),
        ])
        setStats({
          mentors: m.status === "fulfilled" ? m.value.pagination?.total || 0 : 0,
          alumni: a.status === "fulfilled" ? a.value.pagination?.total || 0 : 0,
          courses: c.status === "fulfilled" ? c.value.pagination?.total || 0 : 0,
        })
      } catch {}
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#060a13]">

      {/* ======================== HERO ======================== */}
      <section className="relative overflow-hidden">
        {/* BG Orbs */}
        <div className="absolute top-0 right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/[0.07] rounded-full blur-[80px] md:blur-[120px] animate-glow" />
        <div className="absolute bottom-0 left-[-5%] w-[200px] md:w-[350px] h-[200px] md:h-[350px] bg-violet-600/[0.05] rounded-full blur-[60px] md:blur-[100px] animate-glow delay-500" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-[1fr,auto] gap-5 sm:gap-6 lg:gap-10 items-center pt-5 pb-8 sm:pt-8 sm:pb-12 lg:pt-14 lg:pb-16">

            {/* LEFT — Text */}
            <div className="order-1 text-left">
              <div className={`inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1 text-[10px] sm:text-[11px] text-gray-400 mb-3 sm:mb-4 ${visible ? 'animate-slide-left' : 'opacity-0'}`}>
                <Shield className="w-3 h-3 text-emerald-400" />
                DPIIT Certified Startup
              </div>

              <h1 className={`text-[1.7rem] sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-3 sm:mb-4 tracking-tight ${visible ? 'animate-slide-left delay-100' : 'opacity-0'}`}>
                <span className="text-white">Build Your </span>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  Career
                </span>
                <br className="hidden sm:block" />{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  & Startup
                </span>
                <span className="text-white"> with</span>
                <br />
                <span className="text-gray-400">Expert Guidance</span>
              </h1>

              <p className={`text-gray-400 text-[13px] sm:text-sm md:text-[15px] leading-relaxed mb-5 sm:mb-6 max-w-md ${visible ? 'animate-slide-left delay-200' : 'opacity-0'}`}>
                Mentorship, alumni networking, skill courses & startup incubation — everything to build your future.
              </p>

              <div className={`flex flex-wrap gap-2.5 sm:gap-3 mb-6 sm:mb-8 ${visible ? 'animate-slide-left delay-300' : 'opacity-0'}`}>
                <Button className="bg-white text-black hover:bg-gray-100 font-semibold h-9 sm:h-10 px-5 sm:px-6 text-xs sm:text-sm group rounded-lg" asChild>
                  <Link href="/auth/login">
                    Get Started Free
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 bg-white/[0.02] h-9 sm:h-10 px-5 sm:px-6 text-xs sm:text-sm rounded-lg" asChild>
                  <Link href="/mentorship">
                    <Play className="w-3 h-3 mr-1.5" /> Explore Platform
                  </Link>
                </Button>
              </div>

              {/* Inline stats row */}
              <div className={`flex items-center gap-5 sm:gap-8 ${visible ? 'animate-slide-left delay-400' : 'opacity-0'}`}>
                {[
                  { v: stats.mentors > 0 ? stats.mentors + "+" : "500+", l: "Mentors", c: "text-blue-400" },
                  { v: stats.alumni > 0 ? stats.alumni + "+" : "100+", l: "Alumni", c: "text-violet-400" },
                  { v: stats.courses > 0 ? stats.courses + "+" : "50+", l: "Courses", c: "text-emerald-400" },
                  { v: "4.8", l: "Rating", c: "text-amber-400" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className={`text-lg sm:text-xl font-bold ${s.c}`}>{s.v}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Feature highlights (clickable) */}
            <div className="order-2 flex flex-col gap-2 sm:gap-2.5 w-full lg:w-[320px]">
              {[
                { icon: Users, title: "Expert Mentors", desc: "1-on-1 sessions with industry pros", c: "text-blue-400", bg: "from-blue-500/[0.12] to-blue-900/[0.04]", bc: "border-blue-500/[0.12]", href: "/mentorship" },
                { icon: GraduationCap, title: "Alumni Network", desc: "Real connections, real advice", c: "text-violet-400", bg: "from-violet-500/[0.12] to-violet-900/[0.04]", bc: "border-violet-500/[0.12]", href: "/alumni" },
                { icon: BookOpen, title: "Skill Courses", desc: "Hindi & English career courses", c: "text-emerald-400", bg: "from-emerald-500/[0.12] to-emerald-900/[0.04]", bc: "border-emerald-500/[0.12]", href: "/courses" },
                { icon: Rocket, title: "Startup Support", desc: "Tech, marketing, strategy & more", c: "text-orange-400", bg: "from-orange-500/[0.12] to-orange-900/[0.04]", bc: "border-orange-500/[0.12]", href: "/startups" },
              ].map((item, i) => (
                <Link key={item.title} href={item.href}>
                  <div className={`animate-scale-in delay-${(i + 3) * 100} flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r ${item.bg} border ${item.bc} rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 hover:scale-[1.02] hover:border-white/[0.2] transition-all duration-300 cursor-pointer group`}>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.1] transition-colors">
                      <item.icon className={`w-4 h-4 ${item.c}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] sm:text-[13px] font-semibold text-white group-hover:text-blue-300 transition-colors">{item.title}</p>
                      <p className="text-[10px] sm:text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
              {/* DPIIT — not clickable, just info */}
              <div className="animate-scale-in delay-700 flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-emerald-500/[0.1] to-emerald-900/[0.03] border border-emerald-500/[0.15] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/[0.15] flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] sm:text-[13px] font-semibold text-emerald-400">DPIIT Certified</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500">Govt. of India Recognized</p>
                </div>
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </section>

      {/* ======================== SERVICES ======================== */}
      <section ref={services.ref} className="relative py-12 sm:py-16 md:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-600/[0.03] rounded-full blur-[80px]" />

        <div className="container mx-auto px-4 relative">
          <div className={`mb-8 sm:mb-12 ${services.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-500/[0.08] border border-blue-500/15 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] text-blue-400 mb-2">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Our Services
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Everything You Need to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Succeed</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs sm:max-w-sm sm:text-right">
                Comprehensive services to accelerate your career and business.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {SERVICES.map((service, i) => (
              <Link key={service.title} href={service.href}>
                <div className={`group relative h-full bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3.5 sm:p-6 
                  hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 
                  hover:translate-y-[-2px] sm:hover:translate-y-[-4px] hover:shadow-lg hover:shadow-black/30 
                  ${services.inView ? `animate-fade-up delay-${(i + 1) * 100}` : 'opacity-0'}`}
                >
                  <div className={`absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-px bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

                  <div className="flex items-start justify-between mb-3 sm:mb-5">
                    <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.gradient} bg-opacity-10 flex items-center justify-center`}
                      style={{ background: `linear-gradient(135deg, var(--tw-gradient-from) / 0.15, var(--tw-gradient-to) / 0.05)` }}>
                      <service.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${service.accent}-400`} />
                    </div>
                    <span className="text-[8px] sm:text-[10px] text-gray-600 bg-white/[0.04] border border-white/[0.06] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full hidden sm:inline">
                      {service.tag}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-xs sm:text-[15px] mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-[10px] sm:text-[13px] text-gray-500 leading-relaxed mb-2 sm:mb-4 group-hover:text-gray-400 transition-colors line-clamp-2 sm:line-clamp-none">
                    {service.desc}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] sm:text-[12px] text-gray-500 group-hover:text-blue-400 transition-all duration-300">
                    Explore <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== STARTUP INCUBATION ======================== */}
      <section ref={startup.ref} className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className={startup.inView ? 'animate-slide-left' : 'opacity-0'}>
                <div className="inline-flex items-center gap-1.5 bg-orange-500/[0.08] border border-orange-500/15 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] text-orange-400 mb-3">
                  <Rocket className="w-3 h-3" /> For Startups
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  Full Startup{" "}
                  <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Incubation</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mb-5 sm:mb-8 leading-relaxed max-w-md">
                  From idea to scale — our expert team handles tech, marketing, strategy, design, finance, and mentoring.
                </p>
                <Button className="bg-white text-black hover:bg-gray-100 h-9 sm:h-10 text-xs sm:text-sm font-semibold rounded-xl group" asChild>
                  <Link href="/startups">
                    Request a Service <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {STARTUP_SERVICES.map((s, i) => (
                  <div key={s.name}
                    className={`bg-white/[0.02] border border-white/[0.06] rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:bg-white/[0.05] hover:border-white/[0.12] 
                      transition-all duration-400 hover:translate-y-[-2px] group
                      ${startup.inView ? `animate-scale-in delay-${(i + 2) * 100}` : 'opacity-0'}`}
                  >
                    <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color} mb-1.5 sm:mb-2.5 group-hover:scale-110 transition-transform`} />
                    <p className="text-[11px] sm:text-[13px] font-medium text-white mb-0.5">{s.name}</p>
                    <p className="text-[9px] sm:text-[11px] text-gray-500 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section ref={howItWorks.ref} className="relative py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-8 sm:mb-14 ${howItWorks.inView ? 'animate-fade-up' : 'opacity-0'}`}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Start in <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 relative">
              <div className="hidden sm:block absolute top-8 sm:top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-violet-500/20" />

              {[
                { n: "01", title: "Sign Up", desc: "Create free account in 30 seconds.", icon: Zap, c: "text-blue-400", bg: "from-blue-500/15 to-blue-600/5" },
                { n: "02", title: "Connect", desc: "Browse mentors, alumni & courses.", icon: Globe, c: "text-emerald-400", bg: "from-emerald-500/15 to-emerald-600/5" },
                { n: "03", title: "Grow", desc: "Achieve your career & business goals.", icon: Award, c: "text-violet-400", bg: "from-violet-500/15 to-violet-600/5" },
              ].map((step, i) => (
                <div key={step.n}
                  className={`text-center group ${howItWorks.inView ? `animate-fade-up delay-${(i + 1) * 200}` : 'opacity-0'}`}
                >
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.bg} border border-white/[0.06] flex items-center justify-center mx-auto mb-2.5 sm:mb-4 
                    group-hover:scale-105 group-hover:border-white/[0.12] transition-all duration-300 relative`}>
                    <step.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${step.c}`} />
                    <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0d1117] border border-white/10 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-gray-400">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-xs sm:text-sm mb-0.5 sm:mb-1.5">{step.title}</h3>
                  <p className="text-[9px] sm:text-[12px] text-gray-500 leading-relaxed max-w-[150px] sm:max-w-[200px] mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================== TRUST ======================== */}
      <section ref={trust.ref} className="relative py-12 sm:py-16 md:py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className={`bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 relative overflow-hidden ${trust.inView ? 'animate-scale-in' : 'opacity-0'}`}>
              <div className="absolute top-0 right-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-blue-500/[0.04] rounded-full blur-[60px] sm:blur-[80px]" />

              <div className="grid sm:grid-cols-2 gap-6 sm:gap-10 items-center relative">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                    <img src="/logo.png" alt="PS" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">ParthSarthi Knowledge Hub</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500">Pvt. Ltd. &bull; DPIIT Certified</p>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-5">
                    Why <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Choose Us?</span>
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      "DPIIT Recognized by Govt. of India",
                      "Verified industry expert mentors",
                      "Real alumni, real connections",
                      "Full startup incubation support",
                      "Courses in Hindi & English",
                      "Mental wellness & counseling",
                    ].map((item, i) => (
                      <div key={item} className={`flex items-center gap-2 ${trust.inView ? `animate-slide-left delay-${(i + 2) * 100}` : 'opacity-0'}`}>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                        </div>
                        <span className="text-[11px] sm:text-[13px] text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { v: "500+", l: "Students Guided", c: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5" },
                    { v: "4.8/5", l: "User Rating", c: "text-amber-400", bg: "from-amber-500/10 to-amber-600/5" },
                    { v: "24/7", l: "Support", c: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5" },
                    { v: "DPIIT", l: "Certified", c: "text-violet-400", bg: "from-violet-500/10 to-violet-600/5" },
                  ].map((s, i) => (
                    <div key={s.l}
                      className={`bg-gradient-to-br ${s.bg} border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center 
                        hover:border-white/[0.12] transition-all duration-300
                        ${trust.inView ? `animate-scale-in delay-${(i + 3) * 100}` : 'opacity-0'}`}
                    >
                      <p className={`text-base sm:text-xl font-bold ${s.c}`}>{s.v}</p>
                      <p className="text-[9px] sm:text-[11px] text-gray-500 mt-0.5 sm:mt-1">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CTA ======================== */}
      <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/[0.04] to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-blue-600/[0.06] rounded-full blur-[60px]" />

        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Ready to Start Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Journey?</span>
          </h2>
          <p className="text-gray-500 mb-5 sm:mb-8 text-xs sm:text-sm max-w-md mx-auto">
            Join hundreds of students and startups building their future with ParthSarthi.
          </p>
          <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center">
            <Button className="bg-white text-black hover:bg-gray-100 font-semibold h-10 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm rounded-xl" asChild>
              <Link href="/auth/login">Get Started Free</Link>
            </Button>
            <Button variant="outline" className="border-white/10 text-gray-400 hover:bg-white/5 bg-white/[0.02] h-10 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm rounded-xl" asChild>
              <Link href="/mentorship">Browse Mentors</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
