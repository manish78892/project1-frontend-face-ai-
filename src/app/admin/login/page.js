"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        router.push("/admin/dashboard");
      } else {
        alert(data.message || "Invalid credentials. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Cannot connect to backend server. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-slate-800">
      
      {/* Header – matches main page */}
      <header className="w-full bg-white px-8 py-3 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src="/front.png" 
              alt="main logo" 
              width={400} 
              height={90} 
              className="h-14 w-auto object-contain"
              priority 
            />
          </Link>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all font-semibold text-sm group"
        >
          <Home size={18} className="group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
          
          {/* Logo Area */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-full h-16 bg-white mb-4">
              <Image 
                src="/front.png" 
                alt="KCP Logo" 
                width={200} 
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Login</h2>
            <p className="text-slate-500 text-sm mt-1">This portal is for authorized administrators only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Admin Email</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kcp.edu"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-900 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Enter Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-900 text-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Secure Login
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-8 leading-relaxed">
            By signing in, you're agreeing to our Security & Privacy Policies.
          </p>
        </div>
      </main>

      {/* Footer – matches main page */}
      <footer className="text-center pb-6 pt-2 text-slate-400 text-xs font-medium border-t border-slate-100">
        Face Recognition Attendance System VisionID
      </footer>
    </div>
  );
}