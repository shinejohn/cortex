import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Share2,
  Heart,
  Flag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  DollarSign,
  Tag,
  Phone,
  Mail } from
'lucide-react';
import { SimpleHeroSection } from '../hero/SimpleHeroSection';
export const ClassifiedDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [classified, setClassified] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarListings, setSimilarListings] = useState([]);
  const [showContactInfo, setShowContactInfo] = useState(false);
  // Parse the listing ID from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      // In a real app, fetch the listing data from an API
      // For this demo, we'll use mock data
      setLoading(true);
      setTimeout(() => {
        setClassified(getMockClassified(parseInt(id)));
        setSimilarListings(getMockSimilarListings(parseInt(id)));
        setLoading(false);
      }, 500);
    } else {
      navigate('/classifieds');
    }
  }, [location, navigate]);
  const getMockClassified = (id) => {
    // This would be replaced with an API call in a real application
    const classifieds = [
    {
      id: 1,
      title: '2020 Honda Civic - Excellent Condition',
      category: 'forSale',
      subcategory: 'vehicles',
      price: 18500,
      location: 'Downtown Clearwater',
      postedDate: '2023-08-01T12:00:00',
      description:
      'Selling my 2020 Honda Civic. Only 25,000 miles, regular maintenance, no accidents. Black exterior, leather seats, sunroof, and all the bells and whistles. This car has been meticulously maintained and garage kept. Features include:\n\n- 1.5L Turbo Engine\n- Automatic Transmission\n- Leather Interior\n- Heated Seats\n- Sunroof\n- Apple CarPlay & Android Auto\n- Backup Camera\n- Blind Spot Monitoring\n- Lane Keep Assist\n- Adaptive Cruise Control\n\nRecent service completed at the dealership with records available. Title in hand, no liens. Test drives available for serious buyers. Please contact me with any questions.',
      images: [
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1592977571764-e55d18c3e25c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'],

      featured: true,
      condition: 'Excellent',
      specifications: {
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        mileage: 25000,
        fuelType: 'Gasoline',
        transmission: 'Automatic',
        color: 'Black',
        drivetrain: 'FWD',
        vin: '1HGBH41JXMN109186'
      },
      seller: {
        name: 'Michael',
        rating: 4.8,
        memberSince: '2019-03-15',
        responseRate: 98,
        responseTime: 'Within an hour',
        verified: true,
        phone: '(727) 555-1234',
        email: 'michael@example.com',
        otherListings: 3
      },
      views: 243,
      saves: 18,
      contactCount: 5,
      safetyTips: [
      'Meet in a public place',
      "Don't pay in advance",
      'See the item before you pay',
      'Verify vehicle history and title']

    },
    {
      id: 2,
      title: 'Furnished 2BR Apartment for Rent - Beach View',
      category: 'housing',
      subcategory: 'apartments',
      price: 2200,
      priceType: 'Per Month',
      location: 'Clearwater Beach',
      postedDate: '2023-08-02T09:30:00',
      description:
      "Beautiful 2 bedroom, 2 bathroom apartment with a stunning view of Clearwater Beach. Fully furnished, washer/dryer in unit, pool, gym, and covered parking. Available September 1st.\n\nThis modern apartment features:\n\n- 1,200 square feet of living space\n- Large balcony with ocean views\n- Fully equipped kitchen with stainless steel appliances\n- Master bedroom with en-suite bathroom\n- In-unit washer and dryer\n- Central A/C and heating\n- Assigned covered parking space\n- Community amenities include pool, gym, and BBQ area\n\nUtilities not included. 12-month lease required. Security deposit equal to one month's rent. No pets allowed. Background and credit check required.",
      images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'],

      featured: false,
      specifications: {
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        furnished: true,
        petFriendly: false,
        parking: 'Covered',
        laundry: 'In Unit',
        availableFrom: '2023-09-01',
        leaseLength: '12 months'
      },
      seller: {
        name: 'Sarah',
        rating: 4.9,
        memberSince: '2017-07-20',
        responseRate: 100,
        responseTime: 'Within a day',
        verified: true,
        phone: '(727) 555-5678',
        email: 'sarah@example.com',
        otherListings: 5
      },
      views: 186,
      saves: 24,
      contactCount: 8,
      safetyTips: [
      'Visit the property in person',
      'Never wire money or pay in cash',
      'Verify the landlord owns the property',
      'Get everything in writing']

    }];

    return classifieds.find((item) => item.id === id) || null;
  };
  const getMockSimilarListings = (currentId) => {
    // Mock similar listings data - in a real app, this would be fetched based on the current listing
    return [
    {
      id: 101,
      title: '2019 Toyota Camry - Low Miles',
      category: 'forSale',
      subcategory: 'vehicles',
      price: 17200,
      location: 'North Clearwater',
      image:
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 102,
      title: '2021 Honda Accord Sport - Like New',
      category: 'forSale',
      subcategory: 'vehicles',
      price: 24500,
      location: 'South Clearwater',
      image:
      'https://images.unsplash.com/photo-1583267746897-2cf415887172?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 103,
      title: '2018 Mazda 6 - Great Condition',
      category: 'forSale',
      subcategory: 'vehicles',
      price: 15900,
      location: 'Dunedin',
      image:
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    }];

  };
  const handleGoBack = () => {
    navigate('/classifieds');
  };
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
    prev === 0 ? classified.images.length - 1 : prev - 1
    );
  };
  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
    prev === classified.images.length - 1 ? 0 : prev + 1
    );
  };
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatPrice = (price, priceType) => {
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}${priceType ? ` ${priceType}` : ''}`;
  };
  const handleContactSeller = () => {
    setShowContactInfo(!showContactInfo);
  };
  const handleViewSimilarListing = (id) => {
    navigate(`/classifiedDetail?id=${id}`);
  };
  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-news-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing details...</p>
        </div>
      </div>);

  }
  if (!classified) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Listing Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The listing you're looking for may have been removed or is no longer
            available.
          </p>
          <button
            onClick={handleGoBack}
            className="bg-news-primary text-white px-4 py-2 rounded-md hover:bg-news-primary-dark transition-colors">

            Return to Classifieds
          </button>
        </div>
      </div>);

  }
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <SimpleHeroSection
        title="Classified Details"
        subtitle="View complete information about this listing" />

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-news-primary mb-6 hover:underline">

          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Classifieds
        </button>
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Image gallery */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              <img
                src={classified.images[currentImageIndex]}
                alt={classified.title}
                className="w-full h-full object-cover" />

            </div>
            {/* Image navigation buttons */}
            {classified.images.length > 1 &&
            <>
                <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity">

                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity">

                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {classified.images.length}
                </div>
              </>
            }
            {/* Featured badge */}
            {classified.featured &&
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                FEATURED
              </div>
            }
          </div>
          {/* Image thumbnails */}
          {classified.images.length > 1 &&
          <div className="flex overflow-x-auto p-2 space-x-2 bg-gray-50">
              {classified.images.map((image, index) =>
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-news-primary' : 'border-transparent'}`}>

                  <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover" />

                </button>
            )}
            </div>
          }
          {/* Listing details */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {classified.category === 'forSale' ?
                    'For Sale' :
                    classified.category}{' '}
                    &gt; {classified.subcategory}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {classified.title}
                </h1>
                <div className="text-2xl font-bold text-news-primary mb-3">
                  {formatPrice(classified.price, classified.priceType)}
                </div>
                <div className="flex flex-wrap items-center text-sm text-gray-600 gap-y-2">
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{classified.location}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>Posted on {formatDate(classified.postedDate)}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <Eye className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{classified.views} views</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center px-4 py-2 rounded-md border ${isFavorite ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>

                  <Heart
                    className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />

                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    alert('Listing reported. Our team will review it.');
                  }}
                  className="flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">

                  <Flag className="h-5 w-5 mr-2" />
                  <span>Report</span>
                </button>
                <button
                  onClick={() => {
                    navigator.
                    share({
                      title: classified.title,
                      text: `Check out this listing: ${classified.title}`,
                      url: window.location.href
                    }).
                    catch(() => {
                      alert(
                        'Share functionality not supported on this browser'
                      );
                    });
                  }}
                  className="flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">

                  <Share2 className="h-5 w-5 mr-2" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            {/* Specifications */}
            {classified.specifications &&
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  {Object.entries(classified.specifications).map(
                  ([key, value]) =>
                  <div key={key} className="flex items-start">
                        <div className="w-1/2 text-gray-600 text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </div>
                        <div className="w-1/2 text-gray-900 text-sm font-medium">
                          {value.toString()}
                        </div>
                      </div>

                )}
                </div>
              </div>
            }
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Description
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {classified.description}
              </div>
            </div>
            {/* Condition */}
            {classified.condition &&
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Condition
                </h2>
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                  {classified.condition}
                </div>
              </div>
            }
            {/* Seller information */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Seller Information
              </h2>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl mr-4">
                    {classified.seller.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-gray-900 mr-2">
                        {classified.seller.name}
                      </h3>
                      {classified.seller.verified &&
                      <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      }
                    </div>
                    <div className="flex items-center text-yellow-500 mb-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-gray-700">
                        {classified.seller.rating} rating
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Member since{' '}
                      {new Date(classified.seller.memberSince).getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Response rate: {classified.seller.responseRate}% •{' '}
                      {classified.seller.responseTime}
                    </div>
                    {classified.seller.otherListings > 0 &&
                    <div className="text-sm text-news-primary mt-1">
                        <a href="#" className="hover:underline">
                          See {classified.seller.otherListings} other listings
                        </a>
                      </div>
                    }
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleContactSeller}
                    className="flex items-center justify-center px-6 py-3 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">

                    <MessageCircle className="h-5 w-5 mr-2" />
                    <span>Contact Seller</span>
                  </button>
                </div>
              </div>
              {/* Contact information */}
              {showContactInfo &&
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3" />
                      <a
                      href={`tel:${classified.seller.phone}`}
                      className="text-news-primary hover:underline">

                        {classified.seller.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-3" />
                      <a
                      href={`mailto:${classified.seller.email}`}
                      className="text-news-primary hover:underline">

                        {classified.seller.email}
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>
            {/* Safety tips */}
            {classified.safetyTips &&
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Safety Tips
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {classified.safetyTips.map((tip, index) =>
                <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                )}
                </ul>
              </div>
            }
          </div>
        </div>
        {/* Similar listings */}
        {similarListings.length > 0 &&
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Similar Listings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarListings.map((listing) =>
            <div
              key={listing.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewSimilarListing(listing.id)}>

                  <div className="h-48 bg-gray-200">
                    <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover" />

                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {listing.title}
                    </h3>
                    <div className="text-lg font-bold text-news-primary mb-2">
                      ${listing.price.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </div>
        }
        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center">
          Clearwater Day News is not responsible for the content of classified
          listings. Please use caution when responding to any classified
          advertisement and never send money in advance.
        </div>
      </div>
    </div>);

};