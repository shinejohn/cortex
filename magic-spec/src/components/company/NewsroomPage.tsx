import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  FileText,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  MapPin,
  Clock } from
'lucide-react';
export const NewsroomPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Our Newsroom
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Meet the team behind Day.News Clearwater
        </p>
        {/* Newsroom Overview */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About Our Newsroom
              </h2>
              <p className="text-gray-700 mb-6">
                Day.News Clearwater is dedicated to serving our community with
                timely, accurate, and meaningful journalism. Our newsroom brings
                together experienced reporters, editors, and digital media
                specialists who are committed to telling the stories that matter
                to Clearwater residents.
              </p>
              <p className="text-gray-700 mb-6">
                We believe that strong local journalism is essential to a
                thriving community. Our team works tirelessly to keep you
                informed about local government, education, business, arts, and
                community events, while also investigating issues that impact
                your daily life.
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-news-primary">12</div>
                  <div className="text-sm text-gray-600">Journalists</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-news-primary">3</div>
                  <div className="text-sm text-gray-600">Photographers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-news-primary">5</div>
                  <div className="text-sm text-gray-600">Editors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-news-primary">4</div>
                  <div className="text-sm text-gray-600">Digital Staff</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Newsroom team at work"
                className="w-full h-full object-cover" />

            </div>
          </div>
        </div>
        {/* Leadership Team */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src="https://randomuser.me/api/portraits/men/42.jpg"
                alt="James Wilson"
                className="w-full h-48 object-cover" />

              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  James Wilson
                </h3>
                <p className="text-news-primary font-medium mb-3">
                  Executive Editor
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  James has over 25 years of journalism experience and has led
                  our newsroom since 2020. He previously worked at the Tampa Bay
                  Times and the Miami Herald.
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:james.wilson@day.news"
                    className="hover:text-news-primary">

                    james.wilson@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src="https://randomuser.me/api/portraits/women/32.jpg"
                alt="Sarah Johnson"
                className="w-full h-48 object-cover" />

              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Sarah Johnson
                </h3>
                <p className="text-news-primary font-medium mb-3">
                  Managing Editor
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Sarah oversees our day-to-day news operations and has been
                  with Day.News for 7 years. She specializes in local government
                  reporting and investigative journalism.
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:sarah.johnson@day.news"
                    className="hover:text-news-primary">

                    sarah.johnson@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Michael Chen"
                className="w-full h-48 object-cover" />

              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Michael Chen
                </h3>
                <p className="text-news-primary font-medium mb-3">
                  Digital Editor
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Michael leads our digital strategy and audience engagement
                  efforts. He joined Day.News in 2021 after working at digital
                  news startups in New York and San Francisco.
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:michael.chen@day.news"
                    className="hover:text-news-primary">

                    michael.chen@day.news
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Editorial Team */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Editorial Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Emily Rodriguez"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">
                  Emily Rodriguez
                </h3>
                <p className="text-news-primary font-medium mb-2">
                  City Hall Reporter
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:emily.r@day.news"
                    className="hover:text-news-primary">

                    emily.r@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/men/33.jpg"
                alt="David Thompson"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">David Thompson</h3>
                <p className="text-news-primary font-medium mb-2">
                  Business Reporter
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:david.t@day.news"
                    className="hover:text-news-primary">

                    david.t@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/women/65.jpg"
                alt="Lisa Martinez"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">Lisa Martinez</h3>
                <p className="text-news-primary font-medium mb-2">
                  Education Reporter
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:lisa.m@day.news"
                    className="hover:text-news-primary">

                    lisa.m@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/men/22.jpg"
                alt="Robert Jackson"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">Robert Jackson</h3>
                <p className="text-news-primary font-medium mb-2">
                  Sports Reporter
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:robert.j@day.news"
                    className="hover:text-news-primary">

                    robert.j@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/women/28.jpg"
                alt="Jennifer Kim"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">Jennifer Kim</h3>
                <p className="text-news-primary font-medium mb-2">
                  Arts & Culture Reporter
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:jennifer.k@day.news"
                    className="hover:text-news-primary">

                    jennifer.k@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/men/76.jpg"
                alt="Thomas Williams"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">
                  Thomas Williams
                </h3>
                <p className="text-news-primary font-medium mb-2">
                  Investigative Reporter
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:thomas.w@day.news"
                    className="hover:text-news-primary">

                    thomas.w@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/women/90.jpg"
                alt="Angela Davis"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">Angela Davis</h3>
                <p className="text-news-primary font-medium mb-2">
                  Community Reporter
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:angela.d@day.news"
                    className="hover:text-news-primary">

                    angela.d@day.news
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <img
                src="https://randomuser.me/api/portraits/men/52.jpg"
                alt="Mark Peterson"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />

              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">Mark Peterson</h3>
                <p className="text-news-primary font-medium mb-2">
                  Photographer
                </p>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href="mailto:mark.p@day.news"
                    className="hover:text-news-primary">

                    mark.p@day.news
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/authors"
              className="inline-flex items-center text-news-primary font-medium hover:text-news-primary-dark">

              View All Team Members
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        {/* Awards & Recognition */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="flex items-center mb-6">
            <Award className="h-8 w-8 text-news-primary mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Awards & Recognition
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">2023</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Florida Press Association Awards
                    </p>
                    <p className="text-gray-600 text-sm">
                      First Place, Investigative Reporting: "The Hidden Cost of
                      Development"
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Society of Professional Journalists
                    </p>
                    <p className="text-gray-600 text-sm">
                      Excellence in Local Journalism Award for our "Clearwater
                      Schools in Crisis" series
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Online News Association
                    </p>
                    <p className="text-gray-600 text-sm">
                      Best Community Engagement for our "Voices of Clearwater"
                      project
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">2022</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      National Headliner Awards
                    </p>
                    <p className="text-gray-600 text-sm">
                      Second Place, Local News Coverage: "Aftermath of Hurricane
                      Ian"
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Edward R. Murrow Awards
                    </p>
                    <p className="text-gray-600 text-sm">
                      Regional Award for Excellence in Video Journalism:
                      "Clearwater's Changing Coastline"
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Florida Society of News Editors
                    </p>
                    <p className="text-gray-600 text-sm">
                      First Place, Breaking News: Coverage of the Downtown
                      Redevelopment Vote
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Editorial Calendar */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Editorial Calendar
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-700 mb-6">
              Our newsroom plans special coverage throughout the year to
              highlight important topics and events in our community. Here's a
              look at some of our upcoming editorial focuses:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-news-primary mr-2" />
                  <h3 className="font-bold text-gray-900">August 2024</h3>
                </div>
                <p className="text-gray-700 font-medium mb-2">Back to School</p>
                <p className="text-gray-600 text-sm">
                  In-depth coverage of local education issues, school readiness,
                  and resources for parents and students.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-news-primary mr-2" />
                  <h3 className="font-bold text-gray-900">September 2024</h3>
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  Local Business Spotlight
                </p>
                <p className="text-gray-600 text-sm">
                  Featuring small businesses in Clearwater, economic development
                  initiatives, and entrepreneurship resources.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-news-primary mr-2" />
                  <h3 className="font-bold text-gray-900">October 2024</h3>
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  Election Coverage
                </p>
                <p className="text-gray-600 text-sm">
                  Comprehensive coverage of local races, voter guides, candidate
                  profiles, and election issues.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-news-primary mr-2" />
                  <h3 className="font-bold text-gray-900">November 2024</h3>
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  Community Heroes
                </p>
                <p className="text-gray-600 text-sm">
                  Highlighting local volunteers, non-profits, and community
                  leaders making a difference in Clearwater.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-news-primary mr-2" />
                  <h3 className="font-bold text-gray-900">December 2024</h3>
                </div>
                <p className="text-gray-700 font-medium mb-2">Year in Review</p>
                <p className="text-gray-600 text-sm">
                  Recapping the biggest local stories of 2024 and looking ahead
                  to what's coming in 2025.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-news-primary mr-2" />
                  <h3 className="font-bold text-gray-900">January 2025</h3>
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  Health & Wellness
                </p>
                <p className="text-gray-600 text-sm">
                  Focus on local healthcare resources, wellness initiatives, and
                  healthy living in Clearwater.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Press Releases */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Press Releases</h2>
            <Link
              to="#"
              className="text-news-primary font-medium hover:text-news-primary-dark flex items-center">

              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-news-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Day.News Launches New Community Reporting Initiative
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>July 15, 2024</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Day.News Clearwater is excited to announce a new community
                    reporting initiative that will expand our coverage of
                    underrepresented neighborhoods and issues in the Clearwater
                    area.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary text-sm font-medium hover:text-news-primary-dark flex items-center mt-2">

                    Read Full Release
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-news-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Day.News Clearwater Wins Three Florida Press Association
                    Awards
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>June 22, 2024</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    The Florida Press Association has recognized Day.News
                    Clearwater with three awards at its annual ceremony,
                    including first place for investigative reporting on local
                    development issues.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary text-sm font-medium hover:text-news-primary-dark flex items-center mt-2">

                    Read Full Release
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-news-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Day.News Announces Partnership with Clearwater Public
                    Schools
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>May 10, 2024</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Day.News is proud to announce a new partnership with
                    Clearwater Public Schools to provide journalism education
                    and mentorship opportunities for high school students
                    interested in media careers.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary text-sm font-medium hover:text-news-primary-dark flex items-center mt-2">

                    Read Full Release
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Visit Our Newsroom */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Visit Our Newsroom
              </h2>
              <p className="text-gray-700 mb-6">
                We welcome school groups, community organizations, and other
                visitors who are interested in learning more about local
                journalism and how our newsroom works. Contact us to schedule a
                tour or arrange a speaker for your event.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-news-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Our Address</p>
                    <p className="text-gray-600 text-sm">
                      123 Main Street
                      <br />
                      Clearwater, FL 33755
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-news-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Newsroom Hours</p>
                    <p className="text-gray-600 text-sm">
                      Monday - Friday: 8:00 AM - 7:00 PM
                      <br />
                      Saturday: 9:00 AM - 3:00 PM
                      <br />
                      Sunday: Closed (on-call staff only)
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-news-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Contact</p>
                    <p className="text-gray-600 text-sm">
                      Newsroom: (727) 555-0123
                      <br />
                      Email: newsroom@day.news
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/3">
              <img
                src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Day.News newsroom"
                className="w-full h-auto rounded-lg" />

            </div>
          </div>
        </div>
        {/* Join Our Team */}
        <div className="bg-news-primary rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
          <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
            We're always looking for talented journalists, photographers, and
            digital media specialists who are passionate about local news and
            serving our community.
          </p>
          <Link
            to="/careers"
            className="inline-block bg-white text-news-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">

            View Current Openings
          </Link>
        </div>
      </main>
    </div>);

};