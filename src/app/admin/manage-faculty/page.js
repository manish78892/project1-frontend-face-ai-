"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Search, Trash2, Edit, Loader2, X,
  UserCheck, Hash, Mail, Phone, UserX, Save, Shield
} from "lucide-react";
import AdminRoute from '@/components/AdminRoute';

function ManageFacultyContent() {
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    facultyId: '',
    department: '',
    email: '',
    phone: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // --- 1. FETCH ALL REGISTERED FACULTY ---
  useEffect(() => {
    const fetchFaculty = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No admin token found');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) {
          console.error(data);
          alert(data.message || "Failed to fetch faculty");
          return;
        }
        const mappedFaculty = data.faculty.map((f) => ({
          _id: f._id,
          name: f.name,
          employeeId: f.facultyId,
          department: f.department,
          email: f.email,
          phone: f.phone || "N/A",
        }));
        setFaculty(mappedFaculty);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Backend not running?");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  // --- 2. DELETE FACULTY LOGIC ---
  const handleDelete = async (id, name) => {
    if (!confirm(`Permanently delete ${name}? This will also remove their face math.`)) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty/${id}`, { 
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFaculty(faculty.filter(f => f._id !== id));
        alert("Faculty member removed successfully.");
      } else {
        const errData = await res.json();
        alert(errData.message || 'Delete failed');
      }
    } catch (err) {
      alert("Delete failed. Is the backend offline?");
    }
  };

  // --- 3. EDIT FACULTY LOGIC ---
  const openEditModal = (person) => {
    setEditingFaculty(person);
    setEditFormData({
      name: person.name,
      facultyId: person.employeeId,
      department: person.department,
      email: person.email,
      phone: person.phone === 'N/A' ? '' : person.phone
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!editingFaculty) return;
    setIsUpdating(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in');
      setIsUpdating(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty/${editingFaculty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          facultyId: editFormData.facultyId,
          name: editFormData.name,
          department: editFormData.department,
          email: editFormData.email,
          phone: editFormData.phone
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFaculty(faculty.map(f => 
          f._id === editingFaculty._id 
            ? { 
                ...f, 
                name: editFormData.name,
                employeeId: editFormData.facultyId,
                department: editFormData.department,
                email: editFormData.email,
                phone: editFormData.phone || 'N/A'
              }
            : f
        ));
        setShowEditModal(false);
        alert('Faculty updated successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 4. SEARCH FILTER ---
  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Faculty Directory</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">Manage and edit registered staff information</p>
          </div>
          <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
            Total: {filteredFaculty.length}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or Employee ID..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Faculty Grid */}
        {isLoading ? (
          <div className="py-16 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Syncing with database...</p>
          </div>
        ) : filteredFaculty.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFaculty.map((person) => (
              <div key={person._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                
                {/* Actions - always visible on touch devices, but hover for desktop */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(person)} 
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(person._id, person.name)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight">{person.name}</h3>
                    <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider mt-0.5">{person.department}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Hash size={12} className="text-slate-300" /> <span className="font-medium">{person.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={12} className="text-slate-300" /> <span className="truncate">{person.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={12} className="text-slate-300" /> <span>{person.phone}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                   <span className="text-[8px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                      <UserCheck size={10} /> BIOMETRIC REGISTERED
                   </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-200 text-center flex flex-col items-center">
            <UserX size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">No faculty members found.</p>
            <p className="text-xs text-slate-300 mt-1">Try a different search or add a new member.</p>
          </div>
        )}

        {/* Edit Modal - responsive */}
        {showEditModal && editingFaculty && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">Edit Faculty</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl mt-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee ID</label>
                  <input
                    type="text"
                    name="facultyId"
                    value={editFormData.facultyId}
                    onChange={handleEditInputChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl mt-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                  <select
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditInputChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl mt-1 text-sm"
                    required
                  >
                    <option value="">Select Department...</option>
                    <option value="cs">Computer Science</option>
                    <option value="physics">Physics</option>
                    <option value="commerce">Commerce</option>
                    <option value="math">Mathematics</option>
                    <option value="punjabi">Punjabi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl mt-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl mt-1 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 border border-slate-200 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
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
      <ManageFacultyContent />
    </AdminRoute>
  );
}
