"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Plus, Pencil, Trash2, Camera, Loader2, X,
    Rocket
} from "lucide-react"

interface StartupManagerProps {
    startupList: any[]
    form: any
    onFormChange: (form: any) => void
    onLogoChange: (file: File | null) => void
    onSave: () => void
    onDelete: (id: string) => void
    onEdit: (startup: any) => void
    onCancelEdit: () => void
    editingId: string | null
    loading: boolean
    getImageUrl: (path: string) => string | null
    getEditingLogo: () => string | null
}

export function StartupManager({
    startupList, form, onFormChange, onLogoChange, onSave,
    onDelete, onEdit, onCancelEdit, editingId,
    loading, getImageUrl, getEditingLogo
}: StartupManagerProps) {
    const inputClass = "h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
    const labelClass = "text-xs text-gray-300"

    return (
        <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2">
                <Card className="bg-white/[0.02] border-white/[0.06]">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    <CardHeader className="pb-3 px-5 pt-5">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-white flex items-center gap-2">
                                {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {editingId ? "Edit Startup" : "Add Startup"}
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
                            <Label className={labelClass}>Startup Logo</Label>
                            <div className="flex items-center gap-3 mt-1">
                                {(getEditingLogo() || form.logo) ? (
                                    <img src={form.logo ? URL.createObjectURL(form.logo) : getImageUrl(getEditingLogo() || "") || ""} className="w-14 h-14 rounded-lg object-cover border border-white/[0.08]" alt="" />
                                ) : (
                                    <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
                                        <Camera className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <input type="file" accept="image/*" id="startup-logo" className="hidden" onChange={(e) => onLogoChange(e.target.files?.[0] || null)} />
                                    <label htmlFor="startup-logo" className="cursor-pointer text-xs text-blue-400 hover:underline block">
                                        {getEditingLogo() || form.logo ? "Change Logo" : "Upload Logo"}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div><Label className={labelClass}>Startup Name *</Label><Input value={form.name} onChange={(e) => onFormChange({ ...form, name: e.target.value })} placeholder="Startup name" className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className={labelClass}>Industry *</Label><Input value={form.industry} onChange={(e) => onFormChange({ ...form, industry: e.target.value })} placeholder="e.g. EdTech" className={inputClass} /></div>
                            <div>
                                <Label className={labelClass}>Stage</Label>
                                <Select value={form.stage} onValueChange={(v) => onFormChange({ ...form, stage: v })}>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Stage" /></SelectTrigger>
                                    <SelectContent className="bg-[#0d1117] border-white/[0.1] text-white">
                                        <SelectItem value="idea">Idea Stage</SelectItem>
                                        <SelectItem value="mvp">MVP</SelectItem>
                                        <SelectItem value="early">Early Stage</SelectItem>
                                        <SelectItem value="scaling">Scaling</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className={labelClass}>Location</Label><Input value={form.location} onChange={(e) => onFormChange({ ...form, location: e.target.value })} placeholder="City" className={inputClass} /></div>
                            <div><Label className={labelClass}>Founder Name</Label><Input value={form.founderName} onChange={(e) => onFormChange({ ...form, founderName: e.target.value })} placeholder="Founder" className={inputClass} /></div>
                        </div>
                        <div><Label className={labelClass}>Services Offered (comma separated)</Label><Input value={form.services} onChange={(e) => onFormChange({ ...form, services: e.target.value })} placeholder="e.g. Tech, Marketing, Funding" className={inputClass} /></div>
                        <div><Label className={labelClass}>Short Description</Label><Input value={form.shortDescription} onChange={(e) => onFormChange({ ...form, shortDescription: e.target.value })} placeholder="One line pitch..." className={inputClass} /></div>
                        <div><Label className={labelClass}>Full Description</Label><Textarea value={form.description} onChange={(e) => onFormChange({ ...form, description: e.target.value })} placeholder="Startup details..." rows={3} className="text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" /></div>
                        <Button onClick={onSave} disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white h-10 text-sm font-semibold rounded-xl">
                            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : editingId ? <Pencil className="w-3.5 h-3.5 mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                            {editingId ? "Update Startup" : "Add Startup"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
                <Card className="bg-white/[0.02] border-white/[0.06] h-full flex flex-col">
                    <CardHeader className="pb-3 px-5 pt-5 shrink-0">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-red-500" />
                            Startups ({startupList.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex-1 overflow-y-auto min-h-[400px]">
                        <div className="space-y-2">
                            {startupList.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 text-sm italic">No startups found</div>
                            ) : (
                                startupList.map((s) => (
                                    <div key={s._id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.04] shrink-0">
                                                {s.logo ? <img src={getImageUrl(s.logo) || ""} className="w-full h-full object-cover" alt="" /> : <Rocket className="w-5 h-5 m-2.5 text-gray-600" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{s.industry} • {s.stage}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" onClick={() => onEdit(s)} className="h-7 w-7 p-0 text-blue-400 hover:text-white hover:bg-white/[0.06]"><Pencil className="w-3.5 h-3.5" /></Button>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(s._id)} className="h-7 w-7 p-0 text-red-400 hover:text-white hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></Button>
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
