"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, BookOpen, Heart, Target, ArrowRight, Play, Globe, Smartphone, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState("en")

  const translations = {
    en: {
      tagline: "Your Personalized Guide to Career, Confidence & Clarity",
      heroDescription:
        "Connect with expert mentors, access career tools, and unlock your potential with personalized guidance in your preferred language.",
      getMentored: "Get Mentored Now",
      explorePrograms: "Explore Programs",
      whatWeDo: "What We Do",
      whatWeDoDesc: "Comprehensive support for your personal and professional growth",
      careerGuidance: "Career Guidance",
      careerDesc: "Expert mentorship, resume building, mock interviews, and personalized career roadmaps",
      mentalWellness: "Mental Wellness",
      wellnessDesc: "Certified counselors, stress assessments, and self-help resources for mental well-being",
      skillsDevelopment: "Skills Development",
      skillsDesc: "Live courses, webinars, and on-demand content to enhance your professional skills",
      trustedBy: "Trusted By Leading Institutions",
      studentStories: "Student Success Stories",
      storiesDesc: "Real stories from students who transformed their careers",
      mobileApp: "Take Your Growth Journey Mobile",
      mobileDesc: "Access mentors, courses, and tools on-the-go with our mobile app. Available in multiple languages.",
      downloadApp: "Download App",
      availableIn: "Available in 4 Languages",
      readyToTransform: "Ready to Transform Your Career?",
      joinThousands: "Join thousands of students who have already started their journey to success",
      startJourney: "Start Your Career Journey Free",
      takeWellnessTest: "Take Your First Wellness Test",
    },
    hi: {
      tagline: "आपका व्यक्तिगत करियर, आत्मविश्वास और स्पष्टता गाइड",
      heroDescription:
        "विशेषज्ञ मेंटर्स से जुड़ें, करियर टूल्स का उपयोग करें, और अपनी पसंदीदा भाषा में व्यक्तिगत मार्गदर्शन के साथ अपनी क्षमता को अनलॉक करें।",
      getMentored: "अभी मेंटरशिप लें",
      explorePrograms: "प्रोग्राम्स देखें",
      whatWeDo: "हम क्या करते हैं",
      whatWeDoDesc: "आपके व्यक्तिगत और व्यावसायिक विकास के लिए व्यापक सहायता",
      careerGuidance: "करियर गाइडेंस",
      careerDesc: "विशेषज्ञ मेंटरशिप, रिज्यूमे बिल्डिंग, मॉक इंटरव्यू, और व्यक्तिगत करियर रोडमैप",
      mentalWellness: "मानसिक कल्याण",
      wellnessDesc: "प्रमाणित काउंसलर, तनाव मूल्यांकन, और मानसिक कल्याण के लिए स्व-सहायता संसाधन",
      skillsDevelopment: "कौशल विकास",
      skillsDesc: "लाइव कोर्स, वेबिनार, और आपके व्यावसायिक कौशल को बढ़ाने के लिए ऑन-डिमांड कंटेंट",
      trustedBy: "अग्रणी संस्थानों द्वारा भरोसेमंद",
      studentStories: "छात्र सफलता की कहानियां",
      storiesDesc: "उन छात्रों की वास्तविक कहानियां जिन्होंने अपने करियर को बदल दिया",
      mobileApp: "अपनी विकास यात्रा को मोबाइल बनाएं",
      mobileDesc: "हमारे मोबाइल ऐप के साथ चलते-फिरते मेंटर्स, कोर्स और टूल्स का उपयोग करें।",
      downloadApp: "ऐप डाउनलोड करें",
      availableIn: "4 भाषाओं में उपलब्ध",
      readyToTransform: "अपने करियर को बदलने के लिए तैयार हैं?",
      joinThousands: "हजारों छात्रों में शामिल हों जिन्होंने पहले से ही सफलता की यात्रा शुरू की है",
      startJourney: "अपनी करियर यात्रा मुफ्त शुरू करें",
      takeWellnessTest: "अपना पहला वेलनेस टेस्ट लें",
    },
  }

  const t = translations[currentLang as keyof typeof translations]

  const testimonials = [
    {
      name: "प्रिया शर्मा",
      nameEn: "Priya Sharma",
      role: "Software Engineer at Google",
      content: "The mentorship helped me crack my dream job. The mock interviews and resume feedback were invaluable!",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "राहुल कुमार",
      nameEn: "Rahul Kumar",
      role: "Data Scientist",
      content: "Found my mentor who guided me through career transition. Amazing platform!",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "अंजली पटेल",
      nameEn: "Anjali Patel",
      role: "Marketing Manager",
      content: "The wellness counseling sessions helped me manage stress during job search.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
            🚀 India's #1 Personalized Mentorship Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t.tagline.split(" ").map((word, index) => (
              <span key={index} className={index >= 6 ? "text-blue-600 dark:text-blue-400" : ""}>
                {word}{" "}
              </span>
            ))}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">{t.heroDescription}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              <Link href="/mentorship" className="flex items-center gap-2">
                {t.getMentored} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 bg-transparent"
            >
              <Link href="/programs" className="flex items-center gap-2">
                <Play className="w-4 h-4" /> {t.explorePrograms}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.whatWeDo}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.whatWeDoDesc}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{t.careerGuidance}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t.careerDesc}</p>
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
              >
                <Link href="/career">Learn More</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{t.mentalWellness}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t.wellnessDesc}</p>
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
              >
                <Link href="/wellness">Learn More</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{t.skillsDevelopment}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t.skillsDesc}</p>
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
              >
                <Link href="/courses">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{t.trustedBy}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Partnering with top educational institutions and organizations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            {[
              "IIT Delhi",
              "BITS Pilani",
              "NIT Trichy",
              "IIIT Hyderabad",
              "Delhi University",
              "Mumbai University",
              "Jadavpur University",
              "VIT University",
            ].map((institution, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{institution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.studentStories}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">{t.storiesDesc}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.nameEn}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">
                      {currentLang === "hi" ? testimonial.name : testimonial.nameEn}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mobile App Promotion */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.mobileApp}</h2>
              <p className="text-xl mb-6 opacity-90">{t.mobileDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Download className="w-5 h-5" />
                  {t.downloadApp}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  {t.availableIn}
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="w-64 h-96 bg-white/10 rounded-3xl mx-auto flex items-center justify-center backdrop-blur-sm">
                <Smartphone className="w-24 h-24 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="group hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
              10K+
            </div>
            <p className="text-gray-600 dark:text-gray-300">Active Students</p>
          </div>
          <div className="group hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:text-green-700 dark:group-hover:text-green-300">
              500+
            </div>
            <p className="text-gray-600 dark:text-gray-300">Expert Mentors</p>
          </div>
          <div className="group hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300">
              95%
            </div>
            <p className="text-gray-600 dark:text-gray-300">Success Rate</p>
          </div>
          <div className="group hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2 group-hover:text-orange-700 dark:group-hover:text-orange-300">
              4.8/5
            </div>
            <p className="text-gray-600 dark:text-gray-300">User Rating</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.readyToTransform}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">{t.joinThousands}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-3 text-white"
            >
              <Link href="/signup">{t.startJourney}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 bg-transparent"
            >
              <Link href="/wellness">{t.takeWellnessTest}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
