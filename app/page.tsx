import type { Metadata } from "next"
import { HomePage } from "@/components/home/os-showcase/home-page"

const TITLE = "ParthSarthi · Bihar's AI Placement & Career OS"
const DESCRIPTION =
  "Aptitude, DSA and an AI voice interview in Hindi, English or Hinglish, a Placement Readiness Index and drive matching, for every student in Bihar."

export const metadata: Metadata = {
  metadataBase: new URL("https://paarthsarthi.netlify.app"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "ParthSarthi",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/os/media/shot-interview.jpg", width: 1440, height: 900, alt: "Sarthi AI interview: live Hinglish transcript and a follow-up on the student's own project" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/os/media/shot-interview.jpg"],
  },
}

export default function Page() {
  return <HomePage />
}
