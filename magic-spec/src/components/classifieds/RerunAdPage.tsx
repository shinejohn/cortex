import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Info,
  Clock,
  DollarSign,
  AlertCircle,
  Copy } from
'lucide-react';
export const RerunAdPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adId, formData, selectedCommunities } = location.state || {
    adId: null,
    formData: null,
    selectedCommunities: []
  };
  const [selectedDuration, setSelectedDuration] = useState(1); // Default 1 month
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [editCommunities, setEditCommunities] = useState(false);
  const [currentCommunities, setCurrentCommunities] = useState([]);
  useEffect(() => {
    // If no data was passed, redirect back
    if (!adId || !formData || !selectedCommunities) {
      navigate('/profile');
      return;
    }
    // Initialize with the communities from the original ad
    setCurrentCommunities(selectedCommunities);
  }, [adId, formData, selectedCommunities, navigate]);
  const handleBack = () => {
    navigate('/profile');
  };
  const handleContinue = () => {
    navigate('/classifieds/payment', {
      state: {
        formData,
        selectedCommunities: currentCommunities,
        duration: selectedDuration,
        startDate,
        endDate,
        totalPrice: calculateTotalPrice(),
        isRerun: true,
        originalAdId: adId
      }
    });
  };
  const handleDurationChange = (months) => {
    setSelectedDuration(months);
    // Update end date based on new duration
    const newEndDate = new Date(startDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    setEndDate(newEndDate);
  };
  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    setStartDate(newStartDate);
    // Update end date based on new start date
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + selectedDuration);
    setEndDate(newEndDate);
  };
  const handleEditCommunities = () => {
    navigate('/classifieds/select-communities', {
      state: {
        formData,
        isRerun: true,
        preselectedCommunities: currentCommunities
      }
    });
  };
  // Calculate monthly price
  const calculateMonthlyPrice = () => {
    const basePrice = 10; // $10 for up to 3 communities
    const additionalCommunityPrice = 2; // $2 per additional community
    if (currentCommunities.length <= 3) {
      return basePrice;
    } else {
      return (
        basePrice + (currentCommunities.length - 3) * additionalCommunityPrice);

    }
  };
  // Calculate total price with discounts for longer durations
  const calculateTotalPrice = () => {
    const monthlyPrice = calculateMonthlyPrice();
    // Apply discounts based on duration
    if (selectedDuration === 1) {
      return monthlyPrice;
    } else if (selectedDuration === 3) {
      return monthlyPrice * 3 * 0.9; // 10% discount for 3 months
    } else if (selectedDuration === 6) {
      return monthlyPrice * 6 * 0.85; // 15% discount for 6 months
    } else if (selectedDuration === 12) {
      return monthlyPrice * 12 * 0.75; // 25% discount for 12 months
    }
    return monthlyPrice * selectedDuration;
  };
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
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
  // Discount percentage based on duration
  const getDiscountPercentage = () => {
    if (selectedDuration === 3) return 10;
    if (selectedDuration === 6) return 15;
    if (selectedDuration === 12) return 25;
    return 0;
  };
  // Get tomorrow's date for min attribute
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <button
          onClick={handleBack}
          className="flex items-center text-news-primary mb-6 hover:underline"
          aria-label="Back to profile">

          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </button>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Re-run Your Classified Ad
          </h1>
          <p className="text-gray-600 mb-6">
            Set up a new run for your existing classified ad
          </p>
          {/* Ad summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Ad Summary</h3>
                <p className="text-gray-700 mb-1">
                  <strong>Ad ID:</strong> {adId}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Title:</strong> {formData?.title}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Communities:</strong> {currentCommunities.length}{' '}
                  selected
                </p>
                <p className="text-gray-700">
                  <strong>Base Price:</strong>{' '}
                  {formatCurrency(calculateMonthlyPrice())}/month
                </p>
              </div>
              <button
                onClick={handleEditCommunities}
                className="text-news-primary hover:underline flex items-center text-sm"
                aria-label="Edit communities selection">

                <Copy className="h-4 w-4 mr-1" />
                Edit Communities
              </button>
            </div>
          </div>
          {/* Duration options */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Select Duration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DurationOption
                months={1}
                selected={selectedDuration === 1}
                discount={0}
                monthlyPrice={calculateMonthlyPrice()}
                onClick={() => handleDurationChange(1)} />

              <DurationOption
                months={3}
                selected={selectedDuration === 3}
                discount={10}
                monthlyPrice={calculateMonthlyPrice()}
                onClick={() => handleDurationChange(3)} />

              <DurationOption
                months={6}
                selected={selectedDuration === 6}
                discount={15}
                monthlyPrice={calculateMonthlyPrice()}
                onClick={() => handleDurationChange(6)} />

              <DurationOption
                months={12}
                selected={selectedDuration === 12}
                discount={25}
                monthlyPrice={calculateMonthlyPrice()}
                onClick={() => handleDurationChange(12)} />

            </div>
          </div>
          {/* Start date */}
          <div className="mb-6">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1">

              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="startDate"
                min={getTomorrowDate()}
                value={startDate.toISOString().split('T')[0]}
                onChange={handleStartDateChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary"
                aria-label="Select start date" />

            </div>
            <p className="mt-1 text-xs text-gray-500">
              You can schedule your ad to start today or on a future date.
            </p>
          </div>
          {/* Date range summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-800 font-medium mb-1">
                  Ad Run Period
                </h3>
                <p className="text-sm text-blue-700">
                  Your ad will run from <strong>{formatDate(startDate)}</strong>{' '}
                  to <strong>{formatDate(endDate)}</strong>
                </p>
                {getDiscountPercentage() > 0 &&
                <p className="text-sm text-blue-700 mt-1">
                    You're saving {getDiscountPercentage()}% with your{' '}
                    {selectedDuration}-month plan!
                  </p>
                }
              </div>
            </div>
          </div>
          {/* Price calculation */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Price Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly rate:</span>
                <span className="text-gray-900">
                  {formatCurrency(calculateMonthlyPrice())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="text-gray-900">
                  {selectedDuration} month{selectedDuration > 1 ? 's' : ''}
                </span>
              </div>
              {getDiscountPercentage() > 0 &&
              <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({getDiscountPercentage()}%):</span>
                  <span>
                    -
                    {formatCurrency(
                    calculateMonthlyPrice() *
                    selectedDuration * (
                    getDiscountPercentage() / 100)
                  )}
                  </span>
                </div>
              }
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-100">
                <span className="text-gray-900">Total:</span>
                <span className="text-news-primary">
                  {formatCurrency(calculateTotalPrice())}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              aria-label="Cancel and go back to profile">

              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark flex items-center"
              aria-label="Continue to payment page">

              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>);

};
// Duration option component
const DurationOption = ({
  months,
  selected,
  discount,
  monthlyPrice,
  onClick
}) => {
  const totalPrice = months * monthlyPrice * (1 - discount / 100);
  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${selected ? 'border-news-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}>

      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            {months} Month{months > 1 ? 's' : ''}
          </h4>
          {discount > 0 &&
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mt-1">
              Save {discount}%
            </span>
          }
        </div>
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected ? 'bg-news-primary border-news-primary' : 'border-gray-300'}`}>

          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>
      <div className="mt-2">
        <span className="text-gray-900 font-medium">
          ${totalPrice.toFixed(2)}
        </span>
        {discount > 0 &&
        <span className="text-gray-500 text-sm line-through ml-2">
            ${(months * monthlyPrice).toFixed(2)}
          </span>
        }
      </div>
    </div>);

};