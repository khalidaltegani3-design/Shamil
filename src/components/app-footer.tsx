import React from 'react';
import { Code, Mail } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-3">
          {/* Company Info */}
          <div className="flex items-center gap-3 text-gray-700">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-600" />
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AWG Park
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <a 
              href="mailto:info@awgtechs.com"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105"
            >
              <Mail className="h-4 w-4" />
              <span>تواصل معنا</span>
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-xs text-gray-500 text-center">
            <p>© 2025 جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>
  );
}