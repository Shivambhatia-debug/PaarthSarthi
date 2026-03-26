"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    MessageSquare, Trash2, Mail, Phone, Calendar,
    MapPin, User, CheckCircle, Clock, XCircle
} from "lucide-react"

interface ContactManagerProps {
    contacts: any[]
    updateStatus: (id: string, status: string) => void
}

export function ContactManager({ contacts, updateStatus }: ContactManagerProps) {
    return (
        <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    General Requests ({contacts.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 overflow-hidden">
                <div className="space-y-4">
                    {contacts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 text-sm italic">No requests found</div>
                    ) : (
                        contacts.map((c) => (
                            <div key={c._id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-white text-sm">{c.name}</h4>
                                            <Badge variant="outline" className={`h-4 text-[9px] py-0 px-1.5 border-0 ${c.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                                                    c.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                                                        "bg-yellow-500/10 text-yellow-400"
                                                }`}>{c.status}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                            <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{c.email}</span>
                                            <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{c.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {c.status === "pending" && (
                                            <Button onClick={() => updateStatus(c._id, "completed")} size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-400 hover:text-white hover:bg-emerald-500/10">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                        <Button onClick={() => updateStatus(c._id, "cancelled")} size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-white hover:bg-red-500/10">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-300 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04] italic">
                                    "{c.message}"
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> {new Date(c.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
