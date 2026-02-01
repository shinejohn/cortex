import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Heart,
  HelpCircle,
  Mail,
  MessageCircle,
  Send,
  Star,
  ThumbsUp,
  User } from
'lucide-react';
export const CreatorSupportPage = () => {
  const { creator_id } = useParams();
  const navigate = useNavigate();
  const [supportAmount, setSupportAmount] = useState<string>('5');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  // Mock creator data
  const creatorData = {
    id: creator_id,
    name: 'The Clearwater Report',
    image:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    tagline: 'Your weekly deep dive into local politics',
    supporterCount: 437,
    monthlyGoal: 1000,
    currentSupport: 780
  };
  // Support amount options
  const supportOptions = [
  {
    value: '3',
    label: '$3'
  },
  {
    value: '5',
    label: '$5'
  },
  {
    value: '10',
    label: '$10'
  },
  {
    value: '25',
    label: '$25'
  },
  {
    value: 'custom',
    label: 'Custom'
  }];

  // Payment method options
  const paymentOptions = [
  {
    value: 'credit_card',
    label: 'Credit Card',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    value: 'paypal',
    label: 'PayPal',
    icon: <DollarSign className="h-5 w-5" />
  }];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowThankYou(true);
    }, 1500);
  };
  // Calculate progress percentage for the monthly goal
  const progressPercentage = Math.min(
    100,
    creatorData.currentSupport / creatorData.monthlyGoal * 100
  );
  // Handle back button
  const handleBack = () => {
    navigate(`/local-voices/creator/${creator_id}`);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 focus:outline-none focus:text-gray-900"
          aria-label="Go back to creator profile">

          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to {creatorData.name}</span>
        </button>
        {showThankYou ?
        // Thank you screen
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You for Your Support!
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your contribution helps {creatorData.name} continue creating great
              local content.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
              onClick={handleBack}
              className="px-5 py-2.5 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors">

                Return to Creator Profile
              </button>
              <button
              onClick={() => navigate('/local-voices/episodes')}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">

                Discover More Creators
              </button>
            </div>
          </div> :

        // Support form
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Creator info */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center mb-4">
                  <img
                  src={creatorData.image}
                  alt={creatorData.name}
                  className="h-16 w-16 rounded-full object-cover mr-4" />

                  <div>
                    <h2 className="font-bold text-gray-900">
                      {creatorData.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {creatorData.tagline}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Monthly Support Goal</span>
                    <span className="font-medium text-gray-900">
                      ${creatorData.currentSupport} of $
                      {creatorData.monthlyGoal}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                    className="h-full bg-news-primary rounded-full"
                    style={{
                      width: `${progressPercentage}%`
                    }}>
                  </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  <span>{creatorData.supporterCount} supporters</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-news-primary" />
                    Why Support?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your support helps local creators continue producing quality
                    content about our community.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <ThumbsUp className="h-4 w-4 mr-2 text-news-primary flex-shrink-0 mt-0.5" />
                      <span>Support independent local journalism</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-4 w-4 mr-2 text-news-primary flex-shrink-0 mt-0.5" />
                      <span>Get exclusive supporter-only content</span>
                    </li>
                    <li className="flex items-start">
                      <MessageCircle className="h-4 w-4 mr-2 text-news-primary flex-shrink-0 mt-0.5" />
                      <span>Connect directly with creators</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Support form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-6">
                  Support {creatorData.name}
                </h1>
                <form onSubmit={handleSubmit}>
                  {/* Support amount */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Support Amount
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {supportOptions.map((option) =>
                    <button
                      key={option.value}
                      type="button"
                      className={`py-2 px-4 border ${supportAmount === option.value ? 'border-news-primary bg-news-primary bg-opacity-10 text-news-primary' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-news-primary focus:ring-opacity-50`}
                      onClick={() => {
                        setSupportAmount(option.value);
                        if (option.value !== 'custom') {
                          setCustomAmount('');
                        }
                      }}>

                          {option.label}
                        </button>
                    )}
                    </div>
                    {supportAmount === 'custom' &&
                  <div className="mt-3">
                        <label htmlFor="custom-amount" className="sr-only">
                          Custom amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                        type="number"
                        id="custom-amount"
                        name="custom-amount"
                        min="1"
                        step="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-news-primary focus:border-news-primary sm:text-sm"
                        placeholder="Enter amount"
                        required={supportAmount === 'custom'} />

                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              USD
                            </span>
                          </div>
                        </div>
                      </div>
                  }
                  </div>
                  {/* Support message */}
                  <div className="mb-6">
                    <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2">

                      Message (Optional)
                    </label>
                    <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-news-primary focus:border-news-primary sm:text-sm"
                    placeholder="Add a message of support to the creator...">
                  </textarea>
                  </div>
                  {/* Payment method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentOptions.map((option) =>
                    <div
                      key={option.value}
                      className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === option.value ? 'border-news-primary bg-news-primary bg-opacity-5' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setPaymentMethod(option.value)}>

                          <div className="flex items-center">
                            <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === option.value ? 'border-news-primary' : 'border-gray-300'}`}>

                              {paymentMethod === option.value &&
                          <div className="w-3 h-3 rounded-full bg-news-primary"></div>
                          }
                            </div>
                            <div className="flex items-center">
                              {option.icon}
                              <span className="ml-2 font-medium text-gray-700">
                                {option.label}
                              </span>
                            </div>
                          </div>
                        </div>
                    )}
                    </div>
                  </div>
                  {/* Contact information */}
                  <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2">

                        Your Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-news-primary focus:border-news-primary sm:text-sm"
                        placeholder="Your name"
                        required />

                      </div>
                    </div>
                    <div>
                      <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2">

                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-news-primary focus:border-news-primary sm:text-sm"
                        placeholder="you@example.com"
                        required />

                      </div>
                    </div>
                  </div>
                  {/* Submit button */}
                  <div className="flex justify-end">
                    <button
                    type="submit"
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-news-primary hover:bg-news-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}>

                      {isSubmitting ?
                    <>
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
                        </> :

                    <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Support
                        </>
                    }
                    </button>
                  </div>
                </form>
              </div>
              {/* Additional info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p>
                      Your support helps fund local journalism. Contributions
                      are processed securely and can be cancelled at any time
                      from your profile settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

};