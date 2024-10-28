"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import for later navigation use and url handling

interface ResetPageProps {
  params: {
    uidb64: string;
    token: string;
  };
}

const PasswordResetConfirm = ({ params }: ResetPageProps) => {
  const { uidb64, token } = params;
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  const passwordRequirements =
    "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.";

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // If any requirement is not met, return a simple error message
    if (!minLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      return "Password requirements are not met.";
    }
    return null; // Return null if all requirements are met
  };

  useEffect(() => {
    // Fetch the CSRF token when the component loads
    fetch("http://localhost:8000/auth/api/csrf/", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setCsrfToken(data.csrfToken));
  }, []);

  // Form handling after user submits updated password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Confirm if passwords match
    if (newPassword !== confirmPassword) {
      setMessage("Passwords must be the same!");
      return;
    }

    // Check if password met the requirements
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setMessage(passwordValidationError);
      return;
    }

    try {
      // Send POST request to backend server
      const res = await fetch(
        `http://localhost:8000/auth/api/reset/${uidb64}/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken, // To verify request's authenticity
          },
          body: JSON.stringify({ new_password: newPassword }),
          credentials: "include", //  Include cookies
        }
      );

      if (res.ok) {
        router.push("/reset-password-complete");
      } else {
        const data = await res.json();
        setMessage(
          data.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Form handling
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">Enter New Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm w-full">
        <input
          type="password"
          placeholder="New Password"
          className="border p-2 rounded w-full"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <p className="text-sm text-gray-500 text-center whitespace-pre-line">
          {passwordRequirements}
        </p>
        <input
          type="password"
          placeholder="Confirm New Password"
          className="border p-2 rounded w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          Reset Password
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default PasswordResetConfirm;
