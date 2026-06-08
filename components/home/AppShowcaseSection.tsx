"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Smartphone, Shield, Download, CheckCircle, ArrowRight, 
  Home, GraduationCap, Users, MessageSquare, User, 
  Wifi, Battery, Send, Star, Calendar, Clock, Check
} from "lucide-react"

// Mock Data for Simulator
const CLASSES = [
  { id: "class_9", label: "Class 9th", emoji: "🎒" },
  { id: "class_10", label: "Class 10th", emoji: "🏫" },
  { id: "class_11", label: "Class 11th", emoji: "📚" },
  { id: "class_12", label: "Class 12th", emoji: "🎓" },
  { id: "dropper", label: "Dropper", emoji: "🎯" },
]

const GOALS = [
  { id: "jee", label: "IIT-JEE", emoji: "🚀" },
  { id: "neet", label: "NEET-UG", emoji: "🩺" },
  { id: "boards", label: "Boards", emoji: "🏆" },
  { id: "coding", label: "Coding", emoji: "💻" },
]

const MODES = [
  { id: "online", label: "Online Live", emoji: "💻" },
  { id: "offline", label: "Offline Center", emoji: "🏫" },
  { id: "mentorship", label: "1-on-1 Mentor", emoji: "🧠" },
]

const CHALLENGES = [
  { id: "doubts", label: "Solving Doubts", emoji: "❓" },
  { id: "schedule", label: "Making Schedule", emoji: "📅" },
  { id: "marks", label: "Improving Marks", emoji: "📈" },
]

const MOCK_MENTORS = [
  { id: "m1", name: "Alakh Sir", title: "Physics Guru", rating: "4.9", reviews: "12K", exp: "8 yrs", avatar: "👨‍🏫" },
  { id: "m2", name: "Mohit Sir", title: "Maths Expert (IIT D)", rating: "4.8", reviews: "8K", exp: "6 yrs", avatar: "👨‍🎓" },
  { id: "m3", name: "Anushka Ma'am", title: "Biology Specialist", rating: "4.9", reviews: "9K", exp: "7 yrs", avatar: "👩‍⚕️" },
]

