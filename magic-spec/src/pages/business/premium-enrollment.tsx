import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Check,
  X,
  CreditCard,
  Lock,
  AlertTriangle,
  Info } from
'lucide-react';
const PremiumEnrollment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const businessData = location.state?.businessData || {};
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: {
      street: businessData.contact?.address?.street || '',
      city: businessData.contact?.address?.city || '',
      state: businessData.contact?.address?.state || '',
      zipCode: businessData.contact?.address?.zipCode || '',
      country: businessData.contact?.address?.country || 'USA'
    },
    sameAsBusinessAddress: true,
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'sameAsBusinessAddress') {
        // If checking "same as business address", copy over the business address
        if (checked) {
          setFormData({
            ...formData,
            sameAsBusinessAddress: true,
            billingAddress: {
              street: businessData.contact?.address?.street || '',
              city: businessData.contact?.address?.city || '',
              state: businessData.contact?.address?.state || '',
              zipCode: businessData.contact?.address?.zipCode || '',
              country: businessData.contact?.address?.country || 'USA'
            }
          });
        } else {
          setFormData({
            ...formData,
            sameAsBusinessAddress: false
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else {
      // Handle nested objects
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value
          }
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
  };
  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Add space after every 4 digits
    let formatted = '';
    for (let i = 0; i < digits.length; i += 4) {
      formatted += digits.slice(i, i + 4) + ' ';
    }
    // Trim the trailing space and limit to 19 characters (16 digits + 3 spaces)
    return formatted.trim().slice(0, 19);
  };
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formatted
    });
  };
  const formatExpiryDate = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as MM/YY
    if (digits.length <= 2) {
      return digits;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
  };
  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData({
      ...formData,
      expiryDate: formatted
    });
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.cardName.trim())
    newErrors.cardName = 'Name on card is required';
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    }
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    if (!formData.sameAsBusinessAddress) {
      if (!formData.billingAddress.street.trim())
      newErrors['billingAddress.street'] = 'Street address is required';
      if (!formData.billingAddress.city.trim())
      newErrors['billingAddress.city'] = 'City is required';
      if (!formData.billingAddress.state.trim())
      newErrors['billingAddress.state'] = 'State is required';
      if (!formData.billingAddress.zipCode.trim())
      newErrors['billingAddress.zipCode'] = 'ZIP code is required';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsProcessing(true);
      // In a real app, you would submit the payment information to your payment processor here
      setTimeout(() => {
        setIsProcessing(false);
        // Navigate to success page or business profile
        navigate('/business/premium-success', {
          state: {
            businessName: businessData.name,
            subscriptionDate: new Date().toISOString()
          }
        });
      }, 2000);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6">

          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Business Profile
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                Premium Business Listing
              </h1>
              <p className="text-gray-600 mb-6">
                Complete your payment information to activate your premium
                business listing.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Payment Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="cardName"
                          className="block text-sm font-medium text-gray-700 mb-1">

                          Name on Card*
                        </label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="John Smith" />

                        {errors.cardName &&
                        <p className="mt-1 text-sm text-red-600">
                            {errors.cardName}
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
                            value={formData.cardNumber}
                            onChange={handleCardNumberChange}
                            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19} />

                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Lock className="w-4 h-4 text-gray-400" />
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
                            htmlFor="expiryDate"
                            className="block text-sm font-medium text-gray-700 mb-1">

                            Expiry Date*
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleExpiryDateChange}
                            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="MM/YY"
                            maxLength={5} />

                          {errors.expiryDate &&
                          <p className="mt-1 text-sm text-red-600">
                              {errors.expiryDate}
                            </p>
                          }
                        </div>
                        <div>
                          <label
                            htmlFor="cvv"
                            className="block text-sm font-medium text-gray-700 mb-1">

                            CVV*
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="123"
                              maxLength={4} />

                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          {errors.cvv &&
                          <p className="mt-1 text-sm text-red-600">
                              {errors.cvv}
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Billing Address
                    </h2>
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="sameAsBusinessAddress"
                          checked={formData.sameAsBusinessAddress}
                          onChange={handleChange}
                          className="mr-2" />

                        <span>Same as business address</span>
                      </label>
                    </div>
                    {!formData.sameAsBusinessAddress &&
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
                          value={formData.billingAddress.street}
                          onChange={handleChange}
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
                            value={formData.billingAddress.city}
                            onChange={handleChange}
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
                            value={formData.billingAddress.state}
                            onChange={handleChange}
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
                            value={formData.billingAddress.zipCode}
                            onChange={handleChange}
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
                            value={formData.billingAddress.country}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="USA" />

                          </div>
                        </div>
                      </div>
                    }
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          className={`focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500' : ''}`} />

                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="agreeToTerms"
                          className="font-medium text-gray-700">

                          I agree to the Terms and Conditions
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
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                      <div className="flex">
                        <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          Your premium subscription will be billed at $20/month
                          and will automatically renew. You can cancel anytime
                          from your business dashboard.
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`w-full py-3 px-4 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>

                      {isProcessing ?
                      <span className="flex items-center justify-center">
                          <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">

                            <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4">
                          </circle>
                            <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                          </path>
                          </svg>
                          Processing...
                        </span> :

                      'Subscribe Now - $20/month'
                      }
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-medium mb-2">
                  {businessData.name || 'Your Business'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Premium Business Listing
                </p>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly subscription</span>
                  <span className="font-medium">$20.00</span>
                </div>
              </div>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>$20.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>$20.00</span>
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="font-medium text-gray-900 mb-2">
                  Premium Benefits
                </h3>
                <div className="flex">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Priority placement in search results
                  </span>
                </div>
                <div className="flex">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Upload up to 10 photos (vs. 3 for free listings)
                  </span>
                </div>
                <div className="flex">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Add special offers and promotions
                  </span>
                </div>
                <div className="flex">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Detailed analytics and visitor insights
                  </span>
                </div>
                <div className="flex">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Featured in "Promoted Businesses" section
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export default PremiumEnrollment;