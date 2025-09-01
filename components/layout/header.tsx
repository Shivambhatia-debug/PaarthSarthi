"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Menu,
  User,
  BookOpen,
  Heart,
  Briefcase,
  Building2,
  Zap,
  ChevronDown,
  Globe,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navigation = [
    {
      name: "Find Mentors",
      href: "/mentorship",
      icon: Users,
      description: "Connect with expert mentors",
    },
    {
      name: "Courses",
      href: "/courses",
      icon: BookOpen,
      description: "Learn new skills",
    },
    {
      name: "Wellness",
      href: "/wellness",
      icon: Heart,
      description: "Mental health support",
    },
    {
      name: "Career Tools",
      href: "/career",
      icon: Briefcase,
      description: "Resume, interviews & more",
    },
  ]

  const businessLinks = [
    {
      name: "For Institutions",
      href: "/institutions",
      icon: Building2,
      description: "White-label solutions",
    },
    {
      name: "Tech Features",
      href: "/tech-features",
      icon: Zap,
      description: "AI & mobile-first design",
    },
  ]

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "mai", name: "मैथिली", flag: "🇮🇳" },
    { code: "bho", name: "भोजपुरी", flag: "🇮🇳" },
  ]

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Parth Sarthi
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Parth Sarthi
          </span>
          <Badge
            variant="secondary"
            className="hidden sm:inline-flex bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Beta
          </Badge>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Main Navigation */}
          <div className="flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  pathname === item.href ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Business Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium">
                Business
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 dark:bg-gray-800 dark:border-gray-700">
              {businessLinks.map((item) => (
                <DropdownMenuItem key={item.name} asChild className="dark:hover:bg-gray-700">
                  <Link href={item.href} className="flex items-start gap-3 p-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">EN</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
              {languages.map((lang) => (
                <DropdownMenuItem key={lang.code} className="dark:hover:bg-gray-700">
                  <span className="mr-2">{lang.flag}</span>
                  <span className="dark:text-white">{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              asChild
            >
              <Link href="/auth/login">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex flex-col gap-6 py-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Parth Sarthi
                  </span>
                </Link>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Platform</div>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                      </div>
                    </Link>
                  ))}

                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-4">Business</div>
                  {businessLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </nav>

                {/* Language Selector */}
                <div className="border-t dark:border-gray-800 pt-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Language</div>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                      <Button
                        key={lang.code}
                        variant="outline"
                        size="sm"
                        className="justify-start dark:border-gray-700 dark:text-gray-300 bg-transparent"
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="border-t dark:border-gray-800 pt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start dark:border-gray-700 bg-transparent"
                    asChild
                  >
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                    asChild
                  >
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up Free
                    </Link>
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="border-t dark:border-gray-800 pt-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Platform Stats</div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">500+</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Mentors</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">10K+</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Students</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">4.9</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">95%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
