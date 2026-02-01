import React, { useState, Component } from 'react';
import { Calendar, MapPin, Ticket, Scissors, Info } from 'lucide-react';
interface WalletCouponProps {
  business: string;
  logo: string;
  title: string;
  discount: string;
  code: string;
  expiryDate: string;
  location: string;
  backgroundColor?: string;
  textColor?: string;
  onSaveToWallet?: () => void;
}
export const WalletCoupon: React.FC<WalletCouponProps> = ({
  business,
  logo,
  title,
  discount,
  code,
  expiryDate,
  location,
  backgroundColor = '#1a1a1a',
  textColor = 'white',
  onSaveToWallet
}) => {
  const [flipped, setFlipped] = useState(false);
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  // Generate a fake barcode
  const generateBarcode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
  };
  return (
    <div className="max-w-sm mx-auto my-8">
      <div
        className={`relative ${flipped ? 'rotate-y-180' : ''} transition-all duration-500 perspective-1000 transform-style-3d h-64 cursor-pointer`}
        onClick={handleFlip}>

        {/* Front of the coupon */}
        <div
          className={`absolute w-full h-full backface-hidden rounded-xl shadow-lg overflow-hidden ${!flipped ? 'z-10' : 'z-0'}`}
          style={{
            backgroundColor,
            color: textColor
          }}>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-white p-1">
                  <img
                    src={logo}
                    alt={business}
                    className="h-full w-full object-contain" />

                </div>
                <div>
                  <h3 className="font-bold text-lg">{business}</h3>
                </div>
              </div>
              <div className="bg-white text-black font-bold text-sm px-2 py-1 rounded-md">
                {discount}
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="flex items-center text-sm mb-2 opacity-80">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Expires: {expiryDate}</span>
            </div>
            <div className="flex items-center text-sm opacity-80">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{location}</span>
            </div>
            <div className="absolute bottom-4 right-4 text-xs opacity-60">
              Tap to flip
            </div>
          </div>
          {/* Serrated edge */}
          <div className="absolute top-0 left-4 right-4 flex justify-between">
            {Array.from({
              length: 20
            }).map((_, i) =>
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full opacity-20" />

            )}
          </div>
        </div>
        {/* Back of the coupon */}
        <div
          className={`absolute w-full h-full backface-hidden rounded-xl shadow-lg overflow-hidden rotate-y-180 ${flipped ? 'z-10' : 'z-0'}`}
          style={{
            backgroundColor,
            color: textColor
          }}>

          <div className="p-6 flex flex-col items-center justify-center h-full">
            <div className="bg-white p-2 rounded-md mb-4">
              <img
                src={generateBarcode()}
                alt="QR Code"
                className="w-32 h-32" />

            </div>
            <div className="text-center mb-4">
              <div className="font-mono text-lg font-bold">{code}</div>
              <div className="text-xs opacity-70">
                Present this code at checkout
              </div>
            </div>
            <button
              className="mt-2 bg-white text-black py-2 px-4 rounded-full text-sm font-medium flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onSaveToWallet && onSaveToWallet();
              }}>

              <Ticket className="h-4 w-4 mr-2" />
              Add to Wallet
            </button>
            <div className="absolute bottom-4 right-4 text-xs opacity-60">
              Tap to flip
            </div>
          </div>
        </div>
      </div>
    </div>);

};