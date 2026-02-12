import Link from "next/link"
import { Mail, Phone, MapPin, Shield, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#080b12] text-gray-500 border-t border-white/5">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="PS" className="w-7 h-7 object-contain" />
              <span className="font-bold text-white text-sm">ParthSarthi</span>
            </div>
            <p className="text-[11px] leading-relaxed mb-3">
              ParthSarthi Knowledge Hub Pvt. Ltd.<br />
              India&apos;s career guidance platform.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5 text-[10px] text-emerald-400">
              <Shield className="w-3 h-3" /> DPIIT Certified
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-[11px] mb-3 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/mentorship" className="hover:text-white transition-colors">Find Mentors</Link></li>
              <li><Link href="/alumni" className="hover:text-white transition-colors">Alumni Network</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/startups" className="hover:text-white transition-colors">Startups</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-[11px] mb-3 uppercase tracking-wider">Company</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-[11px] mb-3 uppercase tracking-wider">Contact</h4>
            <div className="space-y-1.5 text-[11px]">
              <a href="mailto:parthsarthi0325@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3 h-3 shrink-0" /><span>parthsarthi0325@gmail.com</span>
              </a>
              <a href="tel:+917545996960" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3 h-3 shrink-0" /><span>+91 75459 96960</span>
              </a>
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3 shrink-0" /><span>Darbhanga</span></div>
              <a href="https://www.instagram.com/parthsarthi250425?igsh=MWdxejQyNzQwbXlvYw==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Instagram className="w-3 h-3 shrink-0" /><span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 text-center text-[10px] text-gray-600">
          <p>&copy; {new Date().getFullYear()} ParthSarthi Knowledge Hub Pvt. Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
