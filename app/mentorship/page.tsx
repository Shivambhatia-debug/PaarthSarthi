"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Star, Clock, Users, Search, Globe,
  Loader2, AlertCircle, Calendar, CheckCircle, Sparkles
} from "lucide-react"
import { mentorAPI, meetingAPI } from "@/lib/api"

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [lang, setLang] = useState("all")
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [form, setForm] = useState({
    userName: "", userEmail: "", userPhone: "",
    subject: "", date: ""
  })

  useEffect(() => { fetchMentors() }, [])

  const fetchMentors = async () => {
    try {
      const data = await mentorAPI.getAll("limit=50")
      setMentors(data.mentors || [])
    } catch {} finally { setLoading(false) }
  }

  const filtered = mentors.filter((m) => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.specialization?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
    const matchLang = lang === "all" || m.languages?.includes(lang)
    return matchSearch && matchLang
  })

  const handleBook = async () => {
    setBookingLoading(true)
    setMsg({ type: "", text: "" })
    try {
      if (!form.userName || !form.userEmail || !form.userPhone || !form.subject || !form.date) {
        setMsg({ type: "error", text: "Please fill all required fields" })
        setBookingLoading(false)
        return
      }
      await meetingAPI.book({
        ...form,
        meetingWith: "mentor",
        mentorId: selected?._id,
        timeSlot: { startTime: "10:00", endTime: "10:30" }
      })
      setMsg({ type: "success", text: "Session booked! Admin will confirm shortly." })
      setForm({ userName: "", userEmail: "", userPhone: "", subject: "", date: "" })
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to book" })
    } finally { setBookingLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#060a13]">
      {/* Hero Section */}
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Expert Guidance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Find Your Mentor</h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Connect with industry experts who can guide your career, help you grow, and unlock your full potential.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search mentors or skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-white/[0.04] border-white/[0.08] text-white"><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <p className="text-sm text-gray-500 mb-5">{filtered.length} mentors available</p>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-28">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-center mx-auto mb-5">
              <Users className="w-16 h-16 text-gray-600" />
            </div>
            <p className="font-semibold text-white text-lg mb-1">No Mentors Found</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {mentors.length === 0 ? "Mentors will appear here once added by the admin." : "Try adjusting your search or filters."}
            </p>
          </div>
        )}

        {/* Grid - 1 col mobile, 2 col tablet, 3 col laptop, 4 col wide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((mentor) => (
            <div key={mentor._id} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.15] hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                  {mentor.photo ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${mentor.photo}`} alt={mentor.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : mentor.name?.charAt(0)?.toUpperCase() || "M"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white truncate group-hover:text-white transition-colors">{mentor.name}</h3>
                    {mentor.isAvailable && <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{mentor.designation}</p>
                  {mentor.company && <p className="text-xs text-blue-400 mt-0.5">{mentor.company}</p>}
                </div>
              </div>

              {mentor.specialization?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {mentor.specialization.slice(0, 3).map((s: string, i: number) => (
                    <Badge key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-gray-300 border-0">{s}</Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                {mentor.rating > 0 && (
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {mentor.rating}</span>
                )}
                {mentor.experience > 0 && <span><Clock className="w-3 h-3 inline mr-0.5" />{mentor.experience} yrs</span>}
                {mentor.languages?.length > 0 && (
                  <span><Globe className="w-3 h-3 inline mr-0.5" />{mentor.languages.join(", ")}</span>
                )}
              </div>

              {mentor.sessionPrice > 0 && (
                <p className="text-sm font-bold text-blue-400 mb-4">
                  ₹{mentor.sessionPrice} <span className="font-normal text-xs text-gray-500">/ session</span>
                </p>
              )}

              <Dialog open={bookingOpen && selected?._id === mentor._id} onOpenChange={(open) => {
                setBookingOpen(open)
                if (open) { setSelected(mentor); setMsg({ type: "", text: "" }) }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full bg-white text-black hover:bg-gray-200 h-9 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Book Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm rounded-2xl bg-[#0d1117] border-white/[0.08]">
                  <DialogHeader>
                    <DialogTitle className="text-base text-white">Book Session with {mentor.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    {msg.text && (
                      <div className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${msg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                        {msg.type === "error" ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        {msg.text}
                      </div>
                    )}
                    <div><Label className="text-xs text-gray-400">Name *</Label><Input value={form.userName} onChange={(e) => setForm({...form, userName: e.target.value})} placeholder="Full name" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs text-gray-400">Email *</Label><Input type="email" value={form.userEmail} onChange={(e) => setForm({...form, userEmail: e.target.value})} className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                      <div><Label className="text-xs text-gray-400">Phone *</Label><Input value={form.userPhone} onChange={(e) => setForm({...form, userPhone: e.target.value})} placeholder="+91..." className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                    </div>
                    <div><Label className="text-xs text-gray-400">Subject *</Label><Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="What to discuss?" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                    <div><Label className="text-xs text-gray-400">Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                    <Button onClick={handleBook} disabled={bookingLoading} className="w-full bg-white text-black hover:bg-gray-200 h-9 text-sm">
                      {bookingLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Booking...</> : "Confirm Booking"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
