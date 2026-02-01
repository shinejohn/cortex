import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, CreditCard, ArrowLeft } from 'lucide-react';
const PremiumEnrollment = () => {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    nameOnCard: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPaymentInfo({
        ...paymentInfo,
        [parent]: {
          ...paymentInfo[parent],
          [child]: value
        }
      });
    } else {
      setPaymentInfo({
        ...paymentInfo,
        [name]: value
      });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Process payment logic would go here
    navigate('/business/premium-success');
  };
  const premiumFeatures = [
  'Priority placement in search results',
  'Featured business badge',
  'Up to 10 high-quality photos',
  'Customer review management',
  'Advanced analytics dashboard',
  'Social media integration',
  'Custom business hours display',
  'Special offers and promotions',
  'Direct messaging with customers',
  'Mobile-optimized business page'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6">

          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 mr-2" />
              <h1 className="text-2xl font-bold">Upgrade to Premium</h1>
            </div>
            <p className="text-center text-yellow-100">
              Get maximum visibility for your business with our premium listing
              package
            </p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Premium Features
                </h2>
                <div className="space-y-3">
                  {premiumFeatures.map((feature, index) =>
                  <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900">
                      $29.99
                    </div>
                    <div className="text-blue-600">per month</div>
                    <div className="text-sm text-blue-500 mt-1">
                      Cancel anytime
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="nameOnCard"
                      value={paymentInfo.nameOnCard}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required />

                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={paymentInfo.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cardCvv"
                        value={paymentInfo.cardCvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />

                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Billing Address
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="billingAddress.street"
                        value={paymentInfo.billingAddress.street}
                        onChange={handleInputChange}
                        placeholder="Street Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="billingAddress.city"
                          value={paymentInfo.billingAddress.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required />

                        <input
                          type="text"
                          name="billingAddress.state"
                          value={paymentInfo.billingAddress.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required />

                      </div>
                      <input
                        type="text"
                        name="billingAddress.zipCode"
                        value={paymentInfo.billingAddress.zipCode}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />

                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-3 px-4 rounded-md hover:bg-yellow-600 font-medium transition-colors">

                    Start Premium Subscription - $29.99/month
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export default PremiumEnrollment;