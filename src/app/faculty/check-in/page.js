"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import FacultyRoute from '@/components/FacultyRoute';

function FacultyVerifyContent() {
  const router = useRouter();
  const videoRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | scanning | success | failed
  const [message, setMessage] = useState("");
  const [distance, setDistance] = useState(null);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [errorDetail, setErrorDetail] = useState(""); // for debugging

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    const stored = sessionStorage.getItem("facultyInfo");
    if (!stored) {
      setMessage("No faculty session found.");
      setStatus("failed");
      return;
    }

    const info = JSON.parse(stored);
    if (!info.id) {
      setMessage("Faculty ID missing in session.");
      setStatus("failed");
      return;
    }
    setFacultyInfo(info);
    startCamera();
    loadModels();

    return () => stopCamera();
  }, []);

  /* ===============================
     LOAD MODELS
  =============================== */
  const loadModels = async () => {
    try {
      const faceapi = await import("@vladmandic/face-api");
      const MODEL_URL = "/models";

      await faceapi.tf.setBackend("webgl");
      await faceapi.tf.ready();

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load AI models.");
      setStatus("failed");
    }
  };

  /* ===============================
     CAMERA
  =============================== */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("Camera permission denied.");
      setStatus("failed");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  /* ===============================
     FETCH STORED DESCRIPTOR
  =============================== */
  const fetchStoredDescriptor = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/faculty/${facultyInfo.id}`;
    console.log("Fetching descriptor from:", url);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      if (!data.faceDescriptor || !Array.isArray(data.faceDescriptor)) {
        throw new Error("Face descriptor missing or invalid");
      }
      return data.faceDescriptor;
    } catch (err) {
      console.error("fetchStoredDescriptor error:", err);
      setErrorDetail(err.message);
      throw err; // rethrow to be caught by verifyFace
    }
  };

  /* ===============================
     MARK ATTENDANCE
  =============================== */
  const markAttendance = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId: facultyInfo.id,
        status: "present",
        date: new Date().toISOString()
      })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw { status: res.status, data: errorData };
    }
    return await res.json();
  };

  /* ===============================
     VERIFY FACE
  =============================== */
  const verifyFace = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    setStatus("scanning");
    setMessage("");
    setDistance(null);
    setErrorDetail("");

    try {
      const faceapi = await import("@vladmandic/face-api");

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("failed");
        setMessage("No face detected.");
        return;
      }

      const liveDescriptor = new Float32Array(detection.descriptor);

      const storedArray = await fetchStoredDescriptor();
      const storedDescriptor = new Float32Array(storedArray);

      const labeled = new faceapi.LabeledFaceDescriptors(
        facultyInfo.name,
        [storedDescriptor]
      );

      const matcher = new faceapi.FaceMatcher(labeled, 0.6);

      const result = matcher.findBestMatch(liveDescriptor);

      setDistance(result.distance);

      if (result.label === "unknown") {
        setStatus("failed");
        setMessage("❌ Face Not Matched");
        return;
      }

      // Face matched – try to mark attendance
      try {
        await markAttendance();
        setStatus("success");
        setMessage("✅ Verified & Attendance Marked");
        setTimeout(() => router.push("/faculty/dashboard"), 1500);
      } catch (err) {
        // Check if it's the duplicate attendance error
        if (err.status === 400 && err.data?.message?.includes("already marked")) {
          setStatus("success");
          setMessage("✅ Verified (Already marked today)");
          setTimeout(() => router.push("/faculty/dashboard"), 1500);
        } else {
          // Other attendance error – still consider verification success but show warning
          console.error("Attendance marking error:", err);
          setStatus("success");
          setMessage("✅ Verified but attendance recording failed");
          setErrorDetail(err.data?.message || "Unknown error");
          setTimeout(() => router.push("/faculty/dashboard"), 2000);
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("failed");
      setMessage("Verification error.");
      if (err.message) setErrorDetail(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Face Verification</h1>

      <div className="w-80 h-80 bg-gray-900 rounded-xl overflow-hidden border-4 border-gray-700">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover scale-x-[-1]" // 👈 added flip to remove mirror effect
        />
      </div>

      <button
        onClick={verifyFace}
        disabled={!modelsLoaded || !cameraActive || !facultyInfo || status === "success"}
        className="mt-6 px-6 py-3 bg-blue-600 rounded-lg font-bold disabled:opacity-50"
      >
        {modelsLoaded ? "Verify Face" : "Loading Models..."}
      </button>

      {status === "scanning" && (
        <div className="mt-4 flex items-center gap-2 text-blue-400">
          <Loader2 className="animate-spin" /> Scanning...
        </div>
      )}

      {status === "success" && (
        <div className="mt-4 text-green-400 text-xl font-bold">
          <CheckCircle2 className="inline mr-2" />
          {message}
          <div className="text-sm mt-2">
            Distance: {distance?.toFixed(4)}
          </div>
          <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
          {errorDetail && (
            <div className="text-xs text-gray-400 mt-2 bg-gray-800 p-2 rounded">
              Debug: {errorDetail}
            </div>
          )}
        </div>
      )}

      {status === "failed" && (
        <div className="mt-4 text-red-400 text-xl font-bold">
          <XCircle className="inline mr-2" />
          {message}
          {distance && (
            <div className="text-sm mt-2">
              Distance: {distance.toFixed(4)}
            </div>
          )}
          {errorDetail && (
            <div className="text-xs text-gray-400 mt-2 bg-gray-800 p-2 rounded">
              Debug: {errorDetail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Wrap with FacultyRoute to protect the page
export default function Page() {
  return (
    <FacultyRoute>
      <FacultyVerifyContent />
    </FacultyRoute>
  );
}