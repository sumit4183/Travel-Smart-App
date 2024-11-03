"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from "@/components/Footer";
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token); // Sets login state based on token existence
  }, []);

  return (
    <main>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="mt-20">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </main>
  );
}