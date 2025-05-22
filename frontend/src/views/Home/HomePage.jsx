import { motion } from "framer-motion"
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Lock, Shield, Code, Terminal, Database, 
  AlertTriangle, User, ArrowRight, ChevronRight 
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CodeAnimation from "./CodeAnimation"
import Features from "./Features"
import Footer from "@/components/Footer"
import CTASection from "./CTASection"

const HomePage = () => {
  const navigate = useNavigate()
  const userName = useSelector((state) => state.auth.user?.name) || ''
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  const TypingEffect = ({ text, speed = 150 }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, speed)

        return () => clearTimeout(timeout)
      }
    }, [currentIndex, text, speed])

    return <span>{displayedText}</span>
  }

 

 const handleGetStarted = () => {
    navigate(isAuthenticated ? '/dashboard' : '/register')
  }

 

  return (
    <div className="min-h-screen bg-[#0a192f]">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full  bg-[#0a192f] overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid grid-cols-12 animate-pulse gap-1 opacity-50">
          {Array.from({ length: 144 }).map((_, i) => (
          <div
  key={i}
  className="h-full w-full border border-blue-800/50 animate-pulse transition-all ease-linear duration-[1500ms]"
></div>

          ))}
        </div>

{/* Secure Your Digital Life */}
        <div className="container w-screen relative z-10 mx-auto flex flex-col lg:flex-row items-center justify-center min-h-screen gap-12 px-4 py-24">
          {/* Left side - Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                <TypingEffect text={`Secure Your Digital Life${userName ? `, ${userName}` : ''}`} speed={100} />
              </h1>
              <p className="text-xl text-blue-200 max-w-2xl">
                Protect your sensitive data with enterprise-grade security in an intuitive package.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-blue-600/30 hover:bg-blue-700/50 text-white font-semibold text-lg px-8 py-6 rounded-lg transition-all"
                onClick={handleGetStarted}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="h-5 w-5 inline ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white  hover:bg-white/20 bg-white/10 font-semibold text-lg px-8 py-6 rounded-lg transition-all"
              >
                Learn More
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8"
            >
              <div className="flex items-center gap-2 text-blue-200">
                <Lock className="h-5 w-5" />
                <span>End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Shield className="h-5 w-5" />
                <span>Real-time breach alerts</span>
              </div>
            </motion.div>
          </div>

          {/* Right side - Code animation */}
          <div className="flex-1 relative w-[100%]">
            <CodeAnimation />
          </div>
        </div>
      </section>

      {/* Features Section  and States section*/}
     <Features/>


      {/* CTA Section */}
     <CTASection/>

      {/* Footer */}
      <Footer/>
      
    </div>
  )
}

export default HomePage