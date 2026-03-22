# Khalsa College Patiala (KCP) - Smart Attendance System

A professional, biometric-based attendance solution designed for faculty members at Khalsa College Patiala. This system uses facial recognition and geofencing to ensure secure and accurate attendance marking.

## 🚀 Technology Stack

### **Frontend (Next.js)**
* **Framework:** Next.js 16 (App Router) with React for high-performance UI rendering.
* **Styling:** Tailwind CSS for a modern, mobile-responsive dashboard design.
* **Icons:** Lucide React for professional interface iconography.
* **Biometrics:** face-api.js (built on TensorFlow.js) for browser-based facial landmark detection and recognition.
* **Deployment:** Vercel.

### **Backend (Node.js & Express)**
* **Runtime:** Node.js for scalable server-side operations.
* **Framework:** Express.js for building robust API endpoints.
* **Database:** MongoDB for secure storage of faculty profiles, face descriptors, and attendance logs.
* **Real-time Engine:** Socket.io for instant attendance alerts and system updates.
* **Geofencing:** ProxiScan technology using the Haversine formula to enforce a strict 5-meter radius around college premises.

## 📱 Features
* **Facial Recognition:** Secure biometric verification using the device camera.
* **ProxiScan:** Location-based verification ensuring the user is physically present at the college.
* **Mobile-First Dashboard:** Fully responsive navigation including a slide-out drawer for mobile devices.
* **Real-time Logs:** Instant feedback on attendance status (Present, Late, or Absent).

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Dhruv26-k/kcp-attendance-system.git](https://github.com/Dhruv26-k/kcp-attendance-system.git)