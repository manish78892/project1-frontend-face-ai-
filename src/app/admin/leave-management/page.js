"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Clock, PlaneTakeoff, Trash2, Shield } from "lucide-react";
import AdminRoute from '@/components/AdminRoute'; // adjust path if needed

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
      
      <header className="w-full bg-white px-8 py-3 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Link href="/admin/dashboard">
            <Image src="/front.png" alt="main logo" width={200} height={50} className="h-14 w-auto object-contain" />
          </Link>
        </div>
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors bg-slate-50 px-4 py-2 rounded-xl text-sm border border-slate-200">
          <ArrowLeft size={18} /> Dashboard Home
        </Link>
      </header>

      <main className="max-w-6xl mx-auto w-full p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3 justify-center md:justify-start">
              <PlaneTakeoff className="text-red-500" /> Leave Requests
            </h1>
            <p className="text-slate-500 text-sm mt-1">Pending leave applications from faculty.</p>
          </div>
          <div className="bg-red-50 text-red-600 px-6 py-2 rounded-2xl font-bold border border-red-100 shadow-sm">
            Pending: {leaves.length}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-red-500 mb-4" size={40} />
            <p className="text-slate-500">Loading leave requests...</p>
          </div>
        ) : leaves.length > 0 ? (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div key={leave._id} className="bg-white rounded-3xl p-6 border border-red-100 shadow-md shadow-red-900/5 transition-all hover:border-red-300">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {leave.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        Applied: {formatDateTime(leave.appliedAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xl">{leave.faculty.name}</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      ID: {leave.faculty.facultyId} · {leave.faculty.department}
                    </p>
                    <p className="text-sm text-slate-700 mb-2">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic border-l-4 border-blue-300">
                      “{leave.reason}”
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleAction(leave._id, 'approved')}
                      disabled={processingId === leave._id || deletingId === leave._id}
                      className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition disabled:opacity-50"
                    >
                      {processingId === leave._id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(leave._id, 'rejected')}
                      disabled={processingId === leave._id || deletingId === leave._id}
                      className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      onClick={() => handleDelete(leave._id)}
                      disabled={deletingId === leave._id || processingId === leave._id}
                      className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition disabled:opacity-50"
                      title="Delete request"
                    >
                      {deletingId === leave._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-24 border border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Clock size={48} className="text-slate-200" />
            </div>
            <p className="text-slate-600 font-bold text-xl tracking-tight">No Pending Requests</p>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
              There are no leave applications awaiting your approval.
            </p>
          </div>
        )}
      </main>
      <footer className="absolute bottom-4 w-full px-8 flex justify-center items-center text-[11px] md:text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5"><Shield size={14} />Face Recognition Attendance System VisionID</div>
      </footer>
    </div>
  );
}

// Wrap with AdminRoute to protect the page
export default function Page() {
  return (
    <AdminRoute>
      <LeaveManagementContent />
    </AdminRoute>
  );
}