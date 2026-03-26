"use client"

import { CheckCircle } from "lucide-react"

interface TrustSectionProps {
    trust: { ref: any; inView: boolean }
}

export function TrustSection({ trust }: TrustSectionProps) {
    return (
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
                                        "Admission support for top coaching",
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
    )
}
