import React from 'react';
import { Link } from 'react-router-dom';
import { NewspaperMasthead } from '../navigation/NewspaperMasthead';
import {
  Trophy,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Star,
  TrendingUp } from
'lucide-react';
export const SportsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">
          Sports
        </h1>
        {/* Featured Story */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-2/3 p-6">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                Featured
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                <Link to="#" className="hover:text-blue-600">
                  Clearwater High School Football Team Advances to State
                  Championship
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                The Clearwater Tornadoes defeated their rivals 28-14 in a
                thrilling semifinal game on Friday night, securing their spot in
                the state championship for the first time in 15 years.
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <User className="h-4 w-4 mr-1" />
                <span className="mr-4">By James Wilson</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>2 hours ago</span>
              </div>
              <Link
                to="#"
                className="text-blue-600 font-medium hover:text-blue-800 flex items-center">

                Read Full Story
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="md:w-1/3">
              <img
                src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Football game"
                className="w-full h-full object-cover" />

            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Latest Scores */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Latest Scores
              </h2>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">
                        Football
                      </span>
                      <span className="text-sm text-gray-500">Final</span>
                    </div>
                    <span className="text-sm text-gray-500">Friday, Aug 4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Clearwater High School</div>
                      <div className="font-medium">Palm Harbor University</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">28</div>
                      <div className="font-bold">14</div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">
                        Basketball
                      </span>
                      <span className="text-sm text-gray-500">Final</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Thursday, Aug 3
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Clearwater High School</div>
                      <div className="font-medium">Dunedin High School</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">76</div>
                      <div className="font-bold">68</div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">
                        Baseball
                      </span>
                      <span className="text-sm text-gray-500">Final</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Wednesday, Aug 2
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Clearwater Threshers</div>
                      <div className="font-medium">Dunedin Blue Jays</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">5</div>
                      <div className="font-bold">3</div>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="#"
                className="mt-4 text-blue-600 font-medium hover:text-blue-800 flex items-center">

                View All Scores
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Recent Stories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Stories
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-100 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-blue-600">
                        Local Swimmer Qualifies for National Championships
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Clearwater High School senior Emma Johnson has qualified
                      for the National Swimming Championships after breaking the
                      state record in the 100m freestyle.
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>1 day ago</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-blue-600">
                        Clearwater Threshers Announce New Manager for Upcoming
                        Season
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      The Clearwater Threshers, the Class A affiliate of the
                      Philadelphia Phillies, have announced the appointment of
                      former MLB player Mike Thompson as their new manager.
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>2 days ago</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-100 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-blue-600">
                        Local Golf Course to Host PGA Tour Qualifying Event
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Clearwater's Innisbrook Resort will host a PGA Tour
                      qualifying event next month, bringing professional golfers
                      from around the country to compete.
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>3 days ago</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link to="#" className="hover:text-blue-600">
                        Youth Soccer League Expands with Four New Teams
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      The Clearwater Youth Soccer League is expanding this fall
                      with the addition of four new teams, providing more
                      opportunities for local children to participate.
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
                className="mt-6 inline-block text-blue-600 font-medium hover:text-blue-800 flex items-center">

                More Sports News
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    Saturday, Aug 12
                  </div>
                  <h3 className="font-medium text-gray-900">
                    <Link to="#" className="hover:text-blue-600">
                      Football: Clearwater vs. Countryside
                    </Link>
                  </h3>
                  <div className="text-sm text-gray-600">
                    7:00 PM @ Clearwater High Stadium
                  </div>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    Sunday, Aug 13
                  </div>
                  <h3 className="font-medium text-gray-900">
                    <Link to="#" className="hover:text-blue-600">
                      Baseball: Clearwater Threshers vs. Lakeland Flying Tigers
                    </Link>
                  </h3>
                  <div className="text-sm text-gray-600">
                    1:00 PM @ BayCare Ballpark
                  </div>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-sm text-gray-500 mb-1">
                    Tuesday, Aug 15
                  </div>
                  <h3 className="font-medium text-gray-900">
                    <Link to="#" className="hover:text-blue-600">
                      Volleyball: Clearwater vs. East Lake
                    </Link>
                  </h3>
                  <div className="text-sm text-gray-600">
                    6:30 PM @ Clearwater High Gymnasium
                  </div>
                </div>
              </div>
              <Link
                to="/eventsCalendar"
                className="mt-4 text-blue-600 font-medium hover:text-blue-800 flex items-center">

                View Full Calendar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Local Athletes Spotlight */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Local Athletes Spotlight
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Michael Johnson"
                    className="w-12 h-12 rounded-full mr-4 object-cover" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Michael Johnson
                    </h3>
                    <p className="text-sm text-gray-600">
                      Senior quarterback who led Clearwater High to the state
                      semifinals with 28 touchdowns this season.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Sophia Martinez"
                    className="w-12 h-12 rounded-full mr-4 object-cover" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Sophia Martinez
                    </h3>
                    <p className="text-sm text-gray-600">
                      Junior swimmer who broke two school records and qualified
                      for nationals in three events.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="#"
                className="mt-4 text-blue-600 font-medium hover:text-blue-800 flex items-center">

                View All Athletes
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Trending Sports */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                Trending in Sports
              </h2>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-blue-600">
                    Clearwater High School's Path to the State Championship
                  </Link>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-blue-600">
                    Local Athletes Receiving College Scholarships
                  </Link>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-blue-600">
                    New Training Facility Opens for Youth Sports
                  </Link>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-blue-600">
                    Interview with Clearwater Threshers' New Manager
                  </Link>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-blue-600">
                    Summer Sports Camps Registration Now Open
                  </Link>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>);

};