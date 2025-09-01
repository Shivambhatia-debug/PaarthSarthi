"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  Shield,
  Zap,
  BarChart3,
  HeadphonesIcon,
  Palette,
  Settings,
  BookOpen,
  Heart,
  Target,
  Award,
  TrendingUp,
  Clock,
  MessageCircle,
  Calendar,
  Download,
  FileText,
  Briefcase,
  Smartphone,
} from "lucide-react"
import Image from "next/image"

export default function InstitutionsPage() {
  const [selectedPlan, setSelectedPlan] = useState("professional")
  const [formData, setFormData] = useState({
    institutionName: "",
    contactPerson: "",
    email: "",
    phone: "",
    institutionType: "",
    studentCount: "",
    requirements: "",
    timeline: "",
  })

  const institutionTypes = [
    { value: "school", label: "School/College", icon: BookOpen },
    { value: "ngo", label: "NGO", icon: Heart },
    { value: "edtech", label: "EdTech Company", icon: Zap },
    { value: "corporate", label: "Corporate", icon: Briefcase },
    { value: "government", label: "Government", icon: Building2 },
    { value: "other", label: "Other", icon: Settings },
  ]

  const pricingPlans = [
    {
      id: "starter",
      name: "Starter",
      price: "₹50,000",
      period: "/year",
      description: "Perfect for small institutions getting started",
      features: [
        "Up to 100 students",
        "Basic mentor matching",
        "Email support",
        "Monthly reports",
        "Basic customization",
        "Mobile app access",
      ],
      popular: false,
      color: "border-gray-200 dark:border-gray-700",
    },
    {
      id: "professional",
      name: "Professional",
      price: "₹1,50,000",
      period: "/year",
      description: "Most popular choice for growing institutions",
      features: [
        "Up to 500 students",
        "AI-powered mentor matching",
        "Priority support",
        "Weekly analytics",
        "Full white-label branding",
        "API integrations",
        "Custom workflows",
        "Dedicated account manager",
      ],
      popular: true,
      color: "border-blue-500 dark:border-blue-400",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited students",
        "Advanced AI features",
        "24/7 dedicated support",
        "Real-time analytics",
        "Complete customization",
        "On-premise deployment",
        "Custom integrations",
        "Training & onboarding",
        "SLA guarantees",
      ],
      popular: false,
      color: "border-green-500 dark:border-green-400",
    },
  ]

  const partnerLogos = [
    { name: "IIT Delhi", logo: "/placeholder.svg?height=60&width=120" },
    { name: "AIIMS", logo: "/placeholder.svg?height=60&width=120" },
    { name: "DU", logo: "/placeholder.svg?height=60&width=120" },
    { name: "JNU", logo: "/placeholder.svg?height=60&width=120" },
    { name: "IGNOU", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Jamia", logo: "/placeholder.svg?height=60&width=120" },
  ]

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      position: "Dean, Career Services",
      institution: "Delhi University",
      content:
        "Parth Sarthi has transformed how we provide career guidance to our 15,000+ students. The multilingual support is exceptional.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
      stats: "15,000+ students mentored",
    },
    {
      name: "Priya Sharma",
      position: "Director",
      institution: "Skill Development NGO",
      content:
        "The white-label solution perfectly matches our brand. Our rural students love the Hindi and Bhojpuri support.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
      stats: "5,000+ rural students reached",
    },
    {
      name: "Amit Patel",
      position: "CTO",
      institution: "EduTech Solutions",
      content:
        "Seamless API integration and excellent support. Our client satisfaction has increased by 40% since implementation.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
      stats: "40% increase in satisfaction",
    },
  ]

  const platformStats = [
    { label: "Partner Institutions", value: "50+", icon: Building2 },
    { label: "Students Mentored", value: "25,000+", icon: Users },
    { label: "Success Rate", value: "95%", icon: TrendingUp },
    { label: "Languages Supported", value: "4", icon: Globe },
  ]

  const whitelabelFeatures = [
    {
      title: "Complete Branding",
      description: "Your logo, colors, and domain name throughout the platform",
      icon: Palette,
    },
    {
      title: "Custom Workflows",
      description: "Tailor the mentorship process to match your institution's needs",
      icon: Settings,
    },
    {
      title: "API Integration",
      description: "Seamlessly integrate with your existing student management systems",
      icon: Zap,
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive insights into student engagement and outcomes",
      icon: BarChart3,
    },
    {
      title: "Dedicated Support",
      description: "Priority support with dedicated account management",
      icon: HeadphonesIcon,
    },
    {
      title: "Security & Compliance",
      description: "Enterprise-grade security with data privacy compliance",
      icon: Shield,
    },
  ]

  const implementationSteps = [
    {
      step: 1,
      title: "Discovery & Planning",
      description: "We understand your requirements and create a customized implementation plan",
      duration: "1-2 weeks",
      icon: Target,
    },
    {
      step: 2,
      title: "Setup & Configuration",
      description: "Platform setup with your branding, workflows, and integrations",
      duration: "2-3 weeks",
      icon: Settings,
    },
    {
      step: 3,
      title: "Training & Onboarding",
      description: "Comprehensive training for your team and pilot program with select students",
      duration: "1-2 weeks",
      icon: BookOpen,
    },
    {
      step: 4,
      title: "Launch & Support",
      description: "Full platform launch with ongoing support and optimization",
      duration: "Ongoing",
      icon: Award,
    },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Empower Your Institution with
              <span className="block bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                White-Label Mentorship
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Transform student outcomes with AI-powered career guidance in multiple languages
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 bg-transparent"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Brochure
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto dark:bg-gray-800">
            <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="pricing" className="dark:data-[state=active]:bg-gray-700">
              Pricing
            </TabsTrigger>
            <TabsTrigger value="features" className="dark:data-[state=active]:bg-gray-700">
              Features
            </TabsTrigger>
            <TabsTrigger value="contact" className="dark:data-[state=active]:bg-gray-700">
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-16">
            {/* Institution Types */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Perfect for Every Institution
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  From schools to corporations, our platform adapts to your unique needs
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {institutionTypes.map((type, index) => (
                  <Card key={index} className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <type.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{type.label}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Tailored solutions for {type.label.toLowerCase()} needs
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* White-Label Features */}
            <section className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Complete White-Label Solution
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Make it truly yours with complete customization and branding options
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {whitelabelFeatures.map((feature, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Implementation Process */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Simple Implementation Process
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Get started in just 4-6 weeks with our proven implementation methodology
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {implementationSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {step.duration}
                      </Badge>
                    </div>
                    {index < implementationSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-green-600 transform -translate-x-8"></div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Partner Logos */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Trusted by Leading Institutions
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Join 50+ institutions already transforming student outcomes
                </p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60 hover:opacity-100 transition-opacity">
                {partnerLogos.map((partner, index) => (
                  <div key={index} className="text-center">
                    <Image
                      src={partner.logo || "/placeholder.svg"}
                      alt={partner.name}
                      width={120}
                      height={60}
                      className="mx-auto grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Flexible pricing options designed to scale with your institution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${plan.color} ${
                    plan.popular ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
                  } dark:bg-gray-800`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                          : "bg-transparent"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.id === "enterprise" ? "Contact Sales" : "Get Started"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Packages */}
            <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Bulk Mentorship Packages
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Special pricing for high-volume mentorship requirements
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1,000</div>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">Sessions/Year</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹800/session</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">20% discount</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center border-2 border-blue-500 dark:border-blue-400">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">5,000</div>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">Sessions/Year</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹600/session</div>
                  <div className="text-sm text-green-600 dark:text-green-400">40% discount</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10,000+</div>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">Sessions/Year</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Custom</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Contact us</div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Comprehensive Feature Set
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Everything you need to provide world-class mentorship to your students
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Core Features */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Core Platform Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">AI-Powered Matching</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Smart algorithms match students with ideal mentors based on goals and preferences
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Multilingual Support</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Native support for English, Hindi, Maithili, and Bhojpuri
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Integrated Communication</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        HD video calls, smart chat, and file sharing in one platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Career Toolkit</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Resume builder, mock interviews, and goal planning tools
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Features */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    Admin & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Real-time Dashboard</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monitor student engagement, mentor performance, and outcomes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Custom Reports</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generate detailed reports for stakeholders and compliance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">User Management</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bulk user import, role management, and access controls
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">API Integration</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Connect with existing LMS, SIS, and other institutional systems
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technical Specifications */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    SOC 2 compliant, end-to-end encryption, GDPR ready
                  </p>
                </div>
                <div className="text-center">
                  <Globe className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Scalability</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Auto-scaling infrastructure, 99.9% uptime SLA
                  </p>
                </div>
                <div className="text-center">
                  <Smartphone className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Mobile Ready</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Native mobile apps for iOS and Android</p>
                </div>
                <div className="text-center">
                  <HeadphonesIcon className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    24/7 technical support with dedicated account manager
                  </p>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Request a Demo</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    Let's discuss how Parth Sarthi can transform your institution's career guidance
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institutionName" className="dark:text-gray-300">
                        Institution Name *
                      </Label>
                      <Input
                        id="institutionName"
                        placeholder="Your institution name"
                        value={formData.institutionName}
                        onChange={(e) => handleInputChange("institutionName", e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson" className="dark:text-gray-300">
                        Contact Person *
                      </Label>
                      <Input
                        id="contactPerson"
                        placeholder="Your full name"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="dark:text-gray-300">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@institution.edu"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="dark:text-gray-300">
                        Phone Number *
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institutionType" className="dark:text-gray-300">
                        Institution Type *
                      </Label>
                      <Select
                        value={formData.institutionType}
                        onValueChange={(value) => handleInputChange("institutionType", value)}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                          {institutionTypes.map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                              className="dark:text-white dark:focus:bg-gray-600"
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="studentCount" className="dark:text-gray-300">
                        Number of Students
                      </Label>
                      <Select
                        value={formData.studentCount}
                        onValueChange={(value) => handleInputChange("studentCount", value)}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                          <SelectItem value="0-100" className="dark:text-white dark:focus:bg-gray-600">
                            0-100
                          </SelectItem>
                          <SelectItem value="100-500" className="dark:text-white dark:focus:bg-gray-600">
                            100-500
                          </SelectItem>
                          <SelectItem value="500-1000" className="dark:text-white dark:focus:bg-gray-600">
                            500-1,000
                          </SelectItem>
                          <SelectItem value="1000-5000" className="dark:text-white dark:focus:bg-gray-600">
                            1,000-5,000
                          </SelectItem>
                          <SelectItem value="5000+" className="dark:text-white dark:focus:bg-gray-600">
                            5,000+
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="dark:text-gray-300">
                      Specific Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="Tell us about your specific needs, challenges, or questions..."
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeline" className="dark:text-gray-300">
                      Implementation Timeline
                    </Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="When do you want to start?" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="immediate" className="dark:text-white dark:focus:bg-gray-600">
                          Immediately
                        </SelectItem>
                        <SelectItem value="1-3months" className="dark:text-white dark:focus:bg-gray-600">
                          1-3 months
                        </SelectItem>
                        <SelectItem value="3-6months" className="dark:text-white dark:focus:bg-gray-600">
                          3-6 months
                        </SelectItem>
                        <SelectItem value="6months+" className="dark:text-white dark:focus:bg-gray-600">
                          6+ months
                        </SelectItem>
                        <SelectItem value="exploring" className="dark:text-white dark:focus:bg-gray-600">
                          Just exploring
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-lg py-3">
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Demo Call
                  </Button>

                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    We'll respond within 24 hours to schedule your personalized demo
                  </p>
                </CardContent>
              </Card>

              {/* Contact Info & Testimonials */}
              <div className="space-y-8">
                {/* Contact Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Get in Touch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                        <p className="text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email</p>
                        <p className="text-gray-600 dark:text-gray-400">institutions@parthsarthi.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                        <p className="text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Testimonials */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      What Our Partners Say
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="border-b dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-3 mb-3">
                          <Image
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{testimonial.name}</h4>
                              <div className="flex">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.position}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">{testimonial.institution}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 italic mb-2">"{testimonial.content}"</p>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {testimonial.stats}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Download Resources */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start dark:border-gray-600 dark:text-gray-300 bg-transparent"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Product Brochure
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start dark:border-gray-600 dark:text-gray-300 bg-transparent"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Case Studies & ROI Report
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start dark:border-gray-600 dark:text-gray-300 bg-transparent"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Security & Compliance Guide
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
