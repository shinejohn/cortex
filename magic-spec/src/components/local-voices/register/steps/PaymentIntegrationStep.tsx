import React from 'react';
import { DollarSign, AlertCircle, HelpCircle } from 'lucide-react';
interface PaymentIntegrationStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}
export const PaymentIntegrationStep: React.FC<PaymentIntegrationStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Payment Integration
      </h1>
      <p className="text-gray-600 mb-6">
        Set up how your audience can support you directly. All fields are
        optional.
      </p>
      <div className="space-y-6">
        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Why add payment information?</p>
            <p>
              Enabling direct support options allows your audience to tip you
              for your content. You'll receive 100% of tips (minus payment
              processor fees).
            </p>
          </div>
        </div>
        {/* Venmo Handle */}
        <div>
          <label
            htmlFor="venmoHandle"
            className="block text-sm font-medium text-gray-700 mb-1">

            Venmo Handle
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">@</span>
            </div>
            <input
              type="text"
              id="venmoHandle"
              value={formData.venmoHandle}
              onChange={(e) => updateFormData('venmoHandle', e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
              placeholder="username" />

          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter your Venmo username without the @ symbol
          </p>
        </div>
        {/* CashApp Handle */}
        <div>
          <label
            htmlFor="cashappHandle"
            className="block text-sm font-medium text-gray-700 mb-1">

            CashApp Handle
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="text"
              id="cashappHandle"
              value={formData.cashappHandle}
              onChange={(e) => updateFormData('cashappHandle', e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
              placeholder="cashtag" />

          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter your CashApp $cashtag without the $ symbol
          </p>
        </div>
        {/* PayPal Email */}
        <div>
          <label
            htmlFor="paypalEmail"
            className="block text-sm font-medium text-gray-700 mb-1">

            PayPal Email
          </label>
          <input
            type="email"
            id="paypalEmail"
            value={formData.paypalEmail}
            onChange={(e) => updateFormData('paypalEmail', e.target.value)}
            className={`w-full px-4 py-2 border ${errors.paypalEmail ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
            placeholder="you@example.com" />

          {errors.paypalEmail &&
          <p className="mt-1 text-sm text-red-500">{errors.paypalEmail}</p>
          }
          <p className="mt-1 text-xs text-gray-500">
            The email address associated with your PayPal account
          </p>
        </div>
        {/* Enable Tip Jar */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="enableTipJar"
                type="checkbox"
                checked={formData.enableTipJar}
                onChange={(e) =>
                updateFormData('enableTipJar', e.target.checked)
                }
                className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

            </div>
            <div className="ml-3">
              <label
                htmlFor="enableTipJar"
                className="text-sm font-medium text-gray-700 flex items-center">

                Enable Tip Jar
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-500"
                  title="The Tip Jar appears on your profile and episodes, allowing listeners to support you directly">

                  <HelpCircle className="h-4 w-4" />
                </button>
              </label>
              <p className="text-sm text-gray-500">
                Allow listeners to support you with one-time tips through our
                platform
              </p>
            </div>
          </div>
        </div>
        {/* Preview */}
        {(formData.venmoHandle ||
        formData.cashappHandle ||
        formData.paypalEmail ||
        formData.enableTipJar) &&
        <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Support Button Preview
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <button className="w-full bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Support {formData.displayName || 'Creator'}
              </button>
              <div className="mt-3 text-xs text-gray-500 text-center">
                This button will appear on your profile and episode pages
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

};