import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Check,
  Lock,
  AlertCircle,
  Calendar,
  DollarSign,
  Users } from
'lucide-react';
export const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    formData,
    selectedCommunities,
    duration,
    startDate,
    endDate,
    totalPrice,
    isRerun
  } = location.state || {
    formData: null,
    selectedCommunities: [],
    duration: 1,
    totalPrice: 0,
    isRerun: false
  };
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  useEffect(() => {
    // If no data was passed, redirect back
    if (!formData || !selectedCommunities || selectedCommunities.length === 0) {
      navigate('/postListing');
      return;
    }
  }, [formData, selectedCommunities, navigate]);
  const handleBack = () => {
    navigate(-1);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value.
      replace(/\s/g, '').
      replace(/(\d{4})/g, '$1 ').
      trim();
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
    } else {
      setCardInfo({
        ...cardInfo,
        [name]: value
      });
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (paymentMethod === 'creditCard') {
      if (
      !cardInfo.cardNumber ||
      cardInfo.cardNumber.replace(/\s/g, '').length < 16)
      {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      if (!cardInfo.cardName) {
        newErrors.cardName = 'Please enter the name on card';
      }
      if (!cardInfo.expiryDate || !cardInfo.expiryDate.includes('/')) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }
      if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
    }
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      // Navigate to confirmation page
      navigate('/classifieds/confirmation', {
        state: {
          formData,
          selectedCommunities,
          duration,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalPrice,
          orderId: `CL-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod,
          isRerun
        }
      });
    }, 2000);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <button
          onClick={handleBack}
          className="flex items-center text-news-primary mb-6 hover:underline"
          aria-label="Back to timeframe selection">

          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Timeframe
        </button>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-gray-600 mb-6">
            Complete your payment to publish your classified ad
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payment form - 2 columns */}
            <div className="md:col-span-2 space-y-6">
              {/* Payment methods */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-md cursor-pointer bg-blue-50 border-news-primary">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === 'creditCard'}
                      onChange={() => setPaymentMethod('creditCard')}
                      className="h-4 w-4 text-news-primary focus:ring-news-primary"
                      aria-label="Pay with credit or debit card" />

                    <span className="ml-2 flex-1">Credit or Debit Card</span>
                    <div className="flex space-x-1">
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="h-4 w-4 text-news-primary focus:ring-news-primary"
                      aria-label="Pay with PayPal" />

                    <span className="ml-2 flex-1">PayPal</span>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </label>
                </div>
              </div>
              {/* Credit card form */}
              {paymentMethod === 'creditCard' &&
              <div className="space-y-4">
                  <div>
                    <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Card Number
                    </label>
                    <div className="relative">
                      <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardInfo.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      className={`w-full px-3 py-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                      aria-invalid={errors.cardNumber ? 'true' : 'false'}
                      aria-describedby={
                      errors.cardNumber ? 'cardNumber-error' : undefined
                      } />

                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.cardNumber &&
                  <p
                    className="mt-1 text-sm text-red-500"
                    id="cardNumber-error">

                        {errors.cardNumber}
                      </p>
                  }
                  </div>
                  <div>
                    <label
                    htmlFor="cardName"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Name on Card
                    </label>
                    <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    placeholder="John Smith"
                    value={cardInfo.cardName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                    aria-invalid={errors.cardName ? 'true' : 'false'}
                    aria-describedby={
                    errors.cardName ? 'cardName-error' : undefined
                    } />

                    {errors.cardName &&
                  <p
                    className="mt-1 text-sm text-red-500"
                    id="cardName-error">

                        {errors.cardName}
                      </p>
                  }
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                      htmlFor="expiryDate"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        Expiry Date
                      </label>
                      <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardInfo.expiryDate}
                      onChange={handleInputChange}
                      maxLength={5}
                      className={`w-full px-3 py-2 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                      aria-invalid={errors.expiryDate ? 'true' : 'false'}
                      aria-describedby={
                      errors.expiryDate ? 'expiryDate-error' : undefined
                      } />

                      {errors.expiryDate &&
                    <p
                      className="mt-1 text-sm text-red-500"
                      id="expiryDate-error">

                          {errors.expiryDate}
                        </p>
                    }
                    </div>
                    <div>
                      <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 mb-1">

                        CVV
                      </label>
                      <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={cardInfo.cvv}
                      onChange={handleInputChange}
                      maxLength={4}
                      className={`w-full px-3 py-2 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary`}
                      aria-invalid={errors.cvv ? 'true' : 'false'}
                      aria-describedby={errors.cvv ? 'cvv-error' : undefined} />

                      {errors.cvv &&
                    <p className="mt-1 text-sm text-red-500" id="cvv-error">
                          {errors.cvv}
                        </p>
                    }
                    </div>
                  </div>
                </div>
              }
              {/* PayPal */}
              {paymentMethod === 'paypal' &&
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-gray-700 mb-3">
                    You'll be redirected to PayPal to complete your payment
                    after reviewing your order.
                  </p>
                  <div className="flex items-center justify-center bg-white border border-gray-300 rounded-md p-3">
                    <span className="text-blue-600 font-bold text-xl">Pay</span>
                    <span className="text-blue-800 font-bold text-xl">Pal</span>
                  </div>
                </div>
              }
              {/* Terms and conditions */}
              <div>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={() => {
                      setAgreedToTerms(!agreedToTerms);
                      if (errors.terms) {
                        setErrors({
                          ...errors,
                          terms: null
                        });
                      }
                    }}
                    className="h-5 w-5 mt-0.5 text-news-primary focus:ring-news-primary rounded"
                    aria-invalid={errors.terms ? 'true' : 'false'}
                    aria-describedby={errors.terms ? 'terms-error' : undefined} />

                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="text-news-primary hover:underline">

                      Terms and Conditions
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      className="text-news-primary hover:underline">

                      Privacy Policy
                    </button>
                  </span>
                </label>
                {errors.terms &&
                <p className="mt-1 text-sm text-red-500" id="terms-error">
                    {errors.terms}
                  </p>
                }
              </div>
              {/* Secure payment notice */}
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="h-4 w-4 mr-1 text-gray-400" />
                <span>Payments are secure and encrypted</span>
              </div>
            </div>
            {/* Order summary - 1 column */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ad Title:</span>
                    <span className="text-gray-900 font-medium">
                      {formData?.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Communities:</span>
                    <span className="text-gray-900 font-medium">
                      {selectedCommunities.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-900 font-medium">
                      {duration} month{duration > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Run Period:</span>
                    <span className="text-gray-900 font-medium text-right">
                      {formatDate(startDate)} to
                      <br />
                      {formatDate(endDate)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-news-primary">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className={`w-full py-3 rounded-md font-medium flex items-center justify-center ${processing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-news-primary text-white hover:bg-news-primary-dark'}`}
                  aria-disabled={processing}
                  aria-label="Complete payment">

                  {processing ?
                  <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </> :

                  <>
                      Complete Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};