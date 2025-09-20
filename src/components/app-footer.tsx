import React from 'react';

export default function AppFooter() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-500">
          <span>AWG Park</span>
          <span className="hidden sm:inline">•</span>
          <a 
            href="mailto:info@awgtechs.com"
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            تواصل معنا
          </a>
        </div>
      </div>
    </footer>
  );
}