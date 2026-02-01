import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Edit,
  MapPin,
  ThermometerIcon,
  Check } from
'lucide-react';
const ArticleSeoPage = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  // Mock data for the comparison view
  const originalContent = {
    title: 'Clearwater Community Center Reopens After Renovation',
    metaDescription:
    'The Clearwater Community Center has reopened following a renovation project that has improved facilities for residents.',
    content: `The newly renovated Clearwater Community Center has officially reopened its doors, and residents are already calling it a major success for the city.
The $3.2 million renovation project, which began last year, has transformed the aging facility into a modern, accessible space that better serves the community's needs.
"We're absolutely thrilled with the results," said Mayor Jane Johnson during the ribbon-cutting ceremony on Saturday. "This center has always been the heart of our community, and now it has the facilities to match."
The renovations include an expanded library section, a state-of-the-art computer lab, multiple meeting rooms, and a large multipurpose space for events. Additionally, the building now features improved accessibility, energy-efficient systems, and updated safety measures.
Community members who attended the opening celebration expressed their approval of the changes. "I've been coming to this center for over 20 years, and I've never seen it look this good," said longtime resident Robert Chen, 67. "The new computer lab is going to be especially helpful for seniors like me who want to stay connected."
The project was completed on time and under budget, according to city officials, who credit careful planning and community input for the successful outcome.`,
    tags: ['community center', 'renovation', 'clearwater']
  };
  const optimizedContent = {
    title:
    'Clearwater Community Center Reopens After $3.2M Renovation with Enhanced Facilities',
    metaDescription:
    'The Clearwater Community Center has reopened following a $3.2M renovation project that brings modern facilities, improved accessibility, and new resources to community residents.',
    content: `The newly renovated Clearwater Community Center has officially reopened its doors, and local residents are already calling it a major success for the city.
The $3.2 million renovation project, which began last year, has transformed the aging facility into a modern, accessible community space that better serves the diverse needs of Clearwater residents.
"We're absolutely thrilled with the results," said Mayor Jane Johnson during the ribbon-cutting ceremony on Saturday. "This community center has always been the heart of our Clearwater neighborhood, and now it has the modern facilities to match."
The extensive renovations include an expanded library section, a state-of-the-art computer lab, multiple community meeting rooms, and a large multipurpose space for public events. Additionally, the building now features improved accessibility features, energy-efficient systems, and updated safety measures for all visitors.
Community members who attended the opening celebration expressed their approval of the accessibility improvements and facility upgrades. "I've been coming to this community center for over 20 years, and I've never seen it look this good," said longtime Clearwater resident Robert Chen, 67. "The new computer lab is going to be especially helpful for seniors like me who want to stay connected."
The renovation project was completed on time and under budget, according to Clearwater city officials, who credit careful planning and community input for the successful outcome.`,
    tags: [
    'community center',
    'renovation',
    'clearwater',
    'public facilities',
    'accessibility improvements',
    'community resources',
    'local government']

  };
  // Handle synchronized scrolling between panels
  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollTop);
  };
  useEffect(() => {
    const originalPanel = document.getElementById('original-content');
    const optimizedPanel = document.getElementById('optimized-content');
    if (originalPanel) originalPanel.scrollTop = scrollPosition;
    if (optimizedPanel) optimizedPanel.scrollTop = scrollPosition;
  }, [scrollPosition]);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Community Bar */}
      <div className="bg-news-primary text-white py-2 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>Clearwater, FL</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <ThermometerIcon className="h-3.5 w-3.5 mr-1" />
                <span>78°F Sunny</span>
              </div>
              <span className="mx-2">•</span>
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Newspaper title header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-news-primary">
            CLEARWATER DAY NEWS
          </h1>
          <p className="text-gray-600 italic mt-1">
            "Your Community, Your News"
          </p>
        </div>
      </div>
      {/* Progress Bar Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4 text-center">
            SEO Optimization
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Review and approve AI-enhanced SEO optimizations for your article
          </p>
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 font-medium">
                Step 3 of 4: SEO Optimization
              </div>
              <div className="text-gray-500">75% Complete</div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: '75%'
                }}>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 text-sm font-medium max-w-3xl mx-auto">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-green-600">Draft Article</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-green-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-green-600">Metadata</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-green-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                3
              </div>
              <span className="text-blue-600">SEO</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-gray-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">
                4
              </div>
              <span className="text-gray-500">Review</span>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Split-screen comparison view */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Left panel - Original content */}
                <div className="flex-1 border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Original Content
                    </h2>
                  </div>
                  <div
                    id="original-content"
                    className="p-4 h-[600px] overflow-y-auto"
                    onScroll={handleScroll}>

                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Article Title
                      </h3>
                      <p className="text-gray-800 font-medium">
                        {originalContent.title}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Meta Description
                      </h3>
                      <p className="text-gray-800 text-sm">
                        {originalContent.metaDescription}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Content
                      </h3>
                      <div className="text-gray-800 text-sm whitespace-pre-line">
                        {originalContent.content}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {originalContent.tags.map((tag, index) =>
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">

                            {tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Arrow between panels */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                {/* Right panel - SEO-optimized version */}
                <div className="flex-1 border border-gray-200 rounded-lg">
                  <div className="bg-blue-50 p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                      SEO-Optimized Version
                    </h2>
                  </div>
                  <div
                    id="optimized-content"
                    className="p-4 h-[600px] overflow-y-auto"
                    onScroll={handleScroll}>

                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Article Title
                      </h3>
                      <p className="text-gray-800 font-medium">
                        {optimizedContent.title}
                      </p>
                      <div className="mt-1 flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-xs text-green-600">
                          +keywords: $3.2M, Enhanced Facilities
                        </span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Meta Description
                      </h3>
                      <p className="text-gray-800 text-sm">
                        {optimizedContent.metaDescription}
                      </p>
                      <div className="mt-1 flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-xs text-green-600">
                          +CTR focused with specific details
                        </span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Content
                      </h3>
                      <div className="text-gray-800 text-sm whitespace-pre-line">
                        {optimizedContent.content.
                        split(' ').
                        map((word, index) => {
                          // Highlight SEO keywords
                          const keywords = [
                          'Clearwater',
                          'community',
                          'facilities',
                          'accessibility',
                          'modern',
                          'residents'];

                          const isKeyword = keywords.some((keyword) =>
                          word.
                          toLowerCase().
                          includes(keyword.toLowerCase())
                          );
                          return (
                            <span
                              key={index}
                              className={isKeyword ? 'bg-green-100' : ''}>

                                {word}{' '}
                              </span>);

                        })}
                      </div>
                      <div className="mt-1 flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-xs text-green-600">
                          +keywords strategically placed
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {optimizedContent.tags.map((tag, index) =>
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${originalContent.tags.includes(tag) ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>

                            {tag}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-xs text-green-600">
                          +related tags for better discoverability
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={() => navigate('/create-article/metadata')}
                  className="flex items-center text-gray-700 hover:text-gray-900 font-medium">

                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back to Metadata
                </button>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/create-article/review')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-medium">

                    <Check className="h-5 w-5 mr-2" />
                    Accept SEO Changes
                  </button>
                  <button
                    onClick={() => navigate('/create-article/review')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center font-medium">

                    <Edit className="h-5 w-5 mr-2" />
                    Edit Manually
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};
export default ArticleSeoPage;