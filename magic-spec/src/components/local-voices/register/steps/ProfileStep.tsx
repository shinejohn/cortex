import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image } from 'lucide-react';
interface ProfileStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}
export const ProfileStep: React.FC<ProfileStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    formData.profileImage ? URL.createObjectURL(formData.profileImage) : null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    formData.bannerImage ? URL.createObjectURL(formData.bannerImage) : null
  );
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData('profileImage', file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData('bannerImage', file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };
  const removeProfileImage = () => {
    updateFormData('profileImage', null);
    setProfilePreview(null);
    if (profileInputRef.current) {
      profileInputRef.current.value = '';
    }
  };
  const removeBannerImage = () => {
    updateFormData('bannerImage', null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };
  // Category options
  const categories = [
  'News & Politics',
  'Business & Finance',
  'Technology',
  'Health & Wellness',
  'Education',
  'Arts & Culture',
  'Sports',
  'Entertainment',
  'Music',
  'Food & Cooking',
  'Travel',
  'Lifestyle',
  'Science',
  'History',
  'Religion & Spirituality',
  'True Crime',
  'Comedy',
  'Parenting',
  'Hobbies & Interests',
  'Other'];

  // Tag options
  const availableTags = [
  'local-news',
  'interviews',
  'community',
  'politics',
  'government',
  'small-business',
  'education',
  'schools',
  'health',
  'environment',
  'sports',
  'arts',
  'entertainment',
  'food',
  'history',
  'technology',
  'opinion',
  'investigative',
  'analysis',
  'real-estate',
  'crime',
  'transportation',
  'family',
  'events',
  'culture',
  'lifestyle'];

  const toggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) {
      updateFormData(
        'tags',
        formData.tags.filter((t: string) => t !== tag)
      );
    } else {
      updateFormData('tags', [...formData.tags, tag]);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Your Creator Profile
      </h1>
      <div className="space-y-6">
        {/* Display Name */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-1">

            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="displayName"
            value={formData.displayName}
            onChange={(e) => updateFormData('displayName', e.target.value)}
            className={`w-full px-4 py-2 border ${errors.displayName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
            placeholder="The name your audience will know you by" />

          {errors.displayName &&
          <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>
          }
        </div>
        {/* Tagline */}
        <div>
          <label
            htmlFor="tagline"
            className="block text-sm font-medium text-gray-700 mb-1">

            Tagline{' '}
            <span className="text-gray-500 text-xs">
              (optional, max 100 characters)
            </span>
          </label>
          <input
            type="text"
            id="tagline"
            value={formData.tagline}
            onChange={(e) => updateFormData('tagline', e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
            placeholder="A brief description of your content" />

          <p className="mt-1 text-xs text-gray-500 text-right">
            {formData.tagline.length}/100
          </p>
        </div>
        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-1">

            Bio <span className="text-red-500">*</span>
            <span className="text-gray-500 text-xs ml-2">
              (500-2000 characters)
            </span>
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateFormData('bio', e.target.value)}
            rows={6}
            className={`w-full px-4 py-2 border ${errors.bio ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
            placeholder="Tell your audience about yourself, your background, and what kind of content they can expect">
          </textarea>
          <div className="mt-1 flex justify-between items-center">
            <p
              className={`text-xs ${formData.bio.length < 500 || formData.bio.length > 2000 ? 'text-red-500' : 'text-gray-500'}`}>

              {formData.bio.length}/2000
            </p>
            {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
          </div>
        </div>
        {/* Profile Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image <span className="text-red-500">*</span>
          </label>
          <div className="flex items-start space-x-4">
            <div
              className={`relative h-24 w-24 overflow-hidden rounded-full border-2 ${errors.profileImage ? 'border-red-500' : 'border-gray-300'} flex items-center justify-center bg-gray-100`}>

              {profilePreview ?
              <>
                  <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="h-full w-full object-cover" />

                  <button
                  type="button"
                  onClick={removeProfileImage}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">

                    <X className="h-3 w-3" />
                  </button>
                </> :

              <Camera className="h-8 w-8 text-gray-400" />
              }
            </div>
            <div className="flex-1">
              <input
                type="file"
                ref={profileInputRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                className="hidden"
                id="profile-image-upload" />

              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">

                <Upload className="h-4 w-4 mr-2" />
                Upload Profile Image
              </button>
              <p className="mt-1 text-xs text-gray-500">
                Recommended: Square image, at least 400x400px
              </p>
              {errors.profileImage &&
              <p className="mt-1 text-sm text-red-500">
                  {errors.profileImage}
                </p>
              }
            </div>
          </div>
        </div>
        {/* Banner Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image{' '}
            <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <div className="flex flex-col space-y-2">
            <div className="relative h-40 w-full overflow-hidden rounded-lg border-2 border-gray-300 flex items-center justify-center bg-gray-100">
              {bannerPreview ?
              <>
                  <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="h-full w-full object-cover" />

                  <button
                  type="button"
                  onClick={removeBannerImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">

                    <X className="h-4 w-4" />
                  </button>
                </> :

              <div className="flex flex-col items-center text-gray-400">
                  <Image className="h-8 w-8 mb-2" />
                  <span className="text-sm">Banner Image</span>
                </div>
              }
            </div>
            <div>
              <input
                type="file"
                ref={bannerInputRef}
                onChange={handleBannerImageChange}
                accept="image/*"
                className="hidden"
                id="banner-image-upload" />

              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">

                <Upload className="h-4 w-4 mr-2" />
                Upload Banner Image
              </button>
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 1200x400px, will be displayed at the top of your
                profile
              </p>
            </div>
          </div>
        </div>
        {/* Category Selection */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1">

            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => updateFormData('category', e.target.value)}
            className={`w-full px-4 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary bg-white`}>

            <option value="">Select a category</option>
            {categories.map((category) =>
            <option key={category} value={category}>
                {category}
              </option>
            )}
          </select>
          {errors.category &&
          <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          }
        </div>
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags{' '}
            <span className="text-gray-500 text-xs">
              (select all that apply)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) =>
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${formData.tags.includes(tag) ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

                #{tag}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>);

};