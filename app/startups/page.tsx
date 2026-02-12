"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Rocket, Search, Loader2, Users, Code, Megaphone, BarChart3,
  Lightbulb, TrendingUp, ExternalLink, CheckCircle, AlertCircle,
  ArrowRight, Send
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { startupAPI, contactAPI } from "@/lib/api"

const apiBase = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || ""

const SERVICES = [
  { id: "tech", name: "Tech Development", icon: Code, desc: "Web, mobile app, MVP development" },
  { id: "marketing", name: "Marketing", icon: Megaphone, desc: "Digital marketing, branding, SEO" },
  { id: "strategy", name: "Strategy", icon: BarChart3, desc: "Business planning & growth strategy" },
  { id: "design", name: "Design", icon: Lightbulb, desc: "UI/UX, logo, brand identity" },
  { id: "finance", name: "Finance", icon: TrendingUp, desc: "Fundraising, pitch decks, finance" },
  { id: "mentoring", name: "Mentoring", icon: Users, desc: "1-on-1 startup mentoring sessions" },
]

function getStageColor(stage: string): string {
  const m: Record<string, string> = {
    "idea": "bg-yellow-500/10 text-yellow-400",
    "mvp": "bg-blue-500/10 text-blue-400",
    "early-stage": "bg-green-500/10 text-green-400",
    "growth": "bg-purple-500/10 text-purple-400",
    "scaling": "bg-red-500/10 text-red-400",
  }
  return m[stage] || "bg-gray-500/10 text-gray-400"
}

