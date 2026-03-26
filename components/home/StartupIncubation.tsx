"use client"

import { Rocket, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface StartupService {
    icon: any
    name: string
    desc: string
    color: string
}

interface StartupIncubationProps {
    startup: { ref: any; inView: boolean }
    startupServices: StartupService[]
}

export function StartupIncubation({ startup, startupServices }: StartupIncubationProps) {
    return (
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
                            {startupServices.map((s, i) => (
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
    )
}