export function AppShowcaseSection() {
  const [activeTab, setActiveTab] = useState<"home" | "admission" | "mentors" | "chat" | "profile">("home")
  
  // Autoplay simulation states
  const [isPlaying, setIsPlaying] = useState(true)
  const [playPhase, setPlayPhase] = useState(0)

  // Onboarding discovery simulation states
  const [admStep, setAdmStep] = useState(0)
  const [selClass, setSelClass] = useState("")
  const [selGoal, setSelGoal] = useState("")
  const [selMode, setSelMode] = useState("")
  const [selChallenge, setSelChallenge] = useState("")
  const [subName, setSubName] = useState("Parth")
  const [subPhone, setSubPhone] = useState("9876543210")

  // Mentor booking simulation states
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [bookingStep, setBookingStep] = useState<"list" | "slots" | "success">("list")
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [selectedTime, setSelectedTime] = useState("11:00 AM")

  // Chat simulation states
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "Hello! Welcome to ParthSarthi. How is your exam preparation going?", sender: "mentor", time: "09:41 AM" }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Disable autoplay when user interacts
  const handleInteraction = () => {
    setIsPlaying(false)
  }

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setPlayPhase(prev => {
        const next = (prev + 1) % 12
        
        switch (next) {
          case 0:
            setActiveTab("home")
            break
          case 1:
            setActiveTab("admission")
            setAdmStep(0)
            setSelClass("")
            break
          case 2:
            setSelClass("class_11")
            setAdmStep(1)
            setSelGoal("")
            break
          case 3:
            setSelGoal("jee")
            setAdmStep(2)
            setSelMode("")
            break
          case 4:
            setSelMode("mentorship")
            setAdmStep(3)
            setSelChallenge("")
            break
          case 5:
            setSelChallenge("schedule")
            setAdmStep(4)
            break
          case 6:
            setAdmStep(5) // success ("We will connect to you soon!")
            break
          case 7:
            setActiveTab("mentors")
            setBookingStep("list")
            setSelectedMentor(null)
            break
          case 8:
            setSelectedMentor(MOCK_MENTORS[0])
            setBookingStep("slots")
            break
          case 9:
            setBookingStep("success")
            break
          case 10:
            setActiveTab("chat")
            break
          case 11:
            setActiveTab("profile")
            break
        }
        return next
      })
    }, 2800)

    return () => clearInterval(interval)
  }, [isPlaying])

  // Chat dialogue auto-typing sequence
  useEffect(() => {
    if (activeTab === "chat" && isPlaying) {
      setMessages([
        { id: 1, text: "Hello! Welcome to ParthSarthi. How is your exam preparation going?", sender: "mentor", time: "09:41 AM" }
      ])
      
      const t1 = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: 2, text: "Sir, how do I make a structured schedule for IIT-JEE?", sender: "user", time: "09:42 AM" }
        ])
      }, 800)

      const t2 = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: 3, text: "Make a checklist of weak topics. Let's discuss it in our video session!", sender: "mentor", time: "09:42 AM" }
        ])
      }, 1800)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [activeTab, isPlaying])

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Handle send message
  const handleSendMessage = () => {
    handleInteraction()
    if (!inputText.trim()) return
    const newMsg = { id: messages.length + 1, text: inputText.trim(), sender: "user", time: "09:42 AM" }
    setMessages(prev => [...prev, newMsg])
    setInputText("")
    setIsTyping(true)

    // Simulate mentor reply after 1.5 seconds
    setTimeout(() => {
      setIsTyping(false)
      const reply = {
        id: messages.length + 2,
        text: "That sounds like a great start! I highly suggest focusing on physical chemistry concepts and practicing daily DPPs. Let's schedule a 1-on-1 video session to discuss your timetable?",
        sender: "mentor",
        time: "09:43 AM"
      }
      setMessages(prev => [...prev, reply])
    }, 1500)
  }

  // Quick helper to reset admission flow
  const resetAdmissionFlow = () => {
    setAdmStep(0)
    setSelClass("")
    setSelGoal("")
    setSelMode("")
    setSelChallenge("")
  }

  return (
    <section className="py-16 md:py-24 bg-[#080d19] relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[90px]" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Product Showcase Information */}
          <div className="flex flex-col text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-max uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              ParthSarthi Mobile App
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Get Career Guidance on the Go.{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Download Our App!
              </span>
            </h2>

            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Experience personalized mentorship, counseling, and exam prep courses right from your smartphone. Install the app, choose your path, and start learning with top experts today.
            </p>

            {/* Bullet list of key features */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {[
                "1-on-1 Video Session Booking",
                "Instant Pathfinder Interest Discovery",
                "Live Chat Counseling Support",
                "Free Competitive Exam Batches",
                "Community Student Network",
                "Verified Industry Rankers"
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs md:text-sm font-medium">{feat}</span>
                </div>
              ))}
            </div>

            {/* Action buttons with direct APK download */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6">
              <a 
                href="/ParthSarthi.apk"
                download="ParthSarthi.apk"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-sm group"
              >
                <Download className="w-4.5 h-4.5 group-hover:bounce" />
                Download Android APK (34MB)
              </a>
              <div className="flex items-center gap-2.5 justify-center">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Also Available on:</span>
                <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-gray-300 font-semibold cursor-not-allowed">Google Play</span>
                <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-gray-300 font-semibold cursor-not-allowed">App Store</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              *Direct APK installation allows you to run the app directly on any Android device instantly.
            </p>
          </div>

          {/* Right Side: Virtual Interactive Smartphone Simulator */}
          <div className="flex justify-center relative">
            {/* Background glowing frame */}
            <div className="absolute top-[10%] w-[320px] h-[640px] bg-blue-500/10 rounded-[50px] blur-[40px] -z-10" />
            
            {/* Outer phone shell */}
            <div className="w-[310px] h-[630px] rounded-[48px] border-[10px] border-slate-800 bg-black shadow-2xl relative overflow-hidden flex flex-col">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>

              {/* Speaker notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-900 rounded-b-md z-30" />

              {/* Screen Top Status Bar */}
              <div className="h-8 bg-[#060a13] px-6 pt-2 flex justify-between items-center text-[10px] text-white select-none z-20 font-bold">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-2.5 h-2.5 text-white" />
                  <span className="text-[8px] tracking-tighter">5G</span>
                  <Battery className="w-3.5 h-2.5 text-white" />
                </div>
              </div>

              {/* SCREEN CONTENT AREA (TABS) */}
              <div className="flex-1 bg-[#060a13] overflow-hidden flex flex-col relative select-none">
                
                {/* TAB 1: HOME */}
                {activeTab === "home" && (
                  <ScrollViewWrapper>
                    {/* Welcome Header */}
                    <div className="p-4 bg-gradient-to-b from-blue-900/20 to-transparent rounded-b-2xl mb-4 border-b border-blue-900/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <TextHelper className="text-gray-500 text-[10px] uppercase font-bold">Hello Student 👋</TextHelper>
                          <TextHelper className="text-white text-base font-extrabold tracking-tight">Explore ParthSarthi</TextHelper>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-sm">🎓</div>
                      </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="px-4 mb-4">
                      <TextHelper className="text-white text-xs font-bold mb-2.5 block">Quick Services</TextHelper>
                      <div className="grid grid-cols-2 gap-2">
                        <TouchableOpacityHelper 
                          className="bg-[#0d1117] border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1 items-start"
                          onClick={() => { handleInteraction(); setActiveTab("mentors"); }}
                        >
                          <span className="text-lg">🤝</span>
                          <TextHelper className="text-white text-[11px] font-bold">Book Mentor</TextHelper>
                          <TextHelper className="text-gray-500 text-[8px]">1-on-1 Sessions</TextHelper>
                        </TouchableOpacityHelper>
                        <TouchableOpacityHelper 
                          className="bg-[#0d1117] border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1 items-start"
                          onClick={() => { handleInteraction(); setActiveTab("admission"); }}
                        >
                          <span className="text-lg">🎓</span>
                          <TextHelper className="text-white text-[11px] font-bold">Admission</TextHelper>
                          <TextHelper className="text-gray-500 text-[8px]">Interest Discovery</TextHelper>
                        </TouchableOpacityHelper>
                      </div>
                    </div>

                    {/* Banner Card */}
                    <div className="mx-4 mb-4 p-3 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl flex items-center justify-between shadow-lg shadow-emerald-900/20">
                      <div className="max-w-[70%]">
                        <TextHelper className="text-white text-[11px] font-extrabold">Need Stream Guidance?</TextHelper>
                        <TextHelper className="text-white/80 text-[8px] mt-0.5">Start your 1-on-1 counselor path session.</TextHelper>
                      </div>
                      <TouchableOpacityHelper 
                        className="bg-white text-emerald-800 text-[9px] font-bold px-2 py-1 rounded-md"
                        onClick={() => { handleInteraction(); resetAdmissionFlow(); setActiveTab("admission"); }}
                      >
                        Start →
                      </TouchableOpacityHelper>
                    </div>

                    {/* Featured Mentors */}
                    <div className="px-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <TextHelper className="text-white text-xs font-bold">Top Verified Mentors</TextHelper>
                        <TextHelper className="text-emerald-400 text-[9px] font-bold" onClick={() => { handleInteraction(); setActiveTab("mentors"); }}>See All</TextHelper>
                      </div>
                      <div className="space-y-2">
                        {MOCK_MENTORS.slice(0, 2).map(m => (
                          <div key={m.id} className="bg-[#0d1117] border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">{m.avatar}</div>
                              <div>
                                <TextHelper className="text-white text-[11px] font-bold">{m.name}</TextHelper>
                                <TextHelper className="text-gray-500 text-[9px]">{m.title}</TextHelper>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-400 text-[9px] font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {m.rating}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollViewWrapper>
                )}

                {/* TAB 2: ADMISSION (INTEREST DISCOVERY PATH) */}
                {activeTab === "admission" && (
                  <div className="flex-1 flex flex-col p-4 justify-between h-full bg-[#060a13]">
                    
                    {/* Step 0: Class */}
                    {admStep === 0 && (
                      <div className="space-y-2.5 flex-1">
                        <TextHelper className="text-white text-xs font-extrabold">Which class are you in? 🏫</TextHelper>
                        <TextHelper className="text-gray-500 text-[9px] leading-tight mb-1 block">Choose your current grade to identify goals.</TextHelper>
                        {CLASSES.map(item => (
                          <TouchableOpacityHelper 
                            key={item.id}
                            className={`p-2 border rounded-xl flex items-center justify-between ${selClass === item.id ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-[#0d1117]"}`}
                            onClick={() => { handleInteraction(); setSelClass(item.id); setTimeout(() => setAdmStep(1), 200); }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{item.emoji}</span>
                              <TextHelper className="text-white text-[10px] font-bold">{item.label}</TextHelper>
                            </div>
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selClass === item.id ? "border-emerald-500 bg-emerald-500" : "border-slate-700"}`}>
                              {selClass === item.id && <Check className="w-2 h-2 text-white" />}
                            </div>
                          </TouchableOpacityHelper>
                        ))}
                      </div>
                    )}

                    {/* Step 1: Goal */}
                    {admStep === 1 && (
                      <div className="space-y-2.5 flex-1">
                        <TextHelper className="text-white text-xs font-extrabold">What is your target exam? 🚀</TextHelper>
                        <TextHelper className="text-gray-500 text-[9px] leading-tight mb-1 block">Select your primary target objective.</TextHelper>
                        {GOALS.map(item => (
                          <TouchableOpacityHelper 
                            key={item.id}
                            className={`p-2 border rounded-xl flex items-center justify-between ${selGoal === item.id ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-[#0d1117]"}`}
                            onClick={() => { handleInteraction(); setSelGoal(item.id); setTimeout(() => setAdmStep(2), 200); }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{item.emoji}</span>
                              <TextHelper className="text-white text-[10px] font-bold">{item.label}</TextHelper>
                            </div>
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selGoal === item.id ? "border-emerald-500 bg-emerald-500" : "border-slate-700"}`}>
                              {selGoal === item.id && <Check className="w-2 h-2 text-white" />}
                            </div>
                          </TouchableOpacityHelper>
                        ))}
                      </div>
                    )}

                    {/* Step 2: Preferred Study Mode */}
                    {admStep === 2 && (
                      <div className="space-y-2.5 flex-1">
                        <TextHelper className="text-white text-xs font-extrabold">How do you prefer to study? 💡</TextHelper>
                        <TextHelper className="text-gray-500 text-[9px] leading-tight mb-1 block">Choose your study style preference.</TextHelper>
                        {MODES.map(item => (
                          <TouchableOpacityHelper 
                            key={item.id}
                            className={`p-2 border rounded-xl flex items-center justify-between ${selMode === item.id ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-[#0d1117]"}`}
                            onClick={() => { handleInteraction(); setSelMode(item.id); setTimeout(() => setAdmStep(3), 200); }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{item.emoji}</span>
                              <TextHelper className="text-white text-[10px] font-bold">{item.label}</TextHelper>
                            </div>
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selMode === item.id ? "border-emerald-500 bg-emerald-500" : "border-slate-700"}`}>
                              {selMode === item.id && <Check className="w-2 h-2 text-white" />}
                            </div>
                          </TouchableOpacityHelper>
                        ))}
                      </div>
                    )}

                    {/* Step 3: Main Challenge */}
                    {admStep === 3 && (
                      <div className="space-y-2.5 flex-1">
                        <TextHelper className="text-white text-xs font-extrabold">Your biggest study challenge? 🎯</TextHelper>
                        <TextHelper className="text-gray-500 text-[9px] leading-tight mb-1 block">What blocks your success right now?</TextHelper>
                        {CHALLENGES.map(item => (
                          <TouchableOpacityHelper 
                            key={item.id}
                            className={`p-2 border rounded-xl flex items-center justify-between ${selChallenge === item.id ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-[#0d1117]"}`}
                            onClick={() => { handleInteraction(); setSelChallenge(item.id); setTimeout(() => setAdmStep(4), 200); }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{item.emoji}</span>
                              <TextHelper className="text-white text-[10px] font-bold">{item.label}</TextHelper>
                            </div>
                            <div style={{ pointerEvents: 'none' }} className={`w-3 h-3 rounded-full border flex items-center justify-center ${selChallenge === item.id ? "border-emerald-500 bg-emerald-500" : "border-slate-700"}`}>
                              {selChallenge === item.id && <Check className="w-2 h-2 text-white" />}
                            </div>
                          </TouchableOpacityHelper>
                        ))}
                      </div>
                    )}

                    {/* Step 4: Summary & Confirm */}
                    {admStep === 4 && (
                      <div className="space-y-2.5 flex-1">
                        <TextHelper className="text-white text-xs font-extrabold">Confirm Details 📝</TextHelper>
                        <TextHelper className="text-gray-500 text-[9px] leading-tight mb-1 block">Review your selection before booking counselor.</TextHelper>
                        
                        <div className="bg-[#0d1117] border border-slate-850 rounded-xl p-2.5 space-y-1.5">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500">Grade:</span>
                            <span className="text-white font-bold">{CLASSES.find(c=>c.id===selClass)?.label || "Class 11th"}</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500">Target:</span>
                            <span className="text-white font-bold">{GOALS.find(g=>g.id===selGoal)?.label || "IIT-JEE"}</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500">Style:</span>
                            <span className="text-white font-bold">{MODES.find(m=>m.id===selMode)?.label || "1-on-1 Mentor"}</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500">Blocker:</span>
                            <span className="text-white font-bold">{CHALLENGES.find(ch=>ch.id===selChallenge)?.label || "Solving Doubts"}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <input 
                            type="text" 
                            value={subName} 
                            onChange={(e) => { handleInteraction(); setSubName(e.target.value); }}
                            placeholder="Student Name"
                            className="w-full bg-[#0d1117] border border-slate-800 rounded-lg py-1 px-2.5 text-[10px] text-white outline-none focus:border-emerald-500"
                          />
                          <input 
                            type="text" 
                            value={subPhone} 
                            onChange={(e) => { handleInteraction(); setSubPhone(e.target.value); }}
                            placeholder="WhatsApp Number"
                            className="w-full bg-[#0d1117] border border-slate-800 rounded-lg py-1 px-2.5 text-[10px] text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        
                        <TouchableOpacityHelper 
                          className="w-full bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded-lg text-white text-[10px] font-bold text-center mt-2 block"
                          onClick={() => { handleInteraction(); setAdmStep(5); }}
                        >
                          Book Free Counseling Session
                        </TouchableOpacityHelper>
                      </div>
                    )}

                    {/* Step 5: Success Output */}
                    {admStep === 5 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-lg font-bold">✓</div>
                        <div>
                          <TextHelper className="text-white text-xs font-extrabold block">Profile Saved!</TextHelper>
                          <TextHelper className="text-gray-400 text-[9px] mt-1 block px-2 leading-tight">Thank you, {subName}! We have received your preferences.</TextHelper>
                        </div>
                        <div className="py-2 px-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                          <TextHelper className="text-emerald-400 text-[10px] font-bold block">We will connect to you soon!</TextHelper>
                        </div>
                        <TouchableOpacityHelper 
                          className="text-slate-500 hover:text-white text-[9px] font-bold underline cursor-pointer"
                          onClick={() => { handleInteraction(); resetAdmissionFlow(); }}
                        >
                          Restart Discovery
                        </TouchableOpacityHelper>
                      </div>
                    )}

                    {/* Back / Navigation Helper within Onboarding Form */}
                    {admStep > 0 && admStep < 5 && (
                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-900 mt-1 shrink-0 select-none">
                        <TouchableOpacityHelper 
                          className="text-gray-500 hover:text-white text-[9px] font-bold" 
                          onClick={() => { handleInteraction(); setAdmStep(p => p - 1); }}
                        >
                          ← Back
                        </TouchableOpacityHelper>
                        <TextHelper className="text-gray-600 text-[8px] font-semibold">Step {admStep + 1} of 5</TextHelper>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: MENTORS & CALL BOOKING */}
                {activeTab === "mentors" && (
                  <div className="flex-1 flex flex-col justify-between h-full relative bg-[#060a13]">
                    
                    {bookingStep === "list" && (
                      <ScrollViewWrapper>
                        <div className="p-3 border-b border-slate-900 mb-1">
                          <TextHelper className="text-white text-xs font-bold block">Select Mentor</TextHelper>
                          <TextHelper className="text-gray-500 text-[8px]">Select a topper to book a 1-on-1 call</TextHelper>
                        </div>
                        <div className="space-y-2.5 px-3">
                          {MOCK_MENTORS.map(mentor => (
                            <div key={mentor.id} className="bg-[#0d1117] border border-slate-850 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg">{mentor.avatar}</div>
                                <div className="flex-1 min-w-0">
                                  <TextHelper className="text-white text-[10px] font-bold block truncate">{mentor.name}</TextHelper>
                                  <TextHelper className="text-gray-400 text-[8px] block truncate">{mentor.title}</TextHelper>
                                  <TextHelper className="text-gray-500 text-[8px] block truncate">Exp: {mentor.exp} • ⭐ {mentor.rating}</TextHelper>
                                </div>
                              </div>
                              <TouchableOpacityHelper 
                                className="w-full bg-blue-600/20 border border-blue-500/35 hover:bg-blue-600 text-blue-400 hover:text-white font-bold py-1 rounded-lg text-[9px] text-center block"
                                onClick={() => { handleInteraction(); setSelectedMentor(mentor); setBookingStep("slots"); }}
                              >
                                Book Session
                              </TouchableOpacityHelper>
                            </div>
                          ))}
                        </div>
                      </ScrollViewWrapper>
                    )}

                    {bookingStep === "slots" && (
                      <div className="p-3.5 flex-1 flex flex-col justify-between h-full bg-[#060a13]">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <TextHelper className="text-gray-500 text-xs font-bold" onClick={() => { handleInteraction(); setBookingStep("list"); }}>←</TextHelper>
                            <TextHelper className="text-white text-xs font-extrabold">Slots for {selectedMentor?.name}</TextHelper>
                          </div>
                          
                          {/* Day picker */}
                          <div>
                            <TextHelper className="text-gray-500 text-[8px] font-bold block mb-1">Select Day:</TextHelper>
                            <div className="flex gap-1.5">
                              {["Monday", "Wednesday", "Friday"].map(day => (
                                <TouchableOpacityHelper
                                  key={day}
                                  className={`px-2 py-0.5 rounded-md text-[8px] font-bold border ${selectedDay === day ? "border-blue-500 bg-blue-500/10 text-white" : "border-slate-800 text-gray-400 bg-[#0d1117]"}`}
                                  onClick={() => { handleInteraction(); setSelectedDay(day); }}
                                >
                                  {day.substring(0, 3)}
                                </TouchableOpacityHelper>
                              ))}
                            </div>
                          </div>

                          {/* Time slots */}
                          <div>
                            <TextHelper className="text-gray-500 text-[8px] font-bold block mb-1">Select Time Slot:</TextHelper>
                            <div className="grid grid-cols-2 gap-1.5">
                              {["10:00 AM", "11:30 AM", "03:00 PM", "06:30 PM"].map(time => (
                                <TouchableOpacityHelper
                                  key={time}
                                  className={`p-1 rounded-lg text-center text-[9px] font-bold border ${selectedTime === time ? "border-blue-500 bg-blue-500/10 text-white" : "border-slate-800 text-gray-400 bg-[#0d1117]"}`}
                                  onClick={() => { handleInteraction(); setSelectedTime(time); }}
                                >
                                  {time}
                                </TouchableOpacityHelper>
                              ))}
                            </div>
                          </div>
                        </div>

                        <TouchableOpacityHelper 
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-[10px] text-center block mt-3"
                          onClick={() => { handleInteraction(); setBookingStep("success"); }}
                        >
                          Confirm Slot Booking
                        </TouchableOpacityHelper>
                      </div>
                    )}

                    {bookingStep === "success" && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-3 py-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-lg font-bold">✓</div>
                        <div>
                          <TextHelper className="text-white text-xs font-extrabold block">Booking Confirmed!</TextHelper>
                          <TextHelper className="text-gray-400 text-[8px] mt-1 block px-2 leading-tight">Meeting scheduled successfully with {selectedMentor?.name}.</TextHelper>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl w-full text-left space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[8px] text-gray-400">
                            <Calendar className="w-2.5 h-2.5 text-blue-400" />
                            <span>Day: {selectedDay}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[8px] text-gray-400 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-blue-400" />
                            <span>Time: {selectedTime}</span>
                          </div>
                        </div>
                        <TouchableOpacityHelper 
                          className="text-blue-400 hover:text-white text-[9px] font-bold underline cursor-pointer"
                          onClick={() => { handleInteraction(); setBookingStep("list"); }}
                        >
                          Book Another Call
                        </TouchableOpacityHelper>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: CHATS */}
                {activeTab === "chat" && (
                  <div className="flex-1 flex flex-col justify-between h-full bg-[#060a13]">
                    {/* Chat Header */}
                    <div className="p-2.5 border-b border-slate-850 bg-[#0d1117] flex items-center gap-2 shrink-0 select-none">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">👨‍🏫</div>
                      <div>
                        <TextHelper className="text-white text-[9px] font-bold block">Mohit Sir (Physics)</TextHelper>
                        <TextHelper className="text-emerald-400 text-[7px] font-medium block">● Online</TextHelper>
                      </div>
                    </div>

                    {/* Chat Bubble Logs */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5 flex flex-col scrollbar-none" ref={chatScrollRef}>
                      {messages.map(msg => {
                        const isUser = msg.sender === "user";
                        return (
                          <div 
                            key={msg.id}
                            className={`flex flex-col max-w-[80%] rounded-xl p-2 text-[9px] leading-tight ${isUser ? "bg-emerald-600 text-white rounded-br-none align-self-end ml-auto" : "bg-[#0d1117] text-gray-300 rounded-bl-none border border-slate-850"}`}
                          >
                            <TextHelper className="block">{msg.text}</TextHelper>
                            <span className="text-[6px] text-gray-500 text-right mt-0.5 block">{msg.time}</span>
                          </div>
                        );
                      })}

                      {isTyping && (
                        <div className="bg-[#0d1117] text-gray-400 text-[8px] rounded-xl rounded-bl-none p-1.5 border border-slate-850 max-w-[50%] flex gap-1 items-center">
                          <span>Mohit is writing</span>
                          <span className="animate-pulse">...</span>
                        </div>
                      )}
                    </div>

                    {/* Input message bar */}
                    <div className="p-2 border-t border-slate-850 bg-[#0d1117] flex items-center gap-1.5 shrink-0 select-none">
                      <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => { handleInteraction(); setInputText(e.target.value); }}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-[#060a13] border border-slate-800 rounded-lg py-0.5 px-2.5 text-[9px] text-white outline-none focus:border-emerald-500"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-500 cursor-pointer"
                        title="Send Message"
                        aria-label="Send"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: PROFILE */}
                {activeTab === "profile" && (
                  <ScrollViewWrapper>
                    {/* User profile card */}
                    <div className="p-3.5 bg-gradient-to-b from-slate-900 to-transparent flex flex-col items-center text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-600/20 border-2 border-emerald-500/40 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/10">🎓</div>
                      <div>
                        <TextHelper className="text-white text-xs font-extrabold block">Guest Student</TextHelper>
                        <TextHelper className="text-gray-500 text-[8px] block">student@parthsarthi.com</TextHelper>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[8px] text-gray-400">
                        <span>Class 12th</span>
                      </div>
                    </div>

                    {/* Profile links list */}
                    <div className="px-3 space-y-1.5 pb-4">
                      {[
                        { icon: User, label: "Edit Profile Info" },
                        { icon: Calendar, label: "My Booked Sessions" },
                        { icon: Shield, label: "App Settings & Privacy" },
                        { icon: Download, label: "Offline Notes & DPPs" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-[#0d1117] border border-slate-850 rounded-xl hover:border-slate-700 transition-colors" onClick={handleInteraction}>
                          <div className="flex items-center gap-2">
                            <item.icon className="w-3 h-3 text-gray-500" />
                            <TextHelper className="text-white text-[9px] font-bold">{item.label}</TextHelper>
                          </div>
                          <span className="text-gray-600 text-[8px]">→</span>
                        </div>
                      ))}
                    </div>
                  </ScrollViewWrapper>
                )}

              </div>

              {/* Bottom Phone Bar Navigation */}
              <div className="h-12 bg-[#0d1117] border-t border-slate-850 flex justify-around items-center px-1 z-20 shrink-0 select-none">
                {[
                  { id: "home", label: "Home", icon: Home },
                  { id: "admission", label: "Discovery", icon: GraduationCap },
                  { id: "mentors", label: "Mentors", icon: Users },
                  { id: "chat", label: "Chats", icon: MessageSquare },
                  { id: "profile", label: "Profile", icon: User },
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { handleInteraction(); setActiveTab(tab.id as any); }}
                      className="flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer"
                      title={tab.label}
                      aria-label={tab.label}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-500 scale-110" : "text-gray-500"}`} />
                      <span className={`text-[6px] font-bold mt-0.5 ${isActive ? "text-emerald-500" : "text-gray-500"}`}>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Smartphone physical bottom line */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full z-30 pointer-events-none" />

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────
// PRIVATE HELPERS (CSS Mockup Elements)
// ──────────────────────────────────────
function ScrollViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
      {children}
    </div>
  )
}

function TextHelper({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <span className={`${className}`} onClick={onClick}>
      {children}
    </span>
  )
}

function TouchableOpacityHelper({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <div className={`${className} cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all`} onClick={onClick}>
      {children}
    </div>
  )
}
