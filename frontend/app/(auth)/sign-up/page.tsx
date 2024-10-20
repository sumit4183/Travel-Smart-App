"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // To handle redirects after registration
import axios, { AxiosError } from "axios"; // Import Axios to make API requests
import { Facebook } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegistrationPage() {
  const [registrationType, setRegistrationType] = useState<"email" | "facebook">("email");
  const [error, setError] = useState<string | null>(null); // Error state
  const router = useRouter(); // For redirecting after successful registration

  // Form fields state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Make POST request to your Django API
      const response = await axios.post("http://localhost:8000/auth/registration/", {
        username: formData.email, // Set username as email if that's how you handle it
        email: formData.email,
        password1: formData.password,
        password2: formData.confirmPassword, // Send confirmPassword as password2
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Handle successful registration (e.g., redirect to login page)
      if (response) router.push("/sign-in");
    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data) {
        // Log the full error response from the server
        console.error("Error response from server:", error.response.data);

        const errorData = error.response.data as { detail?: string; [key: string]: any };
        setError(errorData.detail || Object.values(errorData).join(", ") || "Registration failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please check your network connection.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value, // Dynamically update state for each input field
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center mt-8 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <Button onClick={() => setRegistrationType("facebook")} className="bg-blue-700 hover:bg-blue-700">
              <Facebook className="w-5 h-5 mr-2" />
              Sign up with Facebook
            </Button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error */}

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <Input label="First Name" type="text" id="firstName" placeholder="John" required onChange={handleInputChange} />
            <Input label="Last Name" type="text" id="lastName" placeholder="Doe" required onChange={handleInputChange} />
            <Input label="Email address" type="email" id="email" placeholder="john@example.com" required onChange={handleInputChange} />
            <Input label="Password" type="password" id="password" placeholder="••••••••" required onChange={handleInputChange} />
            <Input label="Confirm Password" type="password" id="confirmPassword" placeholder="••••••••" required onChange={handleInputChange} />
            
            <div>
              <Button type="submit">Create Account</Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <a href="/sign-in" className="font-medium text-blue-700 hover:text-blue-600">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
