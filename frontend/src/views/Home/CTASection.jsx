import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LockKeyhole, Users } from "lucide-react";

const CTASection = ({ isAuthenticated, handleGetStarted }) => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-[#0a192f] via-[#112a46] to-[#0a192f] text-white overflow-hidden">
      <div className="container px-4 text-center max-w-6xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight"
        >
          Secure your <span className="text-blue-400">future</span>, <br /> one byte at a time.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto mb-12"
        >
          Join thousands of professionals, teams, and enterprises who trust <strong>SecureSuite</strong> to safeguard their digital assets.
        </motion.p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-5 rounded-full shadow-xl transition-all"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
          </Button>
        </motion.div>

        {/* Trust metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-blue-100 text-sm">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-8 h-8 text-blue-400 mb-2" />
            <p className="font-semibold">AES-256 Bit Encryption</p>
            <span>End-to-end protection</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <p className="font-semibold">10,000+ Users</p>
            <span>Securing data globally</span>
          </div>
          <div className="flex flex-col items-center">
            <LockKeyhole className="w-8 h-8 text-blue-400 mb-2" />
            <p className="font-semibold">Zero Trust Framework</p>
            <span>Built with modern principles</span>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-[120px] opacity-20 pointer-events-none z-0"></div>
    </section>
  );
};

export default CTASection;
