"use client";

import { useEffect, useState } from "react";
import { User, Compass, Clock, Camera, Calendar, Lock } from "lucide-react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import axios from "axios";

interface PhotoUploadButtonProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode; // Define children as ReactNode
}

interface SidebarButtonProps {
  active: boolean;
  icon: React.ElementType; // Type for an icon component, adjust as needed
  label: string;
  onClick: () => void;
}

const SidebarButton = ({
  active,
  icon: Icon,
  label,
  onClick,
}: SidebarButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-4 py-3 text-left transition-colors duration-200 ${
      active ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const PhotoUploadButton = ({ onChange, children }: PhotoUploadButtonProps) => (
  <div className="relative group cursor-pointer">
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="hidden"
      id="photo-upload"
    />
    <label
      htmlFor="photo-upload"
      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
    >
      <Camera className="w-6 h-6 mr-2" />
      {children}
    </label>
  </div>
);

const PersonalDetails = () => {
  const [userDetails, setUserDetails] = useState<null | {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
  }>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setError("You are not authenticated.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8000/auth/user/", {
          headers: { Authorization: `Token ${token}` },
        });

        setUserDetails(response.data);
      } catch (err) {
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const validateName = (firstName: string): string | null => {
    // Check if the field is empty
    if (!firstName.trim()) {
      return "First name is required.";
    }

    // Check for valid characters (letters, spaces, hyphens only)
    const validNameRegex = /^[a-zA-Z\s\-]+$/;
    if (!validNameRegex.test(firstName)) {
      return "First or last name can only contain letters, spaces, or hyphens.";
    }

    // Check length constraints
    if (firstName.length < 2) {
      return "First or last name must be at least 2 characters long.";
    }
    if (firstName.length > 50) {
      return "First or last name must be no more than 50 characters long.";
    }

    // If all validations pass, return null (no error)
    return null;
  };

  function validateEmail(email: string): string | null {
    // Check if the field is empty
    if (!email.trim()) {
      return "Email is required.";
    }

    // Check for a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }

    // If all validations pass, return null (no error)
    return null;
  }

  function validatePhoneNumber(phoneNumber: string): string | null {
    // Check if the field is empty
    if (!phoneNumber.trim()) {
      return "Phone number is required.";
    }

    // Check for valid characters (digits, spaces, or '+')
    const phoneRegex = /^[+\d\s\-()]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      return "Phone number can only contain digits, spaces, '+', '-', or parentheses.";
    }

    // Check length constraints
    const cleanedNumber = phoneNumber.replace(/[\s\-()]/g, ""); // Remove spaces, dashes, and parentheses
    if (cleanedNumber.length < 7) {
      return "Phone number must be at least 7 digits.";
    }
    if (cleanedNumber.length > 15) {
      return "Phone number must be no more than 15 digits.";
    }

    // If all validations pass, return null (no error)
    return null;
  }

  function validateAddress(address: string): string | null {
    // Check if the address is empty
    if (!address.trim()) {
      return "Address is required.";
    }

    // Check length constraints
    if (address.length < 5) {
      return "Address must be at least 5 characters long.";
    }
    if (address.length > 100) {
      return "Address must be no more than 100 characters long.";
    }

    // Check for valid characters (letters, numbers, spaces, and common symbols)
    const validAddressRegex = /^[a-zA-Z0-9\s,.'\-#]+$/;
    if (!validAddressRegex.test(address)) {
      return "Address can only contain letters, numbers, spaces, and common symbols (,.'-#).";
    }

    // If all validations pass, return null (no error)
    return null;
  }

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateName(value);

    if (error !== null) {
      setFirstNameError(error);
    } else {
      setFirstNameError(null);
    }

    if (userDetails) {
      setUserDetails({
        ...userDetails,
        first_name: e.target.value,
      });
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateName(value);

    if (error !== null) {
      setLastNameError(error);
    } else {
      setLastNameError(null);
    }

    if (userDetails) {
      setUserDetails({
        ...userDetails,
        last_name: e.target.value,
      });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateEmail(value);

    if (error !== null) {
      setEmailError(error);
    } else {
      setEmailError(null);
    }

    if (userDetails) {
      setUserDetails({
        ...userDetails,
        email: e.target.value,
      });
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validatePhoneNumber(value);

    if (error !== null) {
      setPhoneNumberError(error);
    } else {
      setPhoneNumberError(null);
    }

    if (userDetails) {
      setUserDetails({
        ...userDetails,
        phone_number: e.target.value,
      });
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateAddress(value);

    if (error !== null) {
      setAddressError(error);
    } else {
      setAddressError(null);
    }

    if (userDetails) {
      setUserDetails({
        ...userDetails,
        address: e.target.value,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setError("You are not authenticated.");
        return;
      }

      await axios.put(
        "http://localhost:8000/auth/user/",
        { userDetails }, // Payload with the updated address
        { headers: { Authorization: `Token ${token}` } }
      );

      alert("User details saved successfully!");
    } catch (err) {
      setError("Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-300 flex items-center">
            First Name
            <Lock className="w-4 h-4 ml-2 text-gray-500" />
          </label>
          <Input
            label=""
            type="text"
            id="first_name"
            placeholder="John"
            value={userDetails?.first_name || ""}
            disabled={true}
            onChange={handleFirstNameChange}
          />
          {firstNameError && (
            <p className="text-red-500 text-sm">{firstNameError}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 flex items-center">
            Last Name
            <Lock className="w-4 h-4 ml-2 text-gray-500" />
          </label>
          <Input
            label=""
            type="text"
            id="last_name"
            placeholder="Doe"
            value={userDetails?.last_name || ""}
            disabled={true}
            onChange={handleLastNameChange}
          />
          {lastNameError && (
            <p className="text-red-500 text-sm">{lastNameError}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 flex items-center">
            Email
            <Lock className="w-4 h-4 ml-2 text-gray-500" />
          </label>
          <Input
            label=""
            type="email"
            id="email"
            placeholder="example@gmail.com"
            value={userDetails?.email || ""}
            disabled={true}
            onChange={handleEmailChange}
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Phone
          </label>
          <Input
            label=""
            type="tel"
            id="phone_number"
            placeholder="+1 (555) 123-4567"
            value={userDetails?.phone_number || ""}
            onChange={handlePhoneNumberChange}
          />
          {phoneNumberError && (
            <p className="text-red-500 text-sm">{phoneNumberError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Address
          </label>
          <Input
            label=""
            type="text"
            id="address"
            placeholder=""
            value={userDetails?.address || ""}
            onChange={handleAddressChange}
          />
          {addressError && (
            <p className="text-red-500 text-sm">{addressError}</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const TravelPreferences = () => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-300">
        Preferred Destinations
      </label>
      <Input
        label=""
        type="text"
        id="travel_preferences"
        placeholder="Beach, Mountains, Cities"
        value=""
        onChange={() => {}}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300">
        Travel Style
      </label>
      <Input
        label=""
        type="text"
        id="preferred_language"
        placeholder="English, Russian, German, etc."
        value=""
        onChange={() => {}}
      />
    </div>
    {/* Will be adding other preferences depending on the app and features */}
  </div>
);

const TripCard = ({
  trip,
}: {
  trip: {
    destination: string;
    date: string;
    image: string;
    description: string;
  };
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={trip.image}
          alt={trip.destination}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-200">
          {trip.destination}
        </h3>
        <div className="flex items-center text-gray-400 text-sm mt-1">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{trip.date}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
        {isExpanded && (
          <div className="mt-2 text-gray-300">{trip.description}</div>
        )}
      </div>
    </div>
  );
};

const TravelHistory = () => {
  const trips = [
    {
      destination: "Paris, France",
      date: "June 2023",
      image: "/placeholder.svg?height=200&width=400",
      description:
        "Explored the Louvre, climbed the Eiffel Tower, and enjoyed authentic French cuisine.",
    },
    {
      destination: "Tokyo, Japan",
      date: "March 2023",
      image: "/placeholder.svg?height=200&width=400",
      description:
        "Visited ancient temples, experienced the bustling Shibuya crossing, and tried local street food.",
    },
    {
      destination: "New York, USA",
      date: "December 2022",
      image: "/placeholder.svg?height=200&width=400",
      description:
        "Broadway shows, Central Park walks, and iconic New York pizza.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {trips.map((trip, index) => (
        <TripCard key={index} trip={trip} />
      ))}
    </div>
  );
};

export default function DarkProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [coverPhoto, setCoverPhoto] = useState(
    "/placeholder.svg?height=300&width=1200"
  );
  const [profilePhoto, setProfilePhoto] = useState(
    "/placeholder.svg?height=150&width=150"
  );

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPhoto(url);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
    }
  };

  return (
    <div className="min-h-screen pt-10 bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <div className="relative">
          <div className="h-64 relative rounded-t-xl bg-green-200 overflow-hidden">
            <Image src={coverPhoto} alt="Cover" fill className="object-cover" />
            <PhotoUploadButton onChange={handleCoverPhotoChange}>
              Change Cover
            </PhotoUploadButton>
          </div>
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-yellow-200 overflow-hidden relative">
                <Image
                  src={profilePhoto}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <PhotoUploadButton onChange={handleProfilePhotoChange}>
                Change Photo
              </PhotoUploadButton>
            </div>
          </div>
        </div>

        <div className="mt-20 bg-gray-800 shadow-xl rounded-xl overflow-hidden flex">
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <nav className="flex flex-col py-4">
              <SidebarButton
                active={activeTab === "personal"}
                icon={User}
                label="Personal Details"
                onClick={() => setActiveTab("personal")}
              />
              <SidebarButton
                active={activeTab === "preferences"}
                icon={Compass}
                label="Travel Preferences"
                onClick={() => setActiveTab("preferences")}
              />
              <SidebarButton
                active={activeTab === "history"}
                icon={Clock}
                label="Travel History"
                onClick={() => setActiveTab("history")}
              />
            </nav>
          </div>
          <div className="flex-1 p-6 text-gray-300">
            {activeTab === "personal" && <PersonalDetails />}
            {activeTab === "preferences" && <TravelPreferences />}
            {activeTab === "history" && <TravelHistory />}
          </div>
        </div>
      </div>
    </div>
  );
}
