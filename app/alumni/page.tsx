"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Star, Search, GraduationCap, Briefcase, Calendar,
  Linkedin, Loader2, AlertCircle, CheckCircle
} from "lucide-react"
import { alumniAPI, meetingAPI } from "@/lib/api"

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [form, setForm] = useState({
    userName: "", userEmail: "", userPhone: "",
    subject: "", description: "", date: ""
  })

  useEffect(() => { fetchAlumni() }, [])

  const fetchAlumni = async () => {
    try {
      const data = await alumniAPI.getAll()
      setAlumni(data.alumni || [])
    } catch {} finally { setLoading(false) }
  }

  const filtered = alumni.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.designation?.toLowerCase().includes(search.toLowerCase()) ||
    a.company?.toLowerCase().includes(search.toLowerCase())
  )

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
        meetingWith: "alumni",
        alumniId: selected?._id,
        timeSlot: { startTime: "10:00", endTime: "10:30" }
      })
      setMsg({ type: "success", text: "Meeting booked! Admin will confirm shortly." })
      setForm({ userName: "", userEmail: "", userPhone: "", subject: "", description: "", date: "" })
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to book meeting" })
    } finally { setBookingLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#060a13]">
      {/* Hero */}
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Alumni Network</h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Connect with successful alumni and get career guidance from industry experts who have been where you want to go.
              </p>
            </div>
            <div className="relative sm:w-72 lg:flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name, role, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-violet-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-28">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-center mx-auto mb-5">
              <GraduationCap className="w-16 h-16 text-gray-600" />
            </div>
            <p className="font-semibold text-white text-lg mb-1">No Alumni Found</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {alumni.length === 0 ? "Alumni will appear here once added by the admin." : "No results match your search."}
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((person) => (
            <div key={person._id} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.15] hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                  {person.photo ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${person.photo}`} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    person.name?.charAt(0)?.toUpperCase() || "A"
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-white truncate group-hover:text-white transition-colors">{person.name}</h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{person.designation}</p>
                  {person.company && (
                    <p className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3" /> {person.company}
                    </p>
                  )}
                </div>
              </div>

              {person.bio && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{person.bio}</p>
              )}

              {person.expertise?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {person.expertise.slice(0, 3).map((skill: string, i: number) => (
                    <Badge key={i} className="rounded-md bg-white/[0.06] text-gray-300 border-0 text-[10px] px-2 py-0.5">{skill}</Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                {person.experience > 0 && <span>{person.experience}+ yrs</span>}
                {person.rating > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {person.rating}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {person.isAvailableForMeeting && (
                  <Dialog open={bookingOpen && selected?._id === person._id} onOpenChange={(open) => {
                    setBookingOpen(open)
                    if (open) { setSelected(person); setMsg({ type: "", text: "" }) }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1 bg-white text-black hover:bg-gray-200 h-9 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> Book Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm rounded-2xl bg-[#0d1117] border-white/[0.08]">
                      <DialogHeader>
                        <DialogTitle className="text-base text-white">Book Meeting with {person.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        {msg.text && (
                          <div className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${msg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                            {msg.type === "error" ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {msg.text}
                          </div>
                        )}
                        <div><Label className="text-xs text-gray-300">Name *</Label><Input value={form.userName} onChange={(e) => setForm({...form, userName: e.target.value})} placeholder="Full name" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label className="text-xs text-gray-300">Email *</Label><Input type="email" value={form.userEmail} onChange={(e) => setForm({...form, userEmail: e.target.value})} placeholder="email" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                          <div><Label className="text-xs text-gray-300">Phone *</Label><Input value={form.userPhone} onChange={(e) => setForm({...form, userPhone: e.target.value})} placeholder="+91..." className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                        </div>
                        <div><Label className="text-xs text-gray-300">Subject *</Label><Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Topic" className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                        <div><Label className="text-xs text-gray-300">Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="h-9 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                        <div><Label className="text-xs text-gray-300">Message</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Optional..." rows={2} className="text-sm rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/30" /></div>
                        <Button onClick={handleBook} disabled={bookingLoading} className="w-full bg-white text-black hover:bg-gray-200 h-9 text-sm">
                          {bookingLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Booking...</> : "Confirm Booking"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {person.linkedIn && (
                  <Button variant="outline" size="sm" className="h-9 px-3 bg-white/[0.02] border-white/[0.08] text-gray-300 hover:bg-white/[0.06] hover:text-white" asChild>
                    <a href={person.linkedIn} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
