"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
    Plus, Pencil, Trash2, ImageIcon, Camera,
    Loader2, X, BookOpen
} from "lucide-react"

interface CourseManagerProps {
    courseList: any[]
    form: any
    onFormChange: (form: any) => void
    onThumbnailChange: (file: File | null) => void
    onSave: () => void
    onDelete: (id: string) => void
    onEdit: (course: any) => void
    onCancelEdit: () => void
    editingId: string | null
    loading: boolean
    getImageUrl: (path: string) => string | null
    getEditingThumbnail: () => string | null
}

export function CourseManager({
    courseList, form, onFormChange, onThumbnailChange, onSave,
    onDelete, onEdit, onCancelEdit, editingId,
    loading, getImageUrl, getEditingThumbnail
}: CourseManagerProps) {
    const inputClass = "h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
    const labelClass = "text-xs text-gray-300"

    return (
        <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2">
                <Card className="bg-white/[0.02] border-white/[0.06]">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                    <CardHeader className="pb-3 px-5 pt-5">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-white flex items-center gap-2">
                                {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {editingId ? "Edit Course" : "Add New Course"}
                            </CardTitle>
                            {editingId && (
                                <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-7 text-xs text-gray-400 hover:text-white">
                                    <X className="w-3 h-3 mr-1" /> Cancel
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-3">
                        <div>
                            <Label className={labelClass}>Thumbnail</Label>
                            <div className="flex items-center gap-3 mt-1">
                                {(getEditingThumbnail() || form.thumbnail) ? (
                                    <div className="w-20 aspect-video rounded-lg overflow-hidden border border-white/[0.08]">
                                        <img src={form.thumbnail ? URL.createObjectURL(form.thumbnail) : getImageUrl(getEditingThumbnail() || "") || ""} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ) : (
                                    <div className="w-20 aspect-video rounded-lg bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <input type="file" accept="image/*" id="course-thumb" className="hidden" onChange={(e) => onThumbnailChange(e.target.files?.[0] || null)} />
                                    <label htmlFor="course-thumb" className="cursor-pointer text-xs text-blue-400 hover:underline block">
                                        {getEditingThumbnail() || form.thumbnail ? "Change Image" : "Upload Image"}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div><Label className={labelClass}>Course Title *</Label><Input value={form.title} onChange={(e) => onFormChange({ ...form, title: e.target.value })} placeholder="Course name" className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className={labelClass}>Category</Label>
                                <Select value={form.category} onValueChange={(v) => onFormChange({ ...form, category: v })}>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Category" /></SelectTrigger>
                                    <SelectContent className="bg-[#0d1117] border-white/[0.1] text-white">
                                        <SelectItem value="career-guidance">Career Guidance</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="design">Design</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label className={labelClass}>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => onFormChange({ ...form, price: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className={labelClass}>Language</Label>
                                <Select value={form.language} onValueChange={(v) => onFormChange({ ...form, language: v })}>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Language" /></SelectTrigger>
                                    <SelectContent className="bg-[#0d1117] border-white/[0.1] text-white">
                                        <SelectItem value="hindi">Hindi</SelectItem>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className={labelClass}>Level</Label>
                                <Select value={form.level} onValueChange={(v) => onFormChange({ ...form, level: v })}>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Level" /></SelectTrigger>
                                    <SelectContent className="bg-[#0d1117] border-white/[0.1] text-white">
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div><Label className={labelClass}>Instructor Name</Label><Input value={form.instructorName} onChange={(e) => onFormChange({ ...form, instructorName: e.target.value })} placeholder="Instructor" className={inputClass} /></div>
                        <div><Label className={labelClass}>Short Description</Label><Input value={form.shortDescription} onChange={(e) => onFormChange({ ...form, shortDescription: e.target.value })} placeholder="One line description..." className={inputClass} /></div>
                        <div><Label className={labelClass}>Full Description</Label><Textarea value={form.description} onChange={(e) => onFormChange({ ...form, description: e.target.value })} placeholder="Course details..." rows={3} className="text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" /></div>
                        <div className="flex items-center gap-2">
                            <Switch checked={form.isPublished} onCheckedChange={(v) => onFormChange({ ...form, isPublished: v })} />
                            <Label className={labelClass}>Publish Course</Label>
                        </div>
                        <Button onClick={onSave} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 text-white h-10 text-sm font-semibold rounded-xl">
                            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : editingId ? <Pencil className="w-3.5 h-3.5 mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                            {editingId ? "Update Course" : "Create Course"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
                <Card className="bg-white/[0.02] border-white/[0.06] h-full flex flex-col">
                    <CardHeader className="pb-3 px-5 pt-5 shrink-0">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-orange-400" />
                            Courses ({courseList.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex-1 overflow-y-auto min-h-[400px]">
                        <div className="space-y-2">
                            {courseList.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 text-sm italic">No courses found</div>
                            ) : (
                                courseList.map((c) => (
                                    <div key={c._id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.04] shrink-0">
                                                {c.thumbnail ? <img src={getImageUrl(c.thumbnail) || ""} className="w-full h-full object-cover" alt="" /> : <BookOpen className="w-5 h-5 m-2.5 text-gray-600" />}
                                            </div>
                                            <div className="min-w-0 text-[11px]">
                                                <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                                                <p className="text-gray-500 truncate">₹{c.price || "Free"} • {c.level} • {c.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" onClick={() => onEdit(c)} className="h-7 w-7 p-0 text-blue-400 hover:text-white hover:bg-white/[0.06]"><Pencil className="w-3.5 h-3.5" /></Button>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(c._id)} className="h-7 w-7 p-0 text-red-400 hover:text-white hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
