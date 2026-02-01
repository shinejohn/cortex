import React, { useEffect, useState, useRef } from 'react';
import { Search, MapPin, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const SearchFilterHero = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  subcategoryFilter,
  setSubcategoryFilter
}) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Clearwater, FL');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = useRef(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
      locationDropdownRef.current &&
      !locationDropdownRef.current.contains(event.target))
      {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const categories = [
  {
    id: 'all',
    name: 'All Categories'
  },
  {
    id: 'forSale',
    name: 'For Sale'
  },
  {
    id: 'housing',
    name: 'Housing'
  },
  {
    id: 'jobs',
    name: 'Jobs'
  },
  {
    id: 'services',
    name: 'Services'
  },
  {
    id: 'community',
    name: 'Community'
  }];

  // Subcategories for each main category
  const subcategories = {
    all: [
    {
      id: 'all',
      name: 'All Subcategories'
    }],

    forSale: [
    {
      id: 'all',
      name: 'All For Sale'
    },
    {
      id: 'electronics',
      name: 'Electronics'
    },
    {
      id: 'furniture',
      name: 'Furniture'
    },
    {
      id: 'clothing',
      name: 'Clothing & Accessories'
    },
    {
      id: 'vehicles',
      name: 'Cars & Trucks'
    },
    {
      id: 'collectibles',
      name: 'Collectibles'
    },
    {
      id: 'sports',
      name: 'Sports & Outdoors'
    },
    {
      id: 'tools',
      name: 'Tools & Equipment'
    },
    {
      id: 'toys',
      name: 'Toys & Games'
    },
    {
      id: 'books',
      name: 'Books & Media'
    },
    {
      id: 'other',
      name: 'Other Items'
    }],

    housing: [
    {
      id: 'all',
      name: 'All Housing'
    },
    {
      id: 'apartments',
      name: 'Apartments'
    },
    {
      id: 'houses',
      name: 'Houses'
    },
    {
      id: 'condos',
      name: 'Condos'
    },
    {
      id: 'rooms',
      name: 'Rooms / Shared'
    },
    {
      id: 'vacation',
      name: 'Vacation Rentals'
    },
    {
      id: 'commercial',
      name: 'Commercial Space'
    },
    {
      id: 'parking',
      name: 'Parking / Storage'
    },
    {
      id: 'land',
      name: 'Land'
    }],

    jobs: [
    {
      id: 'all',
      name: 'All Jobs'
    },
    {
      id: 'fulltime',
      name: 'Full-time'
    },
    {
      id: 'parttime',
      name: 'Part-time'
    },
    {
      id: 'contract',
      name: 'Contract / Freelance'
    },
    {
      id: 'temporary',
      name: 'Temporary'
    },
    {
      id: 'internship',
      name: 'Internship'
    },
    {
      id: 'healthcare',
      name: 'Healthcare'
    },
    {
      id: 'retail',
      name: 'Retail'
    },
    {
      id: 'hospitality',
      name: 'Hospitality'
    },
    {
      id: 'technology',
      name: 'Technology'
    },
    {
      id: 'education',
      name: 'Education'
    },
    {
      id: 'trades',
      name: 'Skilled Trades'
    },
    {
      id: 'other',
      name: 'Other Jobs'
    }],

    services: [
    {
      id: 'all',
      name: 'All Services'
    },
    {
      id: 'home',
      name: 'Home Services'
    },
    {
      id: 'landscaping',
      name: 'Landscaping & Lawn'
    },
    {
      id: 'cleaning',
      name: 'Cleaning'
    },
    {
      id: 'repair',
      name: 'Repair & Maintenance'
    },
    {
      id: 'moving',
      name: 'Moving & Storage'
    },
    {
      id: 'tutoring',
      name: 'Tutoring & Lessons'
    },
    {
      id: 'tech',
      name: 'Tech Support'
    },
    {
      id: 'beauty',
      name: 'Beauty & Wellness'
    },
    {
      id: 'automotive',
      name: 'Automotive'
    },
    {
      id: 'pet',
      name: 'Pet Services'
    },
    {
      id: 'event',
      name: 'Event Services'
    },
    {
      id: 'professional',
      name: 'Professional Services'
    }],

    community: [
    {
      id: 'all',
      name: 'All Community'
    },
    {
      id: 'events',
      name: 'Local Events'
    },
    {
      id: 'classes',
      name: 'Classes & Workshops'
    },
    {
      id: 'volunteers',
      name: 'Volunteers & Causes'
    },
    {
      id: 'groups',
      name: 'Groups & Meetups'
    },
    {
      id: 'lost',
      name: 'Lost & Found'
    },
    {
      id: 'musicians',
      name: 'Musicians & Artists'
    },
    {
      id: 'childcare',
      name: 'Childcare'
    },
    {
      id: 'announcements',
      name: 'General Announcements'
    }]

  };
  // Update subcategory when category changes
  useEffect(() => {
    setSubcategoryFilter('all');
  }, [categoryFilter, setSubcategoryFilter]);
  const nearbyLocations = [
  'Clearwater, FL',
  'Dunedin, FL',
  'Palm Harbor, FL',
  'Safety Harbor, FL',
  'Largo, FL',
  'Oldsmar, FL'];

  const handlePostListing = () => {
    navigate('/postListing');
  };
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  const handleSubcategoryChange = (e) => {
    setSubcategoryFilter(e.target.value);
  };
  return (
    <div className="bg-gradient-to-r from-news-primary to-news-primary-light rounded-xl p-6 md:p-8 shadow-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
          Your Neighborhood Marketplace
        </h1>
        <p className="text-black max-w-2xl mx-auto">
          Buy, sell, and trade with neighbors you can trust
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
        {/* Location selector */}
        <div className="relative w-full md:w-1/5" ref={locationDropdownRef}>
          <button
            type="button"
            className="w-full bg-white bg-opacity-20 text-black border border-white border-opacity-20 rounded-md px-4 py-3 text-left flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              setShowLocationDropdown(!showLocationDropdown);
            }}>

            <MapPin className="h-5 w-5 mr-2 text-black text-opacity-80" />
            <span className="truncate">{location}</span>
          </button>
          {showLocationDropdown &&
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {nearbyLocations.map((loc) =>
            <button
              key={loc}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              onClick={() => {
                setLocation(loc);
                setShowLocationDropdown(false);
              }}>

                  {loc}
                </button>
            )}
            </div>
          }
        </div>
        {/* Category selector */}
        <div className="w-full md:w-1/5">
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="w-full bg-white bg-opacity-20 text-black border border-white border-opacity-20 rounded-md px-4 py-3 appearance-none"
            style={{
              backgroundImage:
              "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}>

            {categories.map((category) =>
            <option
              key={category.id}
              value={category.id}
              className="text-gray-800">

                {category.name}
              </option>
            )}
          </select>
        </div>
        {/* Subcategory selector */}
        <div className="w-full md:w-1/5">
          <select
            value={subcategoryFilter}
            onChange={handleSubcategoryChange}
            className="w-full bg-white bg-opacity-20 text-black border border-white border-opacity-20 rounded-md px-4 py-3 appearance-none"
            style={{
              backgroundImage:
              "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}>

            {subcategories[categoryFilter].map((subcategory) =>
            <option
              key={subcategory.id}
              value={subcategory.id}
              className="text-gray-800">

                {subcategory.name}
              </option>
            )}
          </select>
        </div>
        {/* Search input */}
        <div className="relative w-full md:w-2/5">
          <input
            type="text"
            placeholder="Search for anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-md pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" />

          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
      {/* Post a listing button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handlePostListing}
          className="bg-white text-news-primary hover:bg-gray-100 transition-colors px-6 py-3 rounded-md font-medium flex items-center shadow-sm">

          <PlusCircle className="h-5 w-5 mr-2" />
          Post a Listing
        </button>
      </div>
    </div>);

};