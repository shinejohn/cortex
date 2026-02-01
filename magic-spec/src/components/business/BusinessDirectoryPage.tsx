import React, { useEffect, useState } from 'react';
import { BusinessSearchBar } from './BusinessSearchBar';
import { CategoryGrid } from './CategoryGrid';
import { FilterSidebar } from './FilterSidebar';
import { BusinessCard } from './BusinessCard';
import { BusinessMap } from './BusinessMap';
import { PromotedBusinesses } from './PromotedBusinesses';
import { MapPin, List, Map } from 'lucide-react';
import { SimpleHeroSection } from '../hero/SimpleHeroSection';
import { useLocationDetection } from '../location/LocationDetector';
export const BusinessDirectoryPage = () => {
  const [viewMode, setViewMode] = useState('list'); // list or map
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { locationData } = useLocationDetection();
  const [filters, setFilters] = useState({
    openNow: false,
    deliveryAvailable: false,
    newBusinesses: false,
    distance: 10,
    priceRange: [],
    minRating: 0
  });
  // Mock business data
  const businesses = [
  {
    id: 1,
    name: 'Harbor Cafe',
    category: 'Food',
    subcategory: 'Cafe',
    rating: 4.7,
    reviewCount: 128,
    distance: 0.4,
    priceRange: '$$',
    isOpen: true,
    isBusy: 'moderate',
    images: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    address: '123 Harbor Drive, Clearwater, FL',
    hours: '8:00 AM - 9:00 PM',
    phone: '(727) 555-1234',
    website: 'https://harborcafe.com',
    featuredReview:
    'Great atmosphere and even better coffee. The pastries are always fresh!',
    hasSpecialOffer: true,
    specialOffer: 'Happy Hour 3-5pm: 50% off espresso drinks',
    coordinates: {
      lat: 27.9659,
      lng: -82.8001
    },
    deliveryAvailable: true,
    isNew: false
  },
  {
    id: 2,
    name: 'Coastal Boutique',
    category: 'Shopping',
    subcategory: 'Clothing',
    rating: 4.5,
    reviewCount: 86,
    distance: 0.7,
    priceRange: '$$$',
    isOpen: true,
    isBusy: 'quiet',
    images: [
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    address: '456 Beach Blvd, Clearwater, FL',
    hours: '10:00 AM - 8:00 PM',
    phone: '(727) 555-5678',
    website: 'https://coastalboutique.com',
    featuredReview:
    'Beautiful selection of beach-inspired clothing. The staff is very helpful.',
    hasSpecialOffer: false,
    coordinates: {
      lat: 27.9671,
      lng: -82.7998
    },
    deliveryAvailable: false,
    isNew: true
  },
  {
    id: 3,
    name: 'Bayside Medical Center',
    category: 'Health',
    subcategory: 'Medical Clinic',
    rating: 4.8,
    reviewCount: 214,
    distance: 1.2,
    priceRange: '$$$$',
    isOpen: true,
    isBusy: 'busy',
    images: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    address: '789 Bayside Dr, Clearwater, FL',
    hours: '7:00 AM - 7:00 PM',
    phone: '(727) 555-9012',
    website: 'https://baysidemedical.com',
    featuredReview:
    'Dr. Johnson is amazing. The facility is clean and modern.',
    hasSpecialOffer: true,
    specialOffer: 'Free health screenings every first Saturday',
    coordinates: {
      lat: 27.9683,
      lng: -82.8012
    },
    deliveryAvailable: false,
    isNew: false
  },
  {
    id: 4,
    name: 'Sunshine Home Services',
    category: 'Home Services',
    subcategory: 'Cleaning',
    rating: 4.6,
    reviewCount: 95,
    distance: 2.3,
    priceRange: '$$',
    isOpen: false,
    images: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    address: '321 Sunshine Way, Clearwater, FL',
    hours: '8:00 AM - 5:00 PM',
    phone: '(727) 555-3456',
    website: 'https://sunshinehomeservices.com',
    featuredReview:
    'Excellent cleaning service. My house has never looked better!',
    hasSpecialOffer: true,
    specialOffer: '20% off first-time service',
    coordinates: {
      lat: 27.9645,
      lng: -82.799
    },
    deliveryAvailable: true,
    isNew: false
  },
  {
    id: 5,
    name: 'Gulf Coast Auto Repair',
    category: 'Auto',
    subcategory: 'Repair Shop',
    rating: 4.9,
    reviewCount: 172,
    distance: 1.8,
    priceRange: '$$$',
    isOpen: true,
    isBusy: 'moderate',
    images: [
    'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    address: '555 Mechanics Ave, Clearwater, FL',
    hours: '7:30 AM - 6:00 PM',
    phone: '(727) 555-7890',
    website: 'https://gulfcoastauto.com',
    featuredReview: 'Honest mechanics who do quality work. Fair prices too!',
    hasSpecialOffer: false,
    coordinates: {
      lat: 27.9635,
      lng: -82.802
    },
    deliveryAvailable: false,
    isNew: false
  },
  {
    id: 6,
    name: 'Clearwater Credit Union',
    category: 'Finance',
    subcategory: 'Credit Union',
    rating: 4.4,
    reviewCount: 68,
    distance: 0.9,
    priceRange: '$',
    isOpen: true,
    isBusy: 'quiet',
    images: [
    'https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    address: '777 Financial Pkwy, Clearwater, FL',
    hours: '9:00 AM - 5:00 PM',
    phone: '(727) 555-2345',
    website: 'https://clearwatercu.com',
    featuredReview:
    'Great rates and friendly service. The mobile app is excellent.',
    hasSpecialOffer: true,
    specialOffer: '$100 bonus when opening a new checking account',
    coordinates: {
      lat: 27.9668,
      lng: -82.803
    },
    deliveryAvailable: false,
    isNew: true
  }];

  // Filter businesses based on search, category, and filters
  const filteredBusinesses = businesses.filter((business) => {
    // Filter by search query
    if (
    searchQuery &&
    !business.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !business.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !business.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
    {
      return false;
    }
    // Filter by category
    if (selectedCategory && business.category !== selectedCategory) {
      return false;
    }
    // Filter by open now
    if (filters.openNow && !business.isOpen) {
      return false;
    }
    // Filter by delivery available
    if (filters.deliveryAvailable && !business.deliveryAvailable) {
      return false;
    }
    // Filter by new businesses
    if (filters.newBusinesses && !business.isNew) {
      return false;
    }
    // Filter by price range
    if (
    filters.priceRange.length > 0 &&
    !filters.priceRange.includes(business.priceRange))
    {
      return false;
    }
    // Filter by rating
    if (filters.minRating > 0 && business.rating < filters.minRating) {
      return false;
    }
    // Filter by distance
    if (business.distance > filters.distance) {
      return false;
    }
    return true;
  });
  // Debug: Log filter changes
  useEffect(() => {
    console.log('Filters updated:', filters);
    console.log('Filtered businesses:', filteredBusinesses.length);
  }, [filters]);
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Directory-specific hero section with title */}
      <SimpleHeroSection
        title="Business Directory"
        subtitle="Support local - discover amazing right in your neighborhood" />

      {/* Directory-specific search section */}
      <div className="bg-news-primary py-6">
        <div className="container mx-auto px-4">
          <BusinessSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery} />

        </div>
      </div>
      {/* Category grid */}
      <div className="container mx-auto px-4 py-6">
        <CategoryGrid
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory} />

      </div>
      {/* View toggle */}
      <div className="container mx-auto px-4 pb-4 flex justify-end">
        <div className="inline-flex bg-white rounded-md shadow-sm border border-gray-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md flex items-center ${viewMode === 'list' ? 'bg-news-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>

            <List className="h-4 w-4 mr-1.5" />
            List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md flex items-center ${viewMode === 'map' ? 'bg-news-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>

            <Map className="h-4 w-4 mr-1.5" />
            Map
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
            {/* Add pricing information banner */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-4">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">List Your Business</h3>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-news-primary">
                      $29
                    </span>
                    <span className="text-gray-600 text-sm">/month</span>
                    <p className="text-xs text-gray-500">
                      or $299/year (save $49)
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/business/create')}
                    className="bg-news-primary text-white px-4 py-2 rounded-md text-sm">

                    Get Started
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Reach local customers with a premium business listing in our
                  directory.
                </p>
              </div>
            </div>
          </div>
          {/* Business listings or map */}
          <div className="flex-1">
            {/* Promoted businesses section */}
            <div className="mb-8">
              <PromotedBusinesses />
            </div>
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {filteredBusinesses.length}{' '}
                {filteredBusinesses.length === 1 ? 'Business' : 'Businesses'}{' '}
                Found
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{locationData?.city || 'Clearwater'}, FL</span>
              </div>
            </div>
            {viewMode === 'list' /* List view */ ?
            <div className="space-y-6">
                {filteredBusinesses.map((business) =>
              <BusinessCard key={business.id} business={business} />
              )}
                {filteredBusinesses.length === 0 &&
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                    <div className="text-gray-400 mb-4">
                      <Map className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No businesses found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria to see more
                      results.
                    </p>
                    <button
                  onClick={() => {
                    setFilters({
                      openNow: false,
                      deliveryAvailable: false,
                      newBusinesses: false,
                      distance: 10,
                      priceRange: [],
                      minRating: 0
                    });
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="text-news-primary font-medium hover:underline">

                      Reset all filters
                    </button>
                  </div>
              }
              </div> /* Map view */ :

            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <BusinessMap businesses={filteredBusinesses} />
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};