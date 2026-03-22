"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoute({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const alertShown = useRef(false); // 👈 track if alert already shown

  useEffect(() => {
    const token = localStorage.getItem('token'); // or 'adminToken'
    if (!token) {
      if (!alertShown.current) {
        alertShown.current = true;
        alert('Please login first to access this page.');
      }
      router.replace('/admin/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}