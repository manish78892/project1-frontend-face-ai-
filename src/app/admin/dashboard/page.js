"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Home, LayoutDashboard, LogOut, UserPlus,Shield,
  Users, UserCheck, UserX, Search, Loader2, BarChart
} from "lucide-react";
import AdminRoute from '@/components/AdminRoute';

function AdminDashboardContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    totalFaculty: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeaves: 0
  });
  const [attendanceLog, setAttendanceLog] = useState([]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No admin token');
        setIsLoading(false);
        return;
      }

      try {
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();

        const logRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/attendance-log?page=1&limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!logRes.ok) throw new Error('Failed to fetch attendance log');
        const logData = await logRes.json();

        setStats({
          totalFaculty: statsData.totalFaculty,
          presentToday: statsData.presentToday,
          onLeave: statsData.onLeaveToday,
          pendingLeaves: statsData.pendingLeaves || 0
        });

        const logs = logData.records.map(record => {
          let displayDate = record.dateStr;
          if (!displayDate && record.date) {
            const dateObj = new Date(record.date);
            displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          } else if (!displayDate) {
            displayDate = 'N/A';
          }

          let displayTime = 'N/A';
          if (record.date) {
            const dateObj = new Date(record.date);
            displayTime = dateObj.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
          }

          return {
            id: record.facultyId || 'N/A',
            name: record.facultyName || 'Unknown',
            department: record.department || 'N/A',
            date: displayDate,
            timeIn: displayTime,
            status: record.status === 'present' ? 'Present' : 
                    record.status === 'late' ? 'Late' : 'Absent'
          };
        });
        setAttendanceLog(logs);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredLogs = attendanceLog.filter(log => {
    if (filter === "all") return true;
    return log.status.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-slate-800 pb-20 relative">
      {/* Header – updated order and hover styles */}
      <header className="w-full bg-white px-8 py-3 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Link href="/">
            <Image src="/front.png" alt="main logo" width={400} height={90} className="h-14 w-auto object-contain" priority />
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
          {/* Dashboard first */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm">
            <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
          </div>

          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all"
          >
            <Home size={18} /> <span className="hidden md:inline">Home</span>
          </Link>

          <Link 
            href="/admin/reports" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-green-600 transition-all"
          >
            <BarChart size={18} /> <span className="hidden md:inline">Reports</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-slate-100 hover:text-red-700 transition-all"
          >
            <LogOut size={18} /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 md:px-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Overview of Faculty Attendance</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/admin/add-faculty">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                <UserPlus size={16} /> Add Faculty
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Faculty */}
          <Link href="/admin/manage-faculty" className="block group transition-transform hover:-translate-y-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full group-hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-500 text-sm font-medium group-hover:text-blue-600 transition-colors">Total Faculty</p>
                <div className="p-2 bg-purple-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all"><Users size={18} /></div>
              </div>
              <div className="flex justify-between items-end">
                <h3 className={`text-3xl font-bold ${isLoading ? "text-slate-200" : "text-slate-900"}`}>
                  {isLoading ? "0" : stats.totalFaculty}
                </h3>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Edit List</span>
              </div>
            </div>
          </Link>

          {/* Present Today */}
          <button onClick={() => setFilter("present")} className="text-left group transition-transform hover:-translate-y-1">
            <div className={`bg-white p-6 rounded-3xl border shadow-sm h-full group-hover:shadow-md ${filter === "present" ? "border-green-500" : "border-slate-100"}`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-500 text-sm font-medium">Present Faculty</p>
                <div className="p-2 bg-green-50 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors"><UserCheck size={18} /></div>
              </div>
              <div className="flex justify-between items-end">
                <h3 className={`text-3xl font-bold ${isLoading ? "text-slate-200" : "text-slate-900"}`}>
                  {isLoading ? "0" : stats.presentToday}
                </h3>
              </div>
            </div>
          </button>

          {/* On Leave */}
          <Link href="/admin/leave-management" className="text-left group transition-transform hover:-translate-y-1 block">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full group-hover:shadow-md group-hover:border-red-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-500 text-sm font-medium group-hover:text-red-600 transition-colors">Leave Faculty</p>
                <div className="p-2 bg-red-50 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors"><UserX size={18} /></div>
              </div>
              <div className="flex justify-between items-end">
                <h3 className={`text-3xl font-bold ${isLoading ? "text-slate-200" : "text-slate-900"}`}>
                  {isLoading ? "0" : stats.pendingLeaves}
                </h3>
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight">Manage</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Attendance Log Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900">Present & Attendance Log</h2>
              {filter !== "all" && <button onClick={() => setFilter("all")} className="text-xs font-bold text-blue-600 hover:underline">Clear Filter</button>}
            </div>
          </div>
          
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Faculty ID</th>
                  <th className="px-6 py-4">Faculty Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time In</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">{log.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{log.name}</td>
                      <td className="px-6 py-4 text-slate-500">{log.department}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{log.date}</td>
                      <td className="px-6 py-4 font-mono text-blue-600">{log.timeIn}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === "Present" ? "bg-green-100 text-green-700" : 
                          log.status === "Late" ? "bg-orange-100 text-orange-700" : 
                          "bg-red-100 text-red-700"
                        }`}>{log.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="px-6 py-20 text-center"><div className="flex flex-col items-center justify-center opacity-40"><Image src="/front.png" alt="Watermark" width={180} height={70} className="mb-4 grayscale" /><p className="text-slate-600 font-semibold text-lg">Attendance data not recorded yet.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <footer className="absolute bottom-4 w-full px-8 flex justify-center items-center text-[11px] md:text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5"><Shield size={14} />Face Recognition Attendance System VisionID</div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}