"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Plus, Pencil, Trash2, CopyPlus, ImageIcon,
    Loader2, X, AlertTriangle, CheckCircle
} from "lucide-react"

interface OfferManagerProps {
    offers: any[]
    form: any
    onFormChange: (form: any) => void
    onImageChange: (file: File | null) => void
    onSave: () => void
    onDelete: (id: string) => void
    onDuplicate: (offer: any) => void
    onEdit: (offer: any) => void
    onCancelEdit: () => void
    editingId: string | null
    loading: boolean
    message: { type: string; text: string }
    tickerText: string
    onTickerChange: (text: string) => void
    onTickerSave: () => void
    tickerSaving: boolean
    getImageUrl: (path: string) => string | null
}

export function OfferManager({
    offers, form, onFormChange, onImageChange, onSave,
    onDelete, onDuplicate, onEdit, onCancelEdit,
    editingId, loading, message, tickerText,
    onTickerChange, onTickerSave, tickerSaving, getImageUrl
}: OfferManagerProps) {
    const inputClass = "h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
    const labelClass = "text-xs text-gray-300"

    return (
        <div className="grid lg:grid-cols-5 gap-5">
            {/* Left - Form */}
            <div className="lg:col-span-2 space-y-5">
                <Card className="bg-white/[0.02] border-white/[0.06]">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    <CardHeader className="pb-3 px-5 pt-5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                            {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {editingId ? "Edit Offer" : "Add New Offer"}
                        </CardTitle>
                        {editingId && (
                            <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-7 text-xs text-gray-400 hover:text-white">
                                <X className="w-3 h-3 mr-1" /> Cancel
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-4">
                        <div className="space-y-3">
                            <div>
                                <Label className={labelClass}>Offer Banner Image</Label>
                                <div className="mt-1.5 flex items-center gap-3">
                                    <div className="w-20 aspect-video rounded-lg bg-white/[0.04] border border-white/[0.08] overflow-hidden flex items-center justify-center">
                                        {form.imageUrl || editingId ? (
                                            <img src={getImageUrl(form.imageUrl) || ""} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input type="file" accept="image/*" onChange={(e) => onImageChange(e.target.files?.[0] || null)} className="h-8 text-[10px] bg-white/[0.02] border-white/[0.1] file:text-white file:text-[10px]" />
                                        <p className="text-[10px] text-gray-500 mt-1">Recommended: 1200x600px</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className={labelClass}>Title (Main Heading) *</Label>
                                <Input value={form.title} onChange={(e) => onFormChange({ ...form, title: e.target.value })} placeholder="e.g. 20% OFF on Mentorship" className={inputClass} />
                            </div>

                            <div>
                                <Label className={labelClass}>Subtitle (Description)</Label>
                                <Input value={form.subtitle} onChange={(e) => onFormChange({ ...form, subtitle: e.target.value })} placeholder="Short detail..." className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className={labelClass}>CTA Button Text</Label>
                                    <Input value={form.ctaText} onChange={(e) => onFormChange({ ...form, ctaText: e.target.value })} placeholder="Get Started" className={inputClass} />
                                </div>
                                <div>
                                    <Label className={labelClass}>CTA Link (Path)</Label>
                                    <Input value={form.ctaLink} onChange={(e) => onFormChange({ ...form, ctaLink: e.target.value })} placeholder="/admission" className={inputClass} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <Switch checked={form.isActive} onCheckedChange={(v) => onFormChange({ ...form, isActive: v })} />
                                    <Label className={labelClass}>Active (visible on home)</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className={labelClass}>Sort Order</Label>
                                    <Input type="number" value={form.order} onChange={(e) => onFormChange({ ...form, order: parseInt(e.target.value) || 0 })} className="w-16 h-8 bg-white/[0.04] border-white/[0.08]" />
                                </div>
                            </div>
                        </div>

                        <Button onClick={onSave} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-10 text-sm font-semibold rounded-xl transition-all">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingId ? <Pencil className="w-3.5 h-3.5 mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                            {editingId ? "Update Offer" : "Add Offer"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Ticker Settings */}
                <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardHeader className="pb-3 px-5 pt-5">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Home Page Ticker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-3">
                        <Label className={labelClass}>Moving Announcement Text</Label>
                        <Input value={tickerText} onChange={(e) => onTickerChange(e.target.value)} placeholder="Enter announcement text..." className={inputClass} />
                        <Button onClick={onTickerSave} disabled={tickerSaving} size="sm" className="w-full border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white">
                            {tickerSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : "Save Ticker Text"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right - List */}
            <div className="lg:col-span-3">
                <Card className="bg-white/[0.02] border-white/[0.06] h-full flex flex-col">
                    <CardHeader className="pb-3 px-5 pt-5 shrink-0">
                        <CardTitle className="text-sm text-white">Live Offers ({offers.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex-1 overflow-y-auto min-h-[400px]">
                        <div className="space-y-3">
                            {offers.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 text-sm italic">No offers found</div>
                            ) : (
                                offers.sort((a, b) => (a.order || 0) - (b.order || 0)).map((o) => (
                                    <div key={o._id} className={`group p-4 rounded-xl border transition-all ${o.isActive ? "bg-white/[0.03] border-white/[0.08]" : "bg-red-500/[0.02] border-red-500/10 opacity-60"}`}>
                                        <div className="flex gap-4">
                                            {o.imageUrl && (
                                                <div className="w-24 aspect-video rounded-lg overflow-hidden border border-white/[0.04] shrink-0">
                                                    <img src={getImageUrl(o.imageUrl) || ""} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-semibold text-white text-sm truncate">{o.title}</h4>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${o.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                                        {o.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{o.subtitle || "No subtitle"}</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-blue-500" /> Sort Order: {o.order || 0}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-500" /> CTA: {o.ctaText}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button onClick={() => onDuplicate(o)} variant="ghost" size="sm" className="h-7 text-[10px] text-blue-400 hover:text-blue-300 px-2">
                                                <CopyPlus className="w-3 h-3 mr-1" /> Duplicate
                                            </Button>
                                            <Button onClick={() => onEdit(o)} variant="ghost" size="sm" className="h-7 text-[10px] text-blue-400 hover:text-blue-300 px-2">
                                                <Pencil className="w-3 h-3 mr-1" /> Edit
                                            </Button>
                                            <Button onClick={() => onDelete(o._id)} variant="ghost" size="sm" className="h-7 text-[10px] text-red-400 hover:text-red-300 px-2">
                                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                                            </Button>
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
