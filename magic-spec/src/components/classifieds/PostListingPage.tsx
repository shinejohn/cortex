import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  X,
  Info,
  Calendar,
  MapPin,
  CheckCircle } from
'lucide-react';
export const PostListingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    location: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }
    // Create image previews
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages]
    });
  };
  const removeImage = (index) => {
    const newImages = [...formData.images];
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  };
  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.subcategory)
      newErrors.subcategory = 'Subcategory is required';
      if (!formData.price && formData.price !== '0')
      newErrors.price = 'Price is required';
      if (isNaN(Number(formData.price)))
      newErrors.price = 'Price must be a number';
    } else if (currentStep === 2) {
      if (!formData.description)
      newErrors.description = 'Description is required';
      if (formData.description && formData.description.length < 20)
      newErrors.description = 'Description must be at least 20 characters';
      if (!formData.location) newErrors.location = 'Location is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === 3) {
        // If at the last step of the initial form, proceed to community selection
        navigate('/classifieds/select-communities', {
          state: {
            formData
          }
        });
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/classifieds');
    }
  };
  // Category options
  const categories = [
  {
    id: 'forSale',
    name: 'For Sale',
    subcategories: [
    {
      id: 'furniture',
      name: 'Furniture'
    },
    {
      id: 'electronics',
      name: 'Electronics'
    },
    {
      id: 'clothing',
      name: 'Clothing & Accessories'
    },
    {
      id: 'vehicles',
      name: 'Vehicles'
    },
    {
      id: 'toys',
      name: 'Toys & Games'
    },
    {
      id: 'sports',
      name: 'Sports Equipment'
    },
    {
      id: 'other',
      name: 'Other Items'
    }]

  },
  {
    id: 'housing',
    name: 'Housing',
    subcategories: [
    {
      id: 'apartments',
      name: 'Apartments'
    },
    {
      id: 'houses',
      name: 'Houses'
    },
    {
      id: 'rooms',
      name: 'Rooms / Shared'
    },
    {
      id: 'vacation',
      name: 'Vacation Rentals'
    },
    {
      id: 'parking',
      name: 'Parking / Storage'
    },
    {
      id: 'commercial',
      name: 'Commercial Space'
    }]

  },
  {
    id: 'jobs',
    name: 'Jobs',
    subcategories: [
    {
      id: 'fullTime',
      name: 'Full-time'
    },
    {
      id: 'partTime',
      name: 'Part-time'
    },
    {
      id: 'contract',
      name: 'Contract'
    },
    {
      id: 'gigs',
      name: 'Gigs / Freelance'
    },
    {
      id: 'internship',
      name: 'Internship'
    },
    {
      id: 'volunteer',
      name: 'Volunteer'
    }]

  },
  {
    id: 'services',
    name: 'Services',
    subcategories: [
    {
      id: 'landscaping',
      name: 'Landscaping'
    },
    {
      id: 'cleaning',
      name: 'Cleaning'
    },
    {
      id: 'repair',
      name: 'Repair & Maintenance'
    },
    {
      id: 'tutoring',
      name: 'Tutoring & Lessons'
    },
    {
      id: 'wellness',
      name: 'Health & Wellness'
    },
    {
      id: 'professional',
      name: 'Professional Services'
    }]

  },
  {
    id: 'community',
    name: 'Community',
    subcategories: [
    {
      id: 'events',
      name: 'Local Events'
    },
    {
      id: 'groups',
      name: 'Groups & Clubs'
    },
    {
      id: 'volunteers',
      name: 'Volunteers & Causes'
    },
    {
      id: 'lost',
      name: 'Lost & Found'
    },
    {
      id: 'free',
      name: 'Free Items'
    }]

  }];

  // Get subcategories for selected category
  const getSubcategories = () => {
    const selectedCategory = categories.find(
      (cat) => cat.id === formData.category
    );
    return selectedCategory ? selectedCategory.subcategories : [];
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <button
          onClick={handleBack}
          className="flex items-center text-news-primary mb-6 hover:underline"
          aria-label={
          currentStep === 1 ? 'Back to Classifieds' : 'Previous Step'
          }>

          <ArrowLeft className="h-4 w-4 mr-1" />
          {currentStep === 1 ? 'Back to Classifieds' : 'Previous Step'}
        </button>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Post a Classified Ad
          </h1>
          <p className="text-gray-600 mb-6">
            List your items, services, or opportunities in the community
            classifieds
          </p>
          {/* Progress steps */}
          <div className="flex items-center mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-news-primary text-white' : 'bg-gray-200 text-gray-500'}`}>

              1
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-news-primary' : 'bg-gray-200'}`}>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-news-primary text-white' : 'bg-gray-200 text-gray-500'}`}>

              2
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-news-primary' : 'bg-gray-200'}`}>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-news-primary text-white' : 'bg-gray-200 text-gray-500'}`}>

              3
            </div>
          </div>
          {/* Step 1: Basic Information */}
          {currentStep === 1 &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Title*
                  </label>
                  <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                  placeholder="Enter a descriptive title"
                  aria-invalid={errors.title ? 'true' : 'false'}
                  aria-describedby={errors.title ? 'title-error' : undefined} />

                  {errors.title &&
                <p className="mt-1 text-sm text-red-500" id="title-error">
                      {errors.title}
                    </p>
                }
                </div>
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
                  className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                  aria-invalid={errors.category ? 'true' : 'false'}
                  aria-describedby={
                  errors.category ? 'category-error' : undefined
                  }>

                    <option value="">Select a category</option>
                    {categories.map((category) =>
                  <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                  )}
                  </select>
                  {errors.category &&
                <p
                  className="mt-1 text-sm text-red-500"
                  id="category-error">

                      {errors.category}
                    </p>
                }
                </div>
                {formData.category &&
              <div>
                    <label
                  htmlFor="subcategory"
                  className="block text-sm font-medium text-gray-700 mb-1">

                      Subcategory*
                    </label>
                    <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.subcategory ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                  aria-invalid={errors.subcategory ? 'true' : 'false'}
                  aria-describedby={
                  errors.subcategory ? 'subcategory-error' : undefined
                  }>

                      <option value="">Select a subcategory</option>
                      {getSubcategories().map((subcategory) =>
                  <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                  )}
                    </select>
                    {errors.subcategory &&
                <p
                  className="mt-1 text-sm text-red-500"
                  id="subcategory-error">

                        {errors.subcategory}
                      </p>
                }
                  </div>
              }
                <div>
                  <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Price*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full pl-7 pr-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                    placeholder="0.00"
                    aria-invalid={errors.price ? 'true' : 'false'}
                    aria-describedby={
                    errors.price ? 'price-error' : undefined
                    } />

                  </div>
                  {errors.price &&
                <p className="mt-1 text-sm text-red-500" id="price-error">
                      {errors.price}
                    </p>
                }
                  <p className="mt-1 text-xs text-gray-500">
                    Enter 0 for free items or "price on request" items
                  </p>
                </div>
              </div>
            </div>
          }
          {/* Step 2: Description and Location */}
          {currentStep === 2 &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description and Location
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Description*
                  </label>
                  <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                  placeholder="Provide details about what you're offering..."
                  aria-invalid={errors.description ? 'true' : 'false'}
                  aria-describedby={
                  errors.description ? 'description-error' : undefined
                  }>
                </textarea>
                  {errors.description &&
                <p
                  className="mt-1 text-sm text-red-500"
                  id="description-error">

                      {errors.description}
                    </p>
                }
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 20 characters. Include condition, features, and
                    other relevant details.
                  </p>
                </div>
                <div>
                  <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Location*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                    placeholder="Neighborhood, City, or Address"
                    aria-invalid={errors.location ? 'true' : 'false'}
                    aria-describedby={
                    errors.location ? 'location-error' : undefined
                    } />

                  </div>
                  {errors.location &&
                <p
                  className="mt-1 text-sm text-red-500"
                  id="location-error">

                      {errors.location}
                    </p>
                }
                </div>
              </div>
            </div>
          }
          {/* Step 3: Photos */}
          {currentStep === 3 &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add Photos
              </h2>
              <p className="text-gray-600 mb-4">
                Photos help your listing get noticed. You can add up to 5
                images.
              </p>
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.images.map((image, index) =>
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">

                      <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover" />

                      <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    aria-label="Remove image">

                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                )}
                  {formData.images.length < 5 &&
                <label className="aspect-square bg-gray-100 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 border-2 border-dashed border-gray-300">
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Photo</span>
                      <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    multiple
                    aria-label="Upload images" />

                    </label>
                }
                </div>
                <div className="flex items-start text-sm">
                  <Info className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-500">
                    Supported formats: JPG, PNG, GIF. Maximum file size: 5MB per
                    image.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Next: Select Communities & Timeframe
                </h3>
                <p className="text-sm text-blue-700">
                  After completing this step, you'll select the communities
                  where your ad will appear and choose how long it should run.
                </p>
              </div>
            </div>
          }
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              aria-label={
              currentStep === 1 ?
              'Back to Classifieds' :
              'Go back to previous step'
              }>

              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark flex items-center"
              aria-label={
              currentStep === 3 ?
              'Continue to Communities selection' :
              'Proceed to next step'
              }>

              {currentStep === 3 ? 'Continue to Communities' : 'Next Step'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Classified Ad Pricing
          </h3>
          <div className="flex items-start mb-4">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700 font-medium">Base Price: $10/month</p>
              <p className="text-sm text-gray-500">
                Includes listing in up to 3 communities
              </p>
            </div>
          </div>
          <div className="flex items-start mb-4">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700 font-medium">
                Additional Communities: $2/each
              </p>
              <p className="text-sm text-gray-500">
                Extend your reach to more communities
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700 font-medium">
                Minimum Duration: 1 month
              </p>
              <p className="text-sm text-gray-500">
                Longer durations available at discounted rates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};