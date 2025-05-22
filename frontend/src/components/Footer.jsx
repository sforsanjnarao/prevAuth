import React from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, ScrollText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#050e1a] via-[#02173a] to-[#0f172a] text-gray-400 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 text-white text-2xl font-bold"
            >
              <ShieldCheck className="h-6 w-6 text-blue-400" />
              Secure<span className="text-blue-400">Suite</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Enterprise-grade security for everyone. Your data deserves the
              best protection.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2 md:items-center">
            <h4 className="text-white text-lg font-semibold mb-2">Quick Links</h4>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Subscribe or Contact Info */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-3">Get in Touch</h4>
            <p className="text-sm mb-4">Have questions? Reach out anytime:</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <a
                href="mailto:support@securesuite.com"
                className="hover:text-white transition"
              >
                support@securesuite.com
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} <span className="text-white font-medium">SecureSuite</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
