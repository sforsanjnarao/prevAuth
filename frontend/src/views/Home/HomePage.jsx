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

 

  const features = [
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "Secure Vault",
      description: "Military-grade encryption for all your passwords and sensitive data."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Breach Protection",
      description: "Real-time monitoring of data breaches affecting your accounts."
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      title: "Vulnerability Alerts",
      description: "Get notified when your apps have security vulnerabilities."
    },
    {
      icon: <Database className="h-8 w-8 text-green-600" />,
      title: "Fake Data Generator",
      description: "Create realistic but fake data for safe development and testing."
    }
  ]

  const stats = [
    { value: "256-bit", label: "Encryption", icon: <Database className="h-6 w-6" /> },
    { value: "24/7", label: "Monitoring", icon: <Shield className="h-6 w-6" /> },
    { value: "10M+", label: "Breaches Detected", icon: <AlertTriangle className="h-6 w-6" /> },
    { value: "100K+", label: "Protected Users", icon: <User className="h-6 w-6" /> }
  ]

  const handleGetStarted = () => {
    navigate(isAuthenticated ? '/dashboard' : '/register')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full anim bg-[#0a192f] overflow-hidden">
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
          <div className="flex-1 relative">
            <CodeAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 ">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SecureSuite?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive security solutions designed for both individuals and developers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="bg-blue-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 flex-grow">{feature.description}</p>
                    <div className="mt-4 text-blue-600 flex items-center">
                      Learn more <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-blue-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0a192f] text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to secure your digital life?</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-8">
              Join thousands of users who trust SecureSuite with their sensitive data.
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-6 rounded-lg transition-all"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold">
                Secure<span className="text-blue-400">Suite</span>
              </Link>
              <p className="mt-2 text-sm">Enterprise-grade security for everyone</p>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            © {new Date().getFullYear()} SecureSuite. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage