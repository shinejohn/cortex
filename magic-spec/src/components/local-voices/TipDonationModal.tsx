import React, { useState } from 'react';
import { X, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
interface TipDonationModalProps {
  creatorName: string;
  creatorId: string;
  episodeTitle?: string;
  episodeId?: string;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}
const TipDonationModal: React.FC<TipDonationModalProps> = ({
  creatorName,
  creatorId,
  episodeTitle,
  episodeId,
  onClose,
  onSuccess
}) => {
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<
    'credit_card' | 'venmo' | 'cashapp' | 'paypal'>(
    'credit_card');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment' | 'success'>('amount');
  const [error, setError] = useState<string | null>(null);
  // Mock data - In a real app, this would come from an API
  const suggestedAmounts = [2, 5, 10, 20];
  const creatorPaymentMethods = {
    venmo: '@johndoe',
    cashapp: '$johndoe',
    paypal: 'john.doe@example.com',
    creditCard: true
  };
  const handleAmountSelect = (amount: number) => {
    setTipAmount(amount);
    setCustomAmount('');
    setError(null);
  };
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setCustomAmount(value);
      setTipAmount(null);
      setError(null);
    }
  };
  const handleContinue = () => {
    // Validate amount
    const finalAmount =
    tipAmount || (customAmount ? parseFloat(customAmount) : null);
    if (!finalAmount) {
      setError('Please select or enter a tip amount');
      return;
    }
    if (finalAmount < 1) {
      setError('Minimum tip amount is $1.00');
      return;
    }
    if (finalAmount > 1000) {
      setError('Maximum tip amount is $1,000.00');
      return;
    }
    // Clear error and move to payment step
    setError(null);
    setStep('payment');
  };
  const handleSubmit = () => {
    // Validate payment info
    if (paymentMethod === 'credit_card') {
      if (!name && !isAnonymous) {
        setError('Please enter your name or select anonymous');
        return;
      }
      if (!email) {
        setError('Please enter your email address');
        return;
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    // Clear error and process payment
    setError(null);
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      // Call the success callback with the final amount
      const finalAmount =
      tipAmount || (customAmount ? parseFloat(customAmount) : 0);
      onSuccess(finalAmount);
    }, 1500);
  };
  const getFinalAmount = () => {
    return tipAmount || (customAmount ? parseFloat(customAmount) : 0);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 text-news-primary mr-1" />
            Support {creatorName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500">

            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          {/* Amount Selection Step */}
          {step === 'amount' &&
          <>
              <p className="text-gray-600 mb-4">
                Your support helps {creatorName} create more great content.
                {episodeTitle &&
              <span>
                    {' '}
                    You're supporting the episode:{' '}
                    <strong>{episodeTitle}</strong>
                  </span>
              }
              </p>
              {/* Suggested Amounts */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select an amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {suggestedAmounts.map((amount) =>
                <button
                  key={amount}
                  type="button"
                  className={`py-2 px-4 rounded-md font-medium ${tipAmount === amount ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => handleAmountSelect(amount)}>

                      ${amount}
                    </button>
                )}
                </div>
              </div>
              {/* Custom Amount */}
              <div className="mb-6">
                <label
                htmlFor="customAmount"
                className="block text-sm font-medium text-gray-700 mb-2">

                  Or enter a custom amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                  type="text"
                  id="customAmount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Enter amount"
                  className={`w-full pl-8 pr-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`} />

                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimum: $1.00, Maximum: $1,000.00
                </p>
              </div>
              {/* Error Message */}
              {error &&
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
            }
              {/* Continue Button */}
              <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3 px-4 bg-news-primary text-white font-medium rounded-md hover:bg-news-primary-dark">

                Continue
              </button>
            </>
          }
          {/* Payment Method Step */}
          {step === 'payment' &&
          <>
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tip amount:</span>
                  <span className="text-lg font-bold text-news-primary">
                    ${getFinalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
              {/* Payment Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {creatorPaymentMethods.creditCard &&
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300" />

                      <div className="ml-3 flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700">Credit Card</span>
                      </div>
                    </label>
                }
                  {creatorPaymentMethods.venmo &&
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'venmo'}
                    onChange={() => setPaymentMethod('venmo')}
                    className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300" />

                      <div className="ml-3 flex items-center">
                        <span className="bg-blue-500 text-white font-bold rounded px-1 mr-2">
                          V
                        </span>
                        <span className="text-gray-700">
                          Venmo ({creatorPaymentMethods.venmo})
                        </span>
                      </div>
                    </label>
                }
                  {creatorPaymentMethods.cashapp &&
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cashapp'}
                    onChange={() => setPaymentMethod('cashapp')}
                    className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300" />

                      <div className="ml-3 flex items-center">
                        <span className="bg-green-500 text-white font-bold rounded px-1 mr-2">
                          $
                        </span>
                        <span className="text-gray-700">
                          Cash App ({creatorPaymentMethods.cashapp})
                        </span>
                      </div>
                    </label>
                }
                  {creatorPaymentMethods.paypal &&
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300" />

                      <div className="ml-3 flex items-center">
                        <span className="bg-blue-600 text-white font-bold rounded px-1 mr-2">
                          P
                        </span>
                        <span className="text-gray-700">PayPal</span>
                      </div>
                    </label>
                }
                </div>
              </div>
              {/* Credit Card Form */}
              {paymentMethod === 'credit_card' &&
            <div className="space-y-4 mb-6">
                  {/* Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700">

                        Your Name
                      </label>
                      <label className="flex items-center text-sm text-gray-600">
                        <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary mr-1" />

                        <span>Anonymous</span>
                      </label>
                    </div>
                    <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAnonymous}
                  className={`w-full px-4 py-2 border ${error && !name && !isAnonymous ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary disabled:bg-gray-100 disabled:text-gray-500`}
                  placeholder={isAnonymous ? 'Anonymous' : 'Your name'} />

                    <p className="mt-1 text-xs text-gray-500">
                      This will be shown to the creator with your tip
                    </p>
                  </div>
                  {/* Email */}
                  <div>
                    <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1">

                      Email Address
                    </label>
                    <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 border ${error && (!email || !/^\S+@\S+\.\S+$/.test(email)) ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
                  placeholder="you@example.com" />

                    <p className="mt-1 text-xs text-gray-500">
                      For receipt and confirmation (not shared with creator)
                    </p>
                  </div>
                  {/* Message */}
                  <div>
                    <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1">

                      Message{' '}
                      <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                  placeholder="Add a message of support (visible to creator)">
                </textarea>
                  </div>
                </div>
            }
              {/* External Payment Methods */}
              {paymentMethod !== 'credit_card' &&
            <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    You'll be redirected to{' '}
                    {paymentMethod === 'venmo' ?
                'Venmo' :
                paymentMethod === 'cashapp' ?
                'Cash App' :
                'PayPal'}{' '}
                    to complete your tip.
                  </p>
                  {/* Message */}
                  <div>
                    <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1">

                      Message{' '}
                      <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                  placeholder="Add a message of support">
                </textarea>
                  </div>
                </div>
            }
              {/* Error Message */}
              {error &&
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
            }
              {/* Submit Button */}
              <div className="flex items-center space-x-3">
                <button
                type="button"
                onClick={() => setStep('amount')}
                className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                disabled={isProcessing}>

                  Back
                </button>
                <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 px-4 bg-news-primary text-white font-medium rounded-md hover:bg-news-primary-dark flex items-center justify-center"
                disabled={isProcessing}>

                  {isProcessing ?
                <>
                      <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    </> :

                `Send $${getFinalAmount().toFixed(2)} Tip`
                }
                </button>
              </div>
            </>
          }
          {/* Success Step */}
          {step === 'success' &&
          <div className="text-center py-4">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-6">
                Your tip of ${getFinalAmount().toFixed(2)} to {creatorName} has
                been sent successfully.
              </p>
              <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 bg-news-primary text-white font-medium rounded-md hover:bg-news-primary-dark">

                Close
              </button>
            </div>
          }
        </div>
      </div>
    </div>);

};
export default TipDonationModal;