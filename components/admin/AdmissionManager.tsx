"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    GraduationCap, Trash2, Eye, Mail, Phone, Calendar,
    MapPin, CheckCircle, Clock, X, AlertTriangle
} from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AdmissionManagerProps {
    admissions: any[]
    updateStatus: (id: string, status: string) => void
    onDelete: (id: string) => void
}

export function AdmissionManager({ admissions, updateStatus, onDelete }: AdmissionManagerProps) {
    const [selectedAdmission, setSelectedAdmission] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)

    const handleView = (a: any) => {
        setSelectedAdmission(a)
        setShowModal(true)
    }

    return (
        <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    Admission Requests ({admissions.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 overflow-hidden">
                <div className="space-y-3">
                    {admissions.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 text-sm italic">No admissions found</div>
                    ) : (
                        admissions.map((a) => (
                            <div key={a._id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between group">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-white text-sm truncate">{a.studentName}</h4>
                                        <Badge variant="outline" className={`h-4 text-[9px] py-0 px-1.5 border-0 ${a.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                                                a.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                                                    "bg-yellow-500/10 text-yellow-400"
                                            }`}>{a.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{a.phone}</span>
                                        <span className="flex items-center gap-1 font-medium text-blue-400">{a.interestedCourse}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" onClick={() => handleView(a)} className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                    {a.status === "pending" && (
                                        <Button onClick={() => updateStatus(a._id, "completed")} size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-400 hover:text-white hover:bg-emerald-500/10">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => onDelete(a._id)} className="h-7 w-7 p-0 text-red-400 hover:text-white hover:bg-red-500/10">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-[#0d1117] border-white/[0.08] text-white">
                    <DialogHeader><DialogTitle className="text-sm font-semibold">Admission Details</DialogTitle></DialogHeader>
                    {selectedAdmission && (
                        <div className="space-y-4 pt-2">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Student Name</p>
                                        <p className="text-sm font-semibold text-white">{selectedAdmission.studentName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Interest</p>
                                        <p className="text-sm font-semibold text-emerald-400 uppercase">{selectedAdmission.interest}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase">Phone</p>
                                    <p className="text-sm text-white">{selectedAdmission.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase">Interested In</p>
                                    <p className="text-sm text-blue-400 font-medium">{selectedAdmission.interestedCourse}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase">Previous Details</p>
                                    <p className="text-sm text-gray-300">{selectedAdmission.previousDetails || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedAdmission.status === "pending" && (
                                    <Button onClick={() => { updateStatus(selectedAdmission._id, "completed"); setShowModal(false) }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-xl font-semibold">
                                        Mark as Completed
                                    </Button>
                                )}
                                <Button onClick={() => { onDelete(selectedAdmission._id); setShowModal(false) }} variant="outline" className="flex-1 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 h-10 rounded-xl">
                                    Delete Request
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
