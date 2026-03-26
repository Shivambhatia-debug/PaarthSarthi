"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users, GraduationCap, BookOpen, Rocket, Clock,
    Calendar, Bell, ChevronRight
} from "lucide-react"

interface DashboardOverviewProps {
    stats: any
    pendingMeetings: any[]
    notifications: any[]
    onAcceptMeeting: (meeting: any) => void
    onCancelMeeting: (id: string) => void
    onTabChange: (tab: any) => void
}

export function DashboardOverview({
    stats,
    pendingMeetings,
    notifications,
    onAcceptMeeting,
    onCancelMeeting,
    onTabChange
}: DashboardOverviewProps) {
    return (
        <div className="space-y-5">
            {stats && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                        { label: "Users", value: stats.totalUsers, icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10" },
                        { label: "Alumni", value: stats.totalAlumni, icon: GraduationCap, color: "text-purple-400", bgColor: "bg-purple-500/10" },
                        { label: "Mentors", value: stats.totalMentors, icon: Users, color: "text-green-400", bgColor: "bg-green-500/10" },
                        { label: "Courses", value: stats.totalCourses, icon: BookOpen, color: "text-orange-400", bgColor: "bg-orange-500/10" },
                        { label: "Startups", value: stats.totalStartups, icon: Rocket, color: "text-red-400", bgColor: "bg-red-500/10" },
                        { label: "Pending", value: stats.pendingMeetings, icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
                    ].map((s) => (
                        <Card key={s.label} className="bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-all">
                            <CardContent className="p-4 text-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 mx-auto ${s.bgColor}`}>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value || 0}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-5">
                {/* Pending Meetings */}
                <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardHeader className="pb-3 px-5 pt-5">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-yellow-400" />
                            Pending Meetings ({pendingMeetings.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        {pendingMeetings.length === 0 ? (
                            <p className="text-base text-gray-500 text-center py-16">No pending meetings</p>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {pendingMeetings.slice(0, 10).map((m) => (
                                    <div key={m._id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{m.userName}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">with {m.meetingPersonName} ({m.meetingWith})</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{m.subject}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[11px] text-gray-500">{new Date(m.date).toLocaleDateString()}</span>
                                                    {m.userPhone && <span className="text-[11px] text-gray-500 flex items-center gap-0.5"><Users className="w-3 h-3" />{m.userPhone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button size="sm" className="h-7 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3" onClick={() => onAcceptMeeting(m)}>
                                                Accept
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-7 text-xs px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0" onClick={() => onCancelMeeting(m._id)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="bg-white/[0.02] border-white/[0.06]">
                    <CardHeader className="pb-3 px-5 pt-5">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                            <Bell className="w-4 h-4 text-blue-400" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        {notifications.length === 0 ? (
                            <p className="text-base text-gray-500 text-center py-16">No notifications</p>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {notifications.map((n) => (
                                    <div key={n._id} className={`p-3 rounded-lg ${n.isRead ? "bg-white/[0.02]" : "bg-blue-500/10 border border-blue-500/10"}`}>
                                        <p className="text-sm font-medium text-white">{n.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                                        <p className="text-[11px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                    <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Add Alumni", tab: "alumni", icon: GraduationCap, color: "text-purple-400" },
                            { label: "Add Mentor", tab: "mentors", icon: Users, color: "text-blue-400" },
                            { label: "Add Course", tab: "courses", icon: BookOpen, color: "text-orange-400" },
                            { label: "Add Startup", tab: "startups", icon: Rocket, color: "text-red-400" },
                        ].map((action) => (
                            <button
                                key={action.label}
                                onClick={() => onTabChange(action.tab)}
                                className="flex items-center gap-3 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                            >
                                <action.icon className={`w-6 h-6 ${action.color} shrink-0`} />
                                <span className="text-sm font-semibold text-white">{action.label}</span>
                                <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
