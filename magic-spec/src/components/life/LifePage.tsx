import React from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  Users,
  Camera,
  Book,
  Calendar,
  Clock,
  ChevronRight,
  Heart,
  Utensils,
  Music,
  MapPin } from
'lucide-react';
export const LifePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">
          Life
        </h1>
        {/* Featured Story */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-2/3 p-6">
              <span className="inline-block bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                Featured
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                <Link to="#" className="hover:text-pink-600">
                  The Hidden Gems of Clearwater: Local Spots You Need to Visit
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                From charming cafés to secluded beaches, discover the
                lesser-known treasures that make Clearwater special. Local
                residents share their favorite spots away from the tourist
                crowds.
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Users className="h-4 w-4 mr-1" />
                <span className="mr-4">By Sarah Johnson</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>3 hours ago</span>
              </div>
              <Link
                to="#"
                className="text-pink-600 font-medium hover:text-pink-800 flex items-center">

                Read Full Story
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="md:w-1/3">
              <img
                src="https://images.unsplash.com/photo-1571041804726-53e8bf082096?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Clearwater Beach sunset"
                className="w-full h-full object-cover" />

            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Link
                to="#"
                className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">

                <Coffee className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                <span className="font-medium text-gray-900">Food & Dining</span>
              </Link>
              <Link
                to="#"
                className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">

                <Camera className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <span className="font-medium text-gray-900">
                  Arts & Culture
                </span>
              </Link>
              <Link
                to="#"
                className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">

                <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <span className="font-medium text-gray-900">
                  Health & Wellness
                </span>
              </Link>
              <Link
                to="#"
                className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">

                <Users className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <span className="font-medium text-gray-900">Family</span>
              </Link>
            </div>
            {/* Recent Stories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Stories
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-100 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mb-2">
                      Health & Wellness
                    </span>
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-pink-600">
                        New Wellness Center Opens in Downtown Clearwater
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      The Clearwater Wellness Collective offers yoga,
                      meditation, nutrition counseling, and more to help
                      residents achieve holistic health.
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>1 day ago</span>
                    </div>
                  </div>
                  <div>
                    <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded mb-2">
                      Food & Dining
                    </span>
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-pink-600">
                        Five New Restaurants Opening This Summer in Clearwater
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      From farm-to-table concepts to international cuisine,
                      Clearwater's dining scene is about to get even more
                      exciting with these new additions.
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>2 days ago</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-100 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mb-2">
                      Arts & Culture
                    </span>
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-pink-600">
                        Local Artist's Mural Project Transforms Downtown
                        Buildings
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Clearwater native Maya Rodriguez is leading a community
                      art initiative that's bringing vibrant murals to
                      previously blank walls downtown.
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>3 days ago</span>
                    </div>
                  </div>
                  <div>
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded mb-2">
                      Family
                    </span>
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-pink-600">
                        Best Summer Activities for Kids in Clearwater
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Keep your children entertained and educated this summer
                      with these family-friendly activities, from beach
                      adventures to indoor workshops.
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>4 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="#"
                className="mt-6 inline-block text-pink-600 font-medium hover:text-pink-800 flex items-center">

                More Lifestyle Stories
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Featured Guides */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Featured Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Dining guide"
                    className="w-full h-48 object-cover" />

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-pink-600">
                        The Ultimate Clearwater Dining Guide
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm">
                      From beachfront seafood to hidden local gems, discover the
                      best places to eat in Clearwater for every budget and
                      taste.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Weekend activities"
                    className="w-full h-48 object-cover" />

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-pink-600">
                        Perfect Weekend in Clearwater
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm">
                      How to spend 48 hours in Clearwater, with insider tips on
                      beaches, activities, dining, and entertainment for the
                      perfect weekend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-pink-600" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    Saturday, Aug 12
                  </div>
                  <h3 className="font-medium text-gray-900">
                    <Link to="#" className="hover:text-pink-600">
                      Clearwater Farmers Market
                    </Link>
                  </h3>
                  <div className="text-sm text-gray-600">
                    9:00 AM - 1:00 PM @ Downtown
                  </div>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    Sunday, Aug 13
                  </div>
                  <h3 className="font-medium text-gray-900">
                    <Link to="#" className="hover:text-pink-600">
                      Summer Concert Series: Jazz at Sunset
                    </Link>
                  </h3>
                  <div className="text-sm text-gray-600">
                    6:00 PM @ Coachman Park
                  </div>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    Tuesday, Aug 15
                  </div>
                  <h3 className="font-medium text-gray-900">
                    <Link to="#" className="hover:text-pink-600">
                      Cooking Class: Mediterranean Cuisine
                    </Link>
                  </h3>
                  <div className="text-sm text-gray-600">
                    6:30 PM @ Clearwater Culinary Institute
                  </div>
                </div>
              </div>
              <Link
                to="/eventsCalendar"
                className="mt-4 text-pink-600 font-medium hover:text-pink-800 flex items-center">

                View Full Calendar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Popular Spots */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                Popular Spots
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=100&q=60"
                    alt="Urban Bites Café"
                    className="w-16 h-16 rounded-md mr-3 object-cover" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Urban Bites Café
                    </h3>
                    <div className="flex items-center text-yellow-500 text-xs mb-1">
                      ★★★★★{' '}
                      <span className="text-gray-500 ml-1">(124 reviews)</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Cozy café with specialty coffee and fresh food
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <img
                    src="https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60"
                    alt="Clearwater Arts Center"
                    className="w-16 h-16 rounded-md mr-3 object-cover" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Clearwater Arts Center
                    </h3>
                    <div className="flex items-center text-yellow-500 text-xs mb-1">
                      ★★★★☆{' '}
                      <span className="text-gray-500 ml-1">(86 reviews)</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Gallery featuring local artists and workshops
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <img
                    src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60"
                    alt="Seaside Spa & Wellness"
                    className="w-16 h-16 rounded-md mr-3 object-cover" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Seaside Spa & Wellness
                    </h3>
                    <div className="flex items-center text-yellow-500 text-xs mb-1">
                      ★★★★★{' '}
                      <span className="text-gray-500 ml-1">(92 reviews)</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Beachfront spa offering relaxing treatments
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/businessDirectory"
                className="mt-4 text-pink-600 font-medium hover:text-pink-800 flex items-center">

                View All Locations
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Trending Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #ClearwaterBeach
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #LocalEats
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #SummerActivities
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #FamilyFun
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #ArtScene
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #HealthyLiving
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #WeekendGetaway
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">

                  #OutdoorDining
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};