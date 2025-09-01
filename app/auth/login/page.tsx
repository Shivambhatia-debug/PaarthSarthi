"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mail,
  Eye,
  EyeOff,
  Phone,
  User,
  Shield,
  CheckCircle,
  ArrowRight,
  Globe,
  MessageCircle,
  Star,
  Users,
  BookOpen,
  Heart,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState("email")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [userType, setUserType] = useState("student")
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "student",
    language: "en",
    interests: [],
    experience: "",
    specialization: "",
  })

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिंदी" },
    { code: "mai", name: "Maithili", native: "मैथिली" },
    { code: "bho", name: "Bhojpuri", native: "भोजपुरी" },
  ]

  const interests = [
    { id: "career", label: "Career Guidance", icon: Briefcase },
    { id: "wellness", label: "Mental Wellness", icon: Heart },
    { id: "skills", label: "Skill Development", icon: BookOpen },
    { id: "interview", label: "Interview Prep", icon: Users },
    { id: "resume", label: "Resume Building", icon: User },
    { id: "communication", label: "Communication", icon: MessageCircle },
  ]

  const platformStats = [
    { label: "Active Mentors", value: "500+", icon: Users },
    { label: "Success Stories", value: "10K+", icon: Star },
    { label: "Languages Supported", value: "4", icon: Globe },
    { label: "Institutions", value: "50+", icon: BookOpen },
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      content: "Parth Sarthi helped me transition from teaching to tech. The mentors are amazing!",
      rating: 5,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "राहुल कुमार",
      role: "Student",
      content: "मैथिली में मेंटरशिप मिलना बहुत अच्छा लगा। बहुत मदद मिली।",
      rating: 5,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Anjali Singh",
      role: "Career Changer",
      content: "The wellness support during my career transition was invaluable.",
      rating: 5,
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }))
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Side - Branding & Info */}
          <div className="space-y-8">
            {/* Logo & Welcome */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Parth Sarthi
                </h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Your Career Journey Starts Here
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Join thousands of learners getting personalized mentorship in their preferred language
              </p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 gap-4">
              {platformStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 text-center"
                >
                  <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features Highlight */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Parth Sarthi?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">AI-powered mentor matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Multilingual support (4 languages)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">24/7 wellness support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Career toolkit & resources</span>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h3>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="border-l-4 border-blue-600 dark:border-blue-400 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                      <div className="flex ml-auto">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{testimonial.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
                <TabsTrigger value="login" className="dark:data-[state=active]:bg-gray-700">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="dark:data-[state=active]:bg-gray-700">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-center dark:text-white">Welcome Back!</CardTitle>
                    <p className="text-center text-gray-600 dark:text-gray-400">
                      Sign in to continue your learning journey
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Login Method Selection */}
                    <div className="flex gap-2">
                      <Button
                        variant={loginMethod === "email" ? "default" : "outline"}
                        onClick={() => setLoginMethod("email")}
                        className="flex-1"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button
                        variant={loginMethod === "phone" ? "default" : "outline"}
                        onClick={() => setLoginMethod("phone")}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Phone
                      </Button>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="login-input" className="dark:text-gray-300">
                          {loginMethod === "email" ? "Email Address" : "Phone Number"}
                        </Label>
                        <Input
                          id="login-input"
                          type={loginMethod === "email" ? "email" : "tel"}
                          placeholder={loginMethod === "email" ? "your@email.com" : "+91 98765 43210"}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="dark:text-gray-300">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" />
                          <Label htmlFor="remember" className="text-sm dark:text-gray-300">
                            Remember me
                          </Label>
                        </div>
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {/* Social Login */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 bg-transparent">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 bg-transparent">
                        <Phone className="w-4 h-4 mr-2" />
                        OTP
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-center dark:text-white">Create Your Account</CardTitle>
                    <p className="text-center text-gray-600 dark:text-gray-400">
                      Step {currentStep} of 3 - Let's get you started
                    </p>
                    <div className="flex justify-center mt-4">
                      <div className="flex space-x-2">
                        {[1, 2, 3].map((step) => (
                          <div
                            key={step}
                            className={`w-8 h-2 rounded-full ${
                              step <= currentStep
                                ? "bg-gradient-to-r from-blue-600 to-green-600"
                                : "bg-gray-200 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="dark:text-gray-300">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email" className="dark:text-gray-300">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone" className="dark:text-gray-300">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="signup-password" className="dark:text-gray-300">
                            Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button
                          onClick={nextStep}
                          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {/* Step 2: User Type & Language */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <Label className="dark:text-gray-300 text-base font-medium">I am a...</Label>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <Button
                              variant={userType === "student" ? "default" : "outline"}
                              onClick={() => setUserType("student")}
                              className="h-20 flex-col gap-2"
                            >
                              <BookOpen className="w-6 h-6" />
                              <span>Student</span>
                            </Button>
                            <Button
                              variant={userType === "mentor" ? "default" : "outline"}
                              onClick={() => setUserType("mentor")}
                              className="h-20 flex-col gap-2"
                            >
                              <Users className="w-6 h-6" />
                              <span>Mentor</span>
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="dark:text-gray-300 text-base font-medium">Preferred Language</Label>
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2">
                              <SelectValue placeholder="Select your language" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                              {languages.map((lang) => (
                                <SelectItem
                                  key={lang.code}
                                  value={lang.code}
                                  className="dark:text-white dark:focus:bg-gray-600"
                                >
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <span>{lang.name}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">({lang.native})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {userType === "mentor" && (
                          <div>
                            <Label htmlFor="experience" className="dark:text-gray-300">
                              Years of Experience
                            </Label>
                            <Select>
                              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2">
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                                <SelectItem value="1-2" className="dark:text-white dark:focus:bg-gray-600">
                                  1-2 years
                                </SelectItem>
                                <SelectItem value="3-5" className="dark:text-white dark:focus:bg-gray-600">
                                  3-5 years
                                </SelectItem>
                                <SelectItem value="5-10" className="dark:text-white dark:focus:bg-gray-600">
                                  5-10 years
                                </SelectItem>
                                <SelectItem value="10+" className="dark:text-white dark:focus:bg-gray-600">
                                  10+ years
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button
                            onClick={prevStep}
                            variant="outline"
                            className="flex-1 dark:border-gray-600 dark:text-gray-300 bg-transparent"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={nextStep}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Interests & Completion */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <Label className="dark:text-gray-300 text-base font-medium">
                            {userType === "student" ? "What are you interested in?" : "Your areas of expertise"}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Select all that apply (minimum 2)
                          </p>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {interests.map((interest) => (
                              <Button
                                key={interest.id}
                                variant={formData.interests.includes(interest.id) ? "default" : "outline"}
                                onClick={() => handleInterestToggle(interest.id)}
                                className="h-16 flex-col gap-2 text-sm"
                              >
                                <interest.icon className="w-5 h-5" />
                                <span>{interest.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-900 dark:text-blue-100">Privacy & Terms</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="terms" />
                              <Label htmlFor="terms" className="text-sm text-blue-800 dark:text-blue-200">
                                I agree to the{" "}
                                <Link href="/terms" className="underline hover:no-underline">
                                  Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="underline hover:no-underline">
                                  Privacy Policy
                                </Link>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="marketing" />
                              <Label htmlFor="marketing" className="text-sm text-blue-800 dark:text-blue-200">
                                Send me updates about new features and mentors
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={prevStep}
                            variant="outline"
                            className="flex-1 dark:border-gray-600 dark:text-gray-300 bg-transparent"
                          >
                            Back
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                            Create Account
                            <CheckCircle className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Additional Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help?{" "}
                <Link href="/support" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Contact Support
                </Link>
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Privacy
                </Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Terms
                </Link>
                <span>•</span>
                <Link href="/help" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
