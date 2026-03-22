"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function FacultyRoute({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const alertShown = useRef(false);

  useEffect(() => {
    const facultyInfo = sessionStorage.getItem('facultyInfo');
    if (!facultyInfo) {
      if (!alertShown.current) {
        alertShown.current = true;
        alert('Please login first to access this page.');
      }
      router.replace('/faculty/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}