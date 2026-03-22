"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, User, Shield, Home, LogOut } from "lucide-react";

export default function FacultyLogin() {
  const [facultyId, setFacultyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!facultyId) return;
    setIsLoading(true);
    setError("");

    try {
      // 1. Verify faculty ID
      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculty/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.message || "Invalid Faculty ID");
        setIsLoading(false);
        return;
      }

      // 2. Store faculty info and redirect to dashboard (or check-in page)
      sessionStorage.setItem("facultyInfo", JSON.stringify(verifyData.faculty));
      window.location.href = "/faculty/dashboard"; // or "/faculty/check-in" if you want direct scan
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-slate-800 relative">
      
      <header className="w-full bg-white px-8 py-3 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src="/front.png" 
              alt="main logo" 
              width={400} 
              height={50} 
              className="h-12 w-auto object-contain [clip-path:inset(3px_0_0_0)]"
              priority 
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
            <Home size={18} /> <span className="hidden md:inline">Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center px-4 pb-20 mt-8 md:mt-0">
        
        <div className="w-full max-w-md flex flex-col items-center">
          
          <div className="flex flex-col items-center mb-8"> 
            <div className="bg-amber-500 text-white p-3.5 rounded-2xl mb-4 shadow-md">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Login</h1>
            <p className="text-slate-500 text-sm mt-2">Enter your Faculty ID to access the system</p>
          </div>

          <div className="bg-white w-full rounded-3xl p-8 shadow border border-slate-100">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Faculty ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. KCP-FAC-001" 
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-xl text-blue-800 text-xs leading-relaxed">
                <span className="font-bold">Note:</span> After logging in, you will be directed to the dashboard where you can start the face recognition scan.
              </div>

              <button 
                type="button"
                onClick={handleLogin}
                disabled={!facultyId || isLoading}
                className={`w-full font-semibold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center ${
                  facultyId && !isLoading
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Verifying..." : "Login"}
              </button>

            </form>
          </div>
        </div>
      </main>

      <div className="absolute bottom-6 w-full px-8 flex justify-center items-center text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Shield size={14} />
          Face Recognition Attendance System VisionID
        </div>
      </div>

    </div>
  );
}