"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye, EyeOff, User, CheckCircle, ArrowRight,
  AlertCircle, Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

export default function AuthPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tab, setTab] = useState("login")

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    name: "", email: "", phone: "", password: "", role: "student", language: "en",
    currentEducation: "", institution: "", location: "", yearOfStudy: "", stream: ""
  })

  const handleLogin = async () => {
    setError(""); setLoading(true)
    try {
      if (!loginData.email || !loginData.password) { setError("Please fill all fields"); setLoading(false); return }
      const data = await authAPI.login(loginData)
      localStorage.setItem("ps_token", data.token)
      localStorage.setItem("ps_user", JSON.stringify(data.user))
      window.dispatchEvent(new Event("authChange"))
      setSuccess("Login successful!")
      setTimeout(() => {
        if (data.user.role === "admin") router.push("/admin")
        else router.push("/")
      }, 800)
    } catch (err: any) { setError(err.message || "Login failed") }
    finally { setLoading(false) }
  }

  const handleSignup = async () => {
    setError(""); setLoading(true)
    try {
      if (!signupData.name || !signupData.email || !signupData.password) { setError("Please fill required fields"); setLoading(false); return }
      if (signupData.password.length < 6) { setError("Password must be 6+ characters"); setLoading(false); return }
      const data = await authAPI.register(signupData)
      localStorage.setItem("ps_token", data.token)
      localStorage.setItem("ps_user", JSON.stringify(data.user))
      window.dispatchEvent(new Event("authChange"))
      setSuccess("Account created!")
      setTimeout(() => router.push("/"), 1000)
    } catch (err: any) { setError(err.message || "Registration failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a13] px-4 py-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="PS" className="w-12 h-12 object-contain" />
          <span className="font-bold text-2xl text-white">ParthSarthi</span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); setSuccess("") }}>
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/[0.04] border border-white/[0.06] rounded-lg">
            <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-lg">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-lg">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="pb-4">
                <h2 className="text-center text-lg text-white font-semibold">Welcome Back</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300 text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="h-10 pr-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={handleLogin} disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 h-11 rounded-xl text-sm font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Signup */}
          <TabsContent value="signup">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="pb-4">
                <h2 className="text-center text-lg text-white font-semibold">Create Account</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-300 text-xs">Full Name *</Label>
                  <Input placeholder="Your name" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Email *</Label>
                  <Input type="email" placeholder="your@email.com" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Phone</Label>
                  <Input type="tel" placeholder="+91 98765 43210" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      className="h-10 pr-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-300 text-xs">I am a</Label>
                    <Select value={signupData.role} onValueChange={(v) => setSignupData({...signupData, role: v})}>
                      <SelectTrigger className="h-10 bg-white/[0.04] border border-white/[0.08] text-white rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-xs">Language</Label>
                    <Select value={signupData.language} onValueChange={(v) => setSignupData({...signupData, language: v})}>
                      <SelectTrigger className="h-10 bg-white/[0.04] border border-white/[0.08] text-white rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {signupData.role === "student" && (
                  <>
                    <div>
                      <Label className="text-gray-300 text-xs">Current education</Label>
                      <Input placeholder="e.g. B.Tech, Class 12, MBA" value={signupData.currentEducation} onChange={(e) => setSignupData({...signupData, currentEducation: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">School / College</Label>
                      <Input placeholder="Institution name" value={signupData.institution} onChange={(e) => setSignupData({...signupData, institution: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-300 text-xs">Year / Class</Label>
                        <Input placeholder="e.g. 2nd year, Class 12" value={signupData.yearOfStudy} onChange={(e) => setSignupData({...signupData, yearOfStudy: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-xs">Stream / Field</Label>
                        <Input placeholder="e.g. Engineering, Commerce" value={signupData.stream} onChange={(e) => setSignupData({...signupData, stream: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">Location (city, state)</Label>
                      <Input placeholder="e.g. Darbhanga, Bihar" value={signupData.location} onChange={(e) => setSignupData({...signupData, location: e.target.value})} className="h-10 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 rounded-lg" />
                    </div>
                  </>
                )}
                <Button onClick={handleSignup} disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 h-11 rounded-xl text-sm font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-gray-500 mt-4">
          <Link href="/privacy" className="hover:underline text-gray-500">Privacy</Link>
          <span className="mx-2">|</span>
          <Link href="/terms" className="hover:underline text-gray-500">Terms</Link>
        </p>
      </div>
    </div>
  )
}
