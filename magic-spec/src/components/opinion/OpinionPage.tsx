import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  User,
  Clock,
  ChevronRight,
  TrendingUp,
  Mail,
  Share2 } from
'lucide-react';
export const OpinionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">
          Opinion
        </h1>
        {/* Featured Opinion */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-2/3 p-6">
              <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                Editorial
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                <Link to="#" className="hover:text-purple-600">
                  Revitalizing Downtown Clearwater: A Vision for the Future
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                As our city grows, we need a comprehensive plan for downtown
                that balances development with preserving our community's
                character. Here's what the editorial board believes should be
                our priorities.
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">By The Editorial Board</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>Published 1 day ago</span>
              </div>
              <Link
                to="#"
                className="text-purple-600 font-medium hover:text-purple-800 flex items-center">

                Read Full Opinion
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="md:w-1/3">
              <img
                src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Downtown Clearwater"
                className="w-full h-full object-cover" />

            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Opinion Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-lg text-center">

                  <span className="font-medium text-gray-900">Editorials</span>
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-lg text-center">

                  <span className="font-medium text-gray-900">Columnists</span>
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-lg text-center">

                  <span className="font-medium text-gray-900">Letters</span>
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-lg text-center">

                  <span className="font-medium text-gray-900">
                    Guest Essays
                  </span>
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-lg text-center">

                  <span className="font-medium text-gray-900">
                    Local Issues
                  </span>
                </Link>
                <Link
                  to="#"
                  className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-lg text-center">

                  <span className="font-medium text-gray-900">
                    National Views
                  </span>
                </Link>
              </div>
            </div>
            {/* Recent Opinions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Recent Opinions
              </h2>
              <div className="space-y-8">
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-start mb-3">
                    <img
                      src="https://randomuser.me/api/portraits/men/42.jpg"
                      alt="David Wilson"
                      className="w-10 h-10 rounded-full mr-3" />

                    <div>
                      <h3 className="font-medium text-gray-900">
                        <Link to="#" className="hover:text-purple-600">
                          We Need More Investment in Public Transportation
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">
                        By David Wilson, Transportation Advocate
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Clearwater's growth demands better public transit options.
                    Our current system leaves too many residents without
                    reliable transportation to work, school, and healthcare.
                    Here's how we can fix it.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>3 days ago</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>24 Comments</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center text-gray-500 hover:text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <span className="text-gray-500">86</span>
                        <button className="flex items-center text-gray-500 hover:text-red-600">
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                        <span className="text-gray-500">12</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-start mb-3">
                    <img
                      src="https://randomuser.me/api/portraits/women/68.jpg"
                      alt="Maria Rodriguez"
                      className="w-10 h-10 rounded-full mr-3" />

                    <div>
                      <h3 className="font-medium text-gray-900">
                        <Link to="#" className="hover:text-purple-600">
                          Our Schools Deserve Better Funding
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">
                        By Maria Rodriguez, School Board Member
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">
                    The recent budget cuts to our school district will have
                    lasting negative impacts on our children's education. We
                    need to prioritize education in our city's budget and find
                    sustainable funding solutions.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>4 days ago</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>38 Comments</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center text-gray-500 hover:text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <span className="text-gray-500">112</span>
                        <button className="flex items-center text-gray-500 hover:text-red-600">
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                        <span className="text-gray-500">18</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start mb-3">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="James Thompson"
                      className="w-10 h-10 rounded-full mr-3" />

                    <div>
                      <h3 className="font-medium text-gray-900">
                        <Link to="#" className="hover:text-purple-600">
                          The Case for Supporting Local Businesses
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">
                        By James Thompson, Business Columnist
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">
                    As national chains continue to expand in Clearwater, we need
                    to remember the value that local businesses bring to our
                    community. Here's why shopping local matters more than ever.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>5 days ago</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>17 Comments</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center text-gray-500 hover:text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <span className="text-gray-500">74</span>
                        <button className="flex items-center text-gray-500 hover:text-red-600">
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                        <span className="text-gray-500">8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="#"
                className="mt-6 inline-block text-purple-600 font-medium hover:text-purple-800 flex items-center">

                View More Opinions
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Letters to the Editor */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Letters to the Editor
                </h2>
                <Link
                  to="#"
                  className="text-purple-600 font-medium hover:text-purple-800 text-sm">

                  Submit a Letter
                </Link>
              </div>
              <div className="space-y-6">
                <div className="border-l-4 border-purple-200 pl-4">
                  <p className="text-gray-600 italic mb-2">
                    "I was pleased to see the city council's decision to expand
                    the recycling program. However, we need to address the lack
                    of recycling in our public spaces and parks."
                  </p>
                  <p className="text-sm text-gray-500">
                    - Sarah Johnson, Clearwater Beach
                  </p>
                </div>
                <div className="border-l-4 border-purple-200 pl-4">
                  <p className="text-gray-600 italic mb-2">
                    "The article on affordable housing missed a key point: we
                    need to incentivize developers to include affordable units
                    in new projects, not just build separate 'affordable'
                    developments."
                  </p>
                  <p className="text-sm text-gray-500">
                    - Michael Chen, Downtown
                  </p>
                </div>
                <div className="border-l-4 border-purple-200 pl-4">
                  <p className="text-gray-600 italic mb-2">
                    "As a small business owner, I want to thank Day.News for
                    highlighting the challenges we face. Your recent coverage
                    has helped bring attention to issues that affect our
                    livelihoods."
                  </p>
                  <p className="text-sm text-gray-500">
                    - Emily Rodriguez, North Clearwater
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Our Columnists */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Our Columnists
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="James Thompson"
                    className="w-12 h-12 rounded-full mr-4" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      James Thompson
                    </h3>
                    <p className="text-sm text-gray-600">Business & Economy</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Lisa Chen"
                    className="w-12 h-12 rounded-full mr-4" />

                  <div>
                    <h3 className="font-medium text-gray-900">Lisa Chen</h3>
                    <p className="text-sm text-gray-600">City Politics</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <img
                    src="https://randomuser.me/api/portraits/men/75.jpg"
                    alt="Robert Jackson"
                    className="w-12 h-12 rounded-full mr-4" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Robert Jackson
                    </h3>
                    <p className="text-sm text-gray-600">
                      Environment & Nature
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <img
                    src="https://randomuser.me/api/portraits/women/68.jpg"
                    alt="Maria Rodriguez"
                    className="w-12 h-12 rounded-full mr-4" />

                  <div>
                    <h3 className="font-medium text-gray-900">
                      Maria Rodriguez
                    </h3>
                    <p className="text-sm text-gray-600">Education</p>
                  </div>
                </div>
              </div>
              <Link
                to="#"
                className="mt-4 text-purple-600 font-medium hover:text-purple-800 flex items-center text-sm">

                View All Columnists
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Most Discussed */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                Most Discussed
              </h2>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-purple-600">
                    The Future of Clearwater's Downtown Development
                  </Link>
                  <div className="text-xs text-gray-500 ml-5">86 comments</div>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-purple-600">
                    Should We Expand the City's Public Transportation?
                  </Link>
                  <div className="text-xs text-gray-500 ml-5">72 comments</div>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-purple-600">
                    The Housing Affordability Crisis in Clearwater
                  </Link>
                  <div className="text-xs text-gray-500 ml-5">65 comments</div>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-purple-600">
                    Local Schools Face Budget Cuts: What's Next?
                  </Link>
                  <div className="text-xs text-gray-500 ml-5">58 comments</div>
                </li>
                <li className="text-gray-900">
                  <Link to="#" className="hover:text-purple-600">
                    Environmental Protection vs. Economic Growth
                  </Link>
                  <div className="text-xs text-gray-500 ml-5">42 comments</div>
                </li>
              </ol>
            </div>
            {/* Opinion Poll */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Weekly Poll
              </h2>
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  What should be the top priority for Clearwater's city budget?
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="poll-1"
                      name="poll"
                      type="radio"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />

                    <label
                      htmlFor="poll-1"
                      className="ml-2 block text-sm text-gray-700">

                      Infrastructure improvements
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="poll-2"
                      name="poll"
                      type="radio"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />

                    <label
                      htmlFor="poll-2"
                      className="ml-2 block text-sm text-gray-700">

                      Education funding
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="poll-3"
                      name="poll"
                      type="radio"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />

                    <label
                      htmlFor="poll-3"
                      className="ml-2 block text-sm text-gray-700">

                      Public safety
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="poll-4"
                      name="poll"
                      type="radio"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />

                    <label
                      htmlFor="poll-4"
                      className="ml-2 block text-sm text-gray-700">

                      Parks and recreation
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="poll-5"
                      name="poll"
                      type="radio"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />

                    <label
                      htmlFor="poll-5"
                      className="ml-2 block text-sm text-gray-700">

                      Economic development
                    </label>
                  </div>
                </div>
              </div>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                Vote
              </button>
              <div className="mt-3 text-sm text-gray-500 text-center">
                Results will be published next week
              </div>
            </div>
            {/* Subscribe */}
            <div className="bg-purple-50 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Stay Informed
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Get our top opinions delivered to your inbox weekly.
              </p>
              <div className="flex mb-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500" />

                <button className="bg-purple-600 text-white px-3 py-2 text-sm font-medium rounded-r-md hover:bg-purple-700 transition-colors">
                  Subscribe
                </button>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Mail className="h-3 w-3 mr-1" />
                <span>We respect your privacy. Unsubscribe anytime.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};