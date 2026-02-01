import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Image as ImageIcon,
  Link,
  Info,
  ChevronRight } from
'lucide-react';
export const EventCreatorPage = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    organizationType: 'non-profit',
    capacity: '',
    category: '',
    tags: [],
    image: null,
    website: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [eventPrice, setEventPrice] = useState(0); // 0 for non-profit
  const [currentTag, setCurrentTag] = useState('');
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleOrganizationTypeChange = (type) => {
    setEventData((prev) => ({
      ...prev,
      organizationType: type
    }));
    setEventPrice(type === 'commercial' ? 29 : 0);
  };
  const handleAddTag = () => {
    if (currentTag.trim() && !eventData.tags.includes(currentTag.trim())) {
      setEventData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };
  const handleRemoveTag = (tagToRemove) => {
    setEventData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic
    navigate('/eventDetail');
  };
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an Event</h1>
      <p className="text-gray-600 mb-6">Share your event with the community</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Event Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                required />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                required>
              </textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                    required />

                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={eventData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  required>

                  <option value="">Select a category</option>
                  <option value="community">Community</option>
                  <option value="arts">Arts & Culture</option>
                  <option value="education">Education</option>
                  <option value="sports">Sports & Recreation</option>
                  <option value="business">Business & Networking</option>
                  <option value="charity">Charity & Causes</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="startTime"
                    value={eventData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                    required />

                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="endTime"
                    value={eventData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                    required />

                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleInputChange}
                  placeholder="Address or venue name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  required />

                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Capacity (optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="capacity"
                  value={eventData.capacity}
                  onChange={handleInputChange}
                  placeholder="Leave blank if unlimited"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent" />

                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tags (e.g., family-friendly, outdoor)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                  } />

                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300">

                  Add
                </button>
              </div>
              {eventData.tags.length > 0 &&
              <div className="flex flex-wrap gap-2 mt-2">
                  {eventData.tags.map((tag) =>
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">

                      {tag}
                      <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300">

                        &times;
                      </button>
                    </span>
                )}
                </div>
              }
            </div>
          </div>
        </div>
        {/* Organization Type Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Organization Type
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Type
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="non-profit"
                  name="organization-type"
                  type="radio"
                  checked={eventData.organizationType === 'non-profit'}
                  onChange={() => handleOrganizationTypeChange('non-profit')}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                <label
                  htmlFor="non-profit"
                  className="ml-3 text-sm text-gray-700">

                  Non-profit/Community Organization (Free)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="commercial"
                  name="organization-type"
                  type="radio"
                  checked={eventData.organizationType === 'commercial'}
                  onChange={() => handleOrganizationTypeChange('commercial')}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                <label
                  htmlFor="commercial"
                  className="ml-3 text-sm text-gray-700">

                  Commercial/Ticketed Event ($29)
                </label>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-800 font-medium mb-1">
                  Pricing Information
                </h3>
                <p className="text-sm text-blue-700">
                  Non-profit and community organizations can list events for
                  free. Commercial events and ticketed functions are $29 per
                  listing.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Additional Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Additional Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Image (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-news-primary hover:text-news-primary-dark">

                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only" />

                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Website (optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="website"
                  value={eventData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent" />

                <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={eventData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  required />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone (optional)
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={eventData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent" />

              </div>
            </div>
          </div>
        </div>
        {/* Pricing Summary */}
        {eventData.organizationType === 'commercial' &&
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Pricing Summary
            </h2>
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="flex justify-between">
                <span>Commercial Event Listing</span>
                <span>$29.00</span>
              </div>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${eventPrice.toFixed(2)}</span>
            </div>
          </div>
        }
        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">

            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark flex items-center">

            {eventData.organizationType === 'commercial' ?
            'Continue to Payment' :
            'Create Event'}
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </form>
    </div>);

};