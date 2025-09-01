"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Video,
  Target,
  Download,
  Upload,
  Play,
  CheckCircle,
  Clock,
  Award,
  Zap,
  Users,
  TrendingUp,
} from "lucide-react"

export default function CareerToolkitPage() {
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
  })

  const [selectedTemplate, setSelectedTemplate] = useState(1)
  const [mockInterviewMode, setMockInterviewMode] = useState("practice")

  const goals = [
    {
      id: 1,
      title: "Complete Python Certification",
      description: "Finish the Python programming course and get certified",
      deadline: "2025-03-15",
      progress: 65,
      status: "In Progress",
      priority: "High",
      category: "Skill Development",
    },
    {
      id: 2,
      title: "Land Software Engineer Role",
      description: "Secure a position as a Software Engineer at a tech company",
      deadline: "2025-06-30",
      progress: 30,
      status: "In Progress",
      priority: "High",
      category: "Job Search",
    },
    {
      id: 3,
      title: "Build Portfolio Website",
      description: "Create a professional portfolio showcasing my projects",
      deadline: "2025-02-28",
      progress: 80,
      status: "In Progress",
      priority: "Medium",
      category: "Personal Branding",
    },
  ]

  const mockInterviewQuestions = [
    {
      id: 1,
      category: "Technical",
      question: "Explain the difference between var, let, and const in JavaScript",
      difficulty: "Medium",
      duration: "5 minutes",
      tips: "Focus on scope, hoisting, and mutability differences",
    },
    {
      id: 2,
      category: "Behavioral",
      question: "Tell me about a time when you had to work under pressure",
      difficulty: "Easy",
      duration: "3 minutes",
      tips: "Use the STAR method: Situation, Task, Action, Result",
    },
    {
      id: 3,
      category: "Technical",
      question: "How would you optimize a slow-performing database query?",
      difficulty: "Hard",
      duration: "10 minutes",
      tips: "Discuss indexing, query optimization, and database design",
    },
    {
      id: 4,
      category: "Behavioral",
      question: "Describe a challenging project you worked on and how you overcame obstacles",
      difficulty: "Medium",
      duration: "5 minutes",
      tips: "Highlight problem-solving skills and teamwork",
    },
  ]

  const careerRoadmaps = [
    {
      id: 1,
      title: "Software Engineer",
      description: "Complete roadmap to become a full-stack software engineer",
      duration: "12-18 months",
      difficulty: "Intermediate",
      steps: 8,
      completedSteps: 3,
      skills: ["JavaScript", "React", "Node.js", "Databases", "System Design"],
      salary: "₹8-15 LPA",
      demand: "High",
    },
    {
      id: 2,
      title: "Data Scientist",
      description: "Path to becoming a data scientist with machine learning expertise",
      duration: "15-24 months",
      difficulty: "Advanced",
      steps: 10,
      completedSteps: 1,
      skills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
      salary: "₹10-20 LPA",
      demand: "Very High",
    },
    {
      id: 3,
      title: "Digital Marketing Specialist",
      description: "Comprehensive guide to digital marketing mastery",
      duration: "6-12 months",
      difficulty: "Beginner",
      steps: 6,
      completedSteps: 0,
      skills: ["SEO", "Social Media", "Content Marketing", "Analytics", "PPC"],
      salary: "₹5-12 LPA",
      demand: "High",
    },
  ]

  const resumeTemplates = [
    { id: 1, name: "Professional", preview: "Clean and modern design", color: "blue" },
    { id: 2, name: "Creative", preview: "Colorful and eye-catching", color: "purple" },
    { id: 3, name: "Minimal", preview: "Simple and elegant", color: "gray" },
    { id: 4, name: "Executive", preview: "Formal and sophisticated", color: "green" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Career Toolkit</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Professional tools to build your resume, practice interviews, and plan your career journey
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" variant="secondary" className="px-6 md:px-8 py-3 flex-1 sm:flex-none">
                Build Resume
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-indigo-600 px-6 md:px-8 py-3 bg-transparent flex-1 sm:flex-none"
              >
                Practice Interview
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-12">
        <Tabs defaultValue="resume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="resume">Resume Builder</TabsTrigger>
            <TabsTrigger value="interview">Mock Interview</TabsTrigger>
            <TabsTrigger value="goals">Goal Planner</TabsTrigger>
            <TabsTrigger value="roadmaps">Career Roadmaps</TabsTrigger>
          </TabsList>

          <TabsContent value="resume">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Resume Form */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <FileText className="w-5 h-5" />
                    Build Your Resume
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create a professional resume with our AI-powered builder
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block dark:text-white">Full Name</label>
                      <Input
                        placeholder="Enter your full name"
                        value={resumeData.name}
                        onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block dark:text-white">Email</label>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={resumeData.email}
                        onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block dark:text-white">Phone Number</label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={resumeData.phone}
                      onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block dark:text-white">Professional Summary</label>
                    <Textarea
                      placeholder="Write a brief summary of your professional background..."
                      rows={3}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block dark:text-white">Work Experience</label>
                    <Textarea
                      placeholder="List your work experience..."
                      rows={4}
                      value={resumeData.experience}
                      onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block dark:text-white">Education</label>
                    <Textarea
                      placeholder="Your educational background..."
                      rows={3}
                      value={resumeData.education}
                      onChange={(e) => setResumeData({ ...resumeData, education: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block dark:text-white">Skills</label>
                    <Input
                      placeholder="JavaScript, React, Node.js, Python..."
                      value={resumeData.skills}
                      onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Resume
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Existing
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Templates */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Choose Template</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select a template that matches your industry and style
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {resumeTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedTemplate === template.id
                            ? `border-${template.color}-500 bg-${template.color}-50 dark:bg-${template.color}-900/20`
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-center dark:text-white">{template.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{template.preview}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Resume Tips</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <li>• Keep it concise (1-2 pages maximum)</li>
                      <li>• Use action verbs to describe achievements</li>
                      <li>• Quantify your accomplishments with numbers</li>
                      <li>• Tailor your resume for each job application</li>
                      <li>• Include relevant keywords from job descriptions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Interview Questions */}
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Video className="w-5 h-5" />
                      Mock Interview Practice
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={mockInterviewMode === "practice" ? "default" : "outline"}
                        onClick={() => setMockInterviewMode("practice")}
                        className={mockInterviewMode !== "practice" ? "bg-transparent" : ""}
                      >
                        Practice Mode
                      </Button>
                      <Button
                        size="sm"
                        variant={mockInterviewMode === "live" ? "default" : "outline"}
                        onClick={() => setMockInterviewMode("live")}
                        className={mockInterviewMode !== "live" ? "bg-transparent" : ""}
                      >
                        Live Interview
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockInterviewQuestions.map((question) => (
                        <div key={question.id} className="border rounded-lg p-4 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={question.category === "Technical" ? "default" : "secondary"}>
                                {question.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  question.difficulty === "Easy"
                                    ? "text-green-600 border-green-600 dark:text-green-400 dark:border-green-400"
                                    : question.difficulty === "Medium"
                                      ? "text-yellow-600 border-yellow-600 dark:text-yellow-400 dark:border-yellow-400"
                                      : "text-red-600 border-red-600 dark:text-red-400 dark:border-red-400"
                                }
                              >
                                {question.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              {question.duration}
                            </div>
                          </div>
                          <p className="font-medium mb-2 dark:text-white">{question.question}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{question.tips}</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 flex-1 sm:flex-none">
                              <Play className="w-4 h-4 mr-2" />
                              Practice Answer
                            </Button>
                            <Button size="sm" variant="outline" className="bg-transparent flex-1 sm:flex-none">
                              <Video className="w-4 h-4 mr-2" />
                              Record Response
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interview Tips & Progress */}
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Interview Preparation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Video className="w-4 h-4 mr-2" />
                          Record Practice Session
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          Common Questions Bank
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Award className="w-4 h-4 mr-2" />
                          Interview Tips Guide
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Pro Tips</h4>
                      <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                        <li>• Research the company thoroughly</li>
                        <li>• Prepare STAR method examples</li>
                        <li>• Practice your elevator pitch</li>
                        <li>• Prepare thoughtful questions</li>
                        <li>• Test your tech setup beforehand</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="dark:text-gray-300">Questions Practiced</span>
                          <span className="dark:text-gray-300">12/50</span>
                        </div>
                        <Progress value={24} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="dark:text-gray-300">Mock Interviews</span>
                          <span className="dark:text-gray-300">3/10</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="dark:text-gray-300">Confidence Score</span>
                          <span className="dark:text-gray-300">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Goals List */}
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Target className="w-5 h-5" />
                      Your Career Goals
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Track your progress and stay motivated with personalized goals
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {goals.map((goal) => (
                        <div key={goal.id} className="border rounded-lg p-4 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1 dark:text-white">{goal.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{goal.description}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant={goal.priority === "High" ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {goal.priority} Priority
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {goal.category}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Due: {goal.deadline}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="self-start">
                              {goal.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="dark:text-gray-300">Progress</span>
                              <span className="dark:text-gray-300">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700">
                      <Target className="w-4 h-4 mr-2" />
                      Add New Goal
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Goal Planning Tools */}
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Goal Planning Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      SMART Goals Template
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Goal Tracker
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Award className="w-4 h-4 mr-2" />
                      Milestone Rewards
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Habit Builder
                    </Button>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Achievement Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">8</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Goals Completed</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">65%</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Progress</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">45</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Days Streak</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">12</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roadmaps">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {careerRoadmaps.map((roadmap) => (
                <Card
                  key={roadmap.id}
                  className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg dark:text-white">{roadmap.title}</CardTitle>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            roadmap.difficulty === "Beginner"
                              ? "secondary"
                              : roadmap.difficulty === "Intermediate"
                                ? "default"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {roadmap.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            roadmap.demand === "Very High"
                              ? "text-green-600 border-green-600 dark:text-green-400 dark:border-green-400"
                              : "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                          }`}
                        >
                          {roadmap.demand} Demand
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{roadmap.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="dark:text-gray-300">Duration:</span>
                        <span className="font-medium dark:text-white">{roadmap.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="dark:text-gray-300">Expected Salary:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{roadmap.salary}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="dark:text-gray-300">Progress:</span>
                        <span className="font-medium dark:text-white">
                          {roadmap.completedSteps}/{roadmap.steps} steps
                        </span>
                      </div>
                      <Progress value={(roadmap.completedSteps / roadmap.steps) * 100} className="h-2" />
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2 dark:text-white">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {roadmap.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {roadmap.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{roadmap.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Growing field with excellent prospects
                      </span>
                    </div>

                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      {roadmap.completedSteps > 0 ? "Continue Learning" : "Start Roadmap"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Card className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Need a Custom Roadmap?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Get a personalized career roadmap based on your skills, interests, and goals
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Users className="w-4 h-4 mr-2" />
                  Talk to Career Counselor
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
