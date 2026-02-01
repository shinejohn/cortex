import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Tag,
  DollarSign,
  Camera,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Lock,
  Calendar,
  CopyCheck,
  User } from
'lucide-react';
const BusinessProfileCreator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    shortDescription: '',
    contact: {
      phone: '',
      email: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    },
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    features: [],
    amenities: [],
    paymentMethods: [],
    priceRange: '$$',
    photos: [],
    isPremium: false
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    nameOnCard: '',
    useSameAddress: true,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      if (grandchild) {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: {
              ...formData[parent][child],
              [grandchild]: value
            }
          }
        });
      } else {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPaymentInfo({
        ...paymentInfo,
        [parent]: {
          ...paymentInfo[parent],
          [child]: value
        }
      });
    } else {
      setPaymentInfo({
        ...paymentInfo,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    // If using same address as business, copy the business address
    if (name === 'useSameAddress' && checked) {
      setPaymentInfo({
        ...paymentInfo,
        billingAddress: {
          street: formData.contact.address.street,
          city: formData.contact.address.city,
          state: formData.contact.address.state,
          zipCode: formData.contact.address.zipCode,
          country: formData.contact.address.country
        }
      });
    }
  };
  const handleCheckboxChange = (e, category) => {
    const { name, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        [category]: [...formData[category], name]
      });
    } else {
      setFormData({
        ...formData,
        [category]: formData[category].filter((item) => item !== name)
      });
    }
  };
  const validateStep = (stepNumber) => {
    const newErrors = {};
    if (stepNumber === 1) {
      if (!formData.name) newErrors.name = 'Business name is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.description)
      newErrors.description = 'Description is required';
      if (!formData.shortDescription)
      newErrors.shortDescription = 'Short description is required';
    }
    if (stepNumber === 2) {
      if (!formData.contact.phone)
      newErrors['contact.phone'] = 'Phone number is required';
      if (!formData.contact.email)
      newErrors['contact.email'] = 'Email is required';
      if (!formData.contact.address.street)
      newErrors['contact.address.street'] = 'Street address is required';
      if (!formData.contact.address.city)
      newErrors['contact.address.city'] = 'City is required';
      if (!formData.contact.address.state)
      newErrors['contact.address.state'] = 'State is required';
      if (!formData.contact.address.zipCode)
      newErrors['contact.address.zipCode'] = 'ZIP code is required';
    }
    if (stepNumber === 5 && formData.isPremium) {
      if (!paymentInfo.cardNumber)
      newErrors['cardNumber'] = 'Card number is required';
      if (!paymentInfo.cardExpiry)
      newErrors['cardExpiry'] = 'Expiration date is required';
      if (!paymentInfo.cardCvv) newErrors['cardCvv'] = 'CVV is required';
      if (!paymentInfo.nameOnCard)
      newErrors['nameOnCard'] = 'Name on card is required';
      if (!paymentInfo.agreeToTerms)
      newErrors['agreeToTerms'] = 'You must agree to the terms and conditions';
      if (!paymentInfo.useSameAddress) {
        if (!paymentInfo.billingAddress.street)
        newErrors['billingAddress.street'] = 'Street address is required';
        if (!paymentInfo.billingAddress.city)
        newErrors['billingAddress.city'] = 'City is required';
        if (!paymentInfo.billingAddress.state)
        newErrors['billingAddress.state'] = 'State is required';
        if (!paymentInfo.billingAddress.zipCode)
        newErrors['billingAddress.zipCode'] = 'ZIP code is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const nextStep = () => {
    if (validateStep(step)) {
      // If we're on step 3 and user didn't select premium, skip payment step
      if (step === 4 && !formData.isPremium) {
        setStep(5);
      } else {
        setStep(step + 1);
      }
      window.scrollTo(0, 0);
    }
  };
  const prevStep = () => {
    // If we're on step 5 and user didn't select premium, go back to step 3
    if (step === 5 && !formData.isPremium) {
      setStep(4);
    } else {
      setStep(step - 1);
    }
    window.scrollTo(0, 0);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.isPremium && !validateStep(5)) {
      return;
    }
    // In a real app, you would submit the data to your backend here
    console.log('Submitting business profile:', formData);
    if (formData.isPremium) {
      console.log('Payment information:', paymentInfo);
    }
    // Show success and redirect to the new business profile
    alert('Business profile created successfully!');
    navigate('/business/1'); // In a real app, navigate to the newly created business
  };
  const categories = [
  'Restaurants & Cafes',
  'Retail & Shopping',
  'Health & Wellness',
  'Professional Services',
  'Home Services',
  'Entertainment & Recreation',
  'Automotive',
  'Education',
  'Financial Services',
  'Other'];

  const features = [
  'Outdoor Seating',
  'Takeout',
  'Delivery',
  'Wheelchair Accessible',
  'Family Friendly',
  'Pet Friendly',
  'Free Parking',
  'Reservations',
  'Vegetarian Options',
  'Vegan Options',
  'Gluten-Free Options',
  'Catering'];

  const amenities = [
  'Free Wi-Fi',
  'Restrooms',
  'Air Conditioning',
  'Heating',
  'TV',
  'Power Outlets',
  'Meeting Rooms',
  'Private Rooms',
  'Smoking Area'];

  const paymentMethods = [
  'Cash',
  'Credit Cards',
  'Debit Cards',
  'Apple Pay',
  'Google Pay',
  'PayPal',
  'Venmo',
  'Checks'];

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((stepNumber) =>
          <div key={stepNumber} className="flex flex-col items-center">
              <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === stepNumber ? 'border-blue-600 bg-blue-600 text-white' : step > stepNumber ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>

                {step > stepNumber ?
              <CheckCircle className="w-5 h-5" /> :

              stepNumber
              }
              </div>
              <div className="text-xs mt-2 text-gray-600">
                {stepNumber === 1 && 'Basic Info'}
                {stepNumber === 2 && 'Contact'}
                {stepNumber === 3 && 'Details'}
                {stepNumber === 4 && 'Photos'}
                {stepNumber === 5 && 'Payment'}
              </div>
            </div>
          )}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded"></div>
          <div
            className="absolute top-0 left-0 h-1 bg-blue-600 rounded transition-all duration-300"
            style={{
              width: `${step / 5 * 100}%`
            }}>
          </div>
        </div>
      </div>);

  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6">

          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Building className="w-6 h-6 mr-2 text-blue-600" />
            Create Your Business Profile
          </h1>
          <p className="text-gray-600 mb-6">
            Complete the form below to add your business to our directory.
          </p>
          {renderStepIndicator()}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 &&
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div>
                  <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Business Name*
                  </label>
                  <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Urban Bites Café" />

                  {errors.name &&
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}>

                    <option value="">Select a category</option>
                    {categories.map((category) =>
                  <option key={category} value={category}>
                        {category}
                      </option>
                  )}
                  </select>
                  {errors.category &&
                <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                }
                </div>
                <div>
                  <label
                  htmlFor="subcategory"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Subcategory
                  </label>
                  <input
                  type="text"
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Café, Italian Restaurant, etc." />

                </div>
                <div>
                  <label
                  htmlFor="shortDescription"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Short Description* (150 characters max)
                  </label>
                  <input
                  type="text"
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={150}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Brief description of your business" />

                  <div className="mt-1 text-xs text-gray-500 flex justify-between">
                    <span>This will appear in search results and listings</span>
                    <span>{formData.shortDescription.length}/150</span>
                  </div>
                  {errors.shortDescription &&
                <p className="mt-1 text-sm text-red-600">
                      {errors.shortDescription}
                    </p>
                }
                </div>
                <div>
                  <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Full Description*
                  </label>
                  <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Detailed description of your business, services, history, etc.">
                </textarea>
                  {errors.description &&
                <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                }
                </div>
                <div>
                  <label
                  htmlFor="priceRange"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Price Range
                  </label>
                  <div className="flex space-x-4">
                    {['$', '$$', '$$$', '$$$$'].map((range) =>
                  <label key={range} className="flex items-center">
                        <input
                      type="radio"
                      name="priceRange"
                      value={range}
                      checked={formData.priceRange === range}
                      onChange={handleChange}
                      className="mr-2" />

                        <span>{range}</span>
                      </label>
                  )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    $ = Inexpensive, $$ = Moderate, $$$ = Expensive, $$$$ = Very
                    Expensive
                  </p>
                </div>
              </div>
            }
            {/* Step 2: Contact Information */}
            {step === 2 &&
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div>
                  <label
                  htmlFor="contact.phone"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Phone Number*
                  </label>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                    type="tel"
                    id="contact.phone"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['contact.phone'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="(555) 123-4567" />

                  </div>
                  {errors['contact.phone'] &&
                <p className="mt-1 text-sm text-red-600">
                      {errors['contact.phone']}
                    </p>
                }
                </div>
                <div>
                  <label
                  htmlFor="contact.email"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Email Address*
                  </label>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                    type="email"
                    id="contact.email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['contact.email'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="info@yourbusiness.com" />

                  </div>
                  {errors['contact.email'] &&
                <p className="mt-1 text-sm text-red-600">
                      {errors['contact.email']}
                    </p>
                }
                </div>
                <div>
                  <label
                  htmlFor="contact.website"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Website
                  </label>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                    type="url"
                    id="contact.website"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.yourbusiness.com" />

                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Business Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label
                      htmlFor="contact.address.street"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Street Address*
                      </label>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                        type="text"
                        id="contact.address.street"
                        name="contact.address.street"
                        value={formData.contact.address.street}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['contact.address.street'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="123 Main Street" />

                      </div>
                      {errors['contact.address.street'] &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors['contact.address.street']}
                        </p>
                    }
                    </div>
                    <div>
                      <label
                      htmlFor="contact.address.city"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        City*
                      </label>
                      <input
                      type="text"
                      id="contact.address.city"
                      name="contact.address.city"
                      value={formData.contact.address.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['contact.address.city'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Clearwater" />

                      {errors['contact.address.city'] &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors['contact.address.city']}
                        </p>
                    }
                    </div>
                    <div>
                      <label
                      htmlFor="contact.address.state"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        State*
                      </label>
                      <input
                      type="text"
                      id="contact.address.state"
                      name="contact.address.state"
                      value={formData.contact.address.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['contact.address.state'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="FL" />

                      {errors['contact.address.state'] &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors['contact.address.state']}
                        </p>
                    }
                    </div>
                    <div>
                      <label
                      htmlFor="contact.address.zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        ZIP Code*
                      </label>
                      <input
                      type="text"
                      id="contact.address.zipCode"
                      name="contact.address.zipCode"
                      value={formData.contact.address.zipCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['contact.address.zipCode'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="33756" />

                      {errors['contact.address.zipCode'] &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors['contact.address.zipCode']}
                        </p>
                    }
                    </div>
                    <div>
                      <label
                      htmlFor="contact.address.country"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Country
                      </label>
                      <input
                      type="text"
                      id="contact.address.country"
                      name="contact.address.country"
                      value={formData.contact.address.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="USA" />

                    </div>
                  </div>
                </div>
              </div>
            }
            {/* Step 3: Business Details */}
            {step === 3 &&
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Business Details
                </h2>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Business Hours
                  </h3>
                  {[
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday'].
                map((day) =>
                <div key={day} className="flex items-center mb-3">
                      <label
                    htmlFor={`hours.${day}`}
                    className="w-28 text-sm font-medium text-gray-700">

                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </label>
                      <div className="flex-1">
                        <input
                      type="text"
                      id={`hours.${day}`}
                      name={`hours.${day}`}
                      value={formData.hours[day]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 9:00 AM - 5:00 PM or Closed" />

                      </div>
                    </div>
                )}
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Features & Amenities
                  </h3>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Features
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {features.map((feature) =>
                    <label key={feature} className="flex items-center">
                          <input
                        type="checkbox"
                        name={feature}
                        checked={formData.features.includes(feature)}
                        onChange={(e) =>
                        handleCheckboxChange(e, 'features')
                        }
                        className="mr-2" />

                          <span className="text-sm">{feature}</span>
                        </label>
                    )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amenities.map((amenity) =>
                    <label key={amenity} className="flex items-center">
                          <input
                        type="checkbox"
                        name={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) =>
                        handleCheckboxChange(e, 'amenities')
                        }
                        className="mr-2" />

                          <span className="text-sm">{amenity}</span>
                        </label>
                    )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Payment Methods
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {paymentMethods.map((method) =>
                    <label key={method} className="flex items-center">
                          <input
                        type="checkbox"
                        name={method}
                        checked={formData.paymentMethods.includes(method)}
                        onChange={(e) =>
                        handleCheckboxChange(e, 'paymentMethods')
                        }
                        className="mr-2" />

                          <span className="text-sm">{method}</span>
                        </label>
                    )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Premium Listing
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">
                          Upgrade to Premium Listing
                        </h4>
                        <p className="text-sm text-blue-700">
                          Get more visibility with a premium business listing
                          for just $20/month. Premium listings appear at the top
                          of search results, include more photos, and allow you
                          to post special offers.
                        </p>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      isPremium: e.target.checked
                    })
                    }
                    className="mr-2" />

                    <span>Yes, I want a premium listing ($20/month)</span>
                  </label>
                  {formData.isPremium &&
                <p className="mt-2 text-sm text-gray-600">
                      You'll be asked to enter payment details in the final
                      step.
                    </p>
                }
                </div>
              </div>
            }
            {/* Step 4: Photos */}
            {step === 4 &&
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Photos
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        Photo Guidelines
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Please upload high-quality photos that showcase your
                        business. Free listings can upload up to 3 photos, while
                        premium listings can upload up to 10. Photos should be
                        at least 800x600 pixels and less than 5MB each.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Upload Photos
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop photos here, or click to select files
                  </p>
                  <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="photo-upload" />

                  <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer">

                    Select Photos
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.isPremium ?
                  'Up to 10 photos (Premium)' :
                  'Up to 3 photos (Free)'}
                  </p>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Selected Photos
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* This would be populated with selected photos in a real app */}
                    <div className="relative bg-gray-100 rounded-lg h-40 flex items-center justify-center text-gray-400">
                      No photos selected
                    </div>
                  </div>
                </div>
              </div>
            }
            {/* Step 5: Payment Information */}
            {step === 5 && formData.isPremium &&
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <CopyCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">
                        Premium Listing Summary
                      </h4>
                      <p className="text-sm text-green-700">
                        You're subscribing to a premium business listing for{' '}
                        {formData.name} at $20/month. Your subscription will
                        begin today and you can cancel anytime from your account
                        settings.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                    Card Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                      htmlFor="nameOnCard"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Name on Card*
                      </label>
                      <input
                      type="text"
                      id="nameOnCard"
                      name="nameOnCard"
                      value={paymentInfo.nameOnCard}
                      onChange={handlePaymentChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.nameOnCard ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="John Smith" />

                      {errors.nameOnCard &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors.nameOnCard}
                        </p>
                    }
                    </div>
                    <div>
                      <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Card Number*
                      </label>
                      <div className="relative">
                        <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="1234 5678 9012 3456" />

                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                          <div className="w-8 h-5 bg-blue-600 rounded"></div>
                          <div className="w-8 h-5 bg-yellow-500 rounded"></div>
                          <div className="w-8 h-5 bg-red-500 rounded"></div>
                        </div>
                      </div>
                      {errors.cardNumber &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors.cardNumber}
                        </p>
                    }
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                        htmlFor="cardExpiry"
                        className="block text-sm font-medium text-gray-700 mb-1">

                          Expiration Date*
                        </label>
                        <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        value={paymentInfo.cardExpiry}
                        onChange={handlePaymentChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="MM/YY" />

                        {errors.cardExpiry &&
                      <p className="mt-1 text-sm text-red-600">
                            {errors.cardExpiry}
                          </p>
                      }
                      </div>
                      <div>
                        <label
                        htmlFor="cardCvv"
                        className="block text-sm font-medium text-gray-700 mb-1">

                          CVV*
                        </label>
                        <div className="relative">
                          <input
                          type="text"
                          id="cardCvv"
                          name="cardCvv"
                          value={paymentInfo.cardCvv}
                          onChange={handlePaymentChange}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.cardCvv ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="123" />

                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        {errors.cardCvv &&
                      <p className="mt-1 text-sm text-red-600">
                            {errors.cardCvv}
                          </p>
                      }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                    Billing Address
                  </h3>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                      type="checkbox"
                      name="useSameAddress"
                      checked={paymentInfo.useSameAddress}
                      onChange={handlePaymentChange}
                      className="mr-2" />

                      <span className="text-sm">Same as business address</span>
                    </label>
                  </div>
                  {!paymentInfo.useSameAddress &&
                <div className="space-y-4">
                      <div>
                        <label
                      htmlFor="billingAddress.street"
                      className="block text-sm font-medium text-gray-700 mb-1">

                          Street Address*
                        </label>
                        <input
                      type="text"
                      id="billingAddress.street"
                      name="billingAddress.street"
                      value={paymentInfo.billingAddress.street}
                      onChange={handlePaymentChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['billingAddress.street'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="123 Main Street" />

                        {errors['billingAddress.street'] &&
                    <p className="mt-1 text-sm text-red-600">
                            {errors['billingAddress.street']}
                          </p>
                    }
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                        htmlFor="billingAddress.city"
                        className="block text-sm font-medium text-gray-700 mb-1">

                            City*
                          </label>
                          <input
                        type="text"
                        id="billingAddress.city"
                        name="billingAddress.city"
                        value={paymentInfo.billingAddress.city}
                        onChange={handlePaymentChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['billingAddress.city'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Clearwater" />

                          {errors['billingAddress.city'] &&
                      <p className="mt-1 text-sm text-red-600">
                              {errors['billingAddress.city']}
                            </p>
                      }
                        </div>
                        <div>
                          <label
                        htmlFor="billingAddress.state"
                        className="block text-sm font-medium text-gray-700 mb-1">

                            State*
                          </label>
                          <input
                        type="text"
                        id="billingAddress.state"
                        name="billingAddress.state"
                        value={paymentInfo.billingAddress.state}
                        onChange={handlePaymentChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['billingAddress.state'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="FL" />

                          {errors['billingAddress.state'] &&
                      <p className="mt-1 text-sm text-red-600">
                              {errors['billingAddress.state']}
                            </p>
                      }
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                        htmlFor="billingAddress.zipCode"
                        className="block text-sm font-medium text-gray-700 mb-1">

                            ZIP Code*
                          </label>
                          <input
                        type="text"
                        id="billingAddress.zipCode"
                        name="billingAddress.zipCode"
                        value={paymentInfo.billingAddress.zipCode}
                        onChange={handlePaymentChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors['billingAddress.zipCode'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="33756" />

                          {errors['billingAddress.zipCode'] &&
                      <p className="mt-1 text-sm text-red-600">
                              {errors['billingAddress.zipCode']}
                            </p>
                      }
                        </div>
                        <div>
                          <label
                        htmlFor="billingAddress.country"
                        className="block text-sm font-medium text-gray-700 mb-1">

                            Country
                          </label>
                          <input
                        type="text"
                        id="billingAddress.country"
                        name="billingAddress.country"
                        value={paymentInfo.billingAddress.country}
                        onChange={handlePaymentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="USA" />

                        </div>
                      </div>
                    </div>
                }
                </div>
                <div className="mt-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={paymentInfo.agreeToTerms}
                      onChange={handlePaymentChange}
                      className={`focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500' : ''}`} />

                    </div>
                    <div className="ml-3 text-sm">
                      <label
                      htmlFor="agreeToTerms"
                      className="font-medium text-gray-700">

                        I agree to the terms and conditions*
                      </label>
                      <p className="text-gray-500">
                        By checking this box, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                        . You also authorize us to charge your card $20/month
                        until you cancel.
                      </p>
                      {errors.agreeToTerms &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors.agreeToTerms}
                        </p>
                    }
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Monthly subscription:</span>
                    <span className="font-medium">$20.00</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">$1.60</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                    <span className="font-medium">Total (monthly):</span>
                    <span className="text-lg font-bold text-blue-600">
                      $21.60
                    </span>
                  </div>
                </div>
              </div>
            }
            {/* Step 5 (non-premium): Confirmation */}
            {step === 5 && !formData.isPremium &&
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Review & Submit
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">
                        Almost Done!
                      </h4>
                      <p className="text-sm text-green-700">
                        Please review your business information before
                        submitting. You can edit your listing anytime from your
                        user profile after it's published.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 text-blue-600 mr-2" />
                    Business Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Business Name
                        </h4>
                        <p className="text-gray-900">{formData.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Category
                        </h4>
                        <p className="text-gray-900">
                          {formData.category}{' '}
                          {formData.subcategory && `- ${formData.subcategory}`}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Description
                      </h4>
                      <p className="text-gray-900">
                        {formData.shortDescription}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Contact Information
                        </h4>
                        <div className="text-gray-900 space-y-1">
                          <p className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {formData.contact.phone}
                          </p>
                          <p className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {formData.contact.email}
                          </p>
                          {formData.contact.website &&
                        <p className="flex items-center">
                              <Globe className="w-4 h-4 mr-2 text-gray-400" />
                              {formData.contact.website}
                            </p>
                        }
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Address
                        </h4>
                        <p className="text-gray-900">
                          {formData.contact.address.street},{' '}
                          {formData.contact.address.city},{' '}
                          {formData.contact.address.state}{' '}
                          {formData.contact.address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Listing Type
                  </h3>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="mr-4 bg-gray-200 rounded-full p-3">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Free Listing</h4>
                      <p className="text-sm text-gray-600">
                        Your business will be listed in our directory with basic
                        information.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={paymentInfo.agreeToTerms}
                      onChange={handlePaymentChange}
                      className={`focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500' : ''}`} />

                    </div>
                    <div className="ml-3 text-sm">
                      <label
                      htmlFor="agreeToTerms"
                      className="font-medium text-gray-700">

                        I agree to the terms and conditions*
                      </label>
                      <p className="text-gray-500">
                        By checking this box, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </p>
                      {errors.agreeToTerms &&
                    <p className="mt-1 text-sm text-red-600">
                          {errors.agreeToTerms}
                        </p>
                    }
                    </div>
                  </div>
                </div>
              </div>
            }
            {/* Navigation buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
              {
              step > 1 ?
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">

                    Previous
                  </button> :

              <div></div>
              // Empty div to maintain spacing with flex justify-between
              }
              {step < 5 ?
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">

                  Next
                  <ArrowRight className="ml-1 w-4 h-4" />
                </button> :

              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">

                  {formData.isPremium ?
                'Submit & Process Payment' :
                'Submit Business Profile'}
                </button>
              }
            </div>
          </form>
        </div>
      </div>
    </div>);

};
export default BusinessProfileCreator;