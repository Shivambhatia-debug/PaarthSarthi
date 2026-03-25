"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, LayoutDashboard, GraduationCap, ImageIcon, Users, BookOpen, Rocket, Calendar, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// --- API & Components ---
import { adminAPI, alumniAPI, mentorAPI, courseAPI, startupAPI, meetingAPI, notificationAPI, contactAPI, admissionAPI, offerAPI, settingsAPI } from "@/lib/api"
import { DashboardOverview } from "@/components/admin/DashboardOverview"
import { AlumniManager } from "@/components/admin/AlumniManager"
import { MentorManager } from "@/components/admin/MentorManager"
import { CourseManager } from "@/components/admin/CourseManager"
import { StartupManager } from "@/components/admin/StartupManager"
import { OfferManager } from "@/components/admin/OfferManager"
import { MeetingManager } from "@/components/admin/MeetingManager"
import { UserManager } from "@/components/admin/UserManager"
import { ContactManager } from "@/components/admin/ContactManager"
import { AdmissionManager } from "@/components/admin/AdmissionManager"

type TabId = "overview" | "alumni" | "admissions" | "offers" | "mentors" | "courses" | "startups" | "meetings" | "users" | "contacts"

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

const TABS: { id: TabId; label: string; icon: any; shortLabel: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, shortLabel: "Home" },
  { id: "alumni", label: "Alumni", icon: GraduationCap, shortLabel: "Alumni" },
  { id: "admissions", label: "Admissions", icon: GraduationCap, shortLabel: "Admissions" },
  { id: "offers", label: "Offers", icon: ImageIcon, shortLabel: "Offers" },
  { id: "mentors", label: "Mentors", icon: Users, shortLabel: "Mentors" },
  { id: "courses", label: "Courses", icon: BookOpen, shortLabel: "Courses" },
  { id: "startups", label: "Startups", icon: Rocket, shortLabel: "Startups" },
  { id: "meetings", label: "Meetings", icon: Calendar, shortLabel: "Meetings" },
  { id: "users", label: "Users", icon: Users, shortLabel: "Users" },
  { id: "contacts", label: "Requests", icon: MessageSquare, shortLabel: "Requests" },
]

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [stats, setStats] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState({ type: "", text: "" })

  // Data Lists
  const [meetings, setMeetings] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [admissions, setAdmissions] = useState<any[]>([])
  const [offerList, setOfferList] = useState<any[]>([])
  const [alumniList, setAlumniList] = useState<any[]>([])
  const [mentorList, setMentorList] = useState<any[]>([])
  const [courseList, setCourseList] = useState<any[]>([])
  const [startupList, setStartupList] = useState<any[]>([])

  // Selection & Editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tickerText, setTickerText] = useState("")
  const [tickerSaving, setTickerSaving] = useState(false)

  // Files
  const [alumniPhoto, setAlumniPhoto] = useState<File | null>(null)
  const [mentorPhoto, setMentorPhoto] = useState<File | null>(null)
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null)
  const [startupLogo, setStartupLogo] = useState<File | null>(null)
  const [offerImage, setOfferImage] = useState<File | null>(null)

  // Forms
  const [alumniForm, setAlumniForm] = useState({ name: "", designation: "", company: "", email: "", phone: "", bio: "", expertise: "", experience: 0, isAvailableForMeeting: true })
  const [mentorForm, setMentorForm] = useState({ name: "", designation: "", company: "", email: "", phone: "", bio: "", specialization: "", languages: "Hindi,English", sessionPrice: 0, experience: 0 })
  const [courseForm, setCourseForm] = useState({ title: "", description: "", shortDescription: "", category: "career-guidance", language: "hindi", level: "beginner", price: 0, instructorName: "", isPublished: true })
  const [startupForm, setStartupForm] = useState({ name: "", description: "", shortDescription: "", industry: "", stage: "idea", services: "", founderName: "", location: "" })
  const [offerForm, setOfferForm] = useState({ title: "", subtitle: "", imageUrl: "", ctaText: "Get admission now", ctaLink: "/admission", order: 0, isActive: true })

  // --- Auth & Init ---
  useEffect(() => {
    const userStr = localStorage.getItem("ps_user")
    if (!userStr) { router.push("/auth/login"); return }
    const user = JSON.parse(userStr)
    if (user.role !== "admin") { router.push("/"); return }
    fetchAll()
  }, [])

  useEffect(() => {
    if (activeTab === "alumni") fetchAlumniList()
    if (activeTab === "admissions") fetchAdmissions()
    if (activeTab === "offers") { fetchOffers(); settingsAPI.getTicker().then(r => setTickerText(r.ticker || "")) }
    if (activeTab === "mentors") fetchMentorList()
    if (activeTab === "courses") fetchCourseList()
    if (activeTab === "startups") fetchStartupList()
  }, [activeTab])

  // --- Fetchers ---
  const fetchAll = () => {
    fetchDashboard(); fetchMeetings(); fetchNotifications(); fetchUsers(); fetchContacts()
  }
  const fetchDashboard = async () => { try { const d = await adminAPI.getDashboard(); setStats(d.stats) } finally { setLoading(false) } }
  const fetchAdmissions = async () => { const d = await admissionAPI.getAll("limit=100"); setAdmissions(d.admissions || []) }
  const fetchOffers = async () => { const d = await offerAPI.getAll(); setOfferList(d.offers || []) }
  const fetchMeetings = async () => { const d = await meetingAPI.getAll("limit=50"); setMeetings(d.meetings || []) }
  const fetchNotifications = async () => { const d = await notificationAPI.getAll("limit=20"); setNotifications(d.notifications || []) }
  const fetchUsers = async () => { const d = await adminAPI.getUsers("limit=100"); setUsers(d.users || []) }
  const fetchContacts = async () => { const d = await contactAPI.getAll("limit=50"); setContacts(d.contacts || []) }
  const fetchAlumniList = async () => { const d = await alumniAPI.getAll("limit=50"); setAlumniList(d.alumni || []) }
  const fetchMentorList = async () => { const d = await mentorAPI.getAll("limit=50"); setMentorList(d.mentors || []) }
  const fetchCourseList = async () => { const d = await courseAPI.getAll("limit=50"); setCourseList(d.courses || []) }
  const fetchStartupList = async () => { const d = await startupAPI.getAll("limit=50"); setStartupList(d.startups || []) }

  // --- Helpers ---
  const getImageUrl = (path: string | undefined) => path ? (path.startsWith("http") ? path : `${API_HOST}${path}`) : null
  const safeParse = (val: any): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val.map(v => String(v).replace(/[\[\]"']/g, '').trim()).filter(Boolean)
    if (typeof val === 'string') {
      if (val.startsWith('[')) try { const p = JSON.parse(val); if (Array.isArray(p)) return p } catch { }
      return val.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
  }

  // --- Handlers ---
  const handleSaveAlumni = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      const fd = new FormData(); Object.entries(alumniForm).forEach(([k, v]) => {
        if (k === "expertise") fd.append(k, JSON.stringify((v as string).split(",").map(s => s.trim()).filter(Boolean)))
        else fd.append(k, String(v))
      })
      if (alumniPhoto) fd.append("photo", alumniPhoto)
      if (editingId) await alumniAPI.update(editingId, fd)
      else await alumniAPI.create(fd)
      setFormMsg({ type: "success", text: `Alumni ${editingId ? 'updated' : 'added'}!` })
      cancelEdit(); fetchAlumniList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) } finally { setFormLoading(false) }
  }

  const handleSaveMentor = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      const fd = new FormData(); Object.entries(mentorForm).forEach(([k, v]) => {
        if (k === "specialization" || k === "languages") fd.append(k, JSON.stringify((v as string).split(",").map(s => s.trim()).filter(Boolean)))
        else fd.append(k, String(v))
      })
      if (mentorPhoto) fd.append("photo", mentorPhoto)
      if (editingId) await mentorAPI.update(editingId, fd)
      else await mentorAPI.create(fd)
      setFormMsg({ type: "success", text: `Mentor ${editingId ? 'updated' : 'added'}!` })
      cancelEdit(); fetchMentorList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) } finally { setFormLoading(false) }
  }

  const handleSaveCourse = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      const fd = new FormData(); Object.entries(courseForm).forEach(([k, v]) => fd.append(k, String(v)))
      if (courseThumbnail) fd.append("thumbnail", courseThumbnail)
      if (editingId) await courseAPI.update(editingId, fd)
      else await courseAPI.create(fd)
      setFormMsg({ type: "success", text: `Course ${editingId ? 'updated' : 'created'}!` })
      cancelEdit(); fetchCourseList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) } finally { setFormLoading(false) }
  }

  const handleSaveStartup = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      const fd = new FormData()
      fd.append("name", startupForm.name); fd.append("industry", startupForm.industry); fd.append("stage", startupForm.stage)
      fd.append("description", startupForm.description); fd.append("shortDescription", startupForm.shortDescription)
      fd.append("location", startupForm.location)
      if (startupForm.services) fd.append("services", JSON.stringify(startupForm.services.split(",").map(s => s.trim()).filter(Boolean)))
      if (startupForm.founderName) fd.append("founder", JSON.stringify({ name: startupForm.founderName }))
      if (startupLogo) fd.append("logo", startupLogo)
      if (editingId) await startupAPI.update(editingId, fd)
      else await startupAPI.create(fd)
      setFormMsg({ type: "success", text: `Startup ${editingId ? 'updated' : 'added'}!` })
      cancelEdit(); fetchStartupList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) } finally { setFormLoading(false) }
  }

  const handleSaveOffer = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      const fd = new FormData()
      fd.append('title', offerForm.title); fd.append('subtitle', offerForm.subtitle)
      fd.append('ctaText', offerForm.ctaText); fd.append('ctaLink', offerForm.ctaLink)
      fd.append('order', String(offerForm.order)); fd.append('isActive', String(offerForm.isActive))
      if (offerImage) fd.append('image', offerImage)
      else if (offerForm.imageUrl) fd.append('imageUrl', offerForm.imageUrl)

      if (editingId) await offerAPI.update(editingId, fd)
      else await offerAPI.create(fd)
      setFormMsg({ type: "success", text: `Offer ${editingId ? 'updated' : 'added'}!` })
      cancelEdit(); fetchOffers()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) } finally { setFormLoading(false) }
  }

  const handleDeleteEntity = async (type: string, id: string) => {
    if (!confirm(`Delete this ${type}?`)) return
    try {
      if (type === "alumni") await alumniAPI.delete(id)
      if (type === "mentor") await mentorAPI.delete(id)
      if (type === "course") await courseAPI.delete(id)
      if (type === "startup") await startupAPI.delete(id)
      if (type === "offer") await offerAPI.delete(id)
      if (type === "user") await adminAPI.deleteUser(id)
      if (type === "admission") await admissionAPI.delete(id)
      setFormMsg({ type: "success", text: `${type} deleted` })
      fetchAll(); if (type === "alumni") fetchAlumniList(); if (type === "mentor") fetchMentorList(); if (type === "course") fetchCourseList(); if (type === "startup") fetchStartupList(); if (type === "offer") fetchOffers(); if (type === "admission") fetchAdmissions()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setAlumniForm({ name: "", designation: "", company: "", email: "", phone: "", bio: "", expertise: "", experience: 0, isAvailableForMeeting: true }); setAlumniPhoto(null)
    setMentorForm({ name: "", designation: "", company: "", email: "", phone: "", bio: "", specialization: "", languages: "Hindi,English", sessionPrice: 0, experience: 0 }); setMentorPhoto(null)
    setCourseForm({ title: "", description: "", shortDescription: "", category: "career-guidance", language: "hindi", level: "beginner", price: 0, instructorName: "", isPublished: true }); setCourseThumbnail(null)
    setStartupForm({ name: "", description: "", shortDescription: "", industry: "", stage: "idea", services: "", founderName: "", location: "" }); setStartupLogo(null)
    setOfferForm({ title: "", subtitle: "", imageUrl: "", ctaText: "Get admission now", ctaLink: "/admission", order: 0, isActive: true }); setOfferImage(null)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#060a13]"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>

  return (
    <div className="min-h-screen bg-[#060a13]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#060a13] via-[#060a13] to-transparent backdrop-blur-xl border-b border-white/[0.06] sticky top-14 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div><h1 className="text-lg lg:text-xl font-bold text-white">Admin Dashboard</h1></div>
            <Button variant="outline" size="sm" onClick={fetchAll} className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]"><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setFormMsg({ type: "", text: "" }); cancelEdit() }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${activeTab === tab.id ? "bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.1)]" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}`}>
                <tab.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        {formMsg.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${formMsg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
            {formMsg.type === "error" ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}{formMsg.text}
          </div>
        )}

        {activeTab === "overview" && (
          <DashboardOverview
            stats={stats}
            pendingMeetings={meetings.filter(m => m.status === "pending")}
            notifications={notifications}
            onAcceptMeeting={(m) => { setActiveTab("meetings") }}
            onCancelMeeting={(id) => handleDeleteEntity("meeting", id)}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === "alumni" && (
          <AlumniManager
            alumniList={alumniList} form={alumniForm} onFormChange={setAlumniForm} onPhotoChange={setAlumniPhoto}
            onSave={handleSaveAlumni} onDelete={(id) => handleDeleteEntity("alumni", id)} onCancelEdit={cancelEdit}
            onEdit={(a) => { setEditingId(a._id); setAlumniForm({ ...a, expertise: safeParse(a.expertise).join(", ") }) }}
            editingId={editingId} loading={formLoading} getImageUrl={getImageUrl} getEditingPhoto={() => alumniList.find(a => a._id === editingId)?.photo}
          />
        )}

        {activeTab === "mentors" && (
          <MentorManager
            mentorList={mentorList} form={mentorForm} onFormChange={setMentorForm} onPhotoChange={setMentorPhoto}
            onSave={handleSaveMentor} onDelete={(id) => handleDeleteEntity("mentor", id)} onCancelEdit={cancelEdit}
            onEdit={(m) => { setEditingId(m._id); setMentorForm({ ...m, specialization: safeParse(m.specialization).join(", "), languages: safeParse(m.languages).join(", ") }) }}
            editingId={editingId} loading={formLoading} getImageUrl={getImageUrl} getEditingPhoto={() => mentorList.find(m => m._id === editingId)?.photo}
          />
        )}

        {activeTab === "courses" && (
          <CourseManager
            courseList={courseList} form={courseForm} onFormChange={setCourseForm} onThumbnailChange={setCourseThumbnail}
            onSave={handleSaveCourse} onDelete={(id) => handleDeleteEntity("course", id)} onCancelEdit={cancelEdit}
            onEdit={(c) => { setEditingId(c._id); setCourseForm({ ...c }) }}
            editingId={editingId} loading={formLoading} getImageUrl={getImageUrl} getEditingThumbnail={() => courseList.find(c => c._id === editingId)?.thumbnail}
          />
        )}

        {activeTab === "startups" && (
          <StartupManager
            startupList={startupList} form={startupForm} onFormChange={setStartupForm} onLogoChange={setStartupLogo}
            onSave={handleSaveStartup} onDelete={(id) => handleDeleteEntity("startup", id)} onCancelEdit={cancelEdit}
            onEdit={(s) => { setEditingId(s._id); setStartupForm({ ...s, services: safeParse(s.services).join(", "), founderName: s.founder?.name || "" }) }}
            editingId={editingId} loading={formLoading} getImageUrl={getImageUrl} getEditingLogo={() => startupList.find(s => s._id === editingId)?.logo}
          />
        )}

        {activeTab === "offers" && (
          <OfferManager
            offers={offerList} form={offerForm} onFormChange={setOfferForm} onImageChange={setOfferImage}
            onSave={handleSaveOffer} onDelete={(id) => handleDeleteEntity("offer", id)} onCancelEdit={cancelEdit}
            onEdit={(o) => { setEditingId(o._id); setOfferForm({ ...o }) }}
            onDuplicate={async (o) => { await offerAPI.create({ ...o, _id: undefined }); fetchOffers() }}
            editingId={editingId} loading={formLoading} getImageUrl={getImageUrl}
            tickerText={tickerText} onTickerChange={setTickerText} tickerSaving={tickerSaving} onTickerSave={async () => { setTickerSaving(true); await settingsAPI.updateTicker(tickerText); setTickerSaving(false) }}
          />
        )}

        {activeTab === "meetings" && (
          <MeetingManager
            meetings={meetings} onCancel={(id) => handleDeleteEntity("meeting", id)}
            onAccept={() => { }} onView={() => { }}
            onSaveLink={async (m, l) => { await meetingAPI.updateStatus(m._id, { meetingLink: l || undefined }); fetchMeetings() }}
            onConfirm={async (m, l) => { await meetingAPI.updateStatus(m._id, { status: "confirmed", meetingLink: l || undefined }); fetchMeetings() }}
          />
        )}

        {activeTab === "users" && <UserManager users={users} onDelete={(id) => handleDeleteEntity("user", id)} />}

        {activeTab === "contacts" && <ContactManager contacts={contacts} updateStatus={async (id, s) => { await contactAPI.update(id, { status: s }); fetchContacts() }} />}

        {activeTab === "admissions" && <AdmissionManager admissions={admissions} onDelete={(id) => handleDeleteEntity("admission", id)} updateStatus={async (id, s) => { await admissionAPI.update(id, { status: s }); fetchAdmissions() }} />}
      </div>
    </div>
  )
}
