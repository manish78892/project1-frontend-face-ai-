"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, Calendar, 
  Clock, Plus, MapPin, BookOpen, Trash2, 
  Menu, X, Inbox, Loader2, LogOut
} from "lucide-react";
import FacultyRoute from '@/components/FacultyRoute'; // adjust path if needed

function FacultyScheduleContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- STATES ---
  const [schedule, setSchedule] = useState([]);
  const [facultyData, setFacultyData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form states for adding a new lecture
  const [newSubject, setNewSubject] = useState("");
  const [newDay, setNewDay] = useState("Monday");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newRoom, setNewRoom] = useState("");

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    sessionStorage.removeItem("facultyInfo");
    localStorage.removeItem("loggedInFacultyId");
    window.location.href = "/faculty/login";
  };

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      // Get faculty info from sessionStorage (set during login)
      const stored = sessionStorage.getItem("facultyInfo");
      if (!stored) {
        window.location.href = "/faculty/login";
        return;
      }

      const faculty = JSON.parse(stored);
      setFacultyData(faculty);
      const facultyId = faculty.id;

      try {
        // Fetch faculty profile (optional – you can use session data directly)
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculty/profile/${facultyId}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          // Merge with session data if needed
          setFacultyData(prev => ({ ...prev, ...profile }));
        }

        // Fetch schedule from backend (if available)
        const scheduleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculty/schedule/${facultyId}`);
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          setSchedule(scheduleData);
        } else {
          // Fallback to localStorage if backend not ready
          const saved = localStorage.getItem(`schedule_${facultyId}`);
          setSchedule(saved ? JSON.parse(saved) : []);
        }
      } catch (err) {
        console.error("Data sync error:", err);
        setError("Failed to load schedule. Using local storage.");
        // Fallback to localStorage
        const saved = localStorage.getItem(`schedule_${facultyId}`);
        setSchedule(saved ? JSON.parse(saved) : []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. PERSIST SCHEDULE TO LOCALSTORAGE WHEN IT CHANGES (as backup) ---
  useEffect(() => {
    if (facultyData && schedule.length > 0) {
      localStorage.setItem(`schedule_${facultyData.id}`, JSON.stringify(schedule));
    }
  }, [schedule, facultyData]);

  // --- 3. ADD LECTURE ---
  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!newSubject || !newStartTime || !newEndTime || !newRoom) return;
    if (!facultyData) return;

    setIsSubmitting(true);

    const newClass = {
      id: Date.now().toString(), // temporary local ID
      subject: newSubject,
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      room: newRoom,
    };

    // Try backend first, fallback to local
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculty/schedule/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newClass, userId: facultyData.id }),
      });

      if (response.ok) {
        const addedClass = await response.json();
        setSchedule([...schedule, addedClass]);
      } else {
        // If backend fails, still add locally
        setSchedule([...schedule, newClass]);
      }
    } catch (error) {
      console.warn("Backend sync failed, saving locally:", error);
      setSchedule([...schedule, newClass]);
    }

    // Reset form
    setNewSubject("");
    setNewStartTime("");
    setNewEndTime("");
    setNewRoom("");
    setIsSubmitting(false);
  };

  // --- 4. DELETE LECTURE ---
  const deleteLecture = async (id) => {
    if (!confirm("Remove this lecture?")) return;
    if (!facultyData) return;

    // Try backend delete, then update local state
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculty/schedule/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: facultyData.id })
      });
      if (response.ok || !response.ok) { // even if backend fails, remove locally
        setSchedule(schedule.filter(lecture => lecture._id !== id && lecture.id !== id));
      }
    } catch (error) {
      console.warn("Delete failed on backend, removing locally:", error);
      setSchedule(schedule.filter(lecture => lecture._id !== id && lecture.id !== id));
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-sans text-slate-800 overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:flex
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image src="/front.png" alt="Logo" width={100} height={80} className="object-contain" />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 leading-tight">Faculty</span>
                          <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Portal</span>
                        </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 p-1 hover:bg-slate-50 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/faculty/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/faculty/schedule" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold">
            <Calendar size={18} /> My Schedule
          </Link>
          <Link href="/faculty/leaves" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Inbox size={18} /> Leave Requests
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors mt-auto"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
        
        {/* SIDEBAR PROFILE SECTION */}
        <div className="p-4 border-t border-slate-100">
           <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : facultyData ? facultyData.name.charAt(0) : "?"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate tracking-tight">
                  {isLoading ? "Syncing..." : facultyData ? facultyData.name : "Guest User"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {facultyData ? facultyData.department : "Khalsa College"}
                </p>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto relative">
            {/* Optional profile icon */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-24">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {error && (
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lecture Schedule</h1>
                  <p className="text-slate-500 mt-1 text-sm font-medium">
                    Hello {facultyData ? facultyData.name.split(' ')[0] : "Professor"}, manage your classes here.
                  </p>
               </div>
               <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Academic Year 2026
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Timetable Display */}
              <div className="lg:col-span-2 space-y-6">
                {isLoading ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-400 font-medium tracking-tight">Loading your timetable...</p>
                  </div>
                ) : schedule.length > 0 ? (
                  daysOfWeek.map(day => {
                    const dayClasses = schedule.filter(c => c.day === day);
                    if (dayClasses.length === 0) return null;

                    return (
                      <div key={day} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                          <h3 className="font-bold text-slate-700 text-[10px] uppercase tracking-widest">{day}</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {dayClasses.map(lecture => (
                            <div key={lecture._id || lecture.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                                  <BookOpen size={20} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-base leading-tight">{lecture.subject}</h4>
                                  <div className="flex items-center gap-4 mt-1.5 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {lecture.startTime} - {lecture.endTime}</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> {lecture.room}</span>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => deleteLecture(lecture._id || lecture.id)} className="text-slate-300 hover:text-red-500 transition-all p-2 bg-slate-50 rounded-lg">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-[40px] p-20 border border-dashed border-slate-200 text-center flex flex-col items-center">
                    <Inbox size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No Lectures Found</p>
                    <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-black">Add your first class using the form on the right</p>
                  </div>
                )}
              </div>

              {/* Right Column: Add New Class Form */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-fit sticky top-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <Plus size={20} className="text-blue-600" /> Add New Class
                </h2>
                
                <form onSubmit={handleAddLecture} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Title</label>
                    <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Mobile Computing" className="w-full px-5 py-3.5 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 font-medium" required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weekday</label>
                    <select value={newDay} onChange={(e) => setNewDay(e.target.value)} className="w-full px-5 py-3.5 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 font-medium appearance-none">
                      {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                      <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} className="w-full px-5 py-3.5 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 font-medium" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                      <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className="w-full px-5 py-3.5 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 font-medium" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Room / Lab</label>
                    <input type="text" value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="e.g. Block B-204" className="w-full px-5 py-3.5 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 font-medium" required />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2 mt-2 shadow-lg shadow-blue-200">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={18} /> Add Lecture</>}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </main>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-around items-center z-50 rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <Link href="/faculty/dashboard" className="flex flex-col items-center gap-1 text-slate-400"><LayoutDashboard size={20} /><span className="text-[10px] font-bold uppercase tracking-tight">Home</span></Link>
          <Link href="/faculty/schedule" className="flex flex-col items-center gap-1 text-blue-600"><Calendar size={20} /><span className="text-[10px] font-bold uppercase tracking-tight">Schedule</span></Link>
          <Link href="/faculty/leaves" className="flex flex-col items-center gap-1 text-slate-400"><Inbox size={20} /><span className="text-[10px] font-bold uppercase tracking-tight">Leaves</span></Link>
        </div>
      </div>
    </div>
  );
}

// Wrap with FacultyRoute to protect the page
export default function Page() {
  return (
    <FacultyRoute>
      <FacultyScheduleContent />
    </FacultyRoute>
  );
}