import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors,
  Copy,
  MapPin,
  Calendar,
  ExternalLink,
  Tag } from
'lucide-react';
export const CouponsPreview = ({ onViewAll }) => {
  const navigate = useNavigate();
  const coupons = [
  {
    id: 1,
    business: 'Clearwater Grill & Bar',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    discount: '15% OFF',
    code: 'SUMMER15',
    description: 'Enjoy 15% off your entire bill. Valid for dine-in only.',
    expiry: 'September 30, 2025',
    location: 'Downtown Clearwater'
  },
  {
    id: 2,
    business: 'Beach Boutique',
    logo: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    discount: '$10 OFF',
    code: 'BEACH10',
    description: 'Get $10 off any purchase of $50 or more.',
    expiry: 'August 15, 2025',
    location: 'Clearwater Beach'
  },
  {
    id: 3,
    business: 'Sunshine Auto Repair',
    logo: 'https://images.unsplash.com/photo-1498887960847-2a5e46312788?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    discount: 'FREE',
    code: 'OILCHECK',
    description:
    'Free oil check and tire pressure adjustment with any service.',
    expiry: 'Ongoing',
    location: 'North Clearwater'
  }];

  const handleCouponClick = (id) => {
    navigate('/couponDetail');
  };
  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.
    writeText(code).
    then(() => {
      alert(`Coupon code ${code} copied to clipboard!`);
    }).
    catch((err) => {
      console.error('Failed to copy code: ', err);
    });
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {coupons.map((coupon) =>
      <div
        key={coupon.id}
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleCouponClick(coupon.id)}>

          {/* Header with logo and discount */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                <img
                src={coupon.logo}
                alt={coupon.business}
                className="h-full w-full object-cover" />

              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {coupon.business}
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {coupon.location}
                </div>
              </div>
            </div>
            <div className="bg-yellow-100 text-yellow-800 font-bold text-sm px-2 py-1 rounded-md">
              {coupon.discount}
            </div>
          </div>
          {/* Coupon description */}
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">{coupon.description}</p>
            {/* Coupon code */}
            <div className="flex mb-4">
              <div className="flex-1">
                <input
                type="text"
                value={coupon.code}
                readOnly
                className="w-full border border-gray-300 rounded-l-md py-2 px-3 text-sm bg-gray-50" />

              </div>
              <button
              className="bg-news-primary text-white py-2 px-3 rounded-r-md flex items-center"
              onClick={(e) => handleCopyCode(coupon.code, e)}>

                <Copy className="h-4 w-4" />
              </button>
            </div>
            {/* Expiry and actions */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Expires: {coupon.expiry}
              </div>
              <div className="flex space-x-2">
                <button
                className="text-news-primary flex items-center font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/couponDetail');
                }}>

                  Details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </button>
                <button
                className="text-gray-600 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Coupon saved!');
                }}>

                  <Tag className="h-3.5 w-3.5 mr-1" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Call to action */}
      <div className="md:col-span-3 text-center mt-4">
        <button
          onClick={onViewAll}
          className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">

          <Scissors className="h-4 w-4 mr-2" />
          View All Coupons & Deals
        </button>
      </div>
    </div>);

};