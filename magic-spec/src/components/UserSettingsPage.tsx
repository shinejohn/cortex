import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Save,
  X,
  Camera,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  ArrowLeft,
  Check,
  AlertCircle,
  Home,
  Building } from
'lucide-react';
export const UserSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  // Mock user data - in a real app, this would come from an API or auth context
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(727) 555-1234',
    location: 'Clearwater, FL',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    joinDate: 'January 2023',
    bio: 'Community member interested in local events and news.',
    profileImage:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverImage:
    'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80',
    social: {
      website: 'johndoe.com',
      twitter: '@johndoe',
      facebook: 'johndoe',
      linkedin: 'johndoe'
    },
    notifications: {
      emailNotifications: true,
      textNotifications: true,
      articleComments: true,
      communityUpdates: true,
      eventReminders: true
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showSocial: true,
      showAddress: false
    },
    preferences: {
      language: 'English',
      timeZone: 'Eastern Time (ET)',
      publicProfile: true,
      aiAssistance: true
    }
  });
  const [formData, setFormData] = useState({
    ...userData
  });
  const [profileImagePreview, setProfileImagePreview] = useState(
    userData.profileImage
  );
  const [coverImagePreview, setCoverImagePreview] = useState(
    userData.coverImage
  );
  // Handle form input changes
  const handleInputChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };
  // Handle social media changes
  const handleSocialChange = (e, field) => {
    setFormData({
      ...formData,
      social: {
        ...formData.social,
        [field]: e.target.value
      }
    });
  };
  // Handle notification toggles
  const handleNotificationToggle = (field) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [field]: !formData.notifications[field]
      }
    });
  };
  // Handle privacy toggles
  const handlePrivacyToggle = (field) => {
    setFormData({
      ...formData,
      privacy: {
        ...formData.privacy,
        [field]: !formData.privacy[field]
      }
    });
  };
  // Handle preference toggles
  const handlePreferenceToggle = (field) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [field]: !formData.preferences[field]
      }
    });
  };
  // Handle preference select changes
  const handlePreferenceSelectChange = (e, field) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [field]: e.target.value
      }
    });
  };
  // Handle image uploads
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        // In a real app, you would upload this to a server
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
        // In a real app, you would upload this to a server
      };
      reader.readAsDataURL(file);
    }
  };
  // Handle form submission
  const handleSaveChanges = () => {
    // In a real app, this would make an API call to update the user profile
    setUserData({
      ...formData,
      profileImage: profileImagePreview,
      coverImage: coverImagePreview
    });
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  const handleCancel = () => {
    navigate('/profile');
  };
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/profile')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors">

              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="text-gray-600">
                Manage your profile information and preferences
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">

              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors flex items-center">

              <Save className="h-4 w-4 mr-1.5" />
              Save Changes
            </button>
          </div>
        </div>
        {/* Success Message */}
        {showSuccessMessage &&
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start">
            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Changes saved successfully!</p>
              <p className="text-sm">
                Your profile has been updated with the new information.
              </p>
            </div>
            <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-auto p-1.5 rounded-full hover:bg-green-100">

              <X className="h-4 w-4 text-green-500" />
            </button>
          </div>
        }
        {/* Profile Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-48 bg-gray-200 relative">
            <img
              src={coverImagePreview}
              alt="Cover"
              className="w-full h-full object-cover" />

            <div className="absolute bottom-4 right-4">
              <label className="bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera className="h-5 w-5 text-gray-700" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverImageUpload} />

              </label>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md z-10 relative">
                <img
                  src={profileImagePreview}
                  alt={formData.name}
                  className="w-full h-full object-cover" />

                <div className="absolute bottom-0 right-0">
                  <label className="bg-news-primary text-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-news-primary-dark transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageUpload} />

                  </label>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 md:pb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {formData.name}
                </h2>
                <p className="text-gray-600">{formData.location}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'profile' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'account' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Account Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'notifications' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'privacy' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Privacy
            </button>
          </div>
        </div>
        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' &&
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Personal Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Full Name
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange(e, 'name')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="Your full name" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Email Address
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange(e, 'email')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="Your email address" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Phone Number
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Phone className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange(e, 'phone')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="Your phone number" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="address1"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Address Line 1
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Home className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="text"
                        id="address1"
                        value={formData.address1}
                        onChange={(e) => handleInputChange(e, 'address1')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="Street address" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="address2"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Address Line 2
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Building className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="text"
                        id="address2"
                        value={formData.address2}
                        onChange={(e) => handleInputChange(e, 'address2')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="Apartment, suite, unit, etc." />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        City, State
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <MapPin className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="text"
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange(e, 'location')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="City, State" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Bio
                      </label>
                      <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange(e, 'bio')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-news-primary focus:outline-none"
                      placeholder="Tell us about yourself...">
                    </textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        This information will be displayed publicly on your
                        profile page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column - Social Media */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Social Media
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Website
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Globe className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="url"
                        id="website"
                        value={formData.social.website}
                        onChange={(e) => handleSocialChange(e, 'website')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="yourwebsite.com" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="twitter"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Twitter
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Twitter className="h-5 w-5 text-blue-400" />
                        </div>
                        <input
                        type="text"
                        id="twitter"
                        value={formData.social.twitter}
                        onChange={(e) => handleSocialChange(e, 'twitter')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="@username" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="facebook"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Facebook
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Facebook className="h-5 w-5 text-blue-600" />
                        </div>
                        <input
                        type="text"
                        id="facebook"
                        value={formData.social.facebook}
                        onChange={(e) => handleSocialChange(e, 'facebook')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="username or page name" />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="linkedin"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        LinkedIn
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Linkedin className="h-5 w-5 text-blue-700" />
                        </div>
                        <input
                        type="text"
                        id="linkedin"
                        value={formData.social.linkedin}
                        onChange={(e) => handleSocialChange(e, 'linkedin')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-news-primary focus:outline-none"
                        placeholder="username" />

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          {/* Account Settings Tab */}
          {activeTab === 'account' &&
          <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Security
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Change Password
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Update your password to maintain account security
                        </p>
                      </div>
                      <button
                      onClick={() =>
                      alert('Password change dialog would open here')
                      }
                      className="px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors">

                        Change Password
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                      onClick={() => alert('2FA setup would start here')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">

                        Set Up 2FA
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Login Sessions
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Manage devices where you're currently logged in
                        </p>
                      </div>
                      <button
                      onClick={() =>
                      alert('Session management would open here')
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">

                        Manage Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Preferences
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Language</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Select your preferred language for the platform
                        </p>
                      </div>
                      <select
                      value={formData.preferences.language}
                      onChange={(e) =>
                      handlePreferenceSelectChange(e, 'language')
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-news-primary">

                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Time Zone</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Set your local time zone for accurate event times
                        </p>
                      </div>
                      <select
                      value={formData.preferences.timeZone}
                      onChange={(e) =>
                      handlePreferenceSelectChange(e, 'timeZone')
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-news-primary">

                        <option>Eastern Time (ET)</option>
                        <option>Central Time (CT)</option>
                        <option>Mountain Time (MT)</option>
                        <option>Pacific Time (PT)</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Public Profile
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Allow others to view your profile and activity
                        </p>
                      </div>
                      <button
                      onClick={() => handlePreferenceToggle('publicProfile')}
                      className="relative inline-flex items-center">

                        <span className="sr-only">Toggle public profile</span>
                        <div
                        className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.preferences.publicProfile ? 'bg-news-primary' : 'bg-gray-200'}`}>

                          <span
                          className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.preferences.publicProfile ? 'translate-x-6' : ''}`}>
                        </span>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          AI Content Assistance
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Use AI to help improve your articles and comments
                        </p>
                      </div>
                      <button
                      onClick={() => handlePreferenceToggle('aiAssistance')}
                      className="relative inline-flex items-center">

                        <span className="sr-only">Toggle AI assistance</span>
                        <div
                        className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.preferences.aiAssistance ? 'bg-news-primary' : 'bg-gray-200'}`}>

                          <span
                          className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.preferences.aiAssistance ? 'translate-x-6' : ''}`}>
                        </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Danger Zone
                </h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-red-800">
                        Delete Account
                      </h4>
                      <p className="text-sm text-red-600 mt-1">
                        Permanently delete your account and all your data
                      </p>
                    </div>
                    <button
                    onClick={() =>
                    alert('Account deletion confirmation would appear here')
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">

                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          {/* Notifications Tab */}
          {activeTab === 'notifications' &&
          <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <button
                    onClick={() =>
                    handleNotificationToggle('emailNotifications')
                    }
                    className="relative inline-flex items-center"
                    aria-pressed={formData.notifications.emailNotifications}>

                      <span className="sr-only">
                        Toggle email notifications
                      </span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.notifications.emailNotifications ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.notifications.emailNotifications ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Text Notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Receive notifications via text message
                      </p>
                    </div>
                    <button
                    onClick={() =>
                    handleNotificationToggle('textNotifications')
                    }
                    className="relative inline-flex items-center"
                    aria-pressed={formData.notifications.textNotifications}>

                      <span className="sr-only">Toggle text notifications</span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.notifications.textNotifications ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.notifications.textNotifications ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Article Comments
                      </h4>
                      <p className="text-sm text-gray-600">
                        Notifications when someone comments on articles you
                        follow
                      </p>
                    </div>
                    <button
                    onClick={() =>
                    handleNotificationToggle('articleComments')
                    }
                    className="relative inline-flex items-center"
                    aria-pressed={formData.notifications.articleComments}>

                      <span className="sr-only">
                        Toggle comment notifications
                      </span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.notifications.articleComments ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.notifications.articleComments ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Community Updates
                      </h4>
                      <p className="text-sm text-gray-600">
                        Notifications about important community news and
                        announcements
                      </p>
                    </div>
                    <button
                    onClick={() =>
                    handleNotificationToggle('communityUpdates')
                    }
                    className="relative inline-flex items-center"
                    aria-pressed={formData.notifications.communityUpdates}>

                      <span className="sr-only">
                        Toggle community update notifications
                      </span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.notifications.communityUpdates ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.notifications.communityUpdates ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Event Reminders
                      </h4>
                      <p className="text-sm text-gray-600">
                        Notifications about upcoming events you're interested in
                      </p>
                    </div>
                    <button
                    onClick={() => handleNotificationToggle('eventReminders')}
                    className="relative inline-flex items-center"
                    aria-pressed={formData.notifications.eventReminders}>

                      <span className="sr-only">Toggle event reminders</span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.notifications.eventReminders ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.notifications.eventReminders ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can unsubscribe from all email
                    notifications at any time by clicking the unsubscribe link
                    in any email we send.
                  </p>
                </div>
              </div>
            </div>
          }
          {/* Privacy Tab */}
          {activeTab === 'privacy' &&
          <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Privacy Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Show Email Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        Display your email address on your public profile
                      </p>
                    </div>
                    <button
                    onClick={() => handlePrivacyToggle('showEmail')}
                    className="relative inline-flex items-center"
                    aria-pressed={formData.privacy.showEmail}>

                      <span className="sr-only">Toggle email visibility</span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.privacy.showEmail ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.privacy.showEmail ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Show Phone Number
                      </h4>
                      <p className="text-sm text-gray-600">
                        Display your phone number on your public profile
                      </p>
                    </div>
                    <button
                    onClick={() => handlePrivacyToggle('showPhone')}
                    className="relative inline-flex items-center"
                    aria-pressed={formData.privacy.showPhone}>

                      <span className="sr-only">Toggle phone visibility</span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.privacy.showPhone ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.privacy.showPhone ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Show Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        Display your address on your public profile
                      </p>
                    </div>
                    <button
                    onClick={() => handlePrivacyToggle('showAddress')}
                    className="relative inline-flex items-center"
                    aria-pressed={formData.privacy.showAddress}>

                      <span className="sr-only">Toggle address visibility</span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.privacy.showAddress ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.privacy.showAddress ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Show Location
                      </h4>
                      <p className="text-sm text-gray-600">
                        Display your location on your public profile
                      </p>
                    </div>
                    <button
                    onClick={() => handlePrivacyToggle('showLocation')}
                    className="relative inline-flex items-center"
                    aria-pressed={formData.privacy.showLocation}>

                      <span className="sr-only">
                        Toggle location visibility
                      </span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.privacy.showLocation ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.privacy.showLocation ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Show Social Media
                      </h4>
                      <p className="text-sm text-gray-600">
                        Display your social media profiles on your public
                        profile
                      </p>
                    </div>
                    <button
                    onClick={() => handlePrivacyToggle('showSocial')}
                    className="relative inline-flex items-center"
                    aria-pressed={formData.privacy.showSocial}>

                      <span className="sr-only">
                        Toggle social media visibility
                      </span>
                      <div
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.privacy.showSocial ? 'bg-news-primary' : 'bg-gray-200'}`}>

                        <span
                        className={`absolute top-1 left-1 inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${formData.privacy.showSocial ? 'translate-x-6' : ''}`}>
                      </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Data & Privacy
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Download Your Data
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Get a copy of all the data we have about you
                        </p>
                      </div>
                      <button
                      onClick={() =>
                      alert('Data download request would be processed')
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">

                        Request Data
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Cookie Preferences
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Manage how we use cookies on this site
                        </p>
                      </div>
                      <button
                      onClick={() =>
                      alert('Cookie preferences dialog would open here')
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">

                        Manage Cookies
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

};