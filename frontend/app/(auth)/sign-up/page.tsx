"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // To handle redirects after registration
import axios, { AxiosError } from "axios"; // Import Axios to make API requests
import { Facebook } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegistrationPage() {
  const [registrationType, setRegistrationType] = useState<
    "email" | "facebook"
  >("email");
  const [error, setError] = useState<string | null>(null); // General error state
  const [passwordError, setPasswordError] = useState<string | null>(null); // Password-specific error
  const router = useRouter(); // For redirecting after successful registration

  // Password requirements (display this below the password field)
  const passwordRequirements =
    "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.";

  // Form fields state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setPasswordError(null); // Clear previous password errors

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    // Check if password meets the requirements
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      // Make POST request to your Django API
      const response = await axios.post(
        "http://localhost:8000/auth/registration/",
        {
          username: formData.email, // Set username as email if that's how you handle it
          email: formData.email,
          password1: formData.password,
          password2: formData.confirmPassword, // Send confirmPassword as password2
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      );

      // Handle successful registration (e.g., redirect to login page)
      console.log(response);
      if (response.status === 201) {
        router.push("/sign-in");
      }
    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data) {
        // Log the full error response from the server
        console.error("Error response from server:", error.response.data);

        const errorData = error.response.data as { detail?: string };
        setError(
          errorData.detail ||
            Object.values(errorData).join(", ") ||
            "Registration failed. Please try again."
        );
      } else {
        setError(
          "An unexpected error occurred. Please check your network connection."
        );
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        const response = await axios.get("http://localhost:8000/auth/status/", {
          headers: { Authorization: `Token ${token}` },
        });
        if (response.data.is_authenticated) {
          router.push("/profile");
        }
      }
    };
    checkAuth();
  }, [router]);

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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <p className="text-red-500 mb-4">{error}</p>}{" "}
          {/* General error displayed at the top */}
          <div className="mb-6">
            <Button
              onClick={() => setRegistrationType("facebook")}
              className="bg-blue-700 hover:bg-blue-700"
            >
              <Facebook className="w-5 h-5 mr-2" />
              Sign up with Facebook
            </Button>
          </div>
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="First Name"
              type="text"
              id="firstName"
              placeholder="John"
              required
              onChange={handleInputChange}
            />
            <Input
              label="Last Name"
              type="text"
              id="lastName"
              placeholder="Doe"
              required
              onChange={handleInputChange}
            />
            <Input
              label="Email address"
              type="email"
              id="email"
              placeholder="john@example.com"
              required
              onChange={handleInputChange}
            />
            {/* Password field with validation message */}
            <Input
              label="Password"
              type="password"
              id="password"
              placeholder="••••••••"
              required
              onChange={handleInputChange}
            />
            <small className="text-gray-500 block">
              {passwordRequirements}
            </small>
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}{" "}
            {/* Display password errors below password field */}
            <Input
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              required
              onChange={handleInputChange}
            />
            <div>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
