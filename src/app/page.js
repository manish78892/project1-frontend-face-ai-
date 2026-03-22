import Link from "next/link";
import Image from "next/image"; 
import { ShieldCheck, GraduationCap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-slate-800">
      
      {/* 1. Header Section */}
      <header className="w-full bg-white px-8 py-3 shadow-sm border-b border-slate-200 flex items-center">
        <div className="flex items-center">
          <Image 
            src="/front.png" 
            alt="main logo" 
            width={400} 
            height={50} 
            className="h-14 w-auto object-contain [clip-path:inset(3px_0_0_0)]"
            priority 
          />
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        
        {/* Title & Subtitle */}
        <div className="text-center max-w-2xl mb-14 mt-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Smart Attendance System
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Official automated attendance portal for Faculty.
          </p>
        </div>

        {/* 3. The Two Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Card 1: Admin Portal */}
          <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={36} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">Admin Portal</h3>
            <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
              Add faculty, manage records, and view attendance reports.
            </p>
            <Link 
              href="/admin/login" 
              className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2 transition-colors"
            >
              Login as Admin <span>&rarr;</span>
            </Link>
          </div>

          {/* Card 2: Faculty Corner */}
          <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <GraduationCap size={36} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">Faculty Corner</h3>
            <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
              Enter your Faculty ID to start face verification and mark today's attendance.
            </p>
            {/* ✅ Updated: opens in new tab */}
            <a 
              href="/faculty/login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-500 font-semibold hover:text-amber-600 flex items-center gap-2 transition-colors"
            >
              Faculty Check-In <span>&rarr;</span>
            </a>
          </div>

        </div>
      </main>

      {/* 4. Footer */}
      <footer className="text-center pb-8 pt-4 text-slate-400 text-sm font-medium">
        Developed by Manish | Dhruv | Aayush
      </footer>
      
    </div>
  );
}