import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-gradient-to-r from-background/95 to-muted/30 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-center px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a 
            href="mailto:info@awgtechs.com" 
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            title="تواصل معنا عبر البريد الإلكتروني"
          >
            <span className="text-gray-700">
              AWG Park
            </span>
            <Mail className="h-3 w-3" />
          </a>
        </div>
        <div className="text-xs text-muted-foreground/70 mt-2 text-center">
          © 2025 جميع الحقوق محفوظة • حلول تقنية متطورة
        </div>
      </div>
    </footer>
  );
}