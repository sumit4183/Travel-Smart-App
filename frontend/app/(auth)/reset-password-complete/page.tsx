"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Import for redirection to login

const ResetPasswordComplete = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/sign-in"); // Redirect to sign-in page
  };

  // returning JSX component
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">Password Reset Successful</h1>
      <p className="text-lg mb-4">
        Your password has been reset successfully. You may sign in with your new
        password.
      </p>
      <button
        onClick={handleLoginRedirect}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Sign in
      </button>
    </div>
  );
};

export default ResetPasswordComplete;
