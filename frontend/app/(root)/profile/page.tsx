"use client"

import { useState } from 'react'
import { User, Compass, Clock, Camera, Calendar, Lock } from 'lucide-react'
import Image from 'next/image'
import Input from '@/components/ui/Input';

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

const SidebarButton = ({ active, icon: Icon, label, onClick }: SidebarButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-4 py-3 text-left transition-colors duration-200 ${
      active ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
)

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
)

const PersonalDetails = () => (
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
          placeholder=""
          value="John"
          disabled={true}
          onChange={()=>{}}
        />
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
          placeholder=""
          value="Doe"
          disabled={true}
          onChange={()=>{}}
        />
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
          placeholder=""
          value="example@gmail.com"
          disabled={true}
          onChange={()=>{}}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Phone</label>
        <Input
          label=""
          type="tel"
          id="last_name"
          placeholder=""
          value="+1 (555) 123-4567"
          onChange={()=>{}}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Address</label>
        <Input
          label=""
          type="text"
          id="last_name"
          placeholder=""
          value=""
          onChange={()=>{}}
        />
      </div>
    </div>
  </div>
)

const TravelPreferences = () => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-300">Preferred Destinations</label>
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
      <label className="block text-sm font-medium text-gray-300">Travel Style</label>
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
)

const TripCard = ({ trip }: { trip: { destination: string; date: string; image: string; description: string } }) => {
  const [isExpanded, setIsExpanded] = useState(false)

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
        <h3 className="font-semibold text-lg text-gray-200">{trip.destination}</h3>
        <div className="flex items-center text-gray-400 text-sm mt-1">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{trip.date}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
        {isExpanded && (
          <div className="mt-2 text-gray-300">
            {trip.description}
          </div>
        )}
      </div>
    </div>
  )
}

const TravelHistory = () => {
  const trips = [
    {
      destination: 'Paris, France',
      date: 'June 2023',
      image: '/placeholder.svg?height=200&width=400',
      description: 'Explored the Louvre, climbed the Eiffel Tower, and enjoyed authentic French cuisine.'
    },
    {
      destination: 'Tokyo, Japan',
      date: 'March 2023',
      image: '/placeholder.svg?height=200&width=400',
      description: 'Visited ancient temples, experienced the bustling Shibuya crossing, and tried local street food.'
    },
    {
      destination: 'New York, USA',
      date: 'December 2022',
      image: '/placeholder.svg?height=200&width=400',
      description: 'Broadway shows, Central Park walks, and iconic New York pizza.'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {trips.map((trip, index) => (
        <TripCard key={index} trip={trip} />
      ))}
    </div>
  )
}

export default function DarkProfilePage() {
  const [activeTab, setActiveTab] = useState('personal')
  const [coverPhoto, setCoverPhoto] = useState('/placeholder.svg?height=300&width=1200')
  const [profilePhoto, setProfilePhoto] = useState('/placeholder.svg?height=150&width=150')

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCoverPhoto(url)
    }
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfilePhoto(url)
    }
  }

  return (
    <div className="min-h-screen pt-10 bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <div className="relative">
          <div className="h-64 relative rounded-t-xl bg-green-200 overflow-hidden">
            <Image
              src={coverPhoto}
              alt="Cover"
              fill
              className="object-cover"
            />
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
                active={activeTab === 'personal'}
                icon={User}
                label="Personal Details"
                onClick={() => setActiveTab('personal')}
              />
              <SidebarButton
                active={activeTab === 'preferences'}
                icon={Compass}
                label="Travel Preferences"
                onClick={() => setActiveTab('preferences')}
              />
              <SidebarButton
                active={activeTab === 'history'}
                icon={Clock}
                label="Travel History"
                onClick={() => setActiveTab('history')}
              />
            </nav>
          </div>
          <div className="flex-1 p-6 text-gray-300">
            {activeTab === 'personal' && <PersonalDetails />}
            {activeTab === 'preferences' && <TravelPreferences />}
            {activeTab === 'history' && <TravelHistory />}
          </div>
        </div>
      </div>
    </div>
  )
}