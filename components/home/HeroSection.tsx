"use client"

import { Shield, Play, ArrowRight, Users, GraduationCap, BookOpen, Rocket, ArrowUpRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroSectionProps {
    visible: boolean
    stats: { mentors: number; alumni: number; courses: number }
}

export function HeroSection({ visible, stats }: HeroSectionProps) {
    return (
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
                            Mentorship, admissions, skill courses & startup incubation — everything to build your future.
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
                                { v: "New", l: "Admission", c: "text-emerald-400" },
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
                            { icon: GraduationCap, title: "Admission", desc: "Coaching & course admissions", c: "text-emerald-400", bg: "from-emerald-500/[0.12] to-emerald-900/[0.04]", bc: "border-emerald-500/[0.12]", href: "/admission" },
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
    )
}
