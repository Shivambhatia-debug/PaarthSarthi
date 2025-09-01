"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Brain,
  MessageCircle,
  BookOpen,
  Users,
  Star,
  Shield,
  Headphones,
  CheckCircle,
  Play,
  Download,
} from "lucide-react"
import Image from "next/image"

export default function WellnessPage() {
  const [assessmentStep, setAssessmentStep] = useState(0)
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([])

  const counselors = [
    {
      id: 1,
      name: "Dr. Meera Patel",
      title: "Clinical Psychologist",
      specialization: ["Anxiety", "Depression", "Career Stress"],
      experience: "12+ years",
      rating: 4.9,
      reviews: 234,
      languages: ["Hindi", "English", "Gujarati"],
      price: 1200,
      image: "/placeholder.svg?height=100&width=100",
      availability: "Available Today",
      verified: true,
      responseTime: "< 1 hour",
    },
    {
      id: 2,
      name: "Dr. Rajesh Kumar",
      title: "Counseling Psychologist",
      specialization: ["Stress Management", "Relationship Issues", "Self-esteem"],
      experience: "8+ years",
      rating: 4.8,
      reviews: 189,
      languages: ["Hindi", "English"],
      price: 1000,
      image: "/placeholder.svg?height=100&width=100",
      availability: "Available Tomorrow",
      verified: true,
      responseTime: "< 2 hours",
    },
    {
      id: 3,
      name: "Dr. Priya Sharma",
      title: "Mental Health Counselor",
      specialization: ["Student Counseling", "Academic Pressure", "Life Transitions"],
      experience: "10+ years",
      rating: 4.9,
      reviews: 156,
      languages: ["Hindi", "English", "Maithili"],
      price: 1100,
      image: "/placeholder.svg?height=100&width=100",
      availability: "Available Today",
      verified: true,
      responseTime: "< 30 mins",
    },
  ]

  const assessmentQuestions = [
    {
      question: "How often do you feel overwhelmed by daily tasks?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      question: "How would you rate your current stress level?",
      options: ["Very Low", "Low", "Moderate", "High", "Very High"],
    },
    {
      question: "How often do you have trouble sleeping due to worry?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      question: "How confident do you feel about your future?",
      options: ["Very Confident", "Confident", "Neutral", "Not Confident", "Very Unconfident"],
    },
  ]

  const selfHelpContent = [
    {
      id: 1,
      title: "5-Minute Morning Meditation",
      type: "Audio Guide",
      duration: "5 minutes",
      category: "Mindfulness",
      image: "/placeholder.svg?height=150&width=200",
      description: "Start your day with peace and clarity",
      plays: 12500,
    },
    {
      id: 2,
      title: "Managing Exam Anxiety",
      type: "Article",
      duration: "8 min read",
      category: "Academic Stress",
      image: "/placeholder.svg?height=150&width=200",
      description: "Practical strategies to overcome test anxiety",
      plays: 8900,
    },
    {
      id: 3,
      title: "Building Self-Confidence",
      type: "Video Series",
      duration: "45 minutes",
      category: "Personal Growth",
      image: "/placeholder.svg?height=150&width=200",
      description: "Transform your self-image and boost confidence",
      plays: 15600,
    },
    {
      id: 4,
      title: "Sleep Better Tonight",
      type: "Audio Guide",
      duration: "20 minutes",
      category: "Sleep Health",
      image: "/placeholder.svg?height=150&width=200",
      description: "Guided relaxation for better sleep quality",
      plays: 9800,
    },
    {
      id: 5,
      title: "Dealing with Career Uncertainty",
      type: "Podcast",
      duration: "35 minutes",
      category: "Career Wellness",
      image: "/placeholder.svg?height=150&width=200",
      description: "Navigate career transitions with confidence",
      plays: 7200,
    },
    {
      id: 6,
      title: "Mindful Breathing Techniques",
      type: "Interactive",
      duration: "10 minutes",
      category: "Mindfulness",
      image: "/placeholder.svg?height=150&width=200",
      description: "Learn breathing exercises for instant calm",
      plays: 11300,
    },
  ]

  const handleAssessmentAnswer = (answerIndex: number) => {
    const newAnswers = [...assessmentAnswers]
    newAnswers[assessmentStep] = answerIndex
    setAssessmentAnswers(newAnswers)

    if (assessmentStep < assessmentQuestions.length - 1) {
      setAssessmentStep(assessmentStep + 1)
    }
  }

  const getAssessmentResult = () => {
    const totalScore = assessmentAnswers.reduce((sum, answer) => sum + answer, 0)
    const maxScore = assessmentQuestions.length * 4
    const percentage = (totalScore / maxScore) * 100

    if (percentage <= 30) return { level: "Low", color: "green", message: "You're managing stress well!" }
    if (percentage <= 60) return { level: "Moderate", color: "yellow", message: "Some areas need attention" }
    return { level: "High", color: "red", message: "Consider speaking with a counselor" }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Mental Wellness Support</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Professional counseling, free assessments, and self-help resources to support your mental well-being
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" variant="secondary" className="px-6 md:px-8 py-3 flex-1 sm:flex-none">
                Chat with Counselor
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-600 px-6 md:px-8 py-3 bg-transparent flex-1 sm:flex-none"
              >
                Take Free Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 md:p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">50+</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certified Counselors</p>
            </CardContent>
          </Card>

          <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 md:p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">10K+</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</p>
            </CardContent>
          </Card>

          <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 md:p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">95%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
            </CardContent>
          </Card>

          <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 md:p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">100%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confidential</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assessment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="counselors">Counselors</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment">
            <div className="max-w-2xl mx-auto">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 dark:text-white">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    Free Stress Assessment
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Take our quick assessment to understand your current mental wellness state
                  </p>
                </CardHeader>
                <CardContent>
                  {assessmentStep < assessmentQuestions.length ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Question {assessmentStep + 1} of {assessmentQuestions.length}
                        </span>
                        <Badge variant="outline">
                          {Math.round(((assessmentStep + 1) / assessmentQuestions.length) * 100)}% Complete
                        </Badge>
                      </div>

                      <Progress value={((assessmentStep + 1) / assessmentQuestions.length) * 100} className="h-2" />

                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-6 dark:text-white">
                          {assessmentQuestions[assessmentStep].question}
                        </h3>

                        <div className="space-y-3">
                          {assessmentQuestions[assessmentStep].options.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              onClick={() => handleAssessmentAnswer(index)}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-2 dark:text-white">Assessment Complete!</h3>
                        {assessmentAnswers.length === assessmentQuestions.length && (
                          <div className="space-y-4">
                            <div
                              className={`p-4 rounded-lg bg-${getAssessmentResult().color}-50 dark:bg-${getAssessmentResult().color}-900/20`}
                            >
                              <div
                                className={`text-lg font-semibold text-${getAssessmentResult().color}-800 dark:text-${getAssessmentResult().color}-200`}
                              >
                                Stress Level: {getAssessmentResult().level}
                              </div>
                              <p
                                className={`text-${getAssessmentResult().color}-700 dark:text-${getAssessmentResult().color}-300`}
                              >
                                {getAssessmentResult().message}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                Book Counseling Session
                              </Button>
                              <Button variant="outline" className="flex-1 bg-transparent">
                                View Detailed Report
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="counselors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {counselors.map((counselor) => (
                <Card
                  key={counselor.id}
                  className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="relative">
                        <Image
                          src={counselor.image || "/placeholder.svg"}
                          alt={counselor.name}
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                        {counselor.verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 dark:text-white truncate">{counselor.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{counselor.title}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{counselor.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({counselor.reviews} reviews)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {counselor.availability}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {counselor.responseTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2 dark:text-white">Specialization:</p>
                        <div className="flex flex-wrap gap-1">
                          {counselor.specialization.map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{counselor.experience}</span>
                        <span>{counselor.languages.join(", ")}</span>
                      </div>

                      <div className="border-t pt-4 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            ₹{counselor.price}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">per session</span>
                        </div>

                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Start Chat Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {selfHelpContent.map((content) => (
                <Card
                  key={content.id}
                  className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="relative">
                    <Image
                      src={content.image || "/placeholder.svg"}
                      alt={content.title}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800">{content.type}</Badge>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {content.duration}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {content.category}
                    </Badge>
                    <h3 className="font-semibold mb-2 dark:text-white line-clamp-2">{content.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{content.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{content.plays.toLocaleString()} plays</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      {content.type === "Audio Guide" ? (
                        <>
                          <Headphones className="w-4 h-4 mr-2" />
                          Listen Now
                        </>
                      ) : content.type === "Video Series" ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Watch Now
                        </>
                      ) : content.type === "Interactive" ? (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Try Now
                        </>
                      ) : content.type === "Podcast" ? (
                        <>
                          <Headphones className="w-4 h-4 mr-2" />
                          Listen
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download Wellness App
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="emergency">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Immediate Support?</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    If you're experiencing a mental health crisis or having thoughts of self-harm, please reach out for
                    immediate help. You're not alone.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Crisis Helpline: 1800-123-4567
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                    >
                      Emergency Chat Support
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 dark:text-white">National Helplines</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                        <li>• Suicide Prevention: 1800-123-4567</li>
                        <li>• Mental Health: 1800-891-4416</li>
                        <li>• Crisis Support: 1800-233-3330</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 dark:text-white">24/7 Online Support</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                        <li>• Live Chat Available</li>
                        <li>• Anonymous Support</li>
                        <li>• Multilingual Help</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 dark:text-white">Emergency Contacts</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                        <li>• Police: 100</li>
                        <li>• Ambulance: 108</li>
                        <li>• Women Helpline: 1091</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
