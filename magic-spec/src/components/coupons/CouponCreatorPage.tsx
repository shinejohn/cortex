import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ticket,
  Calendar,
  Building,
  MapPin,
  Tag,
  Percent,
  Image as ImageIcon,
  Upload,
  Save,
  Send,
  Info } from
'lucide-react';
export const CouponCreatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessName: '',
    location: '',
    discount: '',
    discountType: 'percentage',
    startDate: '',
    endDate: '',
    terms: '',
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
    // Submit coupon logic would go here
    // For now, just navigate back to the coupons page
    navigate('/coupons');
  };
  const handleCancel = () => {
    navigate('/publish');
  };
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
          <div className="p-3 rounded-lg bg-orange-100 mr-4">
            <Ticket className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create a Coupon</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Coupon Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Coupon Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g., '20% Off All Purchases' or 'Free Appetizer with Entrée'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />

              </div>
              {/* Business Name */}
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Business Name*
                </label>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your business name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />

                </div>
              </div>
              {/* Discount Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="discount"
                    className="block text-sm font-medium text-gray-700 mb-1">

                    Discount Amount*
                  </label>
                  <div className="flex items-center">
                    <Percent className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      id="discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      required
                      placeholder="E.g., 20 or 15.99"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />

                  </div>
                </div>
                <div>
                  <label
                    htmlFor="discountType"
                    className="block text-sm font-medium text-gray-700 mb-1">

                    Discount Type*
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">

                    <option value="percentage">Percentage (%)</option>
                    <option value="fixedAmount">Fixed Amount ($)</option>
                    <option value="buyOneGetOne">Buy One Get One</option>
                    <option value="freeItem">Free Item</option>
                  </select>
                </div>
              </div>
              {/* Validity Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1">

                    Valid From*
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />

                  </div>
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-1">

                    Valid Until*
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />

                  </div>
                </div>
              </div>
              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Coupon Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Describe what the coupon offers and any highlights"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                </textarea>
              </div>
              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Business Location*
                </label>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter business address"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />

                </div>
              </div>
              {/* Terms and Conditions */}
              <div>
                <label
                  htmlFor="terms"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Terms & Conditions
                </label>
                <textarea
                  id="terms"
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="E.g., 'Cannot be combined with other offers. Valid for dine-in only.'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                </textarea>
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Business Logo or Coupon Image
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
                  Your coupon will be reviewed before being published. Make sure
                  all information is accurate and the terms are clearly stated.
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
                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center">

                <Send className="h-4 w-4 mr-2" />
                Publish Coupon
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>);

};