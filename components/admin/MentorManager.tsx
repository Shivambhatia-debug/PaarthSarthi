"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Plus, Pencil, Trash2, Camera, Loader2, X,
    Users
} from "lucide-react"

interface MentorManagerProps {
    mentorList: any[]
    form: any
    onFormChange: (form: any) => void
    onPhotoChange: (file: File | null) => void
    onSave: () => void
    onDelete: (id: string) => void
    onEdit: (mentor: any) => void
    onCancelEdit: () => void
    editingId: string | null
    loading: boolean
    getImageUrl: (path: string) => string | null
    getEditingPhoto: () => string | null
}

export function MentorManager({
    mentorList, form, onFormChange, onPhotoChange, onSave,
    onDelete, onEdit, onCancelEdit, editingId,
    loading, getImageUrl, getEditingPhoto
}: MentorManagerProps) {
    const inputClass = "h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
    const labelClass = "text-xs text-gray-300"

    return (
        <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2">
                <Card className="bg-white/[0.02] border-white/[0.06]">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    <CardHeader className="pb-3 px-5 pt-5">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-white flex items-center gap-2">
                                {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {editingId ? "Edit Mentor" : "Add Mentor"}
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
                            <Label className={labelClass}>Photo</Label>
                            <div className="flex items-center gap-3 mt-1">
                                {(getEditingPhoto() || form.photo) ? (
                                    <img src={form.photo ? URL.createObjectURL(form.photo) : getImageUrl(getEditingPhoto() || "") || ""} className="w-14 h-14 rounded-lg object-cover border border-white/[0.08]" alt="" />
                                ) : (
                                    <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
                                        <Camera className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <input type="file" accept="image/*" id="mentor-photo" className="hidden" onChange={(e) => onPhotoChange(e.target.files?.[0] || null)} />
                                    <label htmlFor="mentor-photo" className="cursor-pointer text-xs text-blue-400 hover:underline block">
                                        {getEditingPhoto() || form.photo ? "Change Photo" : "Upload Photo"}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className={labelClass}>Name *</Label><Input value={form.name} onChange={(e) => onFormChange({ ...form, name: e.target.value })} placeholder="Full name" className={inputClass} /></div>
                            <div><Label className={labelClass}>Designation *</Label><Input value={form.designation} onChange={(e) => onFormChange({ ...form, designation: e.target.value })} placeholder="e.g. Mentor" className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className={labelClass}>Company</Label><Input value={form.company} onChange={(e) => onFormChange({ ...form, company: e.target.value })} placeholder="Company" className={inputClass} /></div>
                            <div><Label className={labelClass}>Experience (yrs)</Label><Input type="number" value={form.experience} onChange={(e) => onFormChange({ ...form, experience: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className={labelClass}>Email *</Label><Input type="email" value={form.email} onChange={(e) => onFormChange({ ...form, email: e.target.value })} placeholder="email@example.com" className={inputClass} /></div>
                            <div><Label className={labelClass}>Phone</Label><Input value={form.phone} onChange={(e) => onFormChange({ ...form, phone: e.target.value })} placeholder="+91..." className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className={labelClass}>Price / Session (₹)</Label><Input type="number" value={form.sessionPrice} onChange={(e) => onFormChange({ ...form, sessionPrice: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
                            <div><Label className={labelClass}>Languages</Label><Input value={form.languages} onChange={(e) => onFormChange({ ...form, languages: e.target.value })} placeholder="Hindi, English" className={inputClass} /></div>
                        </div>
                        <div><Label className={labelClass}>Specialization (comma separated)</Label><Input value={form.specialization} onChange={(e) => onFormChange({ ...form, specialization: e.target.value })} placeholder="e.g. Sales, React" className={inputClass} /></div>
                        <div><Label className={labelClass}>Bio</Label><Textarea value={form.bio} onChange={(e) => onFormChange({ ...form, bio: e.target.value })} placeholder="Short bio..." rows={2} className="text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" /></div>
                        <Button onClick={onSave} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white h-10 text-sm font-semibold rounded-xl">
                            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : editingId ? <Pencil className="w-3.5 h-3.5 mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                            {editingId ? "Update Mentor" : "Add Mentor"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
                <Card className="bg-white/[0.02] border-white/[0.06] h-full flex flex-col">
                    <CardHeader className="pb-3 px-5 pt-5 shrink-0">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            Mentor List ({mentorList.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex-1 overflow-y-auto min-h-[400px]">
                        <div className="space-y-2">
                            {mentorList.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 text-sm italic">No mentors found</div>
                            ) : (
                                mentorList.map((m) => (
                                    <div key={m._id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.04] shrink-0">
                                                {m.photo ? <img src={getImageUrl(m.photo) || ""} className="w-full h-full object-cover" alt="" /> : <Users className="w-5 h-5 m-2.5 text-gray-600" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{m.designation} at {m.company || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" onClick={() => onEdit(m)} className="h-7 w-7 p-0 text-blue-400 hover:text-white hover:bg-white/[0.06]"><Pencil className="w-3.5 h-3.5" /></Button>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(m._id)} className="h-7 w-7 p-0 text-red-400 hover:text-white hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></Button>
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
