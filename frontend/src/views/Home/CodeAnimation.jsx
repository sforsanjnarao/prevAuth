import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

const CodeAnimation = () => {
  const codeLines = [
    "// Data breach example",
    "const leakedData = {",
    "  username: 'john_doe',",
    "  email: 'john@example.com',",
    "  password: 'weakPassword123', // ❌ Exposed",
    "  creditCard: '****-****-****-1234',",
    "  ipAddress: '192.168.1.1'",
    "};",
    "",
    "// SecureSuite protection",
    "secureSuite.protect({",
    "  data: sensitiveInfo,",
    "  encryption: 'AES-256', // ✅ Secured",
    "  monitoring: true",
    "});",
  ];

  return (
    <motion.div
      className="relative bg-[#0d2036]  rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl border border-blue-900/50 w-full max-w-4xl mx-auto overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Window buttons */}
      <div className="flex gap-2 mb-4">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
      </div>

      {/* Code block */}
      <div className="overflow-x-auto max-h-[360px] scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-blue-950 pr-2">
        <pre className="text-[13px] sm:text-sm md:text-base text-blue-100 font-mono whitespace-pre">
          {codeLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
              className={
                i === 4
                  ? "text-red-400"
                  : i === 11
                  ? "text-green-400"
                  : "text-blue-100"
              }
            >
              {line}
            </motion.div>
          ))}
        </pre>
      </div>

      {/* Floating Status Badge */}
      <motion.div
        className="absolute bottom-3 right-3 bg-blue-600 text-white text-[12px] sm:text-sm px-3 py-1.5 rounded-md shadow-md flex items-center gap-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
      >
        <Terminal className="h-4 w-4" />
        <span className="hidden sm:inline">SecureSuite Protection Active</span>
        <span className="sm:hidden">Active</span>
      </motion.div>
    </motion.div>
  );
};

export default CodeAnimation;
