"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Camera, Save, User, Hash, Building, Mail, Phone, 
  CheckCircle2, UploadCloud, Image as ImageIcon,
  AlertCircle , UserCheck
} from "lucide-react";
import AdminRoute from '@/components/AdminRoute';

function AddFacultyContent() {
  // ---------- Form Data State ----------
  const [formData, setFormData] = useState({
    name: '',
    facultyId: '',
    department: '',
    email: '',
    phone: ''
  });

  // ---------- Validation States ----------
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ---------- Face Capture State ----------
  const [captureMode, setCaptureMode] = useState("webcam");
  const [cameraActive, setCameraActive] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // ---------- AI Models State ----------
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // ---------- Validation Functions ----------
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'facultyId':
        if (!value.trim()) return 'Faculty ID is required';
        // Format: KCP-2026-04 (case-insensitive)
        if (!/^KCP-\d{4}-\d+$/i.test(value)) return 'Format must be KCP-YYYY-NUMBER (e.g., KCP-2026-04)';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        return '';
      case 'department':
        if (!value) return 'Please select a department';
        return '';
      case 'phone':
        // Phone is optional, but if entered must be exactly 10 digits
        if (value) {
          const digitsOnly = value.replace(/\D/g, '');
          if (!/^\d{10}$/.test(digitsOnly)) return 'Phone must be exactly 10 digits (0-9)';
        }
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      facultyId: true,
      department: true,
      email: true,
      phone: true
    });
    return isValid;
  };

  // ---------- Camera Helpers ----------
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const handleModeSwitch = (mode) => {
    if (mode === "upload" && cameraActive) {
      stopCamera();
    }
    setCaptureMode(mode);
    setFaceCaptured(false);
    setFaceDescriptor(null);
    setUploadedImage(null);
  };

  // ---------- Load AI Models ----------
  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import('@vladmandic/face-api');
        const MODEL_URL = '/models';
        await faceapi.tf.setBackend('webgl');
        await faceapi.tf.ready();
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log("✅ AI Face Models Loaded");
      } catch (err) {
        console.error("❌ Error loading AI models:", err);
      }
    };
    loadModels();
  }, []);

  // ---------- Webcam Logic ----------
  const startCamera = async () => {
    setCameraActive(true);
    setFaceCaptured(false);
    setFaceDescriptor(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Please allow webcam access to register faculty face.");
      setCameraActive(false);
    }
  };

  const captureFaceFromWebcam = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    const faceapi = await import('@vladmandic/face-api');
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const descriptorArray = Array.from(detection.descriptor);
      setFaceDescriptor(descriptorArray);
      setFaceCaptured(true);
      stopCamera();
    } else {
      alert("❌ No face detected! Please look directly at the camera with good lighting.");
    }
  };

  // ---------- Upload Logic ----------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.onload = async () => {
      const faceapi = await import('@vladmandic/face-api');
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const descriptorArray = Array.from(detection.descriptor);
        setFaceDescriptor(descriptorArray);
        setFaceCaptured(true);
      } else {
        alert("❌ No face detected in this photo. Please upload a clear, forward-facing image.");
        setUploadedImage(null);
      }
    };
  };

  // ---------- Submit Handler ----------
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fix the errors before submitting.');
      return;
    }

    if (!faceDescriptor) {
      alert('Please capture face data first');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      faceDescriptor
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Faculty registered successfully!');
        setFormData({ name: '', facultyId: '', department: '', email: '', phone: '' });
        setFaceCaptured(false);
        setFaceDescriptor(null);
        setUploadedImage(null);
        setErrors({});
        setTouched({});
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error - could not reach server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!faceCaptured) return false;
    return Object.keys(formData).every(key => !validateField(key, formData[key]));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-slate-800 pb-20 relative">
      
      {/* Header */}
      <header className="w-full bg-white px-8 py-3 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src="/front.png" 
              alt="main logo" 
              width={400} 
              height={90} 
              className="h-14 w-auto object-contain [clip-path:inset(3px_0_0_0)]"
              priority 
            />
          </Link>
        </div>
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors bg-slate-50 px-4 py-2 rounded-xl text-sm border border-slate-200">
          <ArrowLeft size={18} />Dashboard Home
        </Link>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-8">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register New Faculty</h1>
            <p className="text-slate-500 text-sm mt-1">Add details and provide a face scan/photo to create a secure profile.</p>
          </div>
          {/* AI Status Indicator */}
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-white shadow-sm">
            {modelsLoaded ? (
              <span className="text-green-600 flex items-center gap-1">● AI Engine Ready</span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1 animate-pulse">● Loading AI Engine...</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Side: Registration Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal & Professional Details</h2>
            
            <form className="space-y-5">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Dr. Manjit Singh" 
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.name && touched.name 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                        : 'border-slate-200 focus:ring-blue-500 bg-slate-50/50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Faculty ID Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Faculty Id</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="KCP-2026-04" 
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.facultyId && touched.facultyId 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                        : 'border-slate-200 focus:ring-blue-500 bg-slate-50/50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.facultyId && touched.facultyId && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.facultyId}
                  </p>
                )}
              </div>

              {/* Department Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Department</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all appearance-none ${
                      errors.department && touched.department 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                        : 'border-slate-200 focus:ring-blue-500 bg-slate-50/50 focus:bg-white'
                    }`}
                  >
                    <option value="">Select Department...</option>
                    <option value="cs">Computer Science</option>
                    <option value="physics">Physics</option>
                    <option value="commerce">Commerce</option>
                    <option value="math">Mathematics</option>
                    <option value="punjabi">Punjabi</option>
                  </select>
                </div>
                {errors.department && touched.department && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.department}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="faculty@khalsacollege.edu.in" 
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.email && touched.email 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                        : 'border-slate-200 focus:ring-blue-500 bg-slate-50/50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field (optional, exactly 10 digits if entered) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="+91 98765 43210" 
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.phone && touched.phone 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                        : 'border-slate-200 focus:ring-blue-500 bg-slate-50/50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Right Side: Face Scanner & Upload */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-8 flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Biometric Data</h2>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => handleModeSwitch("webcam")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${captureMode === "webcam" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Camera size={14} /> Webcam
                </button>
                <button 
                  onClick={() => handleModeSwitch("upload")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${captureMode === "upload" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <UploadCloud size={14} /> Upload
                </button>
              </div>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 relative overflow-hidden min-h-[250px] mb-6">
              
              {faceCaptured ? (
                <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center text-green-600 p-6 text-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 size={48} className="mb-3" />
                  <p className="font-bold text-lg">Face Descriptor Extracted!</p>
                  <p className="text-xs text-slate-500 mt-1">Mathematical array ready for MongoDB.</p>
                  <button onClick={() => {
                    setFaceCaptured(false);
                    setFaceDescriptor(null);
                  }} className="mt-4 text-xs font-semibold text-blue-600 hover:underline">Recapture Data</button>
                </div>
              ) : null}

              {captureMode === "webcam" && (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"} scale-x-[-1]`}
                  />
                  {!cameraActive && (
                    <div className="flex flex-col items-center text-slate-400 z-10 p-6 text-center">
                      <Camera size={40} className="mb-3 opacity-50" />
                      <p className="text-sm font-medium">Camera is offline</p>
                      <p className="text-xs mt-1 max-w-[200px]">Position the faculty member in front of the webcam.</p>
                    </div>
                  )}
                </>
              )}

              {captureMode === "upload" && (
                <>
                  {uploadedImage ? (
                    <Image src={uploadedImage} alt="Uploaded Faculty" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 z-10 p-6 text-center">
                      <ImageIcon size={40} className="mb-3 opacity-50" />
                      <p className="text-sm font-medium">No Image Selected</p>
                      <p className="text-xs mt-1 max-w-[200px]">Upload a clear, forward-facing passport photo.</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </>
              )}
            </div>

            {!faceCaptured && (
              captureMode === "webcam" ? (
                cameraActive ? (
                  <button 
                    onClick={captureFaceFromWebcam} 
                    disabled={!modelsLoaded}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    <Camera size={18} /> {modelsLoaded ? "Extract Face Data" : "Loading AI..."}
                  </button>
                ) : (
                  <button onClick={startCamera} className="w-full bg-slate-800 text-white font-semibold py-3 rounded-xl hover:bg-slate-900 transition-colors flex justify-center items-center gap-2 shadow-sm">
                    <Camera size={18} /> Turn On Webcam
                  </button>
                )
              ) : (
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  disabled={!modelsLoaded}
                  className="w-full bg-slate-800 text-white font-semibold py-3 rounded-xl hover:bg-slate-900 disabled:bg-slate-400 transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  <UploadCloud size={18} /> {modelsLoaded ? "Browse photo" : "Loading AI..."}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center mb-10">
          <button 
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting} 
            className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
              isFormValid() && !isSubmitting
                ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Save size={18} /> 
            {isSubmitting ? "Saving..." : "Submit & Save"}
          </button>
        </div>

      </main>

      <div className="absolute bottom-4 w-full px-8 flex justify-center items-center text-[11px] md:text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <UserCheck size={14} />
          Face Recognition Attendance System VisionID
        </div>
      </div>

    </div>
  );
}

export default function Page() {
  return (
    <AdminRoute>
      <AddFacultyContent />
    </AdminRoute>
  );
}