import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Shield,
  AlertCircle } from
'lucide-react';
export const SafetyTips = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="font-bold text-gray-800">Safety Center</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700">

          {expanded ?
          <ChevronUp className="h-5 w-5" /> :

          <ChevronDown className="h-5 w-5" />
          }
        </button>
      </div>
      {expanded ?
      <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1.5" />
              Meet Safely
            </h4>
            <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
              <li>Meet in public, well-lit places</li>
              <li>Bring a friend when possible</li>
              <li>Never share financial information</li>
              <li>Trust your instincts</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 flex items-center">
              <MapPin className="h-4 w-4 text-green-500 mr-1.5" />
              Safe Exchange Zones
            </h4>
            <p className="text-sm text-gray-600">
              Clearwater Police Department offers safe exchange zones monitored
              by 24/7 surveillance cameras.
            </p>
            <div className="bg-green-50 p-2 rounded text-xs text-green-700">
              <strong>Main Location:</strong> 1 Police Plaza, Clearwater, FL
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1.5" />
              Report Suspicious Activity
            </h4>
            <p className="text-sm text-gray-600">
              See something suspicious? Help keep our marketplace safe by
              reporting it.
            </p>
            <button className="w-full py-2 bg-red-50 text-red-600 text-sm font-medium rounded border border-red-100 hover:bg-red-100 transition-colors">
              Report a Listing
            </button>
          </div>
        </div> :

      <div className="p-4">
          <p className="text-sm text-gray-600">
            Keep your transactions safe with our safety tips and resources.
          </p>
          <button
          onClick={() => setExpanded(true)}
          className="mt-2 text-sm text-news-primary font-medium hover:underline">

            View Safety Tips
          </button>
        </div>
      }
    </div>);

};