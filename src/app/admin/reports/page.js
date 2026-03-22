"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, Shield 
} from "lucide-react";

export default function AttendanceRangeReport() {
  const router = useRouter();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/attendance-range?start=${startDate}&end=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to load report');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-orange-100 text-orange-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100';
    }
  };

  const getStatusLetter = (status) => {
    switch(status) {
      case 'present': return 'P';
      case 'late': return 'L';
      case 'absent': return 'A';
      case 'leave': return 'LV';
      default: return '?';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-slate-800">
      {/* Header – matches admin dashboard */}
      <header className="w-full bg-white px-8 py-3 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src="/front.png" 
              alt="Khalsa College Logo" 
              width={400} 
              height={90} 
              className="h-14 w-auto object-contain" 
              priority 
            />
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
          
<Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors bg-slate-50 px-4 py-2 rounded-xl text-sm border border-slate-200">
              <ArrowLeft size={18} />Dashboard Home
            </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 md:px-8 pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <p className="text-slate-500 mb-6">View attendance by date range.</p>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-900"
              />
            </div>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

          {report && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
              <div className="p-4 border-b border-slate-100 font-semibold text-sm text-slate-700">
                {report.days.length} days from {report.start} to {report.end}
              </div>
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-slate-50">Name</th>
                    <th className="px-4 py-3 text-left">Faculty Login ID</th>
                    <th className="px-4 py-3 text-left">Dept</th>
                    {report.days.map(day => (
                      <th key={day} className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                        {new Date(day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.matrix.map(row => (
                    <tr key={row.facultyId} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900 sticky left-0 bg-white">{row.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.facultyId}</td>
                      <td className="px-4 py-3 text-slate-600">{row.department}</td>
                      {report.days.map(day => (
                        <td key={day} className="px-3 py-3 text-center">
                          <span
                            className={`inline-block w-6 h-6 rounded-full text-[10px] font-bold leading-6 ${getStatusClass(row.days[day])}`}
                            title={row.days[day]}
                          >
                            {getStatusLetter(row.days[day])}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <footer className="absolute bottom-4 w-full px-8 flex justify-center items-center text-[11px] md:text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5"><Shield size={14} />Face Recognition Attendance System VisionID</div>
      </footer>
    </div>
  );
}