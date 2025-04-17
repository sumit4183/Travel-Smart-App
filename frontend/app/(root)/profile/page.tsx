"use client";

import { useEffect, useState } from "react";
import { User, Compass, Clock, Camera, Calendar, Lock } from "lucide-react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import axios from "axios";

interface PhotoUploadProps {
  currentImage: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  altText: string;
  id: string;
  className?: string;
  overlayText: string;
}

interface SidebarButtonProps {
  active: boolean;
  icon: React.ElementType; // Type for an icon component, adjust as needed
  label: string;
  onClick: () => void;
}

interface Preferences {
  destinationType: string;
  transportation: string;
  airline: string;
  seatingClass: string;
  meal: string;
  activities: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const ProfilePage: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated.");
        return;
      }
      try {
        const response = await axios.get(
          "http://localhost:8000/api/user/profile/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        setEmail(response.data.email);
      } catch (err) {
        setError("Failed to fetch user data.");
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-6">Profile Page</h1>
      {email ? (
        <DarkProfilePage userEmail={email} />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

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

const PhotoUpload = ({
  currentImage,
  onImageChange,
  altText,
  id,
  className = "",
  overlayText,
}: PhotoUploadProps) => {
  return (
    <div className={`relative group ${className}`}>
      <img
        src={currentImage}
        alt={altText}
        className="w-full h-full object-cover"
      />
      <label
        htmlFor={id}
        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <div className="flex flex-col items-center text-white">
          <Camera className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">{overlayText}</span>
        </div>
      </label>
      <input
        type="file"
        id={id}
        onChange={onImageChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const usePersistedImage = (
  key: string,
  defaultImage: string,
  userEmail: string
) => {
  const userSpecificKey = `${userEmail}:${key}`;
  const [image, setImage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(userSpecificKey);
      return saved || defaultImage;
    }
    return defaultImage;
  });

  useEffect(() => {
    if (image !== defaultImage) {
      localStorage.setItem(userSpecificKey, image);
    }
  }, [image, userSpecificKey, defaultImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await fileToBase64(file);
        setImage(base64String);
      } catch (error) {
        console.error("Error converting image:", error);
      }
    }
  };

  // Add cleanup function to reset state when user changes
  useEffect(() => {
    return () => {
      setImage(defaultImage);
    };
  }, [userEmail, defaultImage]);

  return [image, handleImageChange] as const;
};

const ProfilePhotoUpload = ({
  defaultImage,
  userEmail,
}: {
  defaultImage: string;
  userEmail: string;
}) => {
  const [image, handleImageChange] = usePersistedImage(
    "profilePhoto",
    defaultImage,
    userEmail
  );
  return (
    <PhotoUpload
      currentImage={image}
      onImageChange={handleImageChange}
      altText="Profile photo"
      id="profile-photo-upload"
      className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden"
      overlayText="Change Profile Photo"
    />
  );
};

const CoverPhotoUpload = ({
  defaultImage,
  userEmail,
}: {
  defaultImage: string;
  userEmail: string;
}) => {
  const [image, handleImageChange] = usePersistedImage(
    "coverPhoto",
    defaultImage,
    userEmail
  );
  return (
    <PhotoUpload
      currentImage={image}
      onImageChange={handleImageChange}
      altText="Cover photo"
      id="cover-photo-upload"
      className="h-64 rounded-t-xl overflow-hidden"
      overlayText="Change Cover Photo"
    />
  );
};

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
      return "First and last name are required.";
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

    // Perform final validation checks
    const firstNameError = validateName(userDetails?.first_name || "");
    const lastNameError = validateName(userDetails?.last_name || "");
    const emailError = validateEmail(userDetails?.email || "");
    const phoneNumberError = validatePhoneNumber(
      userDetails?.phone_number || ""
    );
    const addressError = validateAddress(userDetails?.address || "");

    // If any validation fails, do not proceed with saving
    if (
      firstNameError ||
      lastNameError ||
      emailError ||
      phoneNumberError ||
      addressError
    ) {
      alert("Validation failed! Please check your inputs and try again.");
      setIsSaving(false);
      return;
    }

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
      setError("Failed to save changes.");
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
          className={`py-1 px-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const TravelPreferences = ({ userEmail }: { userEmail: string }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    destinationType: "",
    transportation: "",
    airline: "",
    seatingClass: "",
    meal: "",
    activities: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/travel-preferences/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setPreferences(response.data);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        "http://localhost:8000/api/travel-preferences/",
        preferences,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="travel-preferences">
      <h2>Travel Preferences</h2>

      {isEditing ? (
        <div>
          <Input
            label="Destination Type"
            type="text"
            id="destinationType"
            placeholder="e.g., Beach, Mountains"
            value={preferences.destinationType}
            onChange={handleChange}
          />
          <Input
            label="Transportation"
            type="text"
            id="transportation"
            placeholder="e.g., Car, Plane"
            value={preferences.transportation}
            onChange={handleChange}
          />
          <Input
            label="Airline"
            type="text"
            id="airline"
            placeholder="e.g., Delta, Southwest"
            value={preferences.airline}
            onChange={handleChange}
          />
          <Input
            label="Seating Class"
            type="text"
            id="seatingClass"
            placeholder="e.g., Economy, Business"
            value={preferences.seatingClass}
            onChange={handleChange}
          />
          <Input
            label="Meal"
            type="text"
            id="meal"
            placeholder="e.g., Vegetarian, Gluten-Free"
            value={preferences.meal}
            onChange={handleChange}
          />
          <Input
            label="Activities"
            type="text"
            id="activities"
            placeholder="e.g., Hiking, Sightseeing"
            value={preferences.activities}
            onChange={handleChange}
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <ul className="list-disc pl-5">
            <li>
              <strong>Destination Type:</strong> {preferences.destinationType}
            </li>
            <li>
              <strong>Transportation:</strong> {preferences.transportation}
            </li>
            <li>
              <strong>Airline:</strong> {preferences.airline}
            </li>
            <li>
              <strong>Seating Class:</strong> {preferences.seatingClass}
            </li>
            <li>
              <strong>Meal:</strong> {preferences.meal}
            </li>
            <li>
              <strong>Activities:</strong> {preferences.activities}
            </li>
          </ul>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

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
const UpcomingTrips = () => {
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const userResponse = await axios.get(
          "http://localhost:8000/auth/user/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        const tripResponse = await axios.post(
          "http://localhost:8000/flights/upcoming_trips/",
          {
            user: userResponse.data,
          }
        );
        setUpcomingTrips(tripResponse.data.upcomingTrips);
      } catch (error) {
        console.error("Error fetching upcoming trips:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Upcoming Trips</h2>
      {loading ? (
        <p>Loading...</p>
      ) : upcomingTrips.length === 0 ? (
        <p>No upcoming trips.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Departure</th>
              <th className="border p-2">Arrival</th>
              <th className="border p-2">Departure Date</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Booking Ref</th>
            </tr>
          </thead>
          <tbody>
            {upcomingTrips.map((trip, index) => (
              <tr key={index} className="hover:bg-gray-200">
                <td className="border p-2">{trip.departure}</td>
                <td className="border p-2">{trip.arrival}</td>
                <td className="border p-2">{trip.departure_date}</td>
                <td className="border p-2">
                  {trip.price} {trip.currency}
                </td>
                <td className="border p-2">{trip.booking_reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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

export default function DarkProfilePage({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="min-h-screen pt-10 bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <div className="relative">
          <CoverPhotoUpload
            defaultImage="/placeholder.svg?height=300&width=1200"
            userEmail={userEmail}
          />
          <div className="absolute -bottom-16 left-8">
            <ProfilePhotoUpload
              defaultImage="/placeholder.svg?height=150&width=150"
              userEmail={userEmail}
            />
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
              <SidebarButton
                active={activeTab === "upcomingTrips"}
                icon={Clock}
                label="Upcoming Trips"
                onClick={() => setActiveTab("upcomingTrips")}
              />
            </nav>
          </div>
          <div className="flex-1 p-6 text-gray-300">
            {activeTab === "personal" && <PersonalDetails />}
            {activeTab === "preferences" && (
              <TravelPreferences userEmail={userEmail} />
            )}
            {activeTab === "history" && <TravelHistory />}
            {activeTab === "upcomingTrips" && <UpcomingTrips />}
          </div>
        </div>
      </div>
    </div>
  );
}
