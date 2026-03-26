"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Calendar, Clock, Phone, Mail, MessageSquare,
    ExternalLink, CheckCircle, X, Trash2, Eye
} from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface MeetingManagerProps {
    meetings: any[]
    onAccept: (meeting: any) => void
    onCancel: (id: string) => void
    onView: (meeting: any) => void
    onSaveLink: (meeting: any, link: string) => void
    onConfirm: (meeting: any, link: string) => void
    onDelete?: (id: string) => void
}

export function MeetingManager({
    meetings, onAccept, onCancel, onView, onSaveLink, onConfirm, onDelete
}: MeetingManagerProps) {
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [linkInput, setLinkInput] = useState("")

    const getWhatsAppUrl = (phone: string, personName: string, date: string) => {
        const cleanPhone = phone?.replace(/[^0-9]/g, "") || ""
        const fdate = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        const text = encodeURIComponent(`Hi! This is ParthSarthi Admin. Your meeting with ${personName} on ${fdate} has been confirmed. Here is the meeting link: `)
        return `https://wa.me/${cleanPhone}?text=${text}`
    }

    const handleOpenModal = (m: any) => {
        setSelectedMeeting(m)
        setLinkInput(m.meetingLink || "")
        setShowModal(true)
    }

    return (
        <div className="space-y-4">
            <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        All Meetings ({meetings.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 overflow-hidden">
                    <div className="overflow-x-auto -mx-1 px-1">
                        <table className="w-full text-left text-xs text-gray-300 border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.06] text-gray-500 font-medium">
                                    <th className="py-3 px-2">Date</th>
                                    <th className="py-3 px-2">User / Topic</th>
                                    <th className="py-3 px-2">Meeting With</th>
                                    <th className="py-3 px-2">Status</th>
                                    <th className="py-3 px-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {meetings.length === 0 ? (
                                    <tr><td colSpan={5} className="py-20 text-center text-gray-500 italic">No meetings found</td></tr>
                                ) : (
                                    meetings.map((m) => (
                                        <tr key={m._id} className="hover:bg-white/[0.02] group transition-colors">
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-white">{new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                                                <div className="text-[10px] text-gray-500 uppercase">{m.slot || "Any"}</div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-white">{m.userName}</div>
                                                <div className="text-[10px] text-gray-500 line-clamp-1">{m.subject}</div>
                                                {m.userPhone && <div className="text-[9px] text-gray-500 flex items-center gap-0.5 mt-0.5"><Phone className="w-2.5 h-2.5" />{m.userPhone}</div>}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-white">{m.meetingPersonName}</div>
                                                <Badge variant="outline" className="h-4 text-[9px] py-0 px-1.5 border-white/[0.1] text-gray-400 capitalize">{m.meetingWith}</Badge>
                                            </td>
                                            <td className="py-3 px-2">
                                                <Badge variant="outline" className={`h-5 text-[9px] py-0 px-2 flex w-fit items-center gap-1 border-0 ${m.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                                                        m.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                                                            "bg-yellow-500/10 text-yellow-400"
                                                    }`}>
                                                    <span className={`w-1 h-1 rounded-full ${m.status === "confirmed" ? "bg-emerald-400" :
                                                            m.status === "cancelled" ? "bg-red-400" :
                                                                "bg-yellow-400"
                                                        }`} />
                                                    {m.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {m.status === "pending" && (
                                                        <Button size="sm" onClick={() => handleOpenModal(m)} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 px-2.5">
                                                            Accept
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(m)} className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                    {m.status !== "cancelled" && (
                                                        <Button variant="ghost" size="sm" onClick={() => onCancel(m._id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                            <X className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Meeting Detail / Accept Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-[#0d1117] border-white/[0.08] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Meeting Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedMeeting && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">User Information</p>
                                    <p className="font-semibold text-white">{selectedMeeting.userName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{selectedMeeting.userEmail}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{selectedMeeting.userPhone}</p>
                                </div>
                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Meeting With</p>
                                    <p className="font-semibold text-white">{selectedMeeting.meetingPersonName}</p>
                                    <Badge variant="outline" className="h-4 text-[9px] mt-1 border-blue-500/20 text-blue-400">{selectedMeeting.meetingWith}</Badge>
                                </div>
                            </div>

                            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Schedule & Topic</p>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                                        <Calendar className="w-3.5 h-3.5" /> {new Date(selectedMeeting.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-blue-400">
                                        <Clock className="w-3.5 h-3.5" /> {selectedMeeting.slot || "Any"}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-300 mt-2 font-medium">{selectedMeeting.subject}</p>
                                <p className="text-xs text-gray-500 mt-1 italic">{selectedMeeting.description || "No description provided"}</p>
                            </div>

                            <div>
                                <Label className="text-xs text-gray-400 mb-1.5 block">Meeting Link (Google Meet/Zoom)</Label>
                                <Input
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    placeholder="Paste meeting link here..."
                                    className="h-10 bg-white/[0.03] border-white/[0.08] text-white"
                                />
                            </div>

                            <div className="flex gap-2">
                                {selectedMeeting.userPhone && (
                                    <Button asChild variant="outline" className="flex-1 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 h-10 rounded-xl">
                                        <a href={getWhatsAppUrl(selectedMeeting.userPhone, selectedMeeting.meetingPersonName, selectedMeeting.date)} target="_blank" rel="noreferrer">
                                            <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                                        </a>
                                    </Button>
                                )}
                                {selectedMeeting.status === "pending" ? (
                                    <Button onClick={() => { onConfirm(selectedMeeting, linkInput); setShowModal(false) }} className="flex-1 bg-white text-black hover:bg-gray-200 h-10 rounded-xl font-semibold">
                                        Accept & Send Email
                                    </Button>
                                ) : (
                                    <Button onClick={() => onSaveLink(selectedMeeting, linkInput)} className="flex-1 bg-white text-black hover:bg-gray-200 h-10 rounded-xl font-semibold">
                                        Update Link Only
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
