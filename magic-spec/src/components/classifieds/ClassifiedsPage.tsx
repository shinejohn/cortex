import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchFilterHero } from './SearchFilterHero';
import { ClassifiedCard } from './ClassifiedCard';
import { SimpleHeroSection } from '../hero/SimpleHeroSection';
export const ClassifiedsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [listingCreated, setListingCreated] = useState(false);
  // Check if we've just created a listing
  useEffect(() => {
    if (location.state?.listingCreated) {
      setListingCreated(true);
      // Clear the state after showing notification
      setTimeout(() => {
        setListingCreated(false);
      }, 5000);
    }
  }, [location.state]);
  // Mock classifieds data
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
    'Selling my 2020 Honda Civic. Only 25,000 miles, regular maintenance, no accidents. Black exterior, leather seats, sunroof, and all the bells and whistles.',
    images: [
    'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: true,
    condition: 'Excellent',
    seller: {
      name: 'Michael',
      rating: 4.8,
      memberSince: '2019-03-15',
      responseRate: 98,
      responseTime: 'Within an hour'
    }
  },
  {
    id: 2,
    title: 'Furnished 2BR Apartment for Rent - Beach View',
    category: 'housing',
    subcategory: 'apartments',
    price: 2200,
    location: 'Clearwater Beach',
    postedDate: '2023-08-02T09:30:00',
    description:
    'Beautiful 2 bedroom, 2 bathroom apartment with a stunning view of Clearwater Beach. Fully furnished, washer/dryer in unit, pool, gym, and covered parking. Available September 1st.',
    images: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: false,
    seller: {
      name: 'Sarah',
      rating: 4.9,
      memberSince: '2017-07-20',
      responseRate: 100,
      responseTime: 'Within a day'
    }
  },
  {
    id: 3,
    title: 'Web Developer Needed - Remote Position',
    category: 'jobs',
    subcategory: 'technology',
    price: 75000,
    location: 'Remote (Clearwater based company)',
    postedDate: '2023-08-03T14:45:00',
    description:
    'Growing tech company looking for a full-stack web developer. Experience with React, Node.js, and SQL required. Remote position with occasional meetings in our Clearwater office.',
    images: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: true,
    seller: {
      name: 'TechWave Solutions',
      rating: 4.6,
      memberSince: '2018-01-10',
      responseRate: 95,
      responseTime: 'Within 2 days'
    }
  },
  {
    id: 4,
    title: 'Professional Lawn Care Services',
    category: 'services',
    subcategory: 'landscaping',
    price: 0,
    priceType: 'Contact for pricing',
    location: 'All of Clearwater',
    postedDate: '2023-08-04T11:15:00',
    description:
    'Professional lawn care services including mowing, edging, fertilizing, and pest control. Residential and commercial properties. Free estimates.',
    images: [
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: false,
    seller: {
      name: 'Green Thumb Landscaping',
      rating: 4.7,
      memberSince: '2016-05-30',
      responseRate: 97,
      responseTime: 'Within hours'
    }
  },
  {
    id: 5,
    title: 'Dining Table with 6 Chairs - Moving Sale',
    category: 'forSale',
    subcategory: 'furniture',
    price: 450,
    location: 'North Clearwater',
    postedDate: '2023-08-05T16:20:00',
    description:
    'Solid wood dining table with 6 matching chairs. In good condition with minor wear. Table dimensions: 72" x 42". Moving and need to sell quickly.',
    images: [
    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: false,
    condition: 'Good',
    seller: {
      name: 'Jessica',
      rating: 4.5,
      memberSince: '2020-11-05',
      responseRate: 90,
      responseTime: 'Within a day'
    }
  },
  {
    id: 6,
    title: 'Community Beach Cleanup - Volunteers Needed',
    category: 'community',
    subcategory: 'volunteers',
    price: 0,
    location: 'Clearwater Beach',
    postedDate: '2023-08-06T10:00:00',
    description:
    'Join us for our monthly beach cleanup event. Gloves and bags provided. Meet at Pier 60 at 8am on Saturday, August 12th. Help keep our beautiful beaches clean!',
    images: [
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: true,
    seller: {
      name: 'Clearwater Environmental Group',
      rating: 5.0,
      memberSince: '2015-02-18',
      responseRate: 100,
      responseTime: 'Within hours'
    }
  },
  {
    id: 7,
    title: 'iPhone 13 Pro - 256GB - Like New',
    category: 'forSale',
    subcategory: 'electronics',
    price: 799,
    location: 'Clearwater',
    postedDate: '2023-08-07T14:30:00',
    description:
    'Selling my iPhone 13 Pro with 256GB storage. Used for only 6 months, in perfect condition with no scratches. Comes with original box, charger, and a case.',
    images: [
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: false,
    condition: 'Like New',
    seller: {
      name: 'Alex',
      rating: 4.7,
      memberSince: '2018-05-20',
      responseRate: 95,
      responseTime: 'Within hours'
    }
  },
  {
    id: 8,
    title: 'Part-time Retail Associate Needed',
    category: 'jobs',
    subcategory: 'retail',
    price: 15,
    priceType: 'Per Hour',
    location: 'Clearwater Mall',
    postedDate: '2023-08-08T09:15:00',
    description:
    'Local clothing store seeking a part-time retail associate. 15-20 hours per week, weekends required. Customer service experience preferred.',
    images: [
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],

    featured: false,
    seller: {
      name: 'Fashion Outlet',
      rating: 4.2,
      memberSince: '2019-11-10',
      responseRate: 85,
      responseTime: 'Within a day'
    }
  }];

  // Filter classifieds based on search query, category, and subcategory
  const filteredClassifieds = classifieds.filter((classified) => {
    // Apply search filter
    const matchesSearch = searchQuery ?
    classified.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classified.description.toLowerCase().includes(searchQuery.toLowerCase()) :
    true;
    // Apply category filter
    const matchesCategory =
    categoryFilter === 'all' ? true : classified.category === categoryFilter;
    // Apply subcategory filter
    const matchesSubcategory =
    subcategoryFilter === 'all' ?
    true :
    classified.subcategory === subcategoryFilter;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <SimpleHeroSection
        title="Community Classifieds"
        subtitle="Buy, sell, and connect with your neighbors" />

      {/* Listing created notification */}
      {listingCreated &&
      <div
        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4"
        role="alert">

          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">
            Your listing has been created and is now live.
          </span>
          <button
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={() => setListingCreated(false)}>

            <span className="text-2xl">&times;</span>
          </button>
        </div>
      }
      <SearchFilterHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        subcategoryFilter={subcategoryFilter}
        setSubcategoryFilter={setSubcategoryFilter} />

      <div className="container mx-auto px-4 py-8">
        {filteredClassifieds.length === 0 ?
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No listings found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search filters or check back later for new
              listings.
            </p>
            <button
            onClick={() => {
              setCategoryFilter('all');
              setSubcategoryFilter('all');
              setSearchQuery('');
            }}
            className="text-news-primary hover:underline">

              Clear all filters
            </button>
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassifieds.map((classified) =>
          <ClassifiedCard key={classified.id} classified={classified} />
          )}
          </div>
        }
      </div>
    </div>);

};