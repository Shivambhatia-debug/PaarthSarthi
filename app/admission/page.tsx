"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, User, BookOpen, Building2, ChevronRight, ChevronLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { admissionAPI, authAPI } from "@/lib/api"
import { restrictPhone10 } from "@/lib/utils"

const COURSES = [
  "IIT-JEE", "NEET", "Class 6th to 10th", "Class 11th–12th", "UPSC", "GATE", "DEFENCE", "MBA", "CA", "SSC", "SKILL", "Other"
]

const COACHING_INSTITUTES = [
  "Physics Wallah", "Unacademy", "Byju's", "Vedantu", "Aakash", "Allen", "Resonance", "FIITJEE", "Career Launcher", "Triumphias", "Other"
]

const MODES = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "both", label: "Both" },
]

export default function AdmissionPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userLoaded, setUserLoaded] = useState(false)
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [form, setForm] = useState({
    name: "", email: "", phone: "", parentName: "", parentPhone: "", city: "", state: "",
    currentClass: "", board: "", schoolName: "", stream: "", yearOfPassing: "",
    coachingInstitute: "", course: "", mode: "both", additionalNotes: ""
  })

  // Pre-fill form when student is logged in
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ps_token") : null
    if (!token) {
      setUserLoaded(true)
      return
    }
    authAPI
      .getMe()
      .then((res) => {
        const u = res?.user
        if (!u) {
          setUserLoaded(true)
          return
        }
        const loc = (u.location || "").trim()
        const [city, ...stateParts] = loc.split(",").map((s: string) => s.trim())
        const state = stateParts.join(", ") || ""
        setForm((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          city: city || prev.city,
          state: state || prev.state,
          currentClass: u.currentEducation || prev.currentClass,
          schoolName: u.institution || prev.schoolName,
          stream: u.stream || prev.stream,
          yearOfPassing: u.yearOfStudy || prev.yearOfPassing
        }))
      })
      .catch(() => {})
      .finally(() => setUserLoaded(true))
  }, [])

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const step1Valid = form.name.trim() && form.email.trim() && form.phone.trim()
  const step2Valid = true
  const step3Valid = form.coachingInstitute && form.course

  const handleSubmit = async () => {
    setMsg(null)
    const digits = (form.phone || "").replace(/\D/g, "")
    if (digits.length !== 10) {
      setMsg({ type: "error", text: "Phone must be 10 digits" })
      return
    }
    setLoading(true)
    try {
      await admissionAPI.submit({ ...form, phone: digits, parentPhone: (form.parentPhone || "").replace(/\D/g, "") || undefined })
      setMsg({ type: "success", text: "Admission form submitted! We'll connect with you soon." })
      setForm({ name: "", email: "", phone: "", parentName: "", parentPhone: "", city: "", state: "", currentClass: "", board: "", schoolName: "", stream: "", yearOfPassing: "", coachingInstitute: "", course: "", mode: "both", additionalNotes: "" })
      setStep(1)
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to submit" })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
  const labelClass = "text-xs text-gray-300"

  return (
    <div className="min-h-screen bg-[#060a13]">
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Admission</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Coaching & Course Admission</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl">
            Fill the form in 3 simple steps. Our team will connect with you to guide through admissions at your chosen coaching institute.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-2xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-emerald-500 text-white" : step > s ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-gray-500"}`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <ChevronRight className="w-4 h-4 text-gray-600 mx-0.5" />}
            </div>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${msg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
            {msg.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        {userLoaded && form.email && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            You&apos;re logged in. Your details are pre-filled; you can edit them and complete the rest.
          </div>
        )}

        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              {step === 1 && <><User className="w-4 h-4 text-emerald-400" /> Step 1 – Personal details</>}
              {step === 2 && <><BookOpen className="w-4 h-4 text-emerald-400" /> Step 2 – Academic details</>}
              {step === 3 && <><Building2 className="w-4 h-4 text-emerald-400" /> Step 3 – Coaching & course</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <Label className={labelClass}>Your name *</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Phone *</Label>
                  <Input type="tel" value={form.phone} onChange={(e) => update("phone", restrictPhone10(e.target.value))} placeholder="10 digits" maxLength={10} className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Parent / Guardian name</Label>
                  <Input value={form.parentName} onChange={(e) => update("parentName", e.target.value)} placeholder="Optional" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Parent / Guardian phone</Label>
                  <Input type="tel" value={form.parentPhone} onChange={(e) => update("parentPhone", restrictPhone10(e.target.value))} placeholder="10 digits (optional)" maxLength={10} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={labelClass}>City</Label>
                    <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City" className={inputClass} />
                  </div>
                  <div>
                    <Label className={labelClass}>State</Label>
                    <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="State" className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label className={labelClass}>Current class / Grade</Label>
                  <Input value={form.currentClass} onChange={(e) => update("currentClass", e.target.value)} placeholder="e.g. 10th, 12th, B.Tech 1st year" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Board</Label>
                  <Input value={form.board} onChange={(e) => update("board", e.target.value)} placeholder="e.g. CBSE, ICSE, State Board" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>School / College name</Label>
                  <Input value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} placeholder="Current institution" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Stream</Label>
                  <Input value={form.stream} onChange={(e) => update("stream", e.target.value)} placeholder="e.g. Science, Commerce, Arts" className={inputClass} />
                </div>
                <div>
                  <Label className={labelClass}>Year of passing (if applicable)</Label>
                  <Input value={form.yearOfPassing} onChange={(e) => update("yearOfPassing", e.target.value)} placeholder="e.g. 2025" className={inputClass} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label className={labelClass}>Coaching institute where you want admission *</Label>
                  <Select value={form.coachingInstitute || ""} onValueChange={(v) => update("coachingInstitute", v)}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select institute" />
                    </SelectTrigger>
                    <SelectContent>
                      {COACHING_INSTITUTES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Course you want to join *</Label>
                  <Select value={form.course || ""} onValueChange={(v) => update("course", v)}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Mode of learning</Label>
                  <Select value={form.mode} onValueChange={(v) => update("mode", v)}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Additional notes</Label>
                  <Textarea value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} placeholder="Any specific requirement or question" className={`${inputClass} min-h-[80px]`} />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="bg-white/[0.04] border-white/[0.08] text-gray-300">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              <div className="flex-1" />
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)} disabled={step === 1 && !step1Valid} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !step3Valid}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Submit admission form
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
