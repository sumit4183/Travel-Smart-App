"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token); // Sets login state based on token existence
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/'); // Redirect to the home page after logout
  };

  return (
    <main>
      {/* Navbar */}
      <header>
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
          {/* Logo/Brand Name */}
          <div className="text-white text-lg font-bold">
            <Link href="/" className="hover:text-yellow-500">Travel Smart</Link>
          </div>

          {/* Navigation Links */}
          <ul className="flex space-x-6 text-white">
            <li><Link href="/" className="hover:text-yellow-500">Home</Link></li>
            <li><Link href="/flights" className="hover:text-yellow-500">Flights</Link></li>
            <li><Link href="/hotels" className="hover:text-yellow-500">Hotels</Link></li>
            <li><Link href="/itineraries" className="hover:text-yellow-500">Itineraries</Link></li>
            <li><Link href="/packing" className="hover:text-yellow-500">Packing Assistant</Link></li>
            <li><Link href="/expenses" className="hover:text-yellow-500">Expense Tracker</Link></li>
          </ul>

          {/* Conditional Sign In/Sign Up or Account/Logout */}
          <div className="flex space-x-4 text-white">
            {!isLoggedIn ? (
              <>
                <Link href="/sign-in" className="hover:text-yellow-500">Sign In</Link>
                <Link href="/sign-up" className="hover:text-yellow-500">Sign Up</Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="hover:text-yellow-500">Profile</Link>
                <button
                  className="hover:text-yellow-500"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer />
    </main>
  );
}