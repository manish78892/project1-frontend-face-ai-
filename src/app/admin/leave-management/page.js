"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Clock, PlaneTakeoff, Trash2, Shield } from "lucide-react";
import AdminRoute from '@/components/AdminRoute';

function LeaveManagementContent() {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No admin token');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/leaves/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      } else {
        console.error('Failed to fetch leaves');
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (leaveId, status) => {
    setProcessingId(leaveId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/leaves/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setLeaves(leaves.filter(l => l._id !== leaveId));
      } else {
        alert('Action failed');
      }
    } catch (error) {
      console.error(error);
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (leaveId) => {
    if (!confirm("Are you sure you want to permanently delete this leave request?")) return;
    setDeletingId(leaveId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/leaves/${leaveId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLeaves(leaves.filter(l => l._id !== leaveId));
      } else {
        const err = await res.json();
        alert(err.message || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
      alert('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-slate-800 pb-20">
      
      {/* Responsive Header */}
      <header className="w-full bg-white px-4 md:px-8 py-3 shadow-sm border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center">
          <Link href="/admin/dashboard">
            <Image 
              src="/front.png" 
              alt="main logo" 
              width={160} 
              height={45} 
              className="h-8 md:h-10 w-auto object-contain" 
            />
          </Link>
        </div>
        <Link 
          href="/admin/dashboard" 
          className="flex items-center gap-1 text-xs md:text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft size={16} /> <span>Dashboard Home</span>
        </Link>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 justify-center md:justify-start">
              <PlaneTakeoff className="text-red-500" size={20} /> Leave Requests
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">Pending leave applications from faculty.</p>
          </div>
          <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl font-bold border border-red-100 shadow-sm text-sm">
            Pending: {leaves.length}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-red-500 mb-4" size={40} />
            <p className="text-slate-500">Loading leave requests...</p>
          </div>
        ) : leaves.length > 0 ? (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div key={leave._id} className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-red-100 shadow-md shadow-red-900/5 transition-all hover:border-red-300">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        {leave.type}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-400">
                        Applied: {formatDateTime(leave.appliedAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base md:text-xl">{leave.faculty.name}</h3>
                    <p className="text-xs md:text-sm text-slate-500 mb-1">
                      ID: {leave.faculty.facultyId} · {leave.faculty.department}
                    </p>
                    <p className="text-xs md:text-sm text-slate-700 mb-2">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </p>
                    <p className="text-xs md:text-sm text-slate-600 bg-slate-50 p-2 md:p-3 rounded-lg italic border-l-4 border-blue-300">
                      “{leave.reason}”
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 md:mt-0 justify-start md:justify-end">
                    <button
                      onClick={() => handleAction(leave._id, 'approved')}
                      disabled={processingId === leave._id || deletingId === leave._id}
                      className="flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition disabled:opacity-50 text-xs md:text-sm"
                    >
                      {processingId === leave._id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(leave._id, 'rejected')}
                      disabled={processingId === leave._id || deletingId === leave._id}
                      className="flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition disabled:opacity-50 text-xs md:text-sm"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleDelete(leave._id)}
                      disabled={deletingId === leave._id || processingId === leave._id}
                      className="flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition disabled:opacity-50 text-xs md:text-sm"
                      title="Delete request"
                    >
                      {deletingId === leave._id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 md:p-20 border border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="bg-slate-50 p-4 md:p-6 rounded-full mb-4">
              <Clock size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-600 font-bold text-lg md:text-xl tracking-tight">No Pending Requests</p>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-xs mx-auto">
              There are no leave applications awaiting your approval.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 w-full px-4 flex justify-center items-center text-[10px] md:text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Shield size={12} /> Face Recognition Attendance System VisionID
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AdminRoute>
      <LeaveManagementContent />
    </AdminRoute>
  );
}
