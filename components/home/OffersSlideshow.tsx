"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

interface OffersSlideshowProps {
    offers: any[]
}

export function OffersSlideshow({ offers }: OffersSlideshowProps) {
    const [offersCarouselApi, setOffersCarouselApi] = useState<CarouselApi | null>(null)

    const offerImageUrl = (url: string | undefined) => {
        if (!url) return ""
        if (url.startsWith("http")) return url
        const apiHost = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "")
        return apiHost ? `${apiHost}${url.startsWith("/") ? url : "/" + url}` : url
    }

    useEffect(() => {
        if (!offersCarouselApi || offers.length <= 1) return
        const t = setInterval(() => offersCarouselApi.scrollNext(), 2500)
        return () => clearInterval(t)
    }, [offersCarouselApi, offers.length])

    if (offers.length === 0) return null

    return (
        <section className="border-b border-white/[0.06] bg-white/[0.02] py-6 sm:py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <p className="text-center text-xs text-emerald-400 font-medium uppercase tracking-wider mb-4">Offers & Courses</p>
                <Carousel setApi={setOffersCarouselApi} opts={{ loop: true, align: "start" }} className="w-full mx-auto">
                    <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4">
                        {offers.map((o) => (
                            <CarouselItem key={o._id} className="pl-2 sm:pl-3 md:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6 h-full flex flex-col">
                                    <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-white/[0.04]">
                                        {o.imageUrl ? (
                                            <img src={offerImageUrl(o.imageUrl)} alt={o.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No image</div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{o.title}</h3>
                                    {o.subtitle && <p className="text-sm text-gray-400 mb-4 flex-1">{o.subtitle}</p>}
                                    <div className="mt-auto">
                                        <Link href={o.ctaLink || "/admission"}>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                                                {o.ctaText || "Get admission now"}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex -left-2 border-white/10 bg-[#060a13]" />
                    <CarouselNext className="hidden sm:flex -right-2 border-white/10 bg-[#060a13]" />
                </Carousel>
            </div>
        </section>
    )
}
