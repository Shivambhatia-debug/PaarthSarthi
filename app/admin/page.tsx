"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Users, Plus, Loader2, GraduationCap, BookOpen, Rocket, Calendar,
  Bell, CheckCircle, RefreshCw, AlertTriangle, LayoutDashboard,
  ChevronRight, Phone, Mail, Clock, MessageSquare, Trash2, Eye,
  Pencil, X, Camera, ExternalLink, ImageIcon, CopyPlus
} from "lucide-react"
import { useRouter } from "next/navigation"
import { adminAPI, alumniAPI, mentorAPI, courseAPI, startupAPI, meetingAPI, notificationAPI, contactAPI, admissionAPI, offerAPI, settingsAPI } from "@/lib/api"

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
  const [stats, setStats] = useState<any>(null)
  const [meetings, setMeetings] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [admissions, setAdmissions] = useState<any[]>([])
  const [offerList, setOfferList] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  // Entity lists for split-panel
  const [alumniList, setAlumniList] = useState<any[]>([])
  const [mentorList, setMentorList] = useState<any[]>([])
  const [courseList, setCourseList] = useState<any[]>([])
  const [startupList, setStartupList] = useState<any[]>([])

  // Editing IDs (null = add mode, string = edit mode)
  const [editingAlumniId, setEditingAlumniId] = useState<string | null>(null)
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [editingStartupId, setEditingStartupId] = useState<string | null>(null)

  // File upload states
  const [alumniPhoto, setAlumniPhoto] = useState<File | null>(null)
  const [mentorPhoto, setMentorPhoto] = useState<File | null>(null)
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null)
  const [startupLogo, setStartupLogo] = useState<File | null>(null)

  // Meeting accept modal
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  const [meetingLinkInput, setMeetingLinkInput] = useState("")

  // User detail modal (click on user row)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  // Admission detail modal (click on admission row)
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null)

  // Form states
  const [alumniForm, setAlumniForm] = useState({
    name: "", designation: "", company: "", email: "", phone: "",
    bio: "", expertise: "", experience: 0, isAvailableForMeeting: true
  })
  const [mentorForm, setMentorForm] = useState({
    name: "", designation: "", company: "", email: "", phone: "",
    bio: "", specialization: "", languages: "Hindi,English",
    sessionPrice: 0, experience: 0
  })
  const [courseForm, setCourseForm] = useState({
    title: "", description: "", shortDescription: "",
    category: "career-guidance", language: "hindi",
    level: "beginner", price: 0, instructorName: "", isPublished: true
  })
  const [startupForm, setStartupForm] = useState({
    name: "", description: "", shortDescription: "", industry: "",
    stage: "idea", services: "", founderName: "", location: ""
  })
  const [offerForm, setOfferForm] = useState({
    title: "", subtitle: "", imageUrl: "", ctaText: "Get admission now", ctaLink: "/admission", order: 0, isActive: true
  })
  const [offerImage, setOfferImage] = useState<File | null>(null)
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null)
  const [tickerText, setTickerText] = useState("")
  const [tickerSaving, setTickerSaving] = useState(false)

  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState({ type: "", text: "" })

  // ==================== AUTH & INIT ====================
  useEffect(() => {
    const user = localStorage.getItem("ps_user")
    if (!user) { router.push("/auth/login"); return }
    const parsed = JSON.parse(user)
    if (parsed.role !== "admin") { router.push("/"); return }
    fetchAll()
  }, [])

  // Fetch entity lists when tab changes
  useEffect(() => {
    if (activeTab === "alumni") fetchAlumniList()
    if (activeTab === "admissions") fetchAdmissions()
    if (activeTab === "offers") { fetchOffers(); settingsAPI.getTicker().then((r) => setTickerText(r.ticker || "")).catch(() => {}) }
    if (activeTab === "mentors") fetchMentorList()
    if (activeTab === "courses") fetchCourseList()
    if (activeTab === "startups") fetchStartupList()
  }, [activeTab])

  // ==================== FETCH FUNCTIONS ====================
  const fetchAll = () => {
    fetchDashboard(); fetchMeetings(); fetchNotifications(); fetchUsers(); fetchContacts()
  }

  const fetchDashboard = async () => {
    try { const data = await adminAPI.getDashboard(); setStats(data.stats) }
    catch {} finally { setLoading(false) }
  }

  const fetchAdmissions = async () => {
    try { const data = await admissionAPI.getAll("limit=100"); setAdmissions(data.admissions || []) } catch {}
  }

  const fetchOffers = async () => {
    try { const data = await offerAPI.getAll(); setOfferList(data.offers || []) } catch {}
  }
  const fetchMeetings = async () => {
    try { const data = await meetingAPI.getAll("limit=50"); setMeetings(data.meetings || []) } catch {}
  }
  const fetchNotifications = async () => {
    try { const data = await notificationAPI.getAll("limit=20"); setNotifications(data.notifications || []) } catch {}
  }
  const fetchUsers = async () => {
    try { const data = await adminAPI.getUsers("limit=100"); setUsers(data.users || []) } catch {}
  }
  const fetchContacts = async () => {
    try { const data = await contactAPI.getAll("limit=50"); setContacts(data.contacts || []) } catch {}
  }
  const fetchAlumniList = async () => {
    try { const data = await alumniAPI.getAll("limit=50"); setAlumniList(data.alumni || []) } catch {}
  }
  const fetchMentorList = async () => {
    try { const data = await mentorAPI.getAll("limit=50"); setMentorList(data.mentors || []) } catch {}
  }
  const fetchCourseList = async () => {
    try { const data = await courseAPI.getAll("limit=50"); setCourseList(data.courses || []) } catch {}
  }
  const fetchStartupList = async () => {
    try { const data = await startupAPI.getAll("limit=50"); setStartupList(data.startups || []) } catch {}
  }

  // ==================== MEETING HANDLERS ====================
  const handleStartAcceptMeeting = (meeting: any) => {
    setSelectedMeeting(meeting)
    setMeetingLinkInput("")
    setShowMeetingModal(true)
  }

  const handleConfirmMeeting = async () => {
    if (!selectedMeeting) return
    try {
      await meetingAPI.updateStatus(selectedMeeting._id, {
        status: "confirmed",
        meetingLink: meetingLinkInput || undefined
      })
      setShowMeetingModal(false)
      setSelectedMeeting(null)
      setMeetingLinkInput("")
      fetchMeetings()
      fetchDashboard()
      setFormMsg({ type: "success", text: "Meeting confirmed!" })
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }

  const handleCancelMeeting = async (id: string) => {
    try { await meetingAPI.updateStatus(id, { status: "cancelled" }); fetchMeetings(); fetchDashboard() } catch {}
  }

  const openMeetingDetail = (meeting: any) => {
    setSelectedMeeting(meeting)
    setMeetingLinkInput(meeting.meetingLink || "")
    setShowMeetingModal(true)
  }

  const handleSaveMeetingLinkOnly = async () => {
    if (!selectedMeeting) return
    try {
      await meetingAPI.updateStatus(selectedMeeting._id, { meetingLink: meetingLinkInput || undefined })
      setFormMsg({ type: "success", text: "Meeting link saved!" })
      fetchMeetings()
      setSelectedMeeting((prev) => prev ? { ...prev, meetingLink: meetingLinkInput || undefined } : null)
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try { await adminAPI.deleteUser(id); fetchUsers(); fetchDashboard() } catch {}
  }

  const updateContact = async (id: string, status: string) => {
    try { await contactAPI.update(id, { status }); fetchContacts() } catch {}
  }

  const updateAdmissionStatus = async (id: string, status: string) => {
    try { await admissionAPI.update(id, { status }); fetchAdmissions() } catch {}
  }
  const deleteAdmissionById = async (id: string) => {
    if (!confirm("Delete this admission request? This cannot be undone.")) return
    try { await admissionAPI.delete(id); fetchAdmissions(); setSelectedAdmission(null) } catch {}
  }

  const saveOffer = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      const useFormData = !!offerImage
      const payload = useFormData
        ? (() => {
            const fd = new FormData()
            fd.append('title', offerForm.title)
            fd.append('subtitle', offerForm.subtitle)
            fd.append('ctaText', offerForm.ctaText)
            fd.append('ctaLink', offerForm.ctaLink)
            fd.append('order', String(offerForm.order))
            fd.append('isActive', String(offerForm.isActive))
            if (offerForm.imageUrl && !offerImage) fd.append('imageUrl', offerForm.imageUrl)
            if (offerImage) fd.append('image', offerImage)
            return fd
          })()
        : offerForm
      if (editingOfferId) {
        await offerAPI.update(editingOfferId, payload)
        setFormMsg({ type: "success", text: "Offer updated" })
      } else {
        await offerAPI.create(payload)
        setFormMsg({ type: "success", text: "Offer added" })
      }
      setOfferForm({ title: "", subtitle: "", imageUrl: "", ctaText: "Get admission now", ctaLink: "/admission", order: 0, isActive: true })
      setOfferImage(null); setEditingOfferId(null); fetchOffers()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
    finally { setFormLoading(false) }
  }
  const deleteOfferById = async (id: string) => {
    if (!confirm("Delete this offer?")) return
    try { await offerAPI.delete(id); fetchOffers(); setEditingOfferId(null) } catch {}
  }
  const duplicateOffer = async (o: any) => {
    try {
      await offerAPI.create({
        title: o.title,
        subtitle: o.subtitle ?? "",
        imageUrl: o.imageUrl ?? "",
        ctaText: o.ctaText ?? "Get admission now",
        ctaLink: o.ctaLink ?? "/admission",
        order: o.order ?? 0,
        isActive: o.isActive !== false
      })
      setFormMsg({ type: "success", text: "Offer duplicated" })
      fetchOffers()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }
  const startEditOffer = (o: any) => {
    setEditingOfferId(o._id)
    setOfferForm({ title: o.title || "", subtitle: o.subtitle || "", imageUrl: o.imageUrl || "", ctaText: o.ctaText || "Get admission now", ctaLink: o.ctaLink || "/admission", order: o.order || 0, isActive: o.isActive !== false })
    setOfferImage(null)
  }
  const saveTicker = async () => {
    setTickerSaving(true)
    try { await settingsAPI.updateTicker(tickerText); setFormMsg({ type: "success", text: "Ticker text updated" }) } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
    finally { setTickerSaving(false) }
  }

  // ==================== EDIT HELPERS ====================
  const startEditAlumni = (a: any) => {
    setEditingAlumniId(a._id)
    setAlumniForm({
      name: a.name || "", designation: a.designation || "", company: a.company || "",
      email: a.email || "", phone: a.phone || "", bio: a.bio || "",
      expertise: Array.isArray(a.expertise) ? a.expertise.join(", ") : (a.expertise || ""),
      experience: a.experience || 0, isAvailableForMeeting: a.isAvailableForMeeting !== false
    })
    setAlumniPhoto(null)
  }
  const cancelEditAlumni = () => {
    setEditingAlumniId(null)
    setAlumniForm({ name: "", designation: "", company: "", email: "", phone: "", bio: "", expertise: "", experience: 0, isAvailableForMeeting: true })
    setAlumniPhoto(null)
  }

  const startEditMentor = (m: any) => {
    setEditingMentorId(m._id)
    setMentorForm({
      name: m.name || "", designation: m.designation || "", company: m.company || "",
      email: m.email || "", phone: m.phone || "", bio: m.bio || "",
      specialization: Array.isArray(m.specialization) ? m.specialization.join(", ") : (m.specialization || ""),
      languages: Array.isArray(m.languages) ? m.languages.join(", ") : (m.languages || "Hindi,English"),
      sessionPrice: m.sessionPrice || 0, experience: m.experience || 0
    })
    setMentorPhoto(null)
  }
  const cancelEditMentor = () => {
    setEditingMentorId(null)
    setMentorForm({ name: "", designation: "", company: "", email: "", phone: "", bio: "", specialization: "", languages: "Hindi,English", sessionPrice: 0, experience: 0 })
    setMentorPhoto(null)
  }

  const startEditCourse = (c: any) => {
    setEditingCourseId(c._id)
    setCourseForm({
      title: c.title || "", description: c.description || "", shortDescription: c.shortDescription || "",
      category: c.category || "career-guidance", language: c.language || "hindi",
      level: c.level || "beginner", price: c.price || 0,
      instructorName: c.instructorName || "", isPublished: c.isPublished !== false
    })
    setCourseThumbnail(null)
  }
  const cancelEditCourse = () => {
    setEditingCourseId(null)
    setCourseForm({ title: "", description: "", shortDescription: "", category: "career-guidance", language: "hindi", level: "beginner", price: 0, instructorName: "", isPublished: true })
    setCourseThumbnail(null)
  }

  const startEditStartup = (s: any) => {
    setEditingStartupId(s._id)
    setStartupForm({
      name: s.name || "", description: s.description || "", shortDescription: s.shortDescription || "",
      industry: s.industry || "", stage: s.stage || "idea",
      services: Array.isArray(s.services) ? s.services.join(", ") : (s.services || ""),
      founderName: s.founder?.name || "", location: s.location || ""
    })
    setStartupLogo(null)
  }
  const cancelEditStartup = () => {
    setEditingStartupId(null)
    setStartupForm({ name: "", description: "", shortDescription: "", industry: "", stage: "idea", services: "", founderName: "", location: "" })
    setStartupLogo(null)
  }

  // ==================== CREATE / UPDATE HANDLERS ====================
  const handleSaveAlumni = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      if (!alumniForm.name || !alumniForm.designation) { setFormMsg({ type: "error", text: "Name & designation required" }); setFormLoading(false); return }
      const fd = new FormData()
      Object.entries(alumniForm).forEach(([k, v]) => {
        if (k === "expertise") fd.append(k, JSON.stringify((v as string).split(",").map(s => s.trim()).filter(Boolean)))
        else fd.append(k, String(v))
      })
      if (alumniPhoto) fd.append("photo", alumniPhoto)
      if (editingAlumniId) {
        await alumniAPI.update(editingAlumniId, fd)
        setFormMsg({ type: "success", text: "Alumni updated!" })
        cancelEditAlumni()
      } else {
        await alumniAPI.create(fd)
        setFormMsg({ type: "success", text: "Alumni added!" })
        setAlumniForm({ name: "", designation: "", company: "", email: "", phone: "", bio: "", expertise: "", experience: 0, isAvailableForMeeting: true })
        setAlumniPhoto(null)
      }
      fetchAlumniList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
    finally { setFormLoading(false) }
  }

  const handleDeleteAlumni = async (id: string) => {
    if (!confirm("Delete this alumni?")) return
    try {
      await alumniAPI.delete(id)
      if (editingAlumniId === id) cancelEditAlumni()
      fetchAlumniList(); fetchDashboard()
      setFormMsg({ type: "success", text: "Alumni deleted" })
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }

  const handleSaveMentor = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      if (!mentorForm.name || !mentorForm.email || !mentorForm.designation) { setFormMsg({ type: "error", text: "Name, email & designation required" }); setFormLoading(false); return }
      const fd = new FormData()
      Object.entries(mentorForm).forEach(([k, v]) => {
        if (k === "specialization" || k === "languages") fd.append(k, JSON.stringify((v as string).split(",").map(s => s.trim()).filter(Boolean)))
        else fd.append(k, String(v))
      })
      if (mentorPhoto) fd.append("photo", mentorPhoto)
      if (editingMentorId) {
        await mentorAPI.update(editingMentorId, fd)
        setFormMsg({ type: "success", text: "Mentor updated!" })
        cancelEditMentor()
      } else {
        await mentorAPI.create(fd)
        setFormMsg({ type: "success", text: "Mentor added!" })
        setMentorForm({ name: "", designation: "", company: "", email: "", phone: "", bio: "", specialization: "", languages: "Hindi,English", sessionPrice: 0, experience: 0 })
        setMentorPhoto(null)
      }
      fetchMentorList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
    finally { setFormLoading(false) }
  }

  const handleDeleteMentor = async (id: string) => {
    if (!confirm("Delete this mentor?")) return
    try {
      await mentorAPI.delete(id)
      if (editingMentorId === id) cancelEditMentor()
      fetchMentorList(); fetchDashboard()
      setFormMsg({ type: "success", text: "Mentor deleted" })
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }

  const handleSaveCourse = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      if (!courseForm.title || !courseForm.description) { setFormMsg({ type: "error", text: "Title & description required" }); setFormLoading(false); return }
      const fd = new FormData()
      Object.entries(courseForm).forEach(([k, v]) => fd.append(k, String(v)))
      if (courseThumbnail) fd.append("thumbnail", courseThumbnail)
      if (editingCourseId) {
        await courseAPI.update(editingCourseId, fd)
        setFormMsg({ type: "success", text: "Course updated!" })
        cancelEditCourse()
      } else {
        await courseAPI.create(fd)
        setFormMsg({ type: "success", text: "Course created!" })
        setCourseForm({ title: "", description: "", shortDescription: "", category: "career-guidance", language: "hindi", level: "beginner", price: 0, instructorName: "", isPublished: true })
        setCourseThumbnail(null)
      }
      fetchCourseList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
    finally { setFormLoading(false) }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Delete this course?")) return
    try {
      await courseAPI.delete(id)
      if (editingCourseId === id) cancelEditCourse()
      fetchCourseList(); fetchDashboard()
      setFormMsg({ type: "success", text: "Course deleted" })
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }

  const handleSaveStartup = async () => {
    setFormLoading(true); setFormMsg({ type: "", text: "" })
    try {
      if (!startupForm.name || !startupForm.description || !startupForm.industry) { setFormMsg({ type: "error", text: "Name, industry & description required" }); setFormLoading(false); return }
      const fd = new FormData()
      fd.append("name", startupForm.name)
      fd.append("description", startupForm.description)
      fd.append("shortDescription", startupForm.shortDescription)
      fd.append("industry", startupForm.industry)
      fd.append("stage", startupForm.stage)
      fd.append("location", startupForm.location)
      if (startupForm.services) fd.append("services", JSON.stringify(startupForm.services.split(",").map(s => s.trim()).filter(Boolean)))
      if (startupForm.founderName) fd.append("founder", JSON.stringify({ name: startupForm.founderName }))
      if (startupLogo) fd.append("logo", startupLogo)
      if (editingStartupId) {
        await startupAPI.update(editingStartupId, fd)
        setFormMsg({ type: "success", text: "Startup updated!" })
        cancelEditStartup()
      } else {
        await startupAPI.create(fd)
        setFormMsg({ type: "success", text: "Startup added!" })
        setStartupForm({ name: "", description: "", shortDescription: "", industry: "", stage: "idea", services: "", founderName: "", location: "" })
        setStartupLogo(null)
      }
      fetchStartupList(); fetchDashboard()
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
    finally { setFormLoading(false) }
  }

  const handleDeleteStartup = async (id: string) => {
    if (!confirm("Delete this startup?")) return
    try {
      await startupAPI.delete(id)
      if (editingStartupId === id) cancelEditStartup()
      fetchStartupList(); fetchDashboard()
      setFormMsg({ type: "success", text: "Startup deleted" })
    } catch (e: any) { setFormMsg({ type: "error", text: e.message }) }
  }

  // ==================== HELPERS ====================
  const getImageUrl = (path: string | undefined) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    return `${API_HOST}${path}`
  }

  const getWhatsAppUrl = (phone: string, personName: string, date: string) => {
    const cleanPhone = phone?.replace(/[^0-9]/g, "") || ""
    const fdate = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    const text = encodeURIComponent(`Hi! This is ParthSarthi Admin. Your meeting with ${personName} on ${fdate} has been confirmed. Here is the meeting link: `)
    return `https://wa.me/${cleanPhone}?text=${text}`
  }

  // ==================== LOADING ====================
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#060a13]"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
  }

  const pendingMeetings = meetings.filter(m => m.status === "pending")
  const inputClass = "h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
  const labelClass = "text-xs text-gray-300"

  // Helper to get existing image for editing entity
  const getEditingAlumniPhoto = () => editingAlumniId ? alumniList.find(a => a._id === editingAlumniId)?.photo : null
  const getEditingMentorPhoto = () => editingMentorId ? mentorList.find(m => m._id === editingMentorId)?.photo : null
  const getEditingCourseThumbnail = () => editingCourseId ? courseList.find(c => c._id === editingCourseId)?.thumbnail : null
  const getEditingStartupLogo = () => editingStartupId ? startupList.find(s => s._id === editingStartupId)?.logo : null

  return (
    <div className="min-h-screen bg-[#060a13]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#060a13] via-[#060a13] to-transparent backdrop-blur-xl border-b border-white/[0.06] sticky top-14 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Manage your platform</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll} className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08]">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setFormMsg({ type: "", text: "" }) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        {/* Form Messages */}
        {formMsg.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${formMsg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
            {formMsg.type === "error" ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            {formMsg.text}
          </div>
        )}

        {/* ==================== OVERVIEW ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {stats && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Users", value: stats.totalUsers, icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10" },
                  { label: "Alumni", value: stats.totalAlumni, icon: GraduationCap, color: "text-purple-400", bgColor: "bg-purple-500/10" },
                  { label: "Mentors", value: stats.totalMentors, icon: Users, color: "text-green-400", bgColor: "bg-green-500/10" },
                  { label: "Courses", value: stats.totalCourses, icon: BookOpen, color: "text-orange-400", bgColor: "bg-orange-500/10" },
                  { label: "Startups", value: stats.totalStartups, icon: Rocket, color: "text-red-400", bgColor: "bg-red-500/10" },
                  { label: "Pending", value: stats.pendingMeetings, icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
                ].map((s) => (
                  <Card key={s.label} className="bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-all">
                    <CardContent className="p-4 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 mx-auto ${s.bgColor}`}>
                        <s.icon className={`w-5 h-5 ${s.color}`} />
                      </div>
                      <p className={`text-3xl font-bold ${s.color}`}>{s.value || 0}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Pending Meetings */}
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    Pending Meetings ({pendingMeetings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {pendingMeetings.length === 0 ? (
                    <p className="text-base text-gray-500 text-center py-16">No pending meetings</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {pendingMeetings.slice(0, 10).map((m) => (
                        <div key={m._id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{m.userName}</p>
                              <p className="text-xs text-gray-400 mt-0.5">with {m.meetingPersonName} ({m.meetingWith})</p>
                              <p className="text-xs text-gray-500 mt-0.5">{m.subject}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[11px] text-gray-500">{new Date(m.date).toLocaleDateString()}</span>
                                {m.userPhone && <span className="text-[11px] text-gray-500 flex items-center gap-0.5"><Phone className="w-3 h-3" />{m.userPhone}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="h-7 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3" onClick={() => handleStartAcceptMeeting(m)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0" onClick={() => handleCancelMeeting(m._id)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {notifications.length === 0 ? (
                    <p className="text-base text-gray-500 text-center py-16">No notifications</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n._id} className={`p-3 rounded-lg ${n.isRead ? "bg-white/[0.02]" : "bg-blue-500/10 border border-blue-500/10"}`}>
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                          <p className="text-[11px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Add Alumni", tab: "alumni" as TabId, icon: GraduationCap, color: "text-purple-400" },
                    { label: "Add Mentor", tab: "mentors" as TabId, icon: Users, color: "text-blue-400" },
                    { label: "Add Course", tab: "courses" as TabId, icon: BookOpen, color: "text-orange-400" },
                    { label: "Add Startup", tab: "startups" as TabId, icon: Rocket, color: "text-red-400" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setActiveTab(action.tab)}
                      className="flex items-center gap-3 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <action.icon className={`w-6 h-6 ${action.color} shrink-0`} />
                      <span className="text-sm font-semibold text-white">{action.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ==================== ALUMNI (SPLIT PANEL) ==================== */}
        {activeTab === "alumni" && (
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      {editingAlumniId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingAlumniId ? "Edit Alumni" : "Add Alumni"}
                    </CardTitle>
                    {editingAlumniId && (
                      <Button size="sm" variant="ghost" onClick={cancelEditAlumni} className="h-7 text-xs text-gray-400 hover:text-white">
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {/* Photo Upload */}
                  <div>
                    <Label className={labelClass}>Photo</Label>
                    <div className="flex items-center gap-3 mt-1">
                      {(alumniPhoto || getEditingAlumniPhoto()) ? (
                        <img
                          src={alumniPhoto ? URL.createObjectURL(alumniPhoto) : getImageUrl(getEditingAlumniPhoto()) || ""}
                          className="w-14 h-14 rounded-lg object-cover border border-white/[0.08]" alt=""
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
                          <Camera className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" id="alumni-photo" className="hidden" onChange={(e) => setAlumniPhoto(e.target.files?.[0] || null)} />
                        <label htmlFor="alumni-photo" className="cursor-pointer text-xs text-blue-400 hover:underline block">
                          {alumniPhoto || getEditingAlumniPhoto() ? "Change Photo" : "Upload Photo"}
                        </label>
                        {alumniPhoto && <p className="text-[10px] text-gray-500 mt-0.5 max-w-[120px] truncate">{alumniPhoto.name}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Name *</Label><Input value={alumniForm.name} onChange={(e) => setAlumniForm({...alumniForm, name: e.target.value})} placeholder="Full name" className={inputClass} /></div>
                    <div><Label className={labelClass}>Designation *</Label><Input value={alumniForm.designation} onChange={(e) => setAlumniForm({...alumniForm, designation: e.target.value})} placeholder="e.g. Sr. Engineer" className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Company</Label><Input value={alumniForm.company} onChange={(e) => setAlumniForm({...alumniForm, company: e.target.value})} placeholder="Company" className={inputClass} /></div>
                    <div><Label className={labelClass}>Experience (yrs)</Label><Input type="number" value={alumniForm.experience} onChange={(e) => setAlumniForm({...alumniForm, experience: parseInt(e.target.value) || 0})} className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Email</Label><Input type="email" value={alumniForm.email} onChange={(e) => setAlumniForm({...alumniForm, email: e.target.value})} placeholder="email@example.com" className={inputClass} /></div>
                    <div><Label className={labelClass}>Phone</Label><Input value={alumniForm.phone} onChange={(e) => setAlumniForm({...alumniForm, phone: e.target.value})} placeholder="+91..." className={inputClass} /></div>
                  </div>
                  <div><Label className={labelClass}>Expertise (comma separated)</Label><Input value={alumniForm.expertise} onChange={(e) => setAlumniForm({...alumniForm, expertise: e.target.value})} placeholder="e.g. AI, Leadership, Cloud" className={inputClass} /></div>
                  <div><Label className={labelClass}>Bio</Label><Textarea value={alumniForm.bio} onChange={(e) => setAlumniForm({...alumniForm, bio: e.target.value})} placeholder="Short bio..." rows={2} className="text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" /></div>
                  <div className="flex items-center gap-2">
                    <Switch checked={alumniForm.isAvailableForMeeting} onCheckedChange={(v) => setAlumniForm({...alumniForm, isAvailableForMeeting: v})} />
                    <Label className={labelClass}>Available for meetings</Label>
                  </div>
                  <Button onClick={handleSaveAlumni} disabled={formLoading} className="w-full bg-white text-black hover:bg-gray-200 h-10 text-sm font-semibold rounded-xl">
                    {formLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> :
                      editingAlumniId ? <><Pencil className="w-3.5 h-3.5 mr-1.5" /> Update Alumni</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Alumni</>
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" /> Active Alumni ({alumniList.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {alumniList.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-12">No alumni added yet. Use the form to add your first alumni.</p>
                  ) : (
                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                      {alumniList.map((a) => (
                        <div key={a._id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${editingAlumniId === a._id ? "bg-purple-500/10 border-purple-500/20" : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"}`}>
                          {a.photo ? (
                            <img src={getImageUrl(a.photo) || ""} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold shrink-0">
                              {a.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{a.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">{a.designation}{a.company ? ` @ ${a.company}` : ""}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => startEditAlumni(a)} className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteAlumni(a._id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== MENTORS (SPLIT PANEL) ==================== */}
        {activeTab === "mentors" && (
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      {editingMentorId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingMentorId ? "Edit Mentor" : "Add Mentor"}
                    </CardTitle>
                    {editingMentorId && (
                      <Button size="sm" variant="ghost" onClick={cancelEditMentor} className="h-7 text-xs text-gray-400 hover:text-white">
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {/* Photo Upload */}
                  <div>
                    <Label className={labelClass}>Photo</Label>
                    <div className="flex items-center gap-3 mt-1">
                      {(mentorPhoto || getEditingMentorPhoto()) ? (
                        <img
                          src={mentorPhoto ? URL.createObjectURL(mentorPhoto) : getImageUrl(getEditingMentorPhoto()) || ""}
                          className="w-14 h-14 rounded-lg object-cover border border-white/[0.08]" alt=""
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
                          <Camera className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" id="mentor-photo" className="hidden" onChange={(e) => setMentorPhoto(e.target.files?.[0] || null)} />
                        <label htmlFor="mentor-photo" className="cursor-pointer text-xs text-blue-400 hover:underline block">
                          {mentorPhoto || getEditingMentorPhoto() ? "Change Photo" : "Upload Photo"}
                        </label>
                        {mentorPhoto && <p className="text-[10px] text-gray-500 mt-0.5 max-w-[120px] truncate">{mentorPhoto.name}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Name *</Label><Input value={mentorForm.name} onChange={(e) => setMentorForm({...mentorForm, name: e.target.value})} placeholder="Full name" className={inputClass} /></div>
                    <div><Label className={labelClass}>Email *</Label><Input type="email" value={mentorForm.email} onChange={(e) => setMentorForm({...mentorForm, email: e.target.value})} placeholder="email" className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Designation *</Label><Input value={mentorForm.designation} onChange={(e) => setMentorForm({...mentorForm, designation: e.target.value})} placeholder="e.g. Data Scientist" className={inputClass} /></div>
                    <div><Label className={labelClass}>Company</Label><Input value={mentorForm.company} onChange={(e) => setMentorForm({...mentorForm, company: e.target.value})} placeholder="Company" className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Experience (yrs)</Label><Input type="number" value={mentorForm.experience} onChange={(e) => setMentorForm({...mentorForm, experience: parseInt(e.target.value) || 0})} className={inputClass} /></div>
                    <div><Label className={labelClass}>Session Price</Label><Input type="number" value={mentorForm.sessionPrice} onChange={(e) => setMentorForm({...mentorForm, sessionPrice: parseInt(e.target.value) || 0})} className={inputClass} /></div>
                  </div>
                  <div><Label className={labelClass}>Specialization (comma separated)</Label><Input value={mentorForm.specialization} onChange={(e) => setMentorForm({...mentorForm, specialization: e.target.value})} placeholder="e.g. Python, ML, AI" className={inputClass} /></div>
                  <div><Label className={labelClass}>Languages (comma separated)</Label><Input value={mentorForm.languages} onChange={(e) => setMentorForm({...mentorForm, languages: e.target.value})} placeholder="Hindi,English" className={inputClass} /></div>
                  <div><Label className={labelClass}>Phone</Label><Input value={mentorForm.phone} onChange={(e) => setMentorForm({...mentorForm, phone: e.target.value})} placeholder="+91..." className={inputClass} /></div>
                  <div><Label className={labelClass}>Bio</Label><Textarea value={mentorForm.bio} onChange={(e) => setMentorForm({...mentorForm, bio: e.target.value})} placeholder="Short bio..." rows={2} className="text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" /></div>
                  <Button onClick={handleSaveMentor} disabled={formLoading} className="w-full bg-white text-black hover:bg-gray-200 h-10 text-sm font-semibold rounded-xl">
                    {formLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> :
                      editingMentorId ? <><Pencil className="w-3.5 h-3.5 mr-1.5" /> Update Mentor</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Mentor</>
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" /> Active Mentors ({mentorList.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {mentorList.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-12">No mentors added yet. Use the form to add your first mentor.</p>
                  ) : (
                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                      {mentorList.map((m) => (
                        <div key={m._id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${editingMentorId === m._id ? "bg-blue-500/10 border-blue-500/20" : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"}`}>
                          {m.photo ? (
                            <img src={getImageUrl(m.photo) || ""} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                              {m.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{m.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">{m.designation}{m.company ? ` @ ${m.company}` : ""}</p>
                            {m.sessionPrice > 0 && <p className="text-[10px] text-emerald-400">₹{m.sessionPrice}/session</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => startEditMentor(m)} className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteMentor(m._id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== COURSES (SPLIT PANEL) ==================== */}
        {activeTab === "courses" && (
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      {editingCourseId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingCourseId ? "Edit Course" : "Add Course"}
                    </CardTitle>
                    {editingCourseId && (
                      <Button size="sm" variant="ghost" onClick={cancelEditCourse} className="h-7 text-xs text-gray-400 hover:text-white">
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {/* Thumbnail Upload */}
                  <div>
                    <Label className={labelClass}>Thumbnail</Label>
                    <div className="flex items-center gap-3 mt-1">
                      {(courseThumbnail || getEditingCourseThumbnail()) ? (
                        <img
                          src={courseThumbnail ? URL.createObjectURL(courseThumbnail) : getImageUrl(getEditingCourseThumbnail()) || ""}
                          className="w-20 h-14 rounded-lg object-cover border border-white/[0.08]" alt=""
                        />
                      ) : (
                        <div className="w-20 h-14 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" id="course-thumb" className="hidden" onChange={(e) => setCourseThumbnail(e.target.files?.[0] || null)} />
                        <label htmlFor="course-thumb" className="cursor-pointer text-xs text-blue-400 hover:underline block">
                          {courseThumbnail || getEditingCourseThumbnail() ? "Change Thumbnail" : "Upload Thumbnail"}
                        </label>
                        {courseThumbnail && <p className="text-[10px] text-gray-500 mt-0.5 max-w-[120px] truncate">{courseThumbnail.name}</p>}
                      </div>
                    </div>
                  </div>
                  <div><Label className={labelClass}>Title *</Label><Input value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} placeholder="Course title" className={inputClass} /></div>
                  <div><Label className={labelClass}>Description *</Label><Textarea value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} placeholder="Course description..." rows={3} className="text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" /></div>
                  <div><Label className={labelClass}>Short Description</Label><Input value={courseForm.shortDescription} onChange={(e) => setCourseForm({...courseForm, shortDescription: e.target.value})} placeholder="One liner..." className={inputClass} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className={labelClass}>Category</Label>
                      <Select value={courseForm.category} onValueChange={(v) => setCourseForm({...courseForm, category: v})}>
                        <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                          <SelectItem value="career-guidance">Career Guidance</SelectItem>
                          <SelectItem value="skill-development">Skill Dev</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="personality-development">Personality</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={labelClass}>Language</Label>
                      <Select value={courseForm.language} onValueChange={(v) => setCourseForm({...courseForm, language: v})}>
                        <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={labelClass}>Level</Label>
                      <Select value={courseForm.level} onValueChange={(v) => setCourseForm({...courseForm, level: v})}>
                        <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Price (0=free)</Label><Input type="number" value={courseForm.price} onChange={(e) => setCourseForm({...courseForm, price: parseInt(e.target.value) || 0})} className={inputClass} /></div>
                    <div><Label className={labelClass}>Instructor</Label><Input value={courseForm.instructorName} onChange={(e) => setCourseForm({...courseForm, instructorName: e.target.value})} placeholder="Name" className={inputClass} /></div>
                  </div>
                  <Button onClick={handleSaveCourse} disabled={formLoading} className="w-full bg-white text-black hover:bg-gray-200 h-10 text-sm font-semibold rounded-xl">
                    {formLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> :
                      editingCourseId ? <><Pencil className="w-3.5 h-3.5 mr-1.5" /> Update Course</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Create Course</>
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-orange-400" /> All Courses ({courseList.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {courseList.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-12">No courses created yet. Use the form to add your first course.</p>
                  ) : (
                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                      {courseList.map((c) => (
                        <div key={c._id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${editingCourseId === c._id ? "bg-orange-500/10 border-orange-500/20" : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"}`}>
                          {c.thumbnail ? (
                            <img src={getImageUrl(c.thumbnail) || ""} className="w-14 h-10 rounded-md object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-14 h-10 rounded-md bg-orange-500/20 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-orange-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{c.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge className="text-[9px] bg-white/[0.06] text-gray-300 border-0 capitalize">{c.language}</Badge>
                              <Badge className="text-[9px] bg-white/[0.06] text-gray-300 border-0 capitalize">{c.level}</Badge>
                              {c.price > 0 ? <span className="text-[10px] text-emerald-400 font-medium">₹{c.price}</span> : <span className="text-[10px] text-emerald-400 font-medium">Free</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => startEditCourse(c)} className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteCourse(c._id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== STARTUPS (SPLIT PANEL) ==================== */}
        {activeTab === "startups" && (
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      {editingStartupId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingStartupId ? "Edit Startup" : "Add Startup"}
                    </CardTitle>
                    {editingStartupId && (
                      <Button size="sm" variant="ghost" onClick={cancelEditStartup} className="h-7 text-xs text-gray-400 hover:text-white">
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {/* Logo Upload */}
                  <div>
                    <Label className={labelClass}>Logo</Label>
                    <div className="flex items-center gap-3 mt-1">
                      {(startupLogo || getEditingStartupLogo()) ? (
                        <img
                          src={startupLogo ? URL.createObjectURL(startupLogo) : getImageUrl(getEditingStartupLogo()) || ""}
                          className="w-14 h-14 rounded-lg object-cover border border-white/[0.08]" alt=""
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
                          <Rocket className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" id="startup-logo" className="hidden" onChange={(e) => setStartupLogo(e.target.files?.[0] || null)} />
                        <label htmlFor="startup-logo" className="cursor-pointer text-xs text-blue-400 hover:underline block">
                          {startupLogo || getEditingStartupLogo() ? "Change Logo" : "Upload Logo"}
                        </label>
                        {startupLogo && <p className="text-[10px] text-gray-500 mt-0.5 max-w-[120px] truncate">{startupLogo.name}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className={labelClass}>Name *</Label><Input value={startupForm.name} onChange={(e) => setStartupForm({...startupForm, name: e.target.value})} placeholder="Startup name" className={inputClass} /></div>
                    <div><Label className={labelClass}>Industry *</Label><Input value={startupForm.industry} onChange={(e) => setStartupForm({...startupForm, industry: e.target.value})} placeholder="e.g. EdTech" className={inputClass} /></div>
                  </div>
                  <div><Label className={labelClass}>Description *</Label><Textarea value={startupForm.description} onChange={(e) => setStartupForm({...startupForm, description: e.target.value})} placeholder="About..." rows={3} className="text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" /></div>
                  <div><Label className={labelClass}>Short Description</Label><Input value={startupForm.shortDescription} onChange={(e) => setStartupForm({...startupForm, shortDescription: e.target.value})} placeholder="One liner..." className={inputClass} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className={labelClass}>Stage</Label>
                      <Select value={startupForm.stage} onValueChange={(v) => setStartupForm({...startupForm, stage: v})}>
                        <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="mvp">MVP</SelectItem>
                          <SelectItem value="early-stage">Early Stage</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="scaling">Scaling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className={labelClass}>Location</Label><Input value={startupForm.location} onChange={(e) => setStartupForm({...startupForm, location: e.target.value})} placeholder="City, India" className={inputClass} /></div>
                  </div>
                  <div><Label className={labelClass}>Services (comma separated)</Label><Input value={startupForm.services} onChange={(e) => setStartupForm({...startupForm, services: e.target.value})} placeholder="tech, marketing, strategy" className={inputClass} /></div>
                  <div><Label className={labelClass}>Founder Name</Label><Input value={startupForm.founderName} onChange={(e) => setStartupForm({...startupForm, founderName: e.target.value})} placeholder="Founder name" className={inputClass} /></div>
                  <Button onClick={handleSaveStartup} disabled={formLoading} className="w-full bg-white text-black hover:bg-gray-200 h-10 text-sm font-semibold rounded-xl">
                    {formLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> :
                      editingStartupId ? <><Pencil className="w-3.5 h-3.5 mr-1.5" /> Update Startup</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Startup</>
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-red-400" /> All Startups ({startupList.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {startupList.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-12">No startups added yet. Use the form to add your first startup.</p>
                  ) : (
                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                      {startupList.map((s) => (
                        <div key={s._id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${editingStartupId === s._id ? "bg-red-500/10 border-red-500/20" : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"}`}>
                          {s.logo ? (
                            <img src={getImageUrl(s.logo) || ""} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-sm font-bold shrink-0">
                              {s.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{s.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">{s.industry}{s.location ? ` - ${s.location}` : ""}</p>
                            <Badge className="text-[9px] bg-white/[0.06] text-gray-300 border-0 capitalize mt-0.5">{s.stage}</Badge>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => startEditStartup(s)} className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteStartup(s._id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== MEETINGS ==================== */}
        {activeTab === "meetings" && (
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm text-white">All Meetings ({meetings.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {meetings.length === 0 ? (
                <p className="text-base text-gray-500 text-center py-16">No meetings booked yet</p>
              ) : (
                <div className="rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">User</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Meeting With</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs hidden lg:table-cell">Subject</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Date</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs hidden md:table-cell">Contact</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Status</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map((m) => (
                        <tr
                          key={m._id}
                          className="border-b border-white/[0.04] hover:bg-white/[0.02] even:bg-white/[0.01] cursor-pointer"
                          onClick={() => openMeetingDetail(m)}
                        >
                          <td className="p-3">
                            <p className="font-medium text-white text-sm">{m.userName}</p>
                            <p className="text-xs text-gray-500">{m.userEmail}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-sm text-white">{m.meetingPersonName}</p>
                            <p className="text-xs text-gray-500 capitalize">{m.meetingWith}</p>
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-gray-400 hidden lg:table-cell">{m.subject}</td>
                          <td className="p-3 whitespace-nowrap text-gray-400">
                            <p>{new Date(m.date).toLocaleDateString()}</p>
                            {m.timeSlot && <p className="text-[10px] text-gray-500">{m.timeSlot.startTime} - {m.timeSlot.endTime}</p>}
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-500 hidden md:table-cell">{m.userPhone}</td>
                          <td className="p-3">
                            {m.status !== "confirmed" && (
                              <Badge className={`text-[10px] ${m.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"} border-0`}>
                                {m.status}
                              </Badge>
                            )}
                            {m.meetingLink && <p className="text-[10px] text-blue-400 mt-0.5 truncate max-w-[100px]">Link set</p>}
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            {m.status === "pending" && (
                              <div className="flex gap-1.5">
                                <Button size="sm" className="h-7 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-2.5" onClick={() => handleStartAcceptMeeting(m)}>Accept</Button>
                                <Button size="sm" className="h-7 text-xs px-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0" onClick={() => handleCancelMeeting(m._id)}>Cancel</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ==================== ADMISSIONS ==================== */}
        {activeTab === "admissions" && (
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Admission requests ({admissions.length})
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Student details — connect via WhatsApp or call</p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {admissions.length === 0 ? (
                <p className="text-base text-gray-500 text-center py-16">No admission requests yet</p>
              ) : (
                <div className="rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                          <th className="text-left p-3 font-medium text-gray-400 text-xs">Student</th>
                          <th className="text-left p-3 font-medium text-gray-400 text-xs hidden md:table-cell">Contact</th>
                          <th className="text-left p-3 font-medium text-gray-400 text-xs">Course</th>
                          <th className="text-left p-3 font-medium text-gray-400 text-xs hidden lg:table-cell">Coaching</th>
                          <th className="text-left p-3 font-medium text-gray-400 text-xs">Mode</th>
                          <th className="text-left p-3 font-medium text-gray-400 text-xs">Status</th>
                          <th className="text-left p-3 font-medium text-gray-400 text-xs">Connect</th>
                          <th className="text-left p-3 font-medium text-gray-400 text-xs w-14">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admissions.map((a) => (
                          <tr
                            key={a._id}
                            className="border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors"
                            onClick={() => setSelectedAdmission(a)}
                          >
                            <td className="p-3">
                              <p className="font-medium text-white text-sm">{a.name}</p>
                              <p className="text-xs text-gray-500">{a.currentClass || "-"} {a.stream ? ` · ${a.stream}` : ""}</p>
                              {a.city && <p className="text-[10px] text-gray-500">{a.city}{a.state ? `, ${a.state}` : ""}</p>}
                            </td>
                            <td className="p-3 hidden md:table-cell">
                              <p className="text-gray-400 text-xs">{a.email}</p>
                              <p className="text-gray-500 text-xs">{a.phone}</p>
                              {a.parentPhone && <p className="text-[10px] text-gray-500">Parent: {a.parentPhone}</p>}
                            </td>
                            <td className="p-3">
                              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-0">{a.course || "-"}</Badge>
                            </td>
                            <td className="p-3 text-gray-400 text-xs hidden lg:table-cell">{a.coachingInstitute || "-"}</td>
                            <td className="p-3 text-gray-400 text-xs capitalize">{a.mode || "-"}</td>
                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                              <Select value={a.status || "new"} onValueChange={(v) => updateAdmissionStatus(a._id, v)}>
                                <SelectTrigger className="h-7 text-[10px] bg-white/[0.04] border-white/[0.08] text-gray-300 w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="enrolled">Enrolled</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                              <a href={`https://wa.me/${(a.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline">
                                <Phone className="w-3 h-3" /> WhatsApp
                              </a>
                            </td>
                            <td className="p-3" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" className="h-7 w-7 p-0 text-red-400 bg-red-500/10 hover:bg-red-500/20 border-0" onClick={() => deleteAdmissionById(a._id)} title="Delete request">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ==================== OFFERS (slideshow templates) ==================== */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm text-white flex items-center gap-2">Moving ticker text (homepage top bar)</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Edit the scrolling offer text that appears at the top of the homepage.</p>
              </CardHeader>
              <CardContent className="px-5 pb-5 flex gap-2">
                <Input value={tickerText} onChange={(e) => setTickerText(e.target.value)} placeholder="e.g. OFFER — Get admission now" className={inputClass} />
                <Button onClick={saveTicker} disabled={tickerSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0">{tickerSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Save ticker</Button>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  {editingOfferId ? "Edit offer" : "Add offer slide"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                {formMsg.text && (
                  <div className={`p-2.5 rounded-lg text-xs ${formMsg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>{formMsg.text}</div>
                )}
                <div>
                  <Label className={labelClass}>Title *</Label>
                  <Input value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} placeholder="e.g. JEE/NEET Batch" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Subtitle</Label>
                  <Input value={offerForm.subtitle} onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })} placeholder="Short description" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Image</Label>
                  <div className="space-y-2">
                    <Input value={offerForm.imageUrl} onChange={(e) => setOfferForm({ ...offerForm, imageUrl: e.target.value })} placeholder="Image URL (optional)" className={inputClass} />
                    <p className="text-xs text-gray-500">Or upload image:</p>
                    <input type="file" accept="image/*" className="block w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-white/10 file:text-white" onChange={(e) => setOfferImage(e.target.files?.[0] || null)} />
                    {offerImage && <p className="text-xs text-emerald-400">{offerImage.name}</p>}
                    {editingOfferId && offerForm.imageUrl && !offerImage && (
                      <div className="mt-1">
                        <img src={offerForm.imageUrl} alt="" className="h-20 rounded object-cover border border-white/10" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className={labelClass}>Button text</Label>
                  <Input value={offerForm.ctaText} onChange={(e) => setOfferForm({ ...offerForm, ctaText: e.target.value })} placeholder="Get admission now" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Button link</Label>
                  <Input value={offerForm.ctaLink} onChange={(e) => setOfferForm({ ...offerForm, ctaLink: e.target.value })} placeholder="/admission" className={inputClass} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={offerForm.isActive} onCheckedChange={(v) => setOfferForm({ ...offerForm, isActive: v })} />
                  <Label className={labelClass}>Show on homepage</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveOffer} disabled={formLoading || !offerForm.title} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    {formLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null} {editingOfferId ? "Update" : "Add"}
                  </Button>
                  {editingOfferId && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => { setEditingOfferId(null); setOfferForm({ title: "", subtitle: "", imageUrl: "", ctaText: "Get admission now", ctaLink: "/admission", order: 0, isActive: true }); setOfferImage(null) }}>Cancel</Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Offer slides ({offerList.length})
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">These appear in the homepage slideshow</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {offerList.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">No offers yet. Add one to show on homepage.</p>
                ) : (
                  <div className="space-y-2">
                    {offerList.map((o) => (
                      <div key={o._id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{o.title}</p>
                          {o.subtitle && <p className="text-xs text-gray-500 truncate">{o.subtitle}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300" onClick={() => duplicateOffer(o)} title="Duplicate (same as this)"><CopyPlus className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400" onClick={() => startEditOffer(o)}><Pencil className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => deleteOfferById(o._id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {/* ==================== USERS ==================== */}
        {activeTab === "users" && (
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                All Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {users.length === 0 ? (
                <p className="text-base text-gray-500 text-center py-16">No users yet</p>
              ) : (
                <div className="rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Name</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Email</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs hidden md:table-cell">Phone</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Role</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs hidden lg:table-cell">Education</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs hidden lg:table-cell">Location</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs hidden lg:table-cell">Joined</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Status</th>
                        <th className="text-left p-3 font-medium text-gray-400 text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u._id}
                          className="border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors"
                          onClick={() => setSelectedUser(u)}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                                {u.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <span className="font-medium text-white text-sm">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-400">{u.email}</td>
                          <td className="p-3 text-gray-500 hidden md:table-cell">{u.phone || "-"}</td>
                          <td className="p-3">
                            <Badge className={`text-[10px] border-0 capitalize ${u.role === "admin" ? "bg-red-500/10 text-red-400" : u.role === "mentor" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-400 text-xs hidden lg:table-cell max-w-[140px] truncate" title={[u.currentEducation, u.institution, u.yearOfStudy].filter(Boolean).join(" • ")}>
                            {u.role === "student" && (u.currentEducation || u.institution || u.yearOfStudy) ? [u.currentEducation, u.institution, u.yearOfStudy].filter(Boolean).join(" • ") : "-"}
                          </td>
                          <td className="p-3 text-gray-400 text-xs hidden lg:table-cell max-w-[100px] truncate" title={u.location}>{u.role === "student" && u.location ? u.location : "-"}</td>
                          <td className="p-3 text-gray-500 text-xs hidden lg:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <Badge className={`text-[10px] border-0 ${u.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            {u.role !== "admin" && (
                              <Button size="sm" className="h-7 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0 px-2.5" onClick={() => deleteUser(u._id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ==================== CONTACTS / SERVICE REQUESTS ==================== */}
        {activeTab === "contacts" && (
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                Service Requests & Contact Messages ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No contact requests yet. They will appear here when someone submits a startup service request or contact form.</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div key={c._id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white">{c.name}</p>
                            <Badge className={`text-[10px] border-0 ${c.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" : c.status === "in-progress" ? "bg-blue-500/10 text-blue-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                              {c.status || "new"}
                            </Badge>
                            {c.type === "startup-service" && (
                              <Badge className="text-[10px] border-0 bg-orange-500/10 text-orange-400">Startup</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{c.email} {c.phone ? `· ${c.phone}` : ""}</p>
                          <p className="text-sm text-white mt-2 font-medium">{c.subject}</p>
                          <p className="text-xs text-gray-400 mt-1 whitespace-pre-line leading-relaxed">{c.message}</p>
                          <p className="text-[11px] text-gray-600 mt-2">{new Date(c.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {c.status !== "in-progress" && (
                          <Button size="sm" className="h-7 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0 px-3" onClick={() => updateContact(c._id, "in-progress")}>
                            Mark In Progress
                          </Button>
                        )}
                        {c.status !== "resolved" && (
                          <Button size="sm" className="h-7 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0 px-3" onClick={() => updateContact(c._id, "resolved")}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ==================== ADMISSION DETAIL MODAL ==================== */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedAdmission(null)}>
          <div className="bg-[#0d1117] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Admission request — full details</h3>
              <button onClick={() => setSelectedAdmission(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/[0.06]">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg font-bold shrink-0">
                {selectedAdmission.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-white truncate">{selectedAdmission.name}</p>
                <p className="text-sm text-gray-400 truncate">{selectedAdmission.email}</p>
                <div className="flex gap-2 mt-1.5">
                  <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-0">{selectedAdmission.course || "-"}</Badge>
                  <Badge className="text-[10px] border-0 bg-white/10 text-gray-300 capitalize">{selectedAdmission.status || "new"}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Contact</p>
                <p className="text-sm text-white mt-1">Phone: {selectedAdmission.phone || "—"}</p>
                {selectedAdmission.parentName && <p className="text-sm text-gray-400 mt-0.5">Parent: {selectedAdmission.parentName}</p>}
                {selectedAdmission.parentPhone && <p className="text-sm text-gray-400">Parent phone: {selectedAdmission.parentPhone}</p>}
              </div>
              {(selectedAdmission.city || selectedAdmission.state) && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-white mt-1">{[selectedAdmission.city, selectedAdmission.state].filter(Boolean).join(", ") || "—"}</p>
                </div>
              )}
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Academic</p>
                <p className="text-sm text-white mt-1">Class: {selectedAdmission.currentClass || "—"}</p>
                {selectedAdmission.board && <p className="text-sm text-gray-400">Board: {selectedAdmission.board}</p>}
                {selectedAdmission.schoolName && <p className="text-sm text-gray-400">School: {selectedAdmission.schoolName}</p>}
                {(selectedAdmission.stream || selectedAdmission.yearOfPassing) && (
                  <p className="text-sm text-gray-400">{[selectedAdmission.stream, selectedAdmission.yearOfPassing].filter(Boolean).join(" · ")}</p>
                )}
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Coaching preference</p>
                <p className="text-sm text-white mt-1">Course: {selectedAdmission.course || "—"}</p>
                <p className="text-sm text-gray-400">Institute: {selectedAdmission.coachingInstitute || "—"}</p>
                <p className="text-sm text-gray-400 capitalize">Mode: {selectedAdmission.mode || "—"}</p>
              </div>
              {selectedAdmission.additionalNotes && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Notes from student</p>
                  <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{selectedAdmission.additionalNotes}</p>
                </div>
              )}
              {selectedAdmission.adminNotes && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin notes</p>
                  <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{selectedAdmission.adminNotes}</p>
                </div>
              )}
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Submitted</p>
                <p className="text-sm text-gray-400 mt-1">{new Date(selectedAdmission.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <a href={`https://wa.me/${(selectedAdmission.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-medium">
                <Phone className="w-4 h-4" /> WhatsApp
              </a>
              <Button size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0 h-9 text-xs" onClick={() => { if (confirm("Delete this admission request?")) deleteAdmissionById(selectedAdmission._id); setSelectedAdmission(null); }}>Delete</Button>
              <Button variant="outline" className="ml-auto h-9 text-xs rounded-xl bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]" onClick={() => setSelectedAdmission(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== USER DETAIL MODAL ==================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-[#0d1117] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">User details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/[0.06]">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold shrink-0">
                {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-white truncate">{selectedUser.name}</p>
                <p className="text-sm text-gray-400 truncate">{selectedUser.email}</p>
                <div className="flex gap-2 mt-1.5">
                  <Badge className={`text-[10px] border-0 capitalize ${selectedUser.role === "admin" ? "bg-red-500/10 text-red-400" : selectedUser.role === "mentor" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                    {selectedUser.role}
                  </Badge>
                  <Badge className={`text-[10px] border-0 ${selectedUser.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {selectedUser.isVerified && <Badge className="text-[10px] border-0 bg-amber-500/10 text-amber-400">Verified</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Contact</p>
                <p className="text-sm text-white mt-1">Phone: {selectedUser.phone || "—"}</p>
                <p className="text-sm text-gray-400">Language: {selectedUser.language === "hi" ? "Hindi" : "English"}</p>
              </div>
              {(selectedUser.currentEducation || selectedUser.institution || selectedUser.yearOfStudy || selectedUser.stream) && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Education</p>
                  <p className="text-sm text-white mt-1">{selectedUser.currentEducation || "—"}</p>
                  {selectedUser.institution && <p className="text-sm text-gray-400">Institution: {selectedUser.institution}</p>}
                  {(selectedUser.yearOfStudy || selectedUser.stream) && (
                    <p className="text-sm text-gray-400">{[selectedUser.yearOfStudy, selectedUser.stream].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
              )}
              {selectedUser.location && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-white mt-1">{selectedUser.location}</p>
                </div>
              )}
              {Array.isArray(selectedUser.interests) && selectedUser.interests.length > 0 && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Interests</p>
                  <p className="text-sm text-gray-400 mt-1">{selectedUser.interests.join(", ")}</p>
                </div>
              )}
              {selectedUser.bio && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Bio</p>
                  <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{selectedUser.bio}</p>
                </div>
              )}
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Joined</p>
                <p className="text-sm text-gray-400 mt-1">{new Date(selectedUser.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedUser.role !== "admin" && (
                <Button size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0" onClick={() => { if (confirm("Delete this user?")) deleteUser(selectedUser._id); setSelectedUser(null); }}>Delete user</Button>
              )}
              <Button variant="outline" className="ml-auto h-9 text-xs rounded-xl bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]" onClick={() => setSelectedUser(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MEETING ACCEPT MODAL ==================== */}
      {showMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMeetingModal(false)}>
          <div className="bg-[#0d1117] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Meeting details</h3>
              <button onClick={() => setShowMeetingModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Full meeting info */}
            <div className="space-y-3 mb-5">
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Requested by</p>
                <p className="text-sm font-medium text-white mt-1">{selectedMeeting.userName}</p>
                <p className="text-xs text-gray-400">{selectedMeeting.userEmail}</p>
                {selectedMeeting.userPhone && <p className="text-xs text-gray-400">{selectedMeeting.userPhone}</p>}
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Meeting with</p>
                <p className="text-sm font-medium text-white mt-1">{selectedMeeting.meetingPersonName} <span className="text-gray-400 text-xs capitalize">({selectedMeeting.meetingWith})</span></p>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Subject</p>
                <p className="text-sm text-white mt-1">{selectedMeeting.subject}</p>
                {selectedMeeting.description && <p className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{selectedMeeting.description}</p>}
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Date & time</p>
                <p className="text-sm text-white mt-1">
                  {new Date(selectedMeeting.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  {selectedMeeting.timeSlot && ` · ${selectedMeeting.timeSlot.startTime} - ${selectedMeeting.timeSlot.endTime}`}
                </p>
                {selectedMeeting.meetingType && <p className="text-xs text-gray-400 mt-0.5 capitalize">{selectedMeeting.meetingType}</p>}
              </div>
            </div>

            {/* WhatsApp */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-300 mb-2">Contact via WhatsApp</p>
              <a
                href={getWhatsAppUrl(selectedMeeting.userPhone, selectedMeeting.meetingPersonName, selectedMeeting.date)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="truncate">Open WhatsApp ({selectedMeeting.userPhone || "N/A"})</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0" />
              </a>
            </div>

            {/* Meeting link – always allow add/update */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-300 mb-2">Meeting link (Google Meet / Zoom – you can add or update anytime)</p>
              <Input
                value={meetingLinkInput}
                onChange={(e) => setMeetingLinkInput(e.target.value)}
                placeholder="https://meet.google.com/... or zoom link"
                className={inputClass}
              />
              <Button onClick={handleSaveMeetingLinkOnly} variant="outline" className="mt-2 h-9 text-xs rounded-lg bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 w-full">
                Save link
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedMeeting.status === "pending" && (
                <Button onClick={handleConfirmMeeting} className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 h-10 text-sm font-semibold rounded-xl">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Confirm & Accept
                </Button>
              )}
              {selectedMeeting.status === "pending" && (
                <Button onClick={() => handleCancelMeeting(selectedMeeting._id)} className="h-10 text-sm rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0">
                  Cancel meeting
                </Button>
              )}
              <Button onClick={() => setShowMeetingModal(false)} variant="outline" className={`h-10 text-sm rounded-xl bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08] ${selectedMeeting.status !== "pending" ? "flex-1" : ""}`}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