export default function StartupsPage() {
  const [startups, setStartups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [selectedService, setSelectedService] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState({ type: "", text: "" })
  const [serviceForm, setServiceForm] = useState({
    name: "", email: "", phone: "",
    startupName: "", stage: "idea",
    service: "", description: ""
  })

  useEffect(() => { fetchStartups() }, [])

  const fetchStartups = async () => {
    try {
      const data = await startupAPI.getAll()
      setStartups(data.startups || [])
    } catch {} finally { setLoading(false) }
  }

  const filtered = startups.filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.industry?.toLowerCase().includes(search.toLowerCase())
  )

  const openServiceRequest = (serviceId: string) => {
    setSelectedService(serviceId)
    setServiceForm(prev => ({ ...prev, service: serviceId }))
    setFormMsg({ type: "", text: "" })
    setFormOpen(true)
  }

  const handleServiceRequest = async () => {
    setFormLoading(true)
    setFormMsg({ type: "", text: "" })
    try {
      if (!serviceForm.name || !serviceForm.email || !serviceForm.phone || !serviceForm.startupName) {
        setFormMsg({ type: "error", text: "Please fill all required fields" })
        setFormLoading(false)
        return
      }
      await contactAPI.submit({
        name: serviceForm.name,
        email: serviceForm.email,
        phone: serviceForm.phone,
        subject: `Startup Service Request: ${serviceForm.service} - ${serviceForm.startupName}`,
        message: `Startup: ${serviceForm.startupName}\nStage: ${serviceForm.stage}\nService: ${serviceForm.service}\n\n${serviceForm.description}`,
        type: "startup-service"
      })
      setFormMsg({ type: "success", text: "Request submitted! Our team will reach out within 24 hours." })
      setServiceForm({ name: "", email: "", phone: "", startupName: "", stage: "idea", service: selectedService, description: "" })
    } catch (err: any) {
      setFormMsg({ type: "error", text: err.message || "Failed to submit" })
    } finally { setFormLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#060a13]">
      {/* Hero */}
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">Incubation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Startup Incubation</h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                We support startups with Tech, Marketing, Strategy and more. Let us help you build and grow.
              </p>
            </div>
            <Button
              className="bg-white text-black hover:bg-gray-200 font-semibold h-10 text-sm shrink-0"
              onClick={() => openServiceRequest("")}
            >
              Request a Service <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Services We Offer */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h2 className="text-xl lg:text-2xl font-bold mb-6 text-white">Services We Offer to Startups</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {SERVICES.map((service) => (
            <button
              key={service.id}
              onClick={() => openServiceRequest(service.id)}
              className="text-left group"
            >
              <div className="h-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 lg:p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center mb-3 group-hover:bg-white/[0.1] transition-colors">
                  <service.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-white">{service.name}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">{service.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Service Request Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1117] border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-base text-white">Request Startup Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {formMsg.text && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${formMsg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                {formMsg.type === "error" ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                {formMsg.text}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs text-gray-400">Your Name *</Label><Input value={serviceForm.name} onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})} placeholder="Full name" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
              <div><Label className="text-xs text-gray-400">Phone *</Label><Input value={serviceForm.phone} onChange={(e) => setServiceForm({...serviceForm, phone: e.target.value})} placeholder="+91..." className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
            </div>
            <div><Label className="text-xs text-gray-400">Email *</Label><Input type="email" value={serviceForm.email} onChange={(e) => setServiceForm({...serviceForm, email: e.target.value})} placeholder="email@example.com" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
            <div><Label className="text-xs text-gray-400">Startup Name *</Label><Input value={serviceForm.startupName} onChange={(e) => setServiceForm({...serviceForm, startupName: e.target.value})} placeholder="Your startup name" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-400">Startup Stage</Label>
                <Select value={serviceForm.stage} onValueChange={(v) => setServiceForm({...serviceForm, stage: v})}>
                  <SelectTrigger className="h-9 bg-white/[0.04] border-white/[0.08] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0d1117] border-white/[0.08] text-white">
                    <SelectItem value="idea">Idea Stage</SelectItem>
                    <SelectItem value="mvp">MVP</SelectItem>
                    <SelectItem value="early-stage">Early Stage</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="scaling">Scaling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Service Needed</Label>
                <Select value={serviceForm.service} onValueChange={(v) => setServiceForm({...serviceForm, service: v})}>
                  <SelectTrigger className="h-9 bg-white/[0.04] border-white/[0.08] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#0d1117] border-white/[0.08] text-white">
                    {SERVICES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Describe your requirement</Label>
              <Textarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                placeholder="Tell us about your startup and what help you need..."
                rows={3}
                className="text-sm rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <Button onClick={handleServiceRequest} disabled={formLoading} className="w-full bg-white text-black hover:bg-gray-200 h-9 text-sm">
              {formLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Submitting...</> : <><Send className="w-3.5 h-3.5 mr-1.5" /> Submit Request</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Our Startups */}
      <section className="border-t border-white/[0.06] py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-white">Our Startups</h2>
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input placeholder="Search startups..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-orange-400" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-28">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-center mx-auto mb-5">
                <Rocket className="w-16 h-16 text-gray-600" />
              </div>
              <p className="font-semibold text-white text-lg mb-1">No Startups Yet</p>
              <p className="text-sm text-gray-500">Startups will appear here once added.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filtered.map((startup: any) => (
              <Card key={startup._id} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.15] hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold shrink-0">
                      <AvatarImage src={startup.logo ? `${apiBase()}${startup.logo}` : undefined} alt={startup.name} className="object-cover rounded-lg" />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">
                        {startup.name?.charAt(0)?.toUpperCase() || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-white truncate group-hover:text-white transition-colors">{startup.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{startup.industry}</p>
                      {startup.stage && (
                        <Badge className={`mt-1.5 rounded-md text-[10px] px-2 py-0.5 ${getStageColor(startup.stage)}`}>
                          {startup.stage?.replace("-", " ").toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {startup.shortDescription && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{startup.shortDescription}</p>
                  )}

                  {startup.services?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {startup.services.map((s: string, i: number) => (
                        <Badge key={i} className="text-[10px] px-2 py-0.5 rounded-md capitalize bg-white/[0.06] text-gray-400 border-0">{s}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {startup.founder?.name && <span>by {startup.founder.name}</span>}
                    {startup.teamSize && <span><Users className="w-3 h-3 inline mr-0.5" />{startup.teamSize}</span>}
                    {startup.location && <span>{startup.location}</span>}
                  </div>

                  {startup.website && (
                    <a href={startup.website} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Website
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
