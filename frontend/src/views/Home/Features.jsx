import React from 'react'

import {motion} from 'framer-motion'
import { AlertTriangle, ChevronRight, Database, Lock, Shield, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'

const Features = () => {
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

  
  return (
     <div className="bg-gradient-to-br from-[#1a103a] via-[#061529] to-[#1a103a]">

     {/* Features Section */}
       <section className="py-24 ">
        <div className="container px-4 w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-4">
              Why Choose SecureSuite?
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
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
                <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-transparent/40">
                  <div className="flex flex-col h-full">
                    <div className="border-b-gray-500 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-200">{feature.title}</h3>
                    <p className="text-gray-400 flex-grow">{feature.description}</p>
                    <Link  to='/dashboard' className="mt-4 text-blue-600 flex items-center">
                      Learn more <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 ">
        <div className="container px-4  w-full mx-auto">
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
                <h3 className="text-3xl font-bold text-gray-400 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>
  )
}

export default Features