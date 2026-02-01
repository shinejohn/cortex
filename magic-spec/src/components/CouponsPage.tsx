import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Bookmark,
  Copy,
  Calendar,
  Tag,
  Search,
  X,
  Filter,
  ChevronDown } from
'lucide-react';
import { PageHeader } from './PageHeader';
import { SimpleHeroSection } from './hero/SimpleHeroSection';
import { useNavigate } from 'react-router-dom';
export const CouponsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [savedCoupons, setSavedCoupons] = useState([]);
  // Mock coupon data
  const coupons = [
  {
    id: 1,
    business: 'Clearwater Grill & Bar',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '25% OFF',
    code: 'SUMMERSALE2025',
    description: 'Enjoy 25% off your entire bill. Valid for dine-in only.',
    expiry: 'September 30, 2025',
    location: 'Downtown Clearwater',
    category: 'Restaurant',
    featured: true
  },
  {
    id: 2,
    business: 'Beach Boutique',
    logo: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '$10 OFF',
    code: 'BEACH10',
    description:
    'Get $10 off any purchase of $50 or more. Valid in-store and online.',
    expiry: 'August 15, 2025',
    location: 'Clearwater Beach',
    category: 'Retail',
    featured: true
  },
  {
    id: 3,
    business: 'Sunshine Auto Repair',
    logo: 'https://images.unsplash.com/photo-1498887960847-2a5e46312788?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: 'FREE',
    code: 'OILCHECK',
    description:
    'Free oil check and tire pressure adjustment with any service.',
    expiry: 'Ongoing',
    location: 'North Clearwater',
    category: 'Automotive',
    featured: false
  },
  {
    id: 4,
    business: 'Coastal Spa & Wellness',
    logo: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '15% OFF',
    code: 'RELAX15',
    description:
    '15% off any spa service. Perfect for a relaxing day of pampering.',
    expiry: 'December 31, 2025',
    location: 'Downtown Clearwater',
    category: 'Health & Beauty',
    featured: false
  },
  {
    id: 5,
    business: 'Harbor View Hotel',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '20% OFF',
    code: 'VACATION20',
    description:
    '20% off your stay of 2 nights or more. Includes complimentary breakfast.',
    expiry: 'October 31, 2025',
    location: 'Clearwater Beach',
    category: 'Accommodation',
    featured: true
  },
  {
    id: 6,
    business: 'Clearwater Fitness Center',
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: 'FREE TRIAL',
    code: 'FITWEEK',
    description:
    'One week free trial membership. Access to all facilities and classes.',
    expiry: 'September 15, 2025',
    location: 'South Clearwater',
    category: 'Fitness',
    featured: false
  },
  {
    id: 7,
    business: 'Fresh Catch Seafood',
    logo: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: 'BOGO',
    code: 'SEAFOOD2FOR1',
    description:
    'Buy one entree, get one free. Equal or lesser value. Dine-in only.',
    expiry: 'August 31, 2025',
    location: 'Clearwater Marina',
    category: 'Restaurant',
    featured: false
  },
  {
    id: 8,
    business: 'Clearwater Tech Repair',
    logo: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '30% OFF',
    code: 'FIXMYPHONE',
    description:
    '30% off phone screen repairs. All models and makes serviced.',
    expiry: 'November 15, 2025',
    location: 'Downtown Clearwater',
    category: 'Services',
    featured: false
  },
  {
    id: 9,
    business: 'Island Breeze Tours',
    logo: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '10% OFF',
    code: 'ISLANDTOUR10',
    description:
    '10% off any boat tour or water activity. Advance booking required.',
    expiry: 'December 15, 2025',
    location: 'Clearwater Marina',
    category: 'Entertainment',
    featured: false
  },
  {
    id: 10,
    business: 'Sunshine Bakery',
    logo: 'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: 'FREE ITEM',
    code: 'SWEETTREAT',
    description: 'Free cookie or pastry with purchase of any coffee drink.',
    expiry: 'September 30, 2025',
    location: 'North Clearwater',
    category: 'Food & Drink',
    featured: false
  },
  {
    id: 11,
    business: 'Gulf Coast Pet Supplies',
    logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '20% OFF',
    code: 'PETLOVE20',
    description:
    '20% off your first purchase. Valid on all pet food and supplies.',
    expiry: 'October 15, 2025',
    location: 'South Clearwater',
    category: 'Retail',
    featured: false
  },
  {
    id: 12,
    business: 'Clearwater Yoga Studio',
    logo: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80',
    discount: '50% OFF',
    code: 'NAMASTE50',
    description: '50% off your first month of unlimited yoga classes.',
    expiry: 'November 30, 2025',
    location: 'Downtown Clearwater',
    category: 'Fitness',
    featured: false
  }];

  const handleCouponClick = (id) => {
    navigate('/couponDetail');
  };
  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    // Copy code to clipboard
    navigator.clipboard.
    writeText(code).
    then(() => {
      alert(`Coupon code ${code} copied to clipboard!`);
    }).
    catch((err) => {
      console.error('Failed to copy code: ', err);
    });
  };
  const handleSaveCoupon = (couponId, e) => {
    e.stopPropagation();
    if (savedCoupons.includes(couponId)) {
      setSavedCoupons(savedCoupons.filter((id) => id !== couponId));
    } else {
      setSavedCoupons([...savedCoupons, couponId]);
    }
  };
  // Filter coupons based on search query, category, and location
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
    searchQuery === '' ||
    coupon.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
    selectedCategory === 'All' || coupon.category === selectedCategory;
    const matchesLocation =
    selectedLocation === 'All Locations' ||
    coupon.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });
  // Get featured coupons
  const featuredCoupons = coupons.filter((coupon) => coupon.featured);
  // Get unique categories and locations for filters
  const categories = [
  'All',
  ...new Set(coupons.map((coupon) => coupon.category))];

  const locations = [
  'All Locations',
  ...new Set(coupons.map((coupon) => coupon.location))];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <SimpleHeroSection
        title="Coupons & Deals"
        subtitle="Save money at your favorite local businesses" />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for coupons, businesses, or codes..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />

            {searchQuery &&
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}>

                <X className="h-4 w-4" />
              </button>
            }
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Location Filter */}
            <div className="relative">
              <button
                className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                onClick={() =>
                setSelectedLocation(
                  selectedLocation === 'All Locations' ?
                  locations[1] :
                  'All Locations'
                )
                }>

                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                <span>{selectedLocation}</span>
              </button>
            </div>
            {/* Category Filter */}
            <div className="relative">
              <button
                className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}>

                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <span>Category: {selectedCategory}</span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
              </button>
              {showCategoryFilter &&
              <div className="absolute z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    {categories.map((category) =>
                  <button
                    key={category}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryFilter(false);
                    }}>

                        {category}
                      </button>
                  )}
                  </div>
                </div>
              }
            </div>
            {/* Reset Filters */}
            {(searchQuery ||
            selectedCategory !== 'All' ||
            selectedLocation !== 'All Locations') &&
            <button
              className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('All Locations');
              }}>

                Reset Filters
              </button>
            }
          </div>
        </div>
        {/* Featured Coupons Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Featured Deals
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCoupons.map((coupon) =>
            <div
              key={coupon.id}
              className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              onClick={() => handleCouponClick(coupon.id)}>

                {/* Coupon Content */}
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    {/* Business logo and name */}
                    <div className="flex items-center">
                      <div className="mr-3 h-12 w-12 overflow-hidden rounded-full border border-gray-200">
                        <img
                        src={coupon.logo}
                        alt={coupon.business}
                        className="h-full w-full object-cover" />

                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {coupon.business}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="mr-1 h-3 w-3" />
                          {coupon.location}
                        </div>
                      </div>
                    </div>
                    {/* Discount badge */}
                    <div className="rounded-md bg-yellow-100 px-2 py-1 text-sm font-bold text-yellow-800">
                      {coupon.discount}
                    </div>
                  </div>
                  {/* Coupon description */}
                  <p className="mb-4 text-sm text-gray-600">
                    {coupon.description}
                  </p>
                  {/* Coupon code */}
                  <div className="mb-4 flex">
                    <div className="relative flex-1">
                      <input
                      type="text"
                      className="w-full rounded-l-md border border-gray-300 bg-gray-50 py-2 px-3 text-gray-700"
                      value={coupon.code}
                      readOnly />

                      <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                      onClick={(e) => handleCopyCode(coupon.code, e)}>

                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center rounded-r-md bg-gray-900 px-3 text-white">
                      Copy
                    </div>
                  </div>
                  {/* Expiry and actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      Expires: {coupon.expiry}
                    </div>
                    <div className="flex space-x-2">
                      <button
                      className="rounded-full p-1.5 hover:bg-gray-100"
                      onClick={(e) => handleSaveCoupon(coupon.id, e)}>

                        <Bookmark
                        className={`h-4 w-4 ${savedCoupons.includes(coupon.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />

                      </button>
                      <button
                      className="rounded-full p-1.5 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:?subject=Check out this coupon&body=Use code ${coupon.code} at ${coupon.business}`;
                      }}>

                        <Mail className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* All Coupons Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">All Coupons</h2>
          {filteredCoupons.length > 0 ?
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.map((coupon) =>
            <div
              key={coupon.id}
              className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              onClick={() => handleCouponClick(coupon.id)}>

                  {/* Coupon Content */}
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      {/* Business logo and name */}
                      <div className="flex items-center">
                        <div className="mr-3 h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                          <img
                        src={coupon.logo}
                        alt={coupon.business}
                        className="h-full w-full object-cover" />

                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {coupon.business}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Tag className="mr-1 h-3 w-3" />
                            {coupon.category}
                          </div>
                        </div>
                      </div>
                      {/* Discount badge */}
                      <div className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">
                        {coupon.discount}
                      </div>
                    </div>
                    {/* Coupon description */}
                    <p className="mb-3 text-xs text-gray-600 line-clamp-2">
                      {coupon.description}
                    </p>
                    {/* Coupon code */}
                    <div className="mb-3 flex">
                      <div className="relative flex-1">
                        <input
                      type="text"
                      className="w-full rounded-l-md border border-gray-300 bg-gray-50 py-1.5 px-3 text-xs text-gray-700"
                      value={coupon.code}
                      readOnly />

                        <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                      onClick={(e) => handleCopyCode(coupon.code, e)}>

                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-center rounded-r-md bg-gray-900 px-2 text-xs text-white">
                        Copy
                      </div>
                    </div>
                    {/* Expiry and location */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {coupon.expiry}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {coupon.location}
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div> :

          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-gray-700">No coupons found</h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-gray-500">
                We couldn't find any coupons matching your search criteria. Try
                adjusting your filters or check back later.
              </p>
              <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('All Locations');
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">

                Reset Filters
              </button>
            </div>
          }
        </div>
        {/* Create Coupon CTA */}
        <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center text-white">
          <h3 className="mb-2 text-xl font-bold">Are you a local business?</h3>
          <p className="mb-4">
            Create and publish your own coupons to attract more customers.
          </p>
          <button
            onClick={() => navigate('/couponCreator')}
            className="rounded-md bg-white px-5 py-2 text-sm font-medium text-blue-600 hover:bg-gray-100">

            Create a Coupon
          </button>
        </div>
      </div>
    </div>);

};