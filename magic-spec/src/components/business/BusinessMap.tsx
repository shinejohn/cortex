import React, { useEffect, useRef, createElement } from 'react';
import { MapPin } from 'lucide-react';
export const BusinessMap = ({ businesses }) => {
  const mapContainerRef = useRef(null);
  // This is a placeholder for an actual map implementation
  // In a real app, you would use a library like Leaflet or Google Maps
  useEffect(() => {
    // Simulate map loading
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.innerHTML = '';
      // Create a simple mock map
      const mapElement = document.createElement('div');
      mapElement.className = 'relative w-full h-full bg-blue-50';
      mapElement.style.backgroundImage =
      "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-82.8001,27.9659,13,0/1200x600?access_token=pk.placeholder')";
      mapElement.style.backgroundSize = 'cover';
      mapElement.style.backgroundPosition = 'center';
      // Add business markers
      businesses.forEach((business) => {
        const markerElement = document.createElement('div');
        markerElement.className =
        'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer';
        markerElement.style.left = `${Math.random() * 80 + 10}%`;
        markerElement.style.top = `${Math.random() * 80 + 10}%`;
        // Create marker content
        markerElement.innerHTML = `
          <div class="relative group">
            <div class="flex items-center justify-center h-8 w-8 bg-news-primary text-white rounded-full shadow-md hover:bg-news-primary-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:block">
              <div class="bg-white rounded-md shadow-lg p-2 border border-gray-200">
                <div class="text-xs font-medium text-gray-900 truncate">${business.name}</div>
                <div class="flex items-center text-xs text-gray-500">
                  <span class="flex items-center">
                    ${Array(5).
        fill().
        map(
          (_, i) => `
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="${i < Math.floor(business.rating) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${i < Math.floor(business.rating) ? 'text-yellow-400' : 'text-gray-300'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    `
        ).
        join('')}
                    <span class="ml-1">${business.rating}</span>
                  </span>
                  <span class="mx-1">•</span>
                  <span>${business.distance} mi</span>
                </div>
              </div>
            </div>
          </div>
        `;
        mapElement.appendChild(markerElement);
      });
      mapContainer.appendChild(mapElement);
    }
  }, [businesses]);
  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-[600px] w-full">
        {/* Map will be rendered here */}
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Loading map...</p>
          </div>
        </div>
      </div>
      {/* Map controls - would be functional with a real map library */}
      <div className="absolute top-4 right-4 bg-white rounded-md shadow-md border border-gray-200">
        <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-t-md border-b border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path d="m5 12 7-7 7 7"></path>
            <path d="M12 19V5"></path>
          </svg>
        </button>
        <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-b-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path d="m19 12-7 7-7-7"></path>
            <path d="M12 5v14"></path>
          </svg>
        </button>
      </div>
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md border border-gray-200 p-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Map Legend</div>
        <div className="flex items-center mb-1">
          <div className="h-3 w-3 bg-news-primary rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">Business Location</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">Featured Business</span>
        </div>
      </div>
    </div>);

};