import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle } from
'lucide-react';
import { useLocationDetection } from '../location/LocationDetector';
export const UserRegistrationPage = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeTerms: false,
    agreeMarketing: false
  });
  const [errors, setErrors] = useState({});
  const { locationData } = useLocationDetection();
  const navigate = useNavigate();
  const city = locationData?.city || 'Clearwater';
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
    newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // In a real app, you would send the form data to your backend
      console.log('Form submitted:', formData);
      // Navigate to home or profile page after successful registration
      navigate('/');
    }
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-md mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/image.png"
              alt="Logo"
              className="h-12 w-12 rounded-full" />

          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join {city} Day News
          </h1>
          <p className="text-gray-600">
            Get unlimited access to local news, events, and community updates
          </p>
        </div>
        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  First Name
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
                    placeholder="John" />

                  {errors.firstName &&
                  <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  }
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Last Name
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
                    placeholder="Doe" />

                  {errors.lastName &&
                  <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  }
                </div>
              </div>
            </div>
            {/* Email Field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1">

                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pl-10 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
                  placeholder="you@example.com" />

                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {errors.email &&
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                }
              </div>
            </div>
            {/* Password Field */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1">

                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pl-10 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
                  placeholder="Create a password" />

                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}>

                  {showPassword ?
                  <EyeOff className="h-5 w-5" /> :

                  <Eye className="h-5 w-5" />
                  }
                </button>
                {errors.password &&
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                }
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Password must be at least 8 characters long
              </p>
            </div>
            {/* Checkboxes */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="agreeTerms"
                    className="font-medium text-gray-700">

                    I agree to the{' '}
                    <a href="#" className="text-news-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-news-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                  {errors.agreeTerms &&
                  <p className="text-red-500 text-xs mt-1">
                      {errors.agreeTerms}
                    </p>
                  }
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeMarketing"
                    name="agreeMarketing"
                    type="checkbox"
                    checked={formData.agreeMarketing}
                    onChange={handleChange}
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="agreeMarketing"
                    className="font-medium text-gray-700">

                    I agree to receive news updates and promotional materials
                  </label>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-news-primary text-white py-3 px-4 rounded-md font-medium hover:bg-news-primary-dark transition-colors">

              Create Account
            </button>
          </form>
        </div>
        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              className="text-news-primary font-medium hover:underline"
              onClick={() => navigate('/login')}>

              Sign in
            </button>
          </p>
        </div>
        {/* Subscription Benefits */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Subscription Benefits
          </h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Unlimited Access</h3>
                <p className="text-sm text-gray-600">
                  Read all articles and news without restrictions
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Exclusive Content</h3>
                <p className="text-sm text-gray-600">
                  Access subscriber-only articles and features
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">
                  Community Features
                </h3>
                <p className="text-sm text-gray-600">
                  Post announcements, classifieds, and participate in
                  discussions
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">
                  Ad-Free Experience
                </h3>
                <p className="text-sm text-gray-600">
                  Enjoy browsing without advertisements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};