import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  MapPin,
  Users,
  Send,
  Save,
  Image as ImageIcon,
  Upload,
  Info } from
'lucide-react';
export const AnnouncementCreatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    location: '',
    eventDate: '',
    image: null
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit announcement logic would go here
    // For now, just navigate back to the announcements page
    navigate('/announcements');
  };
  const handleCancel = () => {
    navigate('/publish');
  };
  const categories = [
  'Community Event',
  'Public Notice',
  'Emergency Alert',
  'Meeting',
  'Volunteer Opportunity',
  'Road Closure',
  'School Announcement',
  'Other'];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 mb-6 hover:text-gray-900">

          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to options
        </button>
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-lg bg-purple-100 mr-4">
            <Megaphone className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create an Announcement
          </h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Announcement Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a clear, attention-grabbing title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" />

              </div>
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500">

                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) =>
                  <option key={category} value={category}>
                      {category}
                    </option>
                  )}
                </select>
              </div>
              {/* Content */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Announcement Details*
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Provide all the important details about your announcement"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500">
                </textarea>
              </div>
              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Location (if applicable)
                </label>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" />

                </div>
              </div>
              {/* Event Date */}
              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Event Date (if applicable)
                </label>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" />

                </div>
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add an Image (optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Drag and drop an image here, or click to select
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    id="image-upload" />

                  <label
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">

                    Select Image
                  </label>
                </div>
              </div>
              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex">
                <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Your announcement will be reviewed by our team before being
                  published to ensure it meets our community guidelines.
                </p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">

                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center">

                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center">

                <Send className="h-4 w-4 mr-2" />
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>);

};