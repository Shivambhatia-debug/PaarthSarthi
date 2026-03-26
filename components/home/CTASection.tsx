"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
    return (
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
    )
}
