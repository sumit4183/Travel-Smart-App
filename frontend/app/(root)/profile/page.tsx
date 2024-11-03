"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

const Profile = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        router.push('/sign-in');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/auth/user/', {
          headers: { Authorization: `Token ${token}` },
        });
        console.log(response);
        console.log("Hello");
        setUserData(response.data);
      } catch (err) {
        const error = err as AxiosError;
        // router.push('/sign-in');
        if (error.response && error.response.data) {
            // Log the full error response from the server
            console.error("Error response from server:", error.response.data);
    
            const errorData = error.response.data as { detail?: string };
            setError(errorData.detail || Object.values(errorData).join(", ") || "Error fetching user data.");
          }
      }
    };

    fetchUserData();
  }, [router]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div>
      {/* <h1>Welcome, {userData.first_name}</h1>
      <p>Email: {userData.email}</p> */}
      {/* Additional user details */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
    </div>
  );
};

export default Profile;
