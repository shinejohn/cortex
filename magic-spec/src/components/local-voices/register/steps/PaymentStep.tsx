import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
interface PaymentStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
}
export const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  updateFormData,
  errors,
  onSubmit
}) => {
  // Get plan name and price based on selection
  const getPlanDetails = () => {
    switch (formData.selectedPlan) {
      case 'local':
        return {
          name: 'Local Creator',
          monthlyPrice: 19.99,
          color: 'blue'
        };
      case 'professional':
        return {
          name: 'Professional Broadcaster',
          monthlyPrice: 39.99,
          color: 'indigo'
        };
      case 'county':
        return {
          name: 'County Broadcaster',
          monthlyPrice: 69,
          color: 'purple'
        };
      default:
        return {
          name: 'Professional Broadcaster',
          monthlyPrice: 39.99,
          color: 'indigo'
        };
    }
  };
  const planDetails = getPlanDetails();
  // Calculate price based on billing cycle
  const calculatePrice = () => {
    return formData.billingCycle === 'monthly' ?
    planDetails.monthlyPrice :
    planDetails.monthlyPrice * 10;
  };
  const price = calculatePrice();
  // Mock credit card input handling
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return (
      value.
      replace(/\s/g, '').
      match(/.{1,4}/g)?.
      join(' ').
      substr(0, 19) || '');

  };
  // Format expiry date
  const formatExpiry = (value: string) => {
    return value.
    replace(/\D/g, '').
    replace(/^(\d{2})(\d)/, '$1/$2').
    substr(0, 5);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Complete Your Registration
      </h1>
      <p className="text-gray-600 mb-6">
        Enter your payment details to start your creator journey.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Payment Form - Left Column */}
        <div className="md:col-span-3 space-y-6">
          {/* Secure Payment Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-start">
            <Lock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>
                Your payment information is encrypted and never stored on our
                servers. We use Stripe for secure payment processing.
              </p>
            </div>
          </div>
          {/* Credit Card Form */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Payment Information
            </h3>
            <div className="space-y-4">
              {/* Card Number */}
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
                    name="number"
                    value={formatCardNumber(cardDetails.number)}
                    onChange={(e) => {
                      const formattedValue = e.target.value.replace(/\s/g, '');
                      if (/^\d*$/.test(formattedValue)) {
                        handleCardChange({
                          ...e,
                          target: {
                            ...e.target,
                            value: formattedValue
                          }
                        });
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                    maxLength={19} />

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              {/* Expiry Date and CVC */}
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
                    name="expiry"
                    value={formatExpiry(cardDetails.expiry)}
                    onChange={(e) => {
                      handleCardChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: e.target.value.replace(/[^\d/]/g, '')
                        }
                      });
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                    maxLength={5} />

                </div>
                <div>
                  <label
                    htmlFor="cvc"
                    className="block text-sm font-medium text-gray-700 mb-1">

                    CVC
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    value={cardDetails.cvc}
                    onChange={(e) => {
                      if (
                      /^\d*$/.test(e.target.value) &&
                      e.target.value.length <= 4)
                      {
                        handleCardChange(e);
                      }
                    }}
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                    maxLength={4} />

                </div>
              </div>
              {/* Cardholder Name */}
              <div>
                <label
                  htmlFor="cardholderName"
                  className="block text-sm font-medium text-gray-700 mb-1">

                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardholderName"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleCardChange}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary" />

              </div>
            </div>
          </div>
          {/* Terms of Service */}
          <div className="pt-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) =>
                  updateFormData('acceptTerms', e.target.checked)
                  }
                  className={`h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary ${errors.acceptTerms ? 'border-red-500' : ''}`} />

              </div>
              <div className="ml-3">
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-news-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-news-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
                {errors.acceptTerms &&
                <p className="mt-1 text-sm text-red-500">
                    {errors.acceptTerms}
                  </p>
                }
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={onSubmit}
              className="w-full bg-news-primary hover:bg-news-primary-dark text-white font-medium py-3 rounded-lg transition-colors">

              Complete Registration
            </button>
            <p className="mt-3 text-xs text-gray-500 text-center">
              By clicking "Complete Registration", you authorize Day.News to
              charge your card for the selected plan.
            </p>
          </div>
        </div>
        {/* Order Summary - Right Column */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-4">
              {/* Plan Details */}
              <div
                className={`p-4 rounded-md bg-${planDetails.color}-50 border border-${planDetails.color}-100`}>

                <div className="font-medium text-gray-900">
                  {planDetails.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formData.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}{' '}
                  Plan
                </div>
              </div>
              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${price.toFixed(2)}</span>
                </div>
                {formData.billingCycle === 'annual' &&
                <div className="flex justify-between mb-2 text-green-600">
                    <span>Annual discount</span>
                    <span>-$${(planDetails.monthlyPrice * 2).toFixed(2)}</span>
                  </div>
                }
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formData.billingCycle === 'monthly' ?
                  'Billed monthly' :
                  'Billed annually'}
                </div>
              </div>
              {/* Money-back Guarantee */}
              <div className="flex items-start mt-4 pt-4 border-t border-gray-200">
                <AlertCircle className="h-5 w-5 text-news-primary mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  30-day money-back guarantee. If you're not satisfied, contact
                  us for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};