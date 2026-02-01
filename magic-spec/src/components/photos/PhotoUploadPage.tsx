import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Image,
  X,
  ChevronLeft,
  FileText,
  MapPin,
  Tag,
  AlertCircle,
  Check } from
'lucide-react';
import { PageHeader } from '../PageHeader';
import { useLocationDetection } from '../location/LocationDetector';
export const PhotoUploadPage = () => {
  const navigate = useNavigate();
  const { locationData } = useLocationDetection();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [community, setCommunity] = useState(locationData?.city || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // Generate file name from title, description, and community
  const generateFileName = (title, description, community) => {
    // Remove special characters and spaces, convert to lowercase
    const cleanTitle = title.
    toLowerCase().
    replace(/[^a-z0-9]/g, '-').
    substring(0, 30);
    const cleanCommunity = community.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = new Date().getTime();
    return `${cleanCommunity}-${cleanTitle}-${timestamp}`;
  };
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!community.trim()) newErrors.community = 'Community is required';
    if (!selectedFile) newErrors.file = 'Please select an image to upload';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Clear previous errors
    setErrors({});
    // Start upload process
    setIsUploading(true);
    // Generate file name
    const fileName = generateFileName(title, description, community);
    // In a real app, this would upload the file to a server
    // For this demo, we'll simulate an upload delay
    setTimeout(() => {
      setIsUploading(false);
      // Navigate to the photo detail page or gallery
      navigate('/photos');
    }, 2000);
  };
  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  // Cancel upload and go back
  const handleCancel = () => {
    navigate(-1);
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6">

          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Gallery
        </button>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-news-primary p-6">
            <h1 className="text-2xl font-bold text-white">Upload a Photo</h1>
            <p className="text-white text-opacity-80 mt-1">
              Share your community moments with Day.News
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            {/* File upload area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Upload*
              </label>
              {!selectedFile ?
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-news-primary'}`}>

                  <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" />

                  <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center">

                    <Image className="h-12 w-12 text-gray-400 mb-3" />
                    <span className="text-gray-700 font-medium">
                      Click to upload an image
                    </span>
                    <span className="text-gray-500 text-sm mt-1">
                      JPG, PNG or GIF (Max. 10MB)
                    </span>
                  </label>
                  {errors.file &&
                <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.file}
                    </div>
                }
                </div> :

              <div className="relative rounded-lg overflow-hidden">
                  <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover" />

                  <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70">

                    <X className="h-5 w-5" />
                  </button>
                </div>
              }
            </div>
            {/* Title and description */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Title*
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-md border ${errors.title ? 'border-red-300' : 'border-gray-300'} py-2 px-3 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent`}
                  placeholder="Give your photo a descriptive title" />

                {errors.title &&
                <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title}
                  </div>
                }
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full rounded-md border ${errors.description ? 'border-red-300' : 'border-gray-300'} py-2 px-3 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent`}
                  placeholder="Tell the story behind this photo">
                </textarea>
                {errors.description &&
                <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </div>
                }
              </div>
            </div>
            {/* Category and Community */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Category*
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full rounded-md border ${errors.category ? 'border-red-300' : 'border-gray-300'} py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent`}>

                    <option value="">Select a category</option>
                    <option value="Nature">Nature</option>
                    <option value="Events">Events</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Community">Community</option>
                    <option value="Environment">Environment</option>
                    <option value="Sports">Sports</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Arts">Arts & Culture</option>
                    <option value="Business">Business</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {errors.category &&
                <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.category}
                  </div>
                }
              </div>
              <div>
                <label
                  htmlFor="community"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Community*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="community"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className={`w-full rounded-md border ${errors.community ? 'border-red-300' : 'border-gray-300'} py-2 px-3 pl-9 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent`}
                    placeholder="Enter your community name" />

                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {errors.community &&
                <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.community}
                  </div>
                }
              </div>
            </div>
            {/* Privacy settings */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Settings
              </label>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="public"
                  name="privacy"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300" />

                <label htmlFor="public" className="ml-2 text-sm text-gray-700">
                  Public - Everyone can see this photo
                </label>
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="radio"
                  id="private"
                  name="privacy"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300" />

                <label htmlFor="private" className="ml-2 text-sm text-gray-700">
                  Private - Only you can see this photo
                </label>
              </div>
            </div>
            {/* Submit buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">

                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark flex items-center">

                {isUploading ?
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </> :

                <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>);

};