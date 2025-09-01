"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Target,
  BookOpen,
  MessageCircle,
  Award,
  Video,
  Star,
  Bell,
  Brain,
  Zap,
  Trophy,
  Gift,
  ChevronRight,
  Play,
} from "lucide-react"
import Image from "next/image"

export default function StudentDashboard() {
  const [currentStreak, setCurrentStreak] = useState(15)
  const [totalPoints, setTotalPoints] = useState(2450)

  const studentData = {
    name: "Arjun Kumar",
    avatar: "/placeholder.svg?height=80&width=80",
    level: "Advanced Learner",
    nextLevel: "Expert",
    progressToNext: 75,
    joinDate: "March 2024",
  }

  const upcomingSessions = [
    {
      id: 1,
      mentor: "Dr. Priya Sharma",
      topic: "Resume Review & Interview Prep",
      date: "Today, 4:00 PM",
      type: "video",
      duration: "60 min",
      image: "/placeholder.svg?height=40&width=40",
      status: "confirmed",
    },
    {
      id: 2,
      mentor: "Rahul Kumar",
      topic: "Data Science Career Path",
      date: "Tomorrow, 2:00 PM",
      type: "chat",
      duration: "45 min",
      image: "/placeholder.svg?height=40&width=40",
      status: "pending",
    },
  ]

  const goals = [
    {
      id: 1,
      title: "Complete Python Course",
      progress: 75,
      deadline: "Dec 31, 2024",
      status: "In Progress",
      priority: "high",
    },
    {
      id: 2,
      title: "Land Software Engineer Role",
      progress: 40,
      deadline: "Mar 15, 2025",
      status: "In Progress",
      priority: "high",
    },
    {
      id: 3,
      title: "Improve Communication Skills",
      progress: 60,
      deadline: "Jan 30, 2025",
      status: "In Progress",
      priority: "medium",
    },
  ]

  const recentAchievements = [
    {
      id: 1,
      title: "First Session Complete",
      description: "Completed your first mentorship session",
      icon: Video,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      points: 50,
      date: "2 days ago",
    },
    {
      id: 2,
      title: "Goal Achiever",
      description: "Completed 3 career goals this month",
      icon: Target,
      color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      points: 100,
      date: "1 week ago",
    },
    {
      id: 3,
      title: "Streak Master",
      description: "Maintained 15-day learning streak",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
      points: 75,
      date: "Today",
    },
  ]

  const aiSuggestions = [
    {
      id: 1,
      mentor: "Dr. Rajesh Patel",
      specialization: "Software Engineering",
      matchScore: 95,
      reason: "Perfect match for your Python learning goals",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.9,
      sessions: 150,
    },
    {
      id: 2,
      mentor: "Priya Singh",
      specialization: "Career Transition",
      matchScore: 88,
      reason: "Expertise in tech career transitions",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.8,
      sessions: 200,
    },
  ]

  const psychometricResults = [
    {
      test: "Personality Assessment",
      result: "INTJ - The Architect",
      score: "85%",
      date: "Dec 15, 2024",
      insights: "Strong analytical and strategic thinking",
    },
    {
      test: "Career Interest Inventory",
      result: "Technology & Innovation",
      score: "92%",
      date: "Dec 10, 2024",
      insights: "High affinity for technical problem-solving",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-gradient-to-r from-blue-500 to-green-500">
                <AvatarImage src={studentData.avatar || "/placeholder.svg"} alt={studentData.name} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-blue-500 to-green-500 text-white">
                  {studentData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {studentData.name}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Continue your learning journey</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {studentData.level}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{currentStreak} day streak</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="dark:border-gray-600 bg-transparent">
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalPoints}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Points</div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium dark:text-gray-300">Progress to {studentData.nextLevel}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{studentData.progressToNext}%</span>
            </div>
            <Progress value={studentData.progressToNext} className="h-2" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</p>
                </div>
                <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">8</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goals Achieved</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</p>
                </div>
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievements</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">15</p>
                </div>
                <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Mentor Suggestions */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  AI Recommended Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={suggestion.image || "/placeholder.svg"}
                          alt={suggestion.mentor}
                          width={50}
                          height={50}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-medium dark:text-white">{suggestion.mentor}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{suggestion.specialization}</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">{suggestion.reason}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{suggestion.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.sessions} sessions
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-2">
                          {suggestion.matchScore}% match
                        </Badge>
                        <Button
                          size="sm"
                          className="block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          Connect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
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
                          alt={session.mentor}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-medium dark:text-white">{session.mentor}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{session.topic}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{session.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.type === "video" ? "default" : "secondary"}>
                          {session.type === "video" ? (
                            <Video className="w-3 h-3 mr-1" />
                          ) : (
                            <MessageCircle className="w-3 h-3 mr-1" />
                          )}
                          {session.type}
                        </Badge>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-3 h-3 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
                >
                  View All Sessions
                </Button>
              </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Target className="w-5 h-5" />
                  Your Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium dark:text-white">{goal.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={goal.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                            {goal.priority} priority
                          </Badge>
                          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            {goal.status}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{goal.progress}% complete</span>
                        <span>Due: {goal.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Set New Goal
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Find a Mentor
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Brain className="w-4 h-4 mr-2" />
                  Take Assessment
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Career Planner
                </Button>
              </CardContent>
            </Card>

            {/* Psychometric Test Results */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Brain className="w-5 h-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {psychometricResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm dark:text-white">{result.test}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {result.score}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{result.result}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{result.insights}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{result.date}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
                >
                  View All Results
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Award className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div
                        className={`w-8 h-8 ${achievement.color} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <achievement.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium dark:text-white">{achievement.title}</p>
                          <div className="flex items-center gap-1">
                            <Gift className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">+{achievement.points}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
                >
                  View All Achievements
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
