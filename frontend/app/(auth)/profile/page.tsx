"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      setIsLoggedIn(!!token); // Sets login state based on token existence
    };

    checkLoginStatus(); // Run initial check

    // Listen for storage events to update login status across tabs/pages
    window.addEventListener('storage', checkLoginStatus);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []); // Empty dependency array to run only once

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token'); // Remove token from session storage as well
    setIsLoggedIn(false);
    router.push('/'); // Redirect to the home page after logout
  };

  return (
    <main>
      <header>
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
          {/* Logo/Brand Name */}
          <div className="text-white text-lg font-bold">
            <Link href="/" className="hover:text-yellow-500">Travel Smart</Link>
          </div>

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

      <main>{children}</main>
    </main>
  );
}