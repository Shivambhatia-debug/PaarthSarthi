"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Star, Play, Calendar, Search, Filter, Globe, CheckCircle, Zap } from "lucide-react"
import Image from "next/image"

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")

  const courses = [
    {
      id: 1,
      title: "Complete Python Programming Bootcamp",
      instructor: "Dr. Rajesh Kumar",
      category: "Career Skills",
      level: "Beginner",
      duration: "12 weeks",
      students: 2500,
      rating: 4.8,
      reviews: 456,
      price: 2999,
      originalPrice: 4999,
      language: "Hindi",
      type: "On-demand",
      image: "/placeholder.svg?height=200&width=300",
      description: "Master Python from basics to advanced concepts with hands-on projects",
      features: ["Live Projects", "Certificate", "Lifetime Access"],
    },
    {
      id: 2,
      title: "Data Science with R - Complete Guide",
      instructor: "Prof. Anita Sharma",
      category: "Career Skills",
      level: "Intermediate",
      duration: "16 weeks",
      students: 1800,
      rating: 4.9,
      reviews: 234,
      price: 3999,
      originalPrice: 5999,
      language: "English",
      type: "Live",
      image: "/placeholder.svg?height=200&width=300",
      description: "Comprehensive data science course covering statistics, visualization, and machine learning",
      features: ["Live Sessions", "1-on-1 Mentoring", "Job Assistance"],
    },
    {
      id: 3,
      title: "Stress Management & Mindfulness",
      instructor: "Dr. Meera Patel",
      category: "Wellness",
      level: "Beginner",
      duration: "6 weeks",
      students: 3200,
      rating: 4.9,
      reviews: 567,
      price: 1499,
      originalPrice: 2499,
      language: "Hindi",
      type: "On-demand",
      image: "/placeholder.svg?height=200&width=300",
      description: "Learn practical techniques for managing stress and building mental resilience",
      features: ["Meditation Sessions", "Workbook", "Community Access"],
    },
    {
      id: 4,
      title: "Leadership & Growth Mindset",
      instructor: "Vikash Singh",
      category: "Growth Mindset",
      level: "Intermediate",
      duration: "8 weeks",
      students: 1500,
      rating: 4.7,
      reviews: 289,
      price: 2499,
      originalPrice: 3999,
      language: "English",
      type: "Live",
      image: "/placeholder.svg?height=200&width=300",
      description: "Develop leadership skills and cultivate a growth mindset for personal success",
      features: ["Interactive Workshops", "Peer Learning", "Action Plans"],
    },
  ]

  const webinars = [
    {
      id: 1,
      title: "Career Transition in Tech Industry",
      speaker: "Rahul Mehta, Ex-Google",
      date: "Dec 28, 2024",
      time: "7:00 PM IST",
      duration: "90 minutes",
      attendees: 500,
      language: "Hindi",
      price: 299,
      image: "/placeholder.svg?height=150&width=250",
      category: "Career Skills",
      isLive: true,
    },
    {
      id: 2,
      title: "मानसिक स्वास्थ्य और करियर सफलता",
      speaker: "Dr. Priya Gupta, Psychologist",
      date: "Dec 30, 2024",
      time: "6:00 PM IST",
      duration: "60 minutes",
      attendees: 300,
      language: "Hindi",
      price: 199,
      image: "/placeholder.svg?height=150&width=250",
      category: "Wellness",
      isLive: true,
    },
    {
      id: 3,
      title: "Building Resilience in Challenging Times",
      speaker: "Anjali Sharma, Life Coach",
      date: "Jan 2, 2025",
      time: "5:00 PM IST",
      duration: "75 minutes",
      attendees: 400,
      language: "English",
      price: 249,
      image: "/placeholder.svg?height=150&width=250",
      category: "Growth Mindset",
      isLive: true,
    },
  ]

  const subscriptionPlans = [
    {
      name: "Basic Plan",
      price: 999,
      period: "per month",
      features: ["Access to 50+ courses", "Monthly webinars", "Community access", "Mobile app access", "Basic support"],
      popular: false,
      color: "blue",
    },
    {
      name: "Premium Plan",
      price: 1999,
      period: "per month",
      features: [
        "Access to all courses",
        "All webinars included",
        "1-on-1 mentor sessions (2/month)",
        "Career guidance",
        "Priority support",
        "Downloadable resources",
        "Certificate of completion",
      ],
      popular: true,
      color: "green",
    },
    {
      name: "Enterprise Plan",
      price: 4999,
      period: "per month",
      features: [
        "Everything in Premium",
        "Custom learning paths",
        "Team collaboration tools",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom integrations",
        "White-label options",
      ],
      popular: false,
      color: "purple",
    },
  ]

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesLanguage = selectedLanguage === "all" || course.language === selectedLanguage

    return matchesSearch && matchesCategory && matchesLanguage
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Courses & Webinars</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Learn from industry experts with our comprehensive courses and live webinars in your preferred language
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" variant="secondary" className="px-6 md:px-8 py-3 flex-1 sm:flex-none">
                Browse All Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-purple-600 px-6 md:px-8 py-3 bg-transparent flex-1 sm:flex-none"
              >
                Join Live Webinar
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold dark:text-white">Filter Content</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Career Skills">Career Skills</SelectItem>
                <SelectItem value="Wellness">Mental Wellness</SelectItem>
                <SelectItem value="Growth Mindset">Growth Mindset</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Maithili">मैथिली (Maithili)</SelectItem>
                <SelectItem value="Bhojpuri">भोजपुरी (Bhojpuri)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto md:mx-0">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="webinars">Live Webinars</TabsTrigger>
            <TabsTrigger value="subscriptions">Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="relative">
                    <Image
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      width={300}
                      height={200}
                      className="w-full h-40 md:h-48 object-cover rounded-t-lg"
                    />
                    <Badge className={`absolute top-3 left-3 ${course.type === "Live" ? "bg-red-500" : "bg-blue-500"}`}>
                      {course.type === "Live" ? (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                          Live
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          On-demand
                        </>
                      )}
                    </Badge>
                    <Badge variant="secondary" className="absolute top-3 right-3">
                      {course.level}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{course.language}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight dark:text-white line-clamp-2">{course.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-300">by {course.instructor}</p>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">({course.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{course.price}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                          ₹{course.originalPrice}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                        {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                      </Badge>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Enroll Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webinars">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {webinars.map((webinar) => (
                <Card
                  key={webinar.id}
                  className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="relative">
                    <Image
                      src={webinar.image || "/placeholder.svg"}
                      alt={webinar.title}
                      width={250}
                      height={150}
                      className="w-full h-32 md:h-40 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-3 left-3 bg-red-500">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                      Live
                    </Badge>
                    <Badge variant="outline" className="absolute top-3 right-3 bg-white/90">
                      {webinar.category}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">Webinar</Badge>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{webinar.language}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg dark:text-white line-clamp-2">{webinar.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-300">by {webinar.speaker}</p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="dark:text-gray-300">
                          {webinar.date} at {webinar.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="dark:text-gray-300">{webinar.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="dark:text-gray-300">{webinar.attendees} registered</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{webinar.price}
                      </span>
                      <Badge variant="secondary" className="text-orange-600 dark:text-orange-400">
                        Limited Seats
                      </Badge>
                    </div>

                    <Button className="w-full bg-red-600 hover:bg-red-700">Register Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Subscription Plans
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Choose the perfect plan for your learning journey. All plans include mobile access and community
                  support.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {subscriptionPlans.map((plan, index) => (
                  <Card
                    key={index}
                    className={`relative hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700 ${
                      plan.popular ? "border-2 border-green-500 scale-105" : ""
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <div
                        className={`w-16 h-16 bg-${plan.color}-100 dark:bg-${plan.color}-900 rounded-full flex items-center justify-center mx-auto mb-4`}
                      >
                        <Zap className={`w-8 h-8 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                      </div>
                      <CardTitle className="text-xl mb-2 dark:text-white">{plan.name}</CardTitle>
                      <div className={`text-3xl font-bold text-${plan.color}-600 dark:text-${plan.color}-400 mb-1`}>
                        ₹{plan.price}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{plan.period}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full ${plan.popular ? "bg-green-600 hover:bg-green-700" : "bg-transparent"}`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.name === "Enterprise Plan" ? "Contact Sales" : "Get Started"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  All plans include 7-day free trial • Cancel anytime • No hidden fees
                </p>
                <Button variant="outline" className="bg-transparent">
                  Compare All Features
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
