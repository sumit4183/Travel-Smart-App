"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Home = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        router.push('/sign-in');
      } else {
        const response = await axios.get('http://localhost:8000/auth/status/', {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.data.is_authenticated) {
          router.push('/sign-in');
        }
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token); // Sets to true if a token exists in either storage
  }, []);


  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-[calc(100vh-80px)] bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/little-boy-playing-with-a-paper-plane-on-the-beach-suwinai-sukanant.jpg')",
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-25"></div>
        <div className="flex flex-col justify-center items-center h-full text-white z-10">
          <h1 className="text-5xl font-bold mb-4">Welcome to Travel Smart</h1>
          <p className="text-xl mb-6">Your AI-driven travel assistant for seamless journeys.</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 px-4">
        {/* Feature Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Flight Booking</h3>
              <p>Seamlessly book flights through integrated third-party APIs with price alerts and filters.</p>
              <a href="/flights" className="text-blue-500 hover:underline mt-2 inline-block">Learn More</a>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Hotel Reservation</h3>
              <p>Search and reserve accommodations with options for sorting by price, rating, and amenities.</p>
              <a href="/hotels" className="text-blue-500 hover:underline mt-2 inline-block">Learn More</a>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Personalized Itineraries</h3>
              <p>AI-generated itineraries based on user preferences, destination, and budget.</p>
              <a href="/itineraries" className="text-blue-500 hover:underline mt-2 inline-block">Learn More</a>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-yellow-100 text-center py-10 mb-16">
          <h2 className="text-2xl font-bold mb-4">Ready to Travel Smart?</h2>
          <a href="/get-started" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
            Get Started Now
          </a>
        </section>

        {/* Footer Section */}
        <footer className="bg-gray-800 text-white py-4">
          <div className="text-center">
            <p>© {new Date().getFullYear()} Travel Smart. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-2">
              <a href="/privacy-policy" className="text-gray-400 hover:underline">Privacy Policy</a>
              <a href="/terms-of-service" className="text-gray-400 hover:underline">Terms of Service</a>
              <a href="/contact" className="text-gray-400 hover:underline">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;