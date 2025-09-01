"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  MessageCircle,
  Video,
  Shield,
  Zap,
  Users,
  Star,
  Trophy,
  Target,
  BarChart3,
  Globe,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Volume2,
  Settings,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Award,
  Crown,
  Medal,
  Flame,
  Moon,
  Sun,
  BookOpen,
  Bell,
  Lock,
} from "lucide-react"

export default function TechFeaturesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState("ai-matching")
  const [gamificationLevel, setGamificationLevel] = useState(3)
  const [referralTier, setReferralTier] = useState("silver")

  const aiFeatures = [
    {
      title: "Smart Mentor Matching",
      description: "AI analyzes student goals, learning style, and preferences to find the perfect mentor match",
      accuracy: 95,
      icon: Brain,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Personalized Learning Paths",
      description: "Dynamic career roadmaps that adapt based on progress and industry trends",
      accuracy: 88,
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Intelligent Scheduling",
      description: "Automatically suggests optimal meeting times based on both parties' availability",
      accuracy: 92,
      icon: Clock,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Content Recommendations",
      description: "Suggests relevant courses, articles, and resources based on career goals",
      accuracy: 90,
      icon: BookOpen,
      color: "text-orange-600 dark:text-orange-400",
    },
  ]

  const communicationFeatures = [
    {
      title: "HD Video Calls",
      description: "Crystal clear video quality with screen sharing and recording capabilities",
      icon: Video,
      specs: ["1080p HD quality", "Screen sharing", "Session recording", "Multi-device support"],
    },
    {
      title: "Smart Chat System",
      description: "Real-time messaging with file sharing, voice notes, and translation",
      icon: MessageCircle,
      specs: ["Real-time messaging", "File sharing (up to 100MB)", "Voice messages", "Auto-translation"],
    },
    {
      title: "AI Assistant",
      description: "24/7 AI support for scheduling, reminders, and quick questions",
      icon: Brain,
      specs: ["24/7 availability", "Natural language processing", "Smart reminders", "FAQ assistance"],
    },
    {
      title: "Offline Mode",
      description: "Access key features and content even without internet connection",
      icon: Globe,
      specs: ["Offline content access", "Sync when online", "Cached conversations", "Download resources"],
    },
  ]

  const gamificationElements = [
    {
      title: "Achievement Badges",
      description: "Earn badges for completing sessions, reaching goals, and helping others",
      icon: Award,
      examples: ["First Session", "Goal Achiever", "Streak Master", "Helper"],
    },
    {
      title: "Points & Levels",
      description: "Gain XP points for activities and level up your profile",
      icon: TrendingUp,
      examples: ["Session XP", "Goal XP", "Referral XP", "Bonus XP"],
    },
    {
      title: "Learning Streaks",
      description: "Maintain daily learning streaks for bonus rewards",
      icon: Flame,
      examples: ["7-day streak", "30-day streak", "100-day streak", "365-day streak"],
    },
    {
      title: "Leaderboards",
      description: "Compete with peers in various categories and achievements",
      icon: Trophy,
      examples: ["Top Learners", "Goal Achievers", "Helpful Mentors", "Active Users"],
    },
  ]

  const referralTiers = [
    {
      id: "bronze",
      name: "Bronze",
      commission: "10%",
      requirements: "1-5 referrals",
      perks: ["Basic commission", "Monthly reports"],
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      icon: Medal,
    },
    {
      id: "silver",
      name: "Silver",
      commission: "15%",
      requirements: "6-15 referrals",
      perks: ["Higher commission", "Priority support", "Exclusive webinars"],
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      icon: Award,
    },
    {
      id: "gold",
      name: "Gold",
      commission: "20%",
      requirements: "16+ referrals",
      perks: ["Highest commission", "Dedicated manager", "Early access", "Bonus rewards"],
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: Crown,
    },
  ]

  const mobileFeatures = [
    {
      title: "Offline-First Design",
      description: "Core features work without internet, sync when connected",
      icon: Globe,
    },
    {
      title: "Push Notifications",
      description: "Smart notifications for sessions, messages, and achievements",
      icon: Bell,
    },
    {
      title: "Voice Commands",
      description: "Navigate and control the app using voice commands",
      icon: Volume2,
    },
    {
      title: "Biometric Security",
      description: "Secure login with fingerprint and face recognition",
      icon: Shield,
    },
    {
      title: "Adaptive UI",
      description: "Interface adapts to your usage patterns and preferences",
      icon: Settings,
    },
    {
      title: "Quick Actions",
      description: "Shortcuts for common tasks and emergency features",
      icon: Zap,
    },
    {
      title: "Data Optimization",
      description: "Minimal data usage with smart compression",
      icon: BarChart3,
    },
    {
      title: "Multi-language",
      description: "Full support for 4 regional languages",
      icon: Globe,
    },
  ]

  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description: "All communications are encrypted with military-grade security",
      icon: Shield,
      status: "Active",
    },
    {
      title: "GDPR Compliance",
      description: "Full compliance with global data protection regulations",
      icon: CheckCircle,
      status: "Certified",
    },
    {
      title: "Two-Factor Authentication",
      description: "Additional security layer for account protection",
      icon: Lock,
      status: "Available",
    },
    {
      title: "Regular Security Audits",
      description: "Quarterly security assessments by third-party experts",
      icon: Eye,
      status: "Ongoing",
    },
  ]

  const platformStats = [
    { label: "AI Accuracy", value: "95%", icon: Brain },
    { label: "Uptime", value: "99.9%", icon: Shield },
    { label: "Response Time", value: "<100ms", icon: Zap },
    { label: "User Satisfaction", value: "4.9/5", icon: Star },
  ]

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Powered by
              <span className="block bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                Cutting-Edge Technology
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Experience the future of mentorship with AI, gamification, and seamless mobile-first design
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-blue-100">Try Dark Mode:</span>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Moon className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="ai-features" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-4xl mx-auto dark:bg-gray-800">
            <TabsTrigger value="ai-features" className="dark:data-[state=active]:bg-gray-700">
              AI Features
            </TabsTrigger>
            <TabsTrigger value="communication" className="dark:data-[state=active]:bg-gray-700">
              Communication
            </TabsTrigger>
            <TabsTrigger value="gamification" className="dark:data-[state=active]:bg-gray-700">
              Gamification
            </TabsTrigger>
            <TabsTrigger value="mobile" className="dark:data-[state=active]:bg-gray-700">
              Mobile-First
            </TabsTrigger>
            <TabsTrigger value="security" className="dark:data-[state=active]:bg-gray-700">
              Security
            </TabsTrigger>
          </TabsList>

          {/* AI Features Tab */}
          <TabsContent value="ai-features" className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Intelligence
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our advanced AI algorithms ensure perfect mentor-student matches and personalized learning experiences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {aiFeatures.map((feature, index) => (
                <Card key={index} className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 dark:text-white">
                      <div
                        className={`w-12 h-12 ${feature.color} bg-opacity-10 rounded-lg flex items-center justify-center`}
                      >
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Accuracy</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {feature.accuracy}%
                        </span>
                      </div>
                      <Progress value={feature.accuracy} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Demo Section */}
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">See AI Matching in Action</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Watch how our AI analyzes student profiles and finds the perfect mentor match
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Analyzing student profile...</span>
                    <div className="ml-auto">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Matching with 500+ mentors...</span>
                    <div className="ml-auto">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Found 3 perfect matches (95% compatibility)
                    </span>
                    <div className="ml-auto">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Try AI Matching
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </section>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Seamless Communication Suite
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Connect with mentors through multiple channels with enterprise-grade quality and reliability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {communicationFeatures.map((feature, index) => (
                <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 dark:text-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.specs.map((spec, specIndex) => (
                        <li key={specIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Communication Demo */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Experience Crystal Clear Communication
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Preview our communication interface with real-time features
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Video Call Interface</h4>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      HD Quality
                    </Badge>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-green-400 rounded-lg flex items-center justify-center mb-4">
                    <Video className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline" className="dark:border-gray-600 bg-transparent">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="dark:border-gray-600 bg-transparent">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="dark:border-gray-600 bg-transparent">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Smart Chat</h4>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">AI Powered</Badge>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="bg-blue-600 text-white p-3 rounded-lg rounded-bl-none max-w-xs">
                      Hi! I need help with my career planning.
                    </div>
                    <div className="bg-white dark:bg-gray-600 p-3 rounded-lg rounded-br-none max-w-xs ml-auto">
                      <span className="text-gray-900 dark:text-white">
                        I'd be happy to help! Let's start with your current goals.
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                      <Brain className="w-4 h-4 inline mr-1" />
                      AI suggests: "Career Assessment Tool"
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Engaging Gamification System
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Stay motivated with badges, points, streaks, and rewards that make learning fun and engaging
              </p>
            </div>

            {/* Gamification Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gamificationElements.map((element, index) => (
                <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 dark:text-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <element.icon className="w-6 h-6 text-white" />
                      </div>
                      {element.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">{element.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {element.examples.map((example, exampleIndex) => (
                        <Badge
                          key={exampleIndex}
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Progress Demo */}
            <section className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Progress Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track your achievements and see how you're progressing
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">{gamificationLevel}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Level {gamificationLevel}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Advanced Learner</p>
                    <Progress value={75} className="mt-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">750/1000 XP to next level</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Flame className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">15 Day Streak</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Keep it up!</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${i < 5 ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-600"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">12 Badges</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Earned this month</p>
                    <div className="flex justify-center gap-1 mt-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <Medal className="w-4 h-4 text-gray-400" />
                      <Star className="w-4 h-4 text-blue-500" />
                      <Crown className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Referral Program */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Referral & Affiliate Program</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Earn rewards by referring friends and family to Parth Sarthi
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {referralTiers.map((tier) => (
                  <Card
                    key={tier.id}
                    className={`relative ${tier.id === referralTier ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""} dark:bg-gray-700 dark:border-gray-600`}
                  >
                    <CardHeader className="text-center">
                      <div
                        className={`w-16 h-16 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                      >
                        <tier.icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="dark:text-white">{tier.name} Tier</CardTitle>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{tier.commission}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{tier.requirements}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.perks.map((perk, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{perk}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full mt-4"
                        variant={tier.id === referralTier ? "default" : "outline"}
                        onClick={() => setReferralTier(tier.id)}
                      >
                        {tier.id === referralTier ? "Current Tier" : "View Details"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Mobile-First Tab */}
          <TabsContent value="mobile" className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Mobile-First Experience
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Designed for mobile users with offline capabilities and optimized performance
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Mobile Features */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Key Mobile Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mobileFeatures.map((feature, index) => (
                    <Card key={index} className="dark:bg-gray-800 dark:border-gray-700 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Mobile App Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-[500px] bg-gray-900 rounded-[2.5rem] p-2">
                    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden">
                      {/* Status Bar */}
                      <div className="bg-gray-100 dark:bg-gray-700 h-8 flex items-center justify-between px-4 text-xs">
                        <span className="dark:text-white">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                          <div className="w-4 h-2 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                          <div className="w-4 h-2 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 dark:text-white">Dashboard</h4>
                          <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-4 text-white">
                          <div className="text-sm opacity-90">Next Session</div>
                          <div className="font-bold">Dr. Priya Sharma</div>
                          <div className="text-sm">Today, 4:00 PM</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <Video className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                            <div className="text-xs text-gray-600 dark:text-gray-400">Video Call</div>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                            <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Recent Activity</div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-600 dark:text-gray-400">Session completed</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-600 dark:text-gray-400">New message received</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-gray-600 dark:text-gray-400">Achievement unlocked</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Features */}
                  <div className="absolute -right-8 top-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-green-500" />
                      <span className="dark:text-white">Offline Ready</span>
                    </div>
                  </div>
                  <div className="absolute -left-8 top-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="dark:text-white">Fast Loading</span>
                    </div>
                  </div>
                  <div className="absolute -right-8 bottom-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span className="dark:text-white">Secure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Optimized Performance</h3>
                <p className="text-gray-600 dark:text-gray-300">Built for speed and efficiency on all devices</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">&lt;2s</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">App Launch Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">&lt;50MB</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">App Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">90%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Battery Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">&lt;10MB</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Data Usage</div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Enterprise-Grade Security
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Your data and privacy are protected with military-grade encryption and compliance standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 dark:text-white">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      {feature.title}
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {feature.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Security Certifications */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Security Certifications & Compliance
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We meet the highest industry standards for data protection and privacy
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">SOC 2 Type II</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Certified</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">GDPR</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compliant</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">ISO 27001</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Certified</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">HIPAA</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ready</p>
                </div>
              </div>
            </section>

            {/* Security Monitoring */}
            <section className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">24/7 Security Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Real-time threat detection and response to keep your data safe
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">System Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      All Systems Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Last Security Scan</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Threats Blocked (24h)</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Uptime</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">99.99%</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  View Security Dashboard
                </Button>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <section className="text-center py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users already benefiting from our cutting-edge technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                Try Free Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 dark:border-gray-600 dark:text-gray-300 bg-transparent"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
