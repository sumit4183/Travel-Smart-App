"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [active, setActive] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navLinks = [
    { id: "home", title: "Home", href: "/" },
    { id: "flights", title: "Flights", href: "/flights" },
    { id: "hotels", title: "Hotels", href: "/hotels" },
    { id: "itineraries", title: "Itineraries", href: "/itineraries" },
    { id: "packing-assistant", title: "Packing Assistant", href: "/packing-assistant" },
    { id: "expense-tracker", title: "Expense Tracker", href: "/expenses" },
  ];
  
  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    // Listen to storage changes to handle login status changes across tabs
    const handleStorageChange = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/sign-in"); // Redirect to sign-in page after logout
  };

  return (
    <nav className="w-full py-5 fixed top-0 z-20 bg-gray-800">
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <span className="text-white text-lg font-bold">Travel Smart</span>
        </Link>

        <ul className="list-none hidden md:flex flex-row gap-6">
          {navLinks.slice(0, 6).map((link) => (
            <li
              key={link.id}
              className={`${active === link.title ? "text-white" : "text-gray-400"} hover:text-white text-[18px] font-medium cursor-pointer`}
              onClick={() => setActive(link.title)}
            >
              <Link href={link.href}>{link.title}</Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="text-white hover:text-gray-300 px-2 py-2 rounded-md text-[18px] font-medium">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 px-2 py-2 rounded-md text-[18px] font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-white hover:text-gray-300 px-2 py-2 rounded-md text-[18px] font-medium">
                Sign In
              </Link>
              <Link href="/sign-up" className="text-white hover:text-gray-300 px-2 py-2 rounded-md text-[18px] font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          >
            <span className="sr-only">Open main menu</span>
            {!isOpen ? (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.id} href={link.href}>
                <p
                  className={`${active === link.title ? "text-white" : "text-gray-400"} block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => {
                    setIsOpen(!isOpen);
                    setActive(link.title);
                  }}
                >
                  {link.title}
                </p>
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link href="/profile">
                  <p
                    className="text-gray-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </p>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-gray-400 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <p
                    className="text-gray-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </p>
                </Link>
                <Link href="/sign-up">
                  <p
                    className="text-gray-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </p>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
