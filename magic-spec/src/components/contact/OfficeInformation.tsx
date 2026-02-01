import React from 'react';
import { MapPin, Clock, Car, Accessibility, Coffee, Wifi } from 'lucide-react';
export const OfficeInformation = ({ location = 'Clearwater' }) => {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-news-primary text-white px-6 py-4">
        <h2 className="text-xl font-bold">Visit Our Office</h2>
        <p className="text-sm text-white text-opacity-80">
          Stop by our {location} headquarters
        </p>
      </div>
      {/* Map */}
      <div className="h-48 bg-gray-200 relative">
        <img
          src="https://images.unsplash.com/photo-1618035881605-dfe8d7eb387b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Map of office location"
          className="w-full h-full object-cover" />

        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <button className="bg-white text-news-primary px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
            View Interactive Map
          </button>
        </div>
      </div>
      {/* Office Details */}
      <div className="p-6">
        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 text-news-primary mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900">Address</h3>
            <p className="text-gray-600">
              123 Main Street, Suite 400
              <br />
              {location}, FL 33755
            </p>
          </div>
        </div>
        <div className="flex items-start mb-4">
          <Clock className="h-5 w-5 text-news-primary mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900">Hours of Operation</h3>
            <p className="text-gray-600">
              Monday - Friday: 9:00 AM - 5:00 PM
              <br />
              Saturday & Sunday: Closed
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Car className="h-5 w-5 text-news-primary mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900">Parking Information</h3>
            <p className="text-gray-600">
              Free visitor parking available in the front lot.
              <br />
              Street parking also available (metered).
            </p>
          </div>
        </div>
        {/* Amenities */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2">Office Amenities</h3>
          <div className="flex flex-wrap gap-2">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
              <Accessibility className="h-4 w-4 mr-1.5" />
              <span>Wheelchair Accessible</span>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
              <Wifi className="h-4 w-4 mr-1.5" />
              <span>Free Wi-Fi</span>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
              <Coffee className="h-4 w-4 mr-1.5" />
              <span>Coffee Bar</span>
            </div>
          </div>
        </div>
      </div>
      {/* Get Directions */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">Need directions?</span>
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-news-primary font-medium hover:underline">

          Get Directions
        </a>
      </div>
    </section>);

};