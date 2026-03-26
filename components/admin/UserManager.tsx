"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Users, Trash2, Eye, Mail, Phone, Calendar,
    MapPin, Shield
} from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UserManagerProps {
    users: any[]
    onDelete: (id: string) => void
}

export function UserManager({ users, onDelete }: UserManagerProps) {
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)

    const handleViewUser = (u: any) => {
        setSelectedUser(u)
        setShowModal(true)
    }

    return (
        <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Registered Users ({users.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 overflow-hidden">
                <div className="overflow-x-auto px-5 pb-5">
                    <table className="w-full text-left text-xs text-gray-300 border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] text-gray-500 font-medium">
                                <th className="py-3 px-2">User Info</th>
                                <th className="py-3 px-2 text-center">Role</th>
                                <th className="py-3 px-2">Joined</th>
                                <th className="py-3 px-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-white/[0.02] group transition-colors">
                                    <td className="py-3 px-2">
                                        <div className="font-medium text-white">{u.name}</div>
                                        <div className="text-[10px] text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                        <Badge variant="outline" className={`h-5 text-[9px] py-0 px-2 border-0 ${u.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
                                            {u.role}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-2 text-gray-500">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewUser(u)} className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => onDelete(u._id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-[#0d1117] border-white/[0.08] text-white">
                    <DialogHeader><DialogTitle className="text-sm font-semibold">User Details</DialogTitle></DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-lg font-bold">
                                    {selectedUser.name?.[0]}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-xs text-gray-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-white/[0.02] space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase"><Shield className="w-3 h-3" /> Account Role</div>
                                    <p className="text-sm font-medium text-white capitalize">{selectedUser.role}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/[0.02] space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase"><Calendar className="w-3 h-3" /> Member Since</div>
                                    <p className="text-sm font-medium text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Button onClick={() => setShowModal(false)} className="w-full bg-white text-black hover:bg-gray-200 h-10 rounded-xl font-semibold">Done</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
