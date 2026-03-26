"use client"

import { Sparkles, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface Service {
    icon: any
    title: string
    desc: string
    href: string
    tag: string
    accent: string
    gradient: string
}

interface ServicesSectionProps {
    services: { ref: any; inView: boolean }
    servicesData: Service[]
}

export function ServicesSection({ services, servicesData }: ServicesSectionProps) {
    return (
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
                    {servicesData.map((service, i) => (
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
    )
}
