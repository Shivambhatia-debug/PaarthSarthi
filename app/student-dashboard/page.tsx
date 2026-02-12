"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar, BookOpen, Users, Rocket, Bell, ChevronRight,
  GraduationCap, Loader2, Clock, LogOut, ExternalLink, Video, Mic, MapPin
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { meetingAPI, mentorAPI, alumniAPI, courseAPI, notificationAPI } from "@/lib/api"

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])
  const [alumni, setAlumni] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("ps_token")
    const userData = localStorage.getItem("ps_user")
    if (!token || !userData) { router.push("/auth/login"); return }
    try { setUser(JSON.parse(userData)) } catch { router.push("/auth/login"); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [meetingsRes, mentorsRes, alumniRes, coursesRes, notifRes] = await Promise.allSettled([
        meetingAPI.getMyMeetings(),
        mentorAPI.getAll("limit=3"),
        alumniAPI.getAll("limit=3"),
        courseAPI.getAll("limit=4"),
        notificationAPI.getAll("limit=5"),
      ])
      if (meetingsRes.status === "fulfilled") setMeetings(meetingsRes.value.meetings || [])
      if (mentorsRes.status === "fulfilled") setMentors(mentorsRes.value.mentors || [])
      if (alumniRes.status === "fulfilled") setAlumni(alumniRes.value.alumni || [])
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value.courses || [])
      if (notifRes.status === "fulfilled") setNotifications(notifRes.value.notifications || [])
    } catch {} finally { setLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem("ps_token")
    localStorage.removeItem("ps_user")
    window.dispatchEvent(new Event("authChange"))
    router.push("/")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#060a13]"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  const cardClass = "bg-white/[0.02] border border-white/[0.06] rounded-xl"

  const upcomingMeetings = meetings.filter(m => m.status === "confirmed" || m.status === "pending")
  const completedMeetings = meetings.filter(m => m.status === "completed")

  return (
    <div className="min-h-screen bg-[#060a13]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg ring-2 ring-blue-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome, {user?.name?.split(" ")[0] || "User"}</h1>
              <p className="text-xs text-gray-400">Your personal dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/[0.06] text-gray-300 border-0 text-xs capitalize">{user?.role}</Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-gray-400 h-7 hover:bg-white/[0.04]">
              <LogOut className="w-3 h-3 mr-1" /> Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {[
            { label: "My Meetings", value: meetings.length, icon: Calendar, color: "text-blue-500", bgColor: "bg-blue-500/10" },
            { label: "Upcoming", value: upcomingMeetings.length, icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
            { label: "Completed", value: completedMeetings.length, icon: GraduationCap, color: "text-green-500", bgColor: "bg-green-500/10" },
            { label: "Notifications", value: notifications.length, icon: Bell, color: "text-violet-500", bgColor: "bg-violet-500/10" },
          ].map((s) => (
            <div key={s.label} className={cardClass}>
              <div className="p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${s.bgColor} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
          {/* Left - Main Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Upcoming Meetings */}
            <div className={cardClass}>
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                  <div className="text-white text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> My Meetings
                  </div>
                  <Link href="/mentorship" className="text-xs text-blue-400 hover:underline">Book New</Link>
                </div>
              </div>
              <div className="px-4 pb-4">
                {meetings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 mx-auto text-gray-500/30 mb-2" />
                    <p className="text-xs text-gray-400 mb-2">No meetings yet</p>
                    <Button size="sm" className="h-7 text-xs bg-white text-black" asChild>
                      <Link href="/mentorship">Book a Session</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {meetings.slice(0, 5).map((m) => (
                      <div key={m._id} className={`p-3 rounded-lg border ${m.status === "confirmed" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.03] border-transparent"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-white">
                              {m.meetingPersonName || "Meeting"}
                            </p>
                            <p className="text-[11px] text-gray-400">{m.subject}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Calendar className="w-3 h-3" />
                                {new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              {m.timeSlot && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  {m.timeSlot.startTime} - {m.timeSlot.endTime}
                                </span>
                              )}
                              <Badge className="text-[9px] bg-white/[0.06] text-gray-400 border-0 capitalize px-1.5 py-0">
                                {m.meetingType === "video" && <Video className="w-2.5 h-2.5 mr-0.5 inline" />}
                                {m.meetingType === "audio" && <Mic className="w-2.5 h-2.5 mr-0.5 inline" />}
                                {m.meetingType === "in-person" && <MapPin className="w-2.5 h-2.5 mr-0.5 inline" />}
                                {m.meetingWith}
                              </Badge>
                            </div>
                            {/* Meeting link for confirmed meetings */}
                            {m.status === "confirmed" && m.meetingLink && (
                              <a
                                href={m.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/30 transition-colors"
                              >
                                <Video className="w-3 h-3" />
                                Join Meeting
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <Badge
                            className={`text-[10px] shrink-0 border-0 ${
                              m.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                              m.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                              m.status === "completed" ? "bg-blue-500/10 text-blue-400" :
                              "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {m.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Mentors */}
            <div className={cardClass}>
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                  <div className="text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" /> Recommended Mentors
                  </div>
                  <Link href="/mentorship" className="text-xs text-blue-400 hover:underline flex items-center gap-0.5">
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <div className="px-4 pb-4">
                {mentors.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No mentors yet</p>
                ) : (
                  <div className="space-y-2">
                    {mentors.map((m) => (
                      <div key={m._id} className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-lg">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                          {m.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate text-white">{m.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{m.designation} {m.company ? `@ ${m.company}` : ""}</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] bg-transparent shrink-0 border-white/[0.08] text-gray-300" asChild>
                          <Link href="/mentorship">Book</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses */}
            <div className={cardClass}>
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                  <div className="text-white text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-500" /> Explore Courses
                  </div>
                  <Link href="/courses" className="text-xs text-blue-400 hover:underline flex items-center gap-0.5">
                    All Courses <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <div className="px-4 pb-4">
                {courses.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No courses yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {courses.map((c) => (
                      <div key={c._id} className="p-3 bg-white/[0.03] rounded-lg">
                        <h4 className="text-xs font-medium line-clamp-2 mb-1 text-white">{c.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/[0.06] text-gray-300 border-0 text-[9px] px-1 py-0 capitalize">{c.language}</Badge>
                          {c.isFree ? (
                            <span className="text-[10px] font-bold text-emerald-500">Free</span>
                          ) : (
                            <span className="text-[10px] font-bold text-white">₹{c.price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className={cardClass}>
              <div className="px-4 pt-4">
                <div className="text-white text-sm border-b border-white/[0.06] pb-3 mb-3">Quick Actions</div>
              </div>
              <div className="px-4 pb-4 space-y-1.5">
                {[
                  { label: "Find a Mentor", href: "/mentorship", icon: Users, color: "text-blue-500" },
                  { label: "Alumni Network", href: "/alumni", icon: GraduationCap, color: "text-violet-500" },
                  { label: "Browse Courses", href: "/courses", icon: BookOpen, color: "text-emerald-500" },
                  { label: "Explore Startups", href: "/startups", icon: Rocket, color: "text-orange-500" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <div className="flex items-center gap-2.5 p-3 rounded-lg hover:bg-white/[0.04] transition-colors">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                      <span className="text-sm font-medium text-white">{action.label}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className={cardClass}>
              <div className="px-4 pt-4">
                <div className="text-white text-sm flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-3">
                  <Bell className="w-4 h-4 text-yellow-500" /> Notifications
                </div>
              </div>
              <div className="px-4 pb-4">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No notifications</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n._id} className={`p-2 rounded-lg text-xs ${n.isRead ? "bg-white/[0.03]" : "bg-blue-500/5 border border-blue-500/10"}`}>
                        <p className="font-medium text-[11px] text-white">{n.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alumni */}
            <div className={cardClass}>
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                  <div className="text-white text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-violet-500" /> Alumni
                  </div>
                  <Link href="/alumni" className="text-xs text-blue-400 hover:underline">View All</Link>
                </div>
              </div>
              <div className="px-4 pb-4">
                {alumni.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No alumni yet</p>
                ) : (
                  <div className="space-y-2">
                    {alumni.map((a) => (
                      <div key={a._id} className="flex items-center gap-2.5 p-2 bg-white/[0.03] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-[10px] font-bold shrink-0">
                          {a.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate text-white">{a.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{a.designation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
