"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Star, Search, Globe, Loader2, BookOpen, Play } from "lucide-react"
import { courseAPI } from "@/lib/api"

const apiBase = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || ""

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [language, setLanguage] = useState("all")
  const [thumbFailed, setThumbFailed] = useState<Record<string, boolean>>({})

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    try {
      const data = await courseAPI.getAll("limit=50")
      setCourses(data.courses || [])
    } catch {} finally { setLoading(false) }
  }

  const filtered = courses.filter((c) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "all" || c.category === category
    const matchLang = language === "all" || c.language === language
    return matchSearch && matchCat && matchLang
  })

  return (
    <div className="min-h-screen bg-[#060a13]">
      {/* Hero */}
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Learn & Grow</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Courses & Webinars</h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Learn from industry experts with curated courses in your preferred language.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <div className="relative sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500/20" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-44 h-10 bg-white/[0.04] border-white/[0.08] text-white"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/[0.08] text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="career-guidance">Career Guidance</SelectItem>
                  <SelectItem value="skill-development">Skill Development</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="personality-development">Personality</SelectItem>
                </SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full sm:w-36 h-10 bg-white/[0.04] border-white/[0.08] text-white"><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/[0.08] text-white">
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-28">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-16 h-16 text-gray-600" />
            </div>
            <p className="font-semibold text-white text-lg mb-1">No Courses Found</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {courses.length === 0 ? "Courses will appear here once added by the admin." : "Try adjusting your filters."}
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((course) => (
            <Card key={course._id} className="group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.15] hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-white/[0.03]">
                {course.thumbnail && !thumbFailed[course._id] ? (
                  <img
                    src={`${apiBase()}${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={() => setThumbFailed((p) => ({ ...p, [course._id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {course.isWebinar && (
                    <Badge className="rounded-md bg-red-500 text-white text-[10px] px-1.5 border-0">
                      <Play className="w-2.5 h-2.5 mr-0.5" /> Live
                    </Badge>
                  )}
                  <Badge className="rounded-md bg-black/50 backdrop-blur text-white border-0 text-[10px] px-1.5 capitalize">{course.level}</Badge>
                </div>
              </div>

              <CardContent className="p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="rounded-md bg-white/[0.06] text-gray-300 border-0 text-[10px] px-2 py-0.5 capitalize">{course.category?.replace("-", " ")}</Badge>
                  <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                    <Globe className="w-2.5 h-2.5" /> {course.language}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-white mb-1 line-clamp-2 leading-snug group-hover:text-white transition-colors">{course.title}</h3>
                {course.instructorName && <p className="text-xs text-gray-500 mb-3">by {course.instructorName}</p>}

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  {course.totalDuration && <span><Clock className="w-3 h-3 inline mr-0.5" />{course.totalDuration}</span>}
                  {course.enrolledStudents > 0 && <span><Users className="w-3 h-3 inline mr-0.5" />{course.enrolledStudents}</span>}
                  {course.rating > 0 && (
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {course.rating}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {course.isFree ? (
                      <span className="text-base font-bold text-emerald-400">Free</span>
                    ) : (
                      <span className="text-base font-bold text-blue-400">₹{course.price}</span>
                    )}
                  </div>
                  <Button size="sm" className="bg-white text-black hover:bg-gray-200 h-8 text-xs font-medium">
                    {course.isFree ? "Enroll Free" : "Enroll Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
