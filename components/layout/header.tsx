"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Menu, X, User, BookOpen, ChevronDown, LogIn,
  Users, GraduationCap, Rocket, LogOut, LayoutDashboard,
} from "lucide-react"

const NAV = [
  { name: "Mentors", href: "/mentorship", icon: Users },
  { name: "Admission", href: "/admission", icon: GraduationCap },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Startups", href: "/startups", icon: Rocket },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const path = usePathname()
  const router = useRouter()

  useEffect(() => { setMounted(true); checkAuth() }, [])
  useEffect(() => {
    const h = () => checkAuth()
    window.addEventListener("storage", h)
    window.addEventListener("authChange", h)
    return () => { window.removeEventListener("storage", h); window.removeEventListener("authChange", h) }
  }, [])
  useEffect(() => { setOpen(false) }, [path])

  const checkAuth = () => {
    const t = localStorage.getItem("ps_token")
    const d = localStorage.getItem("ps_user")
    if (t && d) { try { setUser(JSON.parse(d)) } catch { setUser(null) } } else setUser(null)
  }

  const logout = () => {
    localStorage.removeItem("ps_token")
    localStorage.removeItem("ps_user")
    setUser(null)
    window.dispatchEvent(new Event("authChange"))
    router.push("/")
  }

  if (!mounted) return <header className="sticky top-0 z-50 w-full h-12 border-b border-white/5 bg-[#0d1117]" />

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0d1117]/90 backdrop-blur-xl">
      <div className="container flex h-12 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="ParthSarthi" className="w-8 h-8 object-contain" />
          <span className="font-bold text-sm tracking-tight text-white">
            ParthSarthi
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                path === item.href ? "bg-white/8 text-white" : "text-gray-400 hover:text-white"
              }`}
            >{item.name}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex h-8 px-2 text-gray-300 hover:text-white">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-xs max-w-[60px] truncate">{user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 opacity-40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-[#161b22] border-white/10">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium truncate text-white">{user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-white/5">
                    <Link href="/admin" className="gap-2 text-xs"><LayoutDashboard className="w-3.5 h-3.5" /> Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-white/5">
                  <Link href="/student-dashboard" className="gap-2 text-xs"><User className="w-3.5 h-3.5" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-300 focus:bg-white/5 gap-2 text-xs">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="hidden sm:flex bg-white text-black hover:bg-gray-200 h-7 px-3 text-[11px] font-medium" asChild>
              <Link href="/auth/login"><LogIn className="w-3 h-3 mr-1" /> Sign In</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="md:hidden h-7 w-7 p-0 text-gray-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0d1117]">
          <nav className="container px-4 py-2 space-y-0.5">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  path === item.href ? "bg-white/5 text-white" : "text-gray-400"
                }`}
              ><item.icon className="w-3.5 h-3.5" />{item.name}</Link>
            ))}
            <div className="border-t border-white/5 my-1.5 pt-1.5">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">{user.name?.charAt(0)?.toUpperCase()}</div>
                    <div><p className="text-xs font-medium text-white truncate">{user.name}</p><p className="text-[10px] text-gray-500">{user.role}</p></div>
                  </div>
                  {user.role === "admin" && <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-gray-400"><LayoutDashboard className="w-3.5 h-3.5" /> Admin</Link>}
                  <Link href="/student-dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-gray-400"><User className="w-3.5 h-3.5" /> Dashboard</Link>
                  <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-red-400 w-full"><LogOut className="w-3.5 h-3.5" /> Logout</button>
                </>
              ) : (
                <Link href="/auth/login" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white text-black">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
