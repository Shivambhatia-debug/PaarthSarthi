"use client"

import { Zap, Globe, Award } from "lucide-react"

interface HowItWorksProps {
    howItWorks: { ref: any; inView: boolean }
}

export function HowItWorks({ howItWorks }: HowItWorksProps) {
    return (
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
                            { n: "02", title: "Connect", desc: "Browse mentors, courses & admissions.", icon: Globe, c: "text-emerald-400", bg: "from-emerald-500/15 to-emerald-600/5" },
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
    )
}
