"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import for later navigation use

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter(); // For redirecting after successful password reset
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    // Fetch the CSRF token when the component loads
    fetch("http://localhost:8000/auth/api/csrf/", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setCsrfToken(data.csrfToken));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/auth/api/password_reset/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken, // Include CSRF token
      },
      body: JSON.stringify({ email }),
      credentials: "include", // Include cookie
    });

    console.log(res.ok);
    console.log(res);

    if (res.ok) {
      // Redirection for success
      router.push("/reset-password-sent");
    } else {
      // Displayed error message if fails
      const data = await res.json();
      setMessage(data.message || "Something went wrong");
    }
  };

  // Form rendering
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-12">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center">
          <label className="text-lg mr-2 mb-5">Email Address:</label>
          <input
            type="email"
            className="border p-2 rounded flex-grow w-80 mb-5"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          Reset Password
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-500">{message}</p>}
    </div>
  );
};

export default PasswordReset;
