import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { RoutesWeFly } from "@/components/landing/RoutesWeFly"
import { CtaBanner } from "@/components/landing/CtaBanner"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <RoutesWeFly />
      <CtaBanner />
      <Footer />
    </div>
  )
}
