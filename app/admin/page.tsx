"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
} from "lucide-react"

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const stats = {
    totalUsers: 12450,
    activeMentors: 567,
    totalSessions: 8934,
    monthlyRevenue: 2340000,
    pendingApprovals: 23,
    reportedIssues: 7,
  }

  const recentUsers = [
    {
      id: 1,
      name: "Arjun Kumar",
      email: "arjun@example.com",
      type: "Student",
      joinDate: "2024-12-20",
      status: "Active",
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      email: "priya@example.com",
      type: "Mentor",
      joinDate: "2024-12-19",
      status: "Pending",
    },
    {
      id: 3,
      name: "Rahul Patel",
      email: "rahul@example.com",
      type: "Student",
      joinDate: "2024-12-18",
      status: "Active",
    },
  ]

  const recentSessions = [
    {
      id: 1,
      student: "Arjun Kumar",
      mentor: "Dr. Priya Sharma",
      topic: "Career Guidance",
      date: "2024-12-20",
      duration: "60 min",
      status: "Completed",
      rating: 5,
    },
    {
      id: 2,
      student: "Neha Singh",
      mentor: "Rahul Kumar",
      topic: "Resume Review",
      date: "2024-12-20",
      duration: "45 min",
      status: "In Progress",
      rating: null,
    },
  ]

  const blogPosts = [
    {
      id: 1,
      title: "Career Transition Guide",
      author: "Admin",
      status: "Published",
      views: 1250,
      date: "2024-12-15",
    },
    {
      id: 2,
      title: "Mental Wellness Tips",
      author: "Dr. Meera Patel",
      status: "Draft",
      views: 0,
      date: "2024-12-20",
    },
  ]

  const reportedIssues = [
    {
      id: 1,
      type: "Session Issue",
      reporter: "Arjun Kumar",
      description: "Mentor didn't join the scheduled session",
      priority: "High",
      status: "Open",
      date: "2024-12-20",
    },
    {
      id: 2,
      type: "Payment Issue",
      reporter: "Priya Singh",
      description: "Payment deducted but session not booked",
      priority: "Critical",
      status: "In Progress",
      date: "2024-12-19",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, content, and platform analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Mentors</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeMentors}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalSessions.toLocaleString()}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">₹{(stats.monthlyRevenue / 100000).toFixed(1)}L</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reported Issues</p>
                  <p className="text-2xl font-bold text-red-600">{stats.reportedIssues}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            {user.type} • {user.joinDate}
                          </p>
                        </div>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{session.topic}</p>
                          <Badge variant={session.status === "Completed" ? "default" : "secondary"}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {session.student} with {session.mentor}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>
                            {session.date} • {session.duration}
                          </span>
                          {session.rating && (
                            <span className="flex items-center gap-1">Rating: {session.rating}/5</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search users..." className="pl-10" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="User Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="mentors">Mentors</SelectItem>
                      <SelectItem value="institutions">Institutions</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Join Date</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="p-3 font-medium">{user.name}</td>
                          <td className="p-3 text-gray-600">{user.email}</td>
                          <td className="p-3">
                            <Badge variant="outline">{user.type}</Badge>
                          </td>
                          <td className="p-3 text-gray-600">{user.joinDate}</td>
                          <td className="p-3">
                            <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Mentor</th>
                        <th className="text-left p-3">Topic</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Duration</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSessions.map((session) => (
                        <tr key={session.id} className="border-b">
                          <td className="p-3">{session.student}</td>
                          <td className="p-3">{session.mentor}</td>
                          <td className="p-3">{session.topic}</td>
                          <td className="p-3">{session.date}</td>
                          <td className="p-3">{session.duration}</td>
                          <td className="p-3">
                            <Badge variant={session.status === "Completed" ? "default" : "secondary"}>
                              {session.status}
                            </Badge>
                          </td>
                          <td className="p-3">{session.rating ? `${session.rating}/5` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Management</CardTitle>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Author</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Views</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogPosts.map((post) => (
                        <tr key={post.id} className="border-b">
                          <td className="p-3 font-medium">{post.title}</td>
                          <td className="p-3">{post.author}</td>
                          <td className="p-3">
                            <Badge variant={post.status === "Published" ? "default" : "secondary"}>{post.status}</Badge>
                          </td>
                          <td className="p-3">{post.views.toLocaleString()}</td>
                          <td className="p-3">{post.date}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Reported Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportedIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{issue.type}</h4>
                          <p className="text-sm text-gray-600">Reported by: {issue.reporter}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              issue.priority === "Critical"
                                ? "destructive"
                                : issue.priority === "High"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {issue.priority}
                          </Badge>
                          <Badge variant="outline">{issue.status}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{issue.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{issue.date}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Assign
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
