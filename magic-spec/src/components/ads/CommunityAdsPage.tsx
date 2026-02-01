import React, { useState } from 'react';
import { CommunityAdsHeader } from './CommunityAdsHeader';
import { AdFormatSelector } from './AdFormatSelector';
import { AdCreationForm } from './AdCreationForm';
import { TargetCommunities, Community } from './TargetCommunities';
import { ScheduleAndBudget } from './ScheduleAndBudget';
import { ReviewAndLaunch } from './ReviewAndLaunch';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Calendar,
  Users,
  DollarSign,
  AlertCircle } from
'lucide-react';
export const CommunityAdsPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [adData, setAdData] = useState({
    title: '',
    image: null,
    bodyText: '',
    callToAction: 'Learn More',
    destinationUrl: ''
  });
  const [selectedCommunities, setSelectedCommunities] = useState<Community[]>(
    []
  );
  const [campaignSubmitted, setCampaignSubmitted] = useState(false);
  const [campaignDuration, setCampaignDuration] = useState(7); // Default 7 days
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 6); // Default to 7 days
    return date;
  });
  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
  };
  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit the campaign
      setCampaignSubmitted(true);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleAdDataChange = (field: string, value: any) => {
    setAdData({
      ...adData,
      [field]: value
    });
  };
  const handleCommunitiesChange = (communities: Community[]) => {
    setSelectedCommunities(communities);
  };
  const handleScheduleChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    // Calculate duration in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setCampaignDuration(diffDays);
  };
  const isNextButtonDisabled = () => {
    if (currentStep === 1) return !selectedFormat;
    if (currentStep === 2) {
      return !adData.title || !adData.bodyText || !adData.destinationUrl;
    }
    if (currentStep === 3) {
      return selectedCommunities.length === 0;
    }
    return false;
  };
  // Calculate total daily cost
  const calculateDailyTotal = (): number => {
    return selectedCommunities.reduce(
      (sum, community) => sum + community.price,
      0
    );
  };
  // Calculate total campaign cost
  const calculateTotalBudget = (): number => {
    return calculateDailyTotal() * campaignDuration;
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CommunityAdsHeader />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Steps indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold`}>

                  {currentStep > 1 ? <Check className="h-5 w-5" /> : 1}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>

                  Format
                </span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div
                  className={`h-full bg-blue-600 ${currentStep >= 2 ? 'w-full' : 'w-0'} transition-all duration-300`}>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold`}>

                  {currentStep > 2 ? <Check className="h-5 w-5" /> : 2}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>

                  Design
                </span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div
                  className={`h-full bg-blue-600 ${currentStep >= 3 ? 'w-full' : 'w-0'} transition-all duration-300`}>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold`}>

                  {currentStep > 3 ? <Check className="h-5 w-5" /> : 3}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>

                  Target
                </span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div
                  className={`h-full bg-blue-600 ${currentStep >= 4 ? 'w-full' : 'w-0'} transition-all duration-300`}>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold`}>

                  {currentStep > 4 ? <Check className="h-5 w-5" /> : 4}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-500'}`}>

                  Schedule
                </span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div
                  className={`h-full bg-blue-600 ${currentStep >= 5 ? 'w-full' : 'w-0'} transition-all duration-300`}>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full ${currentStep >= 5 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold`}>

                  {currentStep > 5 ? <Check className="h-5 w-5" /> : 5}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${currentStep >= 5 ? 'text-blue-600' : 'text-gray-500'}`}>

                  Launch
                </span>
              </div>
            </div>
          </div>

          {/* Main content */}
          {!campaignSubmitted ?
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {currentStep === 1 &&
            <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Select your ad size and format
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Choose the format that best fits your advertising goals and
                    budget
                  </p>
                  <AdFormatSelector
                selectedFormat={selectedFormat}
                onFormatSelect={handleFormatSelect} />

                  <div className="text-sm text-gray-500 mt-6 mb-8 p-4 bg-gray-50 rounded-md">
                    <p>
                      Prices shown are base rates and may vary by community size
                      and engagement levels.
                    </p>
                    <p>
                      Larger communities or those with higher engagement will
                      have premium pricing.
                    </p>
                  </div>
                </>
            }
              {currentStep === 2 &&
            <AdCreationForm
              adFormat={selectedFormat || 'standard'}
              adData={adData}
              onAdDataChange={handleAdDataChange} />

            }
              {currentStep === 3 &&
            <TargetCommunities
              selectedCommunities={selectedCommunities}
              onCommunitiesChange={handleCommunitiesChange} />

            }
              {currentStep === 4 &&
            <ScheduleAndBudget
              selectedCommunities={selectedCommunities}
              onScheduleChange={handleScheduleChange} />

            }
              {currentStep === 5 &&
            <ReviewAndLaunch
              adData={adData}
              adFormat={selectedFormat || 'standard'}
              selectedCommunities={selectedCommunities}
              campaignDuration={campaignDuration}
              startDate={startDate}
              endDate={endDate}
              dailyBudget={calculateDailyTotal()}
              totalBudget={calculateTotalBudget()}
              onEditAd={() => setCurrentStep(2)}
              onEditCommunities={() => setCurrentStep(3)}
              onEditSchedule={() => setCurrentStep(4)} />

            }
              {/* Navigation buttons */}
              {currentStep < 5 &&
            <div className="flex justify-between mt-8">
                  {currentStep > 1 &&
              <button
                onClick={handleBack}
                className="flex items-center px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">

                      <ArrowLeft className="mr-2 h-5 w-5" />
                      <span>Back</span>
                    </button>
              }
                  <div className={currentStep === 1 ? 'ml-auto' : ''}>
                    <button
                  onClick={handleContinue}
                  disabled={isNextButtonDisabled()}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium ${!isNextButtonDisabled() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>

                      <span>Continue</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
            }
            </div> :

          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Campaign Launched Successfully!
              </h1>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Your ad campaign has been submitted and will begin running
                according to your schedule. You can track performance and make
                adjustments from your dashboard.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Campaign Schedule
                  </h3>
                  <p className="text-sm text-gray-500">
                    {campaignDuration} days (starting{' '}
                    {startDate.toLocaleDateString()})
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Target Audience
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedCommunities.length} communities
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Daily Budget
                  </h3>
                  <p className="text-sm text-gray-500">
                    ${calculateDailyTotal()}/day
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start max-w-3xl mx-auto mb-8">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 text-left">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p>
                    Your ad will undergo a brief review (typically within 2
                    hours) to ensure it meets community standards. Once
                    approved, it will begin running according to your schedule.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                  View Campaign Dashboard
                </button>
                <button className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">
                  Create Another Campaign
                </button>
              </div>
            </div>
          }
        </div>
      </main>
    </div>);

};