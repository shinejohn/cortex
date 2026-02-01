import React from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
interface PlanSelectionStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}
export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const toggleBillingCycle = () => {
    updateFormData(
      'billingCycle',
      formData.billingCycle === 'monthly' ? 'annual' : 'monthly'
    );
  };
  const selectPlan = (plan: string) => {
    updateFormData('selectedPlan', plan);
  };
  // Calculate price based on billing cycle
  const getPrice = (monthlyPrice: number) => {
    return formData.billingCycle === 'monthly' ?
    monthlyPrice.toFixed(2) :
    (monthlyPrice * 10).toFixed(2);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Choose Your Plan
      </h1>
      <p className="text-gray-600 mb-6">
        Select the plan that best fits your content creation needs.
      </p>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-8">
        <span
          className={`mr-3 text-sm font-medium ${formData.billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>

          Monthly
        </span>
        <button
          onClick={toggleBillingCycle}
          className="relative inline-flex h-6 w-11 items-center rounded-full"
          aria-pressed={formData.billingCycle === 'annual'}
          type="button">

          <span className="sr-only">Toggle billing cycle</span>
          <span
            className={`inline-block h-6 w-11 rounded-full transition ${formData.billingCycle === 'annual' ? 'bg-news-primary' : 'bg-gray-300'}`} />

          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'}`} />

        </button>
        <span
          className={`ml-3 text-sm font-medium ${formData.billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>

          Annual{' '}
          <span className="text-green-600 font-semibold">(Save 17%)</span>
        </span>
      </div>
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 - Local Creator */}
        <div
          className={`bg-white rounded-xl overflow-hidden border ${formData.selectedPlan === 'local' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'} hover:shadow-md transition-shadow flex flex-col cursor-pointer`}
          onClick={() => selectPlan('local')}>

          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="text-sm font-medium text-blue-600 mb-2">
              Perfect for getting started
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Local Creator
            </h2>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ${getPrice(19.99)}
              </span>
              <span className="text-gray-500 ml-1">
                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            <button
              type="button"
              className={`w-full ${formData.selectedPlan === 'local' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium py-2 rounded-lg transition-colors`}>

              {formData.selectedPlan === 'local' ? 'Selected' : 'Select Plan'}
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  5,000 downloads/month included
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">2 shows/podcasts</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">10 hours storage</span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500">Video podcast support</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Card 2 - Professional Broadcaster */}
        <div
          className={`bg-white rounded-xl overflow-hidden border-2 ${formData.selectedPlan === 'professional' ? 'border-news-primary ring-2 ring-news-primary' : 'border-news-primary'} hover:shadow-md transition-shadow flex flex-col cursor-pointer relative transform md:scale-105 z-10`}
          onClick={() => selectPlan('professional')}>

          <div className="absolute top-0 right-0 bg-news-primary text-white text-xs font-bold px-3 py-1 uppercase">
            Recommended
          </div>
          <div className="p-6 border-b border-gray-200 bg-indigo-50">
            <div className="text-sm font-medium text-indigo-600 mb-2">
              For serious content creators
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Professional Broadcaster
            </h2>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ${getPrice(39.99)}
              </span>
              <span className="text-gray-500 ml-1">
                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            <button
              type="button"
              className={`w-full ${formData.selectedPlan === 'professional' ? 'bg-news-primary-dark hover:bg-news-primary-dark' : 'bg-news-primary hover:bg-news-primary-dark'} text-white font-medium py-2 rounded-lg transition-colors`}>

              {formData.selectedPlan === 'professional' ?
              'Selected' :
              'Select Plan'}
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  25,000 downloads/month included
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">5 shows/podcasts</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">50 hours storage</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Video podcast support (1080p)
                </span>
              </li>
            </ul>
          </div>
        </div>
        {/* Card 3 - County Broadcaster */}
        <div
          className={`bg-white rounded-xl overflow-hidden border ${formData.selectedPlan === 'county' ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-200'} hover:shadow-md transition-shadow flex flex-col cursor-pointer`}
          onClick={() => selectPlan('county')}>

          <div className="p-6 border-b border-gray-200 bg-purple-50">
            <div className="text-sm font-medium text-purple-600 mb-2">
              Maximum local impact
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              County Broadcaster
            </h2>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ${getPrice(69)}
              </span>
              <span className="text-gray-500 ml-1">
                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            <button
              type="button"
              className={`w-full ${formData.selectedPlan === 'county' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium py-2 rounded-lg transition-colors`}>

              {formData.selectedPlan === 'county' ? 'Selected' : 'Select Plan'}
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  50,000 downloads/month included
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">10 shows/podcasts</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">100 hours storage</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Live streaming capability</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Plan Details */}
      <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">
            {formData.selectedPlan === 'local' && 'Local Creator'}
            {formData.selectedPlan === 'professional' &&
            'Professional Broadcaster'}
            {formData.selectedPlan === 'county' && 'County Broadcaster'} Plan
          </h3>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ${formData.selectedPlan === 'local' && getPrice(19.99)}$
              {formData.selectedPlan === 'professional' && getPrice(39.99)}$
              {formData.selectedPlan === 'county' && getPrice(69)}
              <span className="text-sm font-normal text-gray-500">
                /{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            {formData.billingCycle === 'annual' &&
            <div className="text-xs text-green-600">
                Save 17% with annual billing
              </div>
            }
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-500 text-center">
        You can change your plan at any time from your account settings.
      </p>
    </div>);

};