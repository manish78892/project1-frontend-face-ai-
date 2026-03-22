"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, LogOut, Phone, Mail, Loader2, Calendar, Settings, Hash } from "lucide-react";
import FacultyRoute from '@/components/FacultyRoute';

function FacultySettingsContent() {
  const [facultyData, setFacultyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");

  // --- LOAD PROFILE DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      const stored = sessionStorage.getItem("facultyInfo");
      if (!stored) {
        console.error("No faculty info found – redirecting to login");
        window.location.href = "/faculty/login";
        return;
      }

      const faculty = JSON.parse(stored);
      const facultyId = faculty.id;
      // Get the string employee ID from sessionStorage
      setEmployeeId(faculty.facultyId || "Not available");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculty/profile/${facultyId}`);
        if (response.ok) {
          const data = await response.json();
          setFacultyData(data);
          // If the profile returns facultyId, use that (overwrites if different)
          if (data.facultyId) setEmployeeId(data.facultyId);
        } else {
          // Fallback to session data
          setFacultyData({
            name: faculty.name,
            department: faculty.department,
            email: faculty.email || "Not available",
            phone: faculty.phone || "Not available"
          });
        }
      } catch (error) {
        console.error("Settings load error:", error);
        setFacultyData({
          name: faculty.name,
          department: faculty.department,
          email: faculty.email || "Not available",
          phone: faculty.phone || "Not available"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("facultyInfo");
    localStorage.removeItem("loggedInFacultyId");
    window.location.href = "/faculty/login";
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8f9fb]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 md:px-10 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/faculty/dashboard" className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">About Me</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
        
        {/* Profile Card – READ‑ONLY */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
            <User size={20} className="text-blue-600" /> Personal Profile
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-800">
                  {facultyData?.name || "—"}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <div className="w-full p-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-slate-600 font-medium">
                  {facultyData?.department || "—"}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <div className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800">
                    {employeeId}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <div className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800">
                    {facultyData?.email || "—"}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <div className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800">
                    {facultyData?.phone || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security card removed */}

      </main>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-around items-center z-50 rounded-t-[32px] shadow-lg">
        <Link href="/faculty/dashboard" className="flex flex-col items-center gap-1 text-slate-400 transition-colors">
          <User size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </Link>
        <Link href="/faculty/schedule" className="flex flex-col items-center gap-1 text-slate-400 transition-colors">
          <Calendar size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Schedule</span>
        </Link>
        <Link href="/faculty/settings" className="flex flex-col items-center gap-1 text-blue-600 transition-colors">
          <Settings size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
        </Link>
      </div>

    </div>
  );
}

export default function Page() {
  return (
    <FacultyRoute>
      <FacultySettingsContent />
    </FacultyRoute>
  );
}