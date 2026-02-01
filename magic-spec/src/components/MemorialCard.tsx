import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
export const MemorialCard = ({ location, name, years }) => {
  return (
    <div className="min-w-[300px] max-w-[300px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center p-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center text-xs text-gray-500">
            <MapPin className="mr-1 h-3 w-3" />
            <span>{location}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          <div className="text-sm text-gray-600">{years}</div>
          <div className="mt-3 flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
            <div className="mr-2 flex h-4 w-4 items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3 fill-current"
                xmlns="http://www.w3.org/2000/svg">

                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <span>In Memory</span>
          </div>
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
          <svg
            className="h-12 w-12 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <path
              d="M12 16.8C9.3 16.8 7.2 14.7 7.2 12C7.2 9.3 9.3 7.2 12 7.2C14.7 7.2 16.8 9.3 16.8 12C16.8 14.7 14.7 16.8 12 16.8Z"
              fill="currentColor" />

            <path
              d="M12 3.6C11.3 3.6 10.8 3.1 10.8 2.4V1.2C10.8 0.5 11.3 0 12 0C12.7 0 13.2 0.5 13.2 1.2V2.4C13.2 3.1 12.7 3.6 12 3.6Z"
              fill="currentColor" />

            <path
              d="M12 24C11.3 24 10.8 23.5 10.8 22.8V21.6C10.8 20.9 11.3 20.4 12 20.4C12.7 20.4 13.2 20.9 13.2 21.6V22.8C13.2 23.5 12.7 24 12 24Z"
              fill="currentColor" />

            <path
              d="M22.8 13.2H21.6C20.9 13.2 20.4 12.7 20.4 12C20.4 11.3 20.9 10.8 21.6 10.8H22.8C23.5 10.8 24 11.3 24 12C24 12.7 23.5 13.2 22.8 13.2Z"
              fill="currentColor" />

            <path
              d="M2.4 13.2H1.2C0.5 13.2 0 12.7 0 12C0 11.3 0.5 10.8 1.2 10.8H2.4C3.1 10.8 3.6 11.3 3.6 12C3.6 12.7 3.1 13.2 2.4 13.2Z"
              fill="currentColor" />

          </svg>
        </div>
        <ChevronRight className="ml-2 h-5 w-5 text-gray-400" />
      </div>
    </div>);

};