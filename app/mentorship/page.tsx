"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Video, MessageCircle, Clock, Users, Filter, Search, Globe, Award, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function MentorshipPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [priceRange, setPriceRange] = useState("all")

  const mentors = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      title: "Senior Software Engineer at Google",
      expertise: ["Software Development", "Career Guidance", "Interview Prep"],
      languages: ["Hindi", "English"],
      rating: 4.9,
      reviews: 156,
      price: 999,
      image: "/placeholder.svg?height=100&width=100",
      experience: "8+ years",
      sessions: 500,
      availability: "Available Today",
      verified: true,
      responseTime: "< 2 hours",
    },
    {
      id: 2,
      name: "Rahul Kumar",
      title: "Data Science Manager at Microsoft",
      expertise: ["Data Science", "Machine Learning", "Python"],
      languages: ["English", "Maithili"],
      rating: 4.8,
      reviews: 203,
      price: 1299,
      image: "/placeholder.svg?height=100&width=100",
      experience: "10+ years",
      sessions: 750,
      availability: "Available Tomorrow",
      verified: true,
      responseTime: "< 1 hour",
    },
    {
      id: 3,
      name: "Anjali Patel",
      title: "Marketing Director at Flipkart",
      expertise: ["Digital Marketing", "Brand Strategy", "Leadership"],
      languages: ["Hindi", "English", "Gujarati"],
      rating: 4.9,
      reviews: 189,
      price: 899,
      image: "/placeholder.svg?height=100&width=100",
      experience: "12+ years",
      sessions: 420,
      availability: "Available Today",
      verified: true,
      responseTime: "< 3 hours",
    },
    {
      id: 4,
      name: "Vikash Singh",
      title: "Financial Analyst at Goldman Sachs",
      expertise: ["Finance", "Investment Banking", "CFA Prep"],
      languages: ["Hindi", "English", "Bhojpuri"],
      rating: 4.7,
      reviews: 134,
      price: 1199,
      image: "/placeholder.svg?height=100&width=100",
      experience: "6+ years",
      sessions: 280,
      availability: "Available This Week",
      verified: true,
      responseTime: "< 4 hours",
    },
  ]

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some((exp) => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = selectedSubject === "all" || mentor.expertise.includes(selectedSubject)
    const matchesLanguage = selectedLanguage === "all" || mentor.languages.includes(selectedLanguage)
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "under-1000" && mentor.price < 1000) ||
      (priceRange === "1000-1500" && mentor.price >= 1000 && mentor.price <= 1500) ||
      (priceRange === "above-1500" && mentor.price > 1500)

    return matchesSearch && matchesSubject && matchesLanguage && matchesPrice
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Find Your Perfect Mentor</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Connect with industry experts who understand your journey and can guide you to success
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" variant="secondary" className="px-6 md:px-8 py-3 flex-1 sm:flex-none">
                Book Demo Session
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 px-6 md:px-8 py-3 bg-transparent flex-1 sm:flex-none"
              >
                Browse All Mentors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white dark:bg-gray-800 py-6 border-b dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expert Mentors</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">4.8/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">95%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold dark:text-white">Filter Mentors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search mentors or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Software Development">Software Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Career Guidance">Career Guidance</SelectItem>
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

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                <SelectItem value="1000-1500">₹1,000 - ₹1,500</SelectItem>
                <SelectItem value="above-1500">Above ₹1,500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold dark:text-white">{filteredMentors.length} Mentors Found</h3>
          <Select defaultValue="rating">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="relative">
                    <Image
                      src={mentor.image || "/placeholder.svg"}
                      alt={mentor.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                    {mentor.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1 dark:text-white truncate">{mentor.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{mentor.title}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{mentor.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">({mentor.reviews} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {mentor.availability}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {mentor.responseTime}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2 dark:text-white">Expertise:</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 dark:text-white">Languages:</p>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">{mentor.languages.join(", ")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{mentor.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{mentor.sessions} sessions</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{mentor.price}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">per session</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Award className="w-3 h-3 mr-1" />
                        Top Rated
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Video className="w-4 h-4 mr-1" />
                        Video Call
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Book Free Demo Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="bg-transparent">
            Load More Mentors
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white dark:bg-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started with expert mentorship in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">1. Find Your Mentor</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse through our verified mentors and find the perfect match for your goals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">2. Book a Session</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Schedule a chat or video call at your convenience. Start with a free demo session
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">3. Achieve Your Goals</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized guidance and track your progress towards career success
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
