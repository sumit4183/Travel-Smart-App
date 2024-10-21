"use client"

import { useState } from 'react'; // Importing useState for managing authentication state

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track authentication status

  return (
    <main>
      <header>
          <nav className="bg-gray-800 p-4 flex justify-between items-center">
            {/* Logo/Brand Name */}
            <div className="text-white text-lg font-bold">
              <a href="/" className="hover:text-yellow-500">Travel Smart</a>
            </div>

            {/* Navigation Links */}
            <ul className="flex space-x-6 text-white">
              <li>
                <a href="/" className="hover:text-yellow-500">Home</a>
              </li>
              <li>
                <a href="/flights" className="hover:text-yellow-500">Flights</a>
              </li>
              <li>
                <a href="/hotels" className="hover:text-yellow-500">Hotels</a>
              </li>
              <li>
                <a href="/itineraries" className="hover:text-yellow-500">Itineraries</a>
              </li>
              <li>
                <a href="/packing" className="hover:text-yellow-500">Packing Assistant</a>
              </li>
              <li>
                <a href="/expenses" className="hover:text-yellow-500">Expense Tracker</a>
              </li>
            </ul>

            {/* Conditional Sign In/Sign Up or Account/Logout */}
            <div className="flex space-x-4 text-white">
              {!isLoggedIn ? (
                <>
                  <a href="/sign-in" className="hover:text-yellow-500">Sign In</a>
                  <a href="/sign-up" className="hover:text-yellow-500">Sign Up</a>
                </>
              ) : (
                <>
                  <a href="/account" className="hover:text-yellow-500">Account</a>
                  <a href="/logout" className="hover:text-yellow-500" onClick={() => setIsLoggedIn(false)}>Logout</a>
                </>
              )}
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="bg-gray-800 text-white text-center p-4 mt-4">
          <p>&copy; 2024 Travel Smart. All Rights Reserved.</p>
          <a href="/contact" className="hover:text-yellow-500">Contact Us</a> | 
          <a href="/terms" className="hover:text-yellow-500"> Terms & Conditions</a>
        </footer>
    </main>
  );
}  