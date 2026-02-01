import React, { useState } from 'react';
import { DollarSign, X, Coffee, Heart, Star, CreditCard } from 'lucide-react';
interface TipJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorId: string;
  venmoHandle?: string;
  cashappHandle?: string;
  episodeTitle?: string;
  episodeId?: string;
}
const TipJarModal: React.FC<TipJarModalProps> = ({
  isOpen,
  onClose,
  creatorName,
  creatorId,
  venmoHandle,
  cashappHandle,
  episodeTitle,
  episodeId
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [tipMessage, setTipMessage] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
  useState<string>('creditCard');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tipComplete, setTipComplete] = useState<boolean>(false);
  const predefinedAmounts = [3, 5, 10, 25, 50];
  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input with up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };
  // Get final tip amount (either selected or custom)
  const getTipAmount = (): number => {
    if (selectedAmount !== null) return selectedAmount;
    return parseFloat(customAmount) || 0;
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = getTipAmount();
    if (amount <= 0) {
      alert('Please select or enter a valid amount');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to process the payment
      console.log({
        creatorId,
        episodeId,
        amount,
        message: tipMessage,
        paymentMethod: selectedPaymentMethod
      });
      setIsSubmitting(false);
      setTipComplete(true);
    }, 1500);
  };
  // Reset form when closing
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSelectedAmount(5);
      setCustomAmount('');
      setTipMessage('');
      setSelectedPaymentMethod('creditCard');
      setTipComplete(false);
    }, 300);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900">
            {tipComplete ? 'Thank You!' : 'Support Creator'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close">

            <X className="h-6 w-6" />
          </button>
        </div>

        {tipComplete /* Thank You Screen */ ?
        <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-green-500" fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Thank You for Your Support!
            </h3>
            <p className="text-gray-600 mb-6">
              Your tip of ${getTipAmount().toFixed(2)} has been sent to{' '}
              {creatorName}.
              {episodeTitle &&
            ` Your support for "${episodeTitle}" is greatly appreciated.`}
            </p>
            <button
            onClick={handleClose}
            className="w-full py-2.5 bg-news-primary text-white font-medium rounded-lg hover:bg-news-primary-dark">

              Close
            </button>
          </div> /* Tip Form */ :

        <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Creator Info */}
              <div className="text-center mb-6">
                <p className="text-gray-600">Send a tip to</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {creatorName}
                </h3>
                {episodeTitle &&
              <p className="text-sm text-gray-500 mt-1">
                    For episode: "{episodeTitle}"
                  </p>
              }
              </div>

              {/* Amount Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {predefinedAmounts.map((amount) =>
                <button
                  key={amount}
                  type="button"
                  className={`py-2 rounded-md font-medium ${selectedAmount === amount ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}>

                      ${amount}
                    </button>
                )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                  type="text"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-news-primary focus:border-news-primary"
                  aria-label="Custom tip amount" />

                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a Message (Optional)
                </label>
                <textarea
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                placeholder="Share a few words of support..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-news-primary focus:border-news-primary h-24"
                aria-label="Tip message">
              </textarea>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                    type="radio"
                    name="paymentMethod"
                    value="creditCard"
                    checked={selectedPaymentMethod === 'creditCard'}
                    onChange={() => setSelectedPaymentMethod('creditCard')}
                    className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                    <CreditCard className="h-5 w-5 ml-3 mr-2 text-gray-500" />
                    <span className="ml-2 text-gray-700">Credit Card</span>
                  </label>
                  {venmoHandle &&
                <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                    type="radio"
                    name="paymentMethod"
                    value="venmo"
                    checked={selectedPaymentMethod === 'venmo'}
                    onChange={() => setSelectedPaymentMethod('venmo')}
                    className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                      <span className="ml-3 text-[#008CFF] font-bold">
                        Venmo
                      </span>
                      <span className="ml-2 text-gray-700">@{venmoHandle}</span>
                    </label>
                }
                  {cashappHandle &&
                <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                    type="radio"
                    name="paymentMethod"
                    value="cashapp"
                    checked={selectedPaymentMethod === 'cashapp'}
                    onChange={() => setSelectedPaymentMethod('cashapp')}
                    className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                      <span className="ml-3 text-[#00D632] font-bold">
                        Cash App
                      </span>
                      <span className="ml-2 text-gray-700">
                        ${cashappHandle}
                      </span>
                    </label>
                }
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <button
              type="submit"
              disabled={isSubmitting || getTipAmount() <= 0}
              className={`w-full py-2.5 font-medium rounded-lg flex items-center justify-center ${isSubmitting || getTipAmount() <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-news-primary text-white hover:bg-news-primary-dark'}`}>

                {isSubmitting ?
              <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </> :

              <>
                    <DollarSign className="h-5 w-5 mr-2" />
                    Send ${getTipAmount().toFixed(2)} Tip
                  </>
              }
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Your support directly helps {creatorName} create quality
                content.
              </p>
            </div>
          </form>
        }
      </div>
    </div>);

};
export default TipJarModal;