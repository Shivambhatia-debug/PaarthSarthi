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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mentorAPI, meetingAPI } from "@/lib/api"

const apiBase = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || ""

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [lang, setLang] = useState("all")
  const [bookingOpen, setBookingOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
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
    } catch { } finally { setLoading(false) }
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

  const safeParseArray = (val: any): string[] => {
    if (!val) return []
    if (Array.isArray(val)) {
      // If it's already a clean array of strings, return it
      if (val.length > 0 && val.every(v => typeof v === 'string' && !v.startsWith('[') && !v.includes('"'))) {
        return val
      }
      // Try to fix fragmented JSON in array
      try {
        const joined = val.join(',')
        if (joined.startsWith('[') && joined.endsWith(']')) {
          const parsed = JSON.parse(joined)
          if (Array.isArray(parsed)) return parsed
        }
      } catch { }
      // Handle single stringified array
      if (val.length === 1 && typeof val[0] === 'string' && val[0].startsWith('[')) {
        try {
          const parsed = JSON.parse(val[0])
          if (Array.isArray(parsed)) return parsed
        } catch { }
      }
      // Fallback: cleanup strings
      return val.map(v => String(v).replace(/[\[\]"']/g, '').trim()).filter(Boolean)
    }
    if (typeof val === 'string') {
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed
          if (typeof parsed === 'string') return safeParseArray(parsed)
        } catch { }
      }
      return val.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
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
          {filtered.map((mentor) => {
            const specializations = safeParseArray(mentor.specialization)
            const languages = safeParseArray(mentor.languages)

            return (
              <div
                key={mentor._id}
                onClick={() => { setSelected(mentor); setDetailsOpen(true) }}
                className="group flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 hover:border-blue-500/40 hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-4 mb-5 relative">
                  <Avatar className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-0.5 shrink-0 transition-transform group-hover:scale-105">
                    <AvatarImage src={mentor.photo ? (mentor.photo.startsWith("http") ? mentor.photo : `${apiBase()}${mentor.photo}`) : undefined} alt={mentor.name} className="object-cover rounded-[10px]" />
                    <AvatarFallback className="rounded-[10px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-lg">
                      {mentor.name?.split(/\s+/).map((s: string) => s[0]).join("").slice(0, 2).toUpperCase() || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white truncate leading-tight">{mentor.name}</h3>
                      {mentor.isAvailable && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-blue-400 mt-1 truncate">{mentor.designation}</p>
                    {mentor.company && <p className="text-[11px] text-gray-500 mt-0.5 truncate uppercase tracking-wider font-medium">{mentor.company}</p>}
                  </div>
                </div>

                {specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 relative">
                    {specializations.slice(0, 4).map((s: string, i: number) => (
                      <Badge key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-400 border border-white/[0.05] group-hover:border-white/[0.1] transition-colors">{s}</Badge>
                    ))}
                    {specializations.length > 4 && (
                      <span className="text-[10px] text-gray-600 font-medium self-center ml-0.5 text-nowrap">+{specializations.length - 4} more</span>
                    )}
                  </div>
                )}

                {mentor.bio && (
                  <p className="text-xs text-gray-500 mb-5 line-clamp-2 leading-relaxed border-t border-white/[0.06] pt-4 relative italic opacity-80 group-hover:opacity-100 transition-opacity">
                    "{mentor.bio}"
                  </p>
                )}

                <div className="mt-auto relative pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      {mentor.rating > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-yellow-500/90"><Star className="w-3 h-3 fill-yellow-500" /> {mentor.rating}</span>
                      )}
                      <span><Clock className="w-3 h-3 inline mr-1 opacity-70" />{mentor.experience}Y+</span>
                    </div>
                    {mentor.sessionPrice > 0 && (
                      <span className="text-xs font-bold text-white">₹{mentor.sessionPrice}</span>
                    )}
                  </div>

                  <Dialog open={bookingOpen && selected?._id === mentor._id} onOpenChange={(open) => {
                    setBookingOpen(open)
                    if (open) { setSelected(mentor); setMsg({ type: "", text: "" }) }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="w-full bg-white/[0.05] text-white hover:bg-white hover:text-black border border-white/[0.1] h-9 text-xs font-semibold rounded-xl transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <Calendar className="w-3.5 h-3.5 mr-2" /> Book a Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm rounded-2xl bg-[#0d1117] border-white/[0.08] shadow-2xl backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="text-base text-white">Book Session with {mentor.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        {msg.text && (
                          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${msg.type === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
                            {msg.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            {msg.text}
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold ml-1">Full Name</Label>
                          <Input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} placeholder="John Doe" className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/30" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold ml-1">Email</Label>
                            <Input type="email" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} placeholder="john@example.com" className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/30" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold ml-1">Phone</Label>
                            <Input value={form.userPhone} onChange={(e) => setForm({ ...form, userPhone: e.target.value })} placeholder="+91..." className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/30" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold ml-1">Subject</Label>
                          <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Project discussion..." className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/30" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold ml-1">Date</Label>
                          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-white focus:ring-1 focus:ring-blue-500/30 [color-scheme:dark]" />
                        </div>
                        <Button onClick={handleBook} disabled={bookingLoading} className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 text-sm font-bold rounded-xl mt-2 shadow-lg shadow-blue-600/20">
                          {bookingLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : "Confirm Booking"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] bg-[#0d1117] border-white/[0.08] p-0 shadow-3xl">
          {selected && (
            <div className="flex flex-col relative">
              <DialogHeader className="sr-only">
                <DialogTitle>Details of {selected.name}</DialogTitle>
              </DialogHeader>

              {/* Header/Cover Area */}
              <div className="relative h-40 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_70%)]" />
                <div className="absolute -bottom-14 left-8">
                  <Avatar className="w-28 h-28 rounded-2xl border-4 border-[#0d1117] bg-[#1a1f26] shadow-2xl">
                    <AvatarImage src={selected.photo ? (selected.photo.startsWith("http") ? selected.photo : `${apiBase()}${selected.photo}`) : undefined} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {selected.name?.split(/\s+/).map((s: string) => s[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="px-8 pt-16 pb-8">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selected.name}</h2>
                  {selected.isAvailable && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Available Now</Badge>
                  )}
                </div>
                <p className="text-blue-400 font-semibold text-lg">{selected.designation}</p>
                {selected.company && <p className="text-gray-400 text-sm font-medium mt-1">{selected.company}</p>}

                <div className="grid grid-cols-3 gap-4 mt-8 py-6 border-y border-white/[0.06]">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Experience</span>
                    <span className="text-base text-white font-bold mt-1">{selected.experience}Y+</span>
                  </div>
                  <div className="flex flex-col border-l border-white/[0.06] pl-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Rating</span>
                    <span className="text-base text-white font-bold mt-1 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {selected.rating || "5.0"}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-white/[0.06] pl-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Price</span>
                    <span className="text-base text-white font-bold mt-1">₹{selected.sessionPrice || "Free"}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> About Mentor
                  </h3>
                  <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.05]">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                      "{selected.bio || "No bio information provided."}"
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Core Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {safeParseArray(selected.specialization).map((s: string, i: number) => (
                      <Badge key={i} className="bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1 text-[11px] rounded-lg">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Communication
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.05]">
                    {safeParseArray(selected.languages).map((l, i) => (
                      <span key={i} className="flex items-center gap-1.5 font-medium">
                        {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-700" />}
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-10">
                  <Button
                    onClick={() => { setDetailsOpen(false); setBookingOpen(true) }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 text-lg rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    Confirm & Book Session
                  </Button>
                  <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-tighter font-medium">Session duration is 30 minutes unless specified otherwise</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
