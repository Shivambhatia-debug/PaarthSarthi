"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  Video,
  MessageCircle,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap,
} from "lucide-react"
import Image from "next/image"

export default function MentorDashboard() {
  const [isAvailable, setIsAvailable] = useState(true)
  const [currentStreak, setCurrentStreak] = useState(28)

  const mentorData = {
    name: "Dr. Priya Sharma",
    avatar: "/placeholder.svg?height=80&width=80",
    title: "Senior Software Engineer at Google",
    rating: 4.9,
    totalSessions: 156,
    joinDate: "January 2023",
    specializations: ["Software Engineering", "Career Guidance", "Interview Prep"],
  }

  const upcomingSessions = [
    {
      id: 1,
      student: "Arjun Kumar",
      topic: "Career Guidance - Software Engineering",
      date: "Today, 3:00 PM",
      type: "video",
      duration: "60 min",
      amount: 1200,
      image: "/placeholder.svg?height=40&width=40",
      status: "confirmed",
    },
    {
      id: 2,
      student: "Priya Singh",
      topic: "Resume Review",
      date: "Tomorrow, 11:00 AM",
      type: "chat",
      duration: "45 min",
      amount: 800,
      image: "/placeholder.svg?height=40&width=40",
      status: "pending",
    },
    {
      id: 3,
      student: "Rahul Patel",
      topic: "Interview Preparation",
      date: "Dec 29, 4:00 PM",
      type: "video",
      duration: "90 min",
      amount: 1500,
      image: "/placeholder.svg?height=40&width=40",
      status: "confirmed",
    },
  ]

  const recentFeedback = [
    {
      id: 1,
      student: "Anjali Singh",
      rating: 5,
      comment: "Excellent guidance! Really helped me understand my career path better.",
      date: "2 days ago",
      session: "Career Planning",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      student: "Vikash Kumar",
      rating: 5,
      comment: "Very knowledgeable and patient. Great session on interview skills.",
      date: "1 week ago",
      session: "Mock Interview",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      student: "Neha Gupta",
      rating: 4,
      comment: "Good insights on resume building. Would recommend!",
      date: "2 weeks ago",
      session: "Resume Review",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const monthlyStats = {
    totalEarnings: 45600,
    sessionsCompleted: 38,
    averageRating: 4.8,
    totalStudents: 156,
    thisMonthGrowth: 12,
    pendingSessions: 3,
    completionRate: 98,
  }

  const availabilitySlots = [
    { time: "9:00 AM - 10:00 AM", status: "available" },
    { time: "11:00 AM - 12:00 PM", status: "booked", student: "Arjun K." },
    { time: "2:00 PM - 3:00 PM", status: "available" },
    { time: "4:00 PM - 5:00 PM", status: "booked", student: "Priya S." },
    { time: "6:00 PM - 7:00 PM", status: "available" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-gradient-to-r from-blue-500 to-green-500">
                <AvatarImage src={mentorData.avatar || "/placeholder.svg"} alt={mentorData.name} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-blue-500 to-green-500 text-white">
                  {mentorData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome, {mentorData.name}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{mentorData.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mentorData.rating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({mentorData.totalSessions} sessions)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{currentStreak} day streak</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium dark:text-gray-300">Available</span>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>
              <Button variant="outline" size="sm" className="dark:border-gray-600 bg-transparent">
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
            </div>
          </div>

          {/* Availability Status */}
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="font-medium dark:text-white">
                  {isAvailable ? "Available for sessions" : "Currently unavailable"}
                </span>
              </div>
              <Badge
                variant={isAvailable ? "default" : "secondary"}
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                {isAvailable ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{monthlyStats.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{monthlyStats.thisMonthGrowth}% from last month
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions This Month</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {monthlyStats.sessionsCompleted}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{monthlyStats.pendingSessions} pending</p>
                </div>
                <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {monthlyStats.averageRating}
                  </p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {monthlyStats.totalStudents}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Lifetime mentored</p>
                </div>
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl dark:bg-gray-800">
            <TabsTrigger value="sessions" className="dark:data-[state=active]:bg-gray-700">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="calendar" className="dark:data-[state=active]:bg-gray-700">
              Calendar
            </TabsTrigger>
            <TabsTrigger value="earnings" className="dark:data-[state=active]:bg-gray-700">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="feedback" className="dark:data-[state=active]:bg-gray-700">
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Sessions */}
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Calendar className="w-5 h-5" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src={session.image || "/placeholder.svg"}
                              alt={session.student}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium dark:text-white">{session.student}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{session.topic}</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">{session.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={session.type === "video" ? "default" : "secondary"}>
                                {session.type === "video" ? (
                                  <Video className="w-3 h-3 mr-1" />
                                ) : (
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                )}
                                {session.type}
                              </Badge>
                              <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>
                                {session.status === "confirmed" ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                )}
                                {session.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{session.duration}</p>
                            <p className="font-bold text-green-600 dark:text-green-400">₹{session.amount}</p>
                            <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                              Start Session
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      Set Availability
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Update Pricing
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Today's Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {availabilitySlots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded">
                          <span className="text-sm dark:text-gray-300">{slot.time}</span>
                          <div className="flex items-center gap-2">
                            {slot.status === "available" ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                Available
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="default"
                                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {slot.student}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Monthly Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="dark:text-gray-300">Video Sessions (28)</span>
                      <span className="font-bold dark:text-white">₹33,600</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="dark:text-gray-300">Chat Sessions (10)</span>
                      <span className="font-bold dark:text-white">₹8,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="dark:text-gray-300">Bonus & Tips</span>
                      <span className="font-bold dark:text-white">₹4,000</span>
                    </div>
                    <hr className="dark:border-gray-600" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="dark:text-white">Total Earnings</span>
                      <span className="text-green-600 dark:text-green-400">₹45,600</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>Platform Fee (10%)</span>
                      <span>-₹4,560</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-green-600 dark:text-green-400">
                      <span>Net Earnings</span>
                      <span>₹41,040</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Payout Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next Payout Date</p>
                      <p className="font-bold dark:text-white">January 1, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payout Amount</p>
                      <p className="font-bold text-green-600 dark:text-green-400">₹41,040</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                      <p className="font-bold dark:text-white">Bank Transfer (****1234)</p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Update Payment Details</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Recent Student Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="border-b dark:border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={feedback.avatar || "/placeholder.svg"}
                            alt={feedback.student}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-medium dark:text-white">{feedback.student}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.session}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(feedback.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{feedback.date}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic">"{feedback.comment}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Calendar Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">Calendar Integration</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Manage your availability and sync with your preferred calendar app
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">Connect Calendar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
