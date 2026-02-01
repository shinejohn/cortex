import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  Users,
  Newspaper,
  Lightbulb,
  Building } from
'lucide-react';
export const StoryTimeline = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const milestones = [
  {
    year: 2019,
    title: 'Our Beginning',
    description:
    'Founded with a mission to revitalize local journalism through technology and community engagement.',
    icon: <Building className="h-6 w-6" />,
    stats: {
      communities: 3,
      stories: 257,
      team: 5
    }
  },
  {
    year: 2020,
    title: 'AI Integration',
    description:
    'Implemented our first AI journalists to help process and analyze local data, freeing our human journalists to focus on investigative reporting.',
    icon: <Lightbulb className="h-6 w-6" />,
    stats: {
      communities: 12,
      stories: 1458,
      team: 14
    }
  },
  {
    year: 2021,
    title: 'Rapid Expansion',
    description:
    'Expanded to 25 communities across the state, with a focus on underserved rural areas lacking local news coverage.',
    icon: <Users className="h-6 w-6" />,
    stats: {
      communities: 25,
      stories: 4587,
      team: 28
    }
  },
  {
    year: 2022,
    title: 'Award Recognition',
    description:
    'Received the National Innovation in Journalism Award for our unique approach to sustainable local news.',
    icon: <Award className="h-6 w-6" />,
    stats: {
      communities: 42,
      stories: 8754,
      team: 47
    }
  },
  {
    year: 2023,
    title: 'Community Ownership',
    description:
    'Launched our community ownership model, allowing readers to invest in their local news ecosystem.',
    icon: <Users className="h-6 w-6" />,
    stats: {
      communities: 65,
      stories: 12543,
      team: 72
    }
  },
  {
    year: 2024,
    title: 'Today',
    description:
    'Now serving over 80 communities with a hybrid team of human journalists and AI assistants, publishing thousands of local stories monthly.',
    icon: <Newspaper className="h-6 w-6" />,
    stats: {
      communities: 87,
      stories: 15783,
      team: 95
    }
  }];

  const handlePrevious = () => {
    setActiveIndex((prev) => prev > 0 ? prev - 1 : prev);
  };
  const handleNext = () => {
    setActiveIndex((prev) => prev < milestones.length - 1 ? prev + 1 : prev);
  };
  const activeMilestone = milestones[activeIndex];
  const progress = (activeIndex + 1) / milestones.length * 100;
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Our Story
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From a small startup to a network of community-powered news
            platforms
          </p>
        </div>
        {/* Timeline progress bar */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-news-primary rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${progress}%`
              }}>
            </div>
          </div>
          {/* Year markers */}
          <div className="flex justify-between mt-2">
            {milestones.map((milestone, index) =>
            <button
              key={milestone.year}
              onClick={() => setActiveIndex(index)}
              className={`flex flex-col items-center transition-all ${index === activeIndex ? 'scale-110' : 'opacity-70'}`}>

                <span
                className={`w-4 h-4 rounded-full ${index === activeIndex ? 'bg-news-primary' : 'bg-gray-300'} mb-1`}>
              </span>
                <span
                className={`text-sm font-medium ${index === activeIndex ? 'text-news-primary' : 'text-gray-500'}`}>

                  {milestone.year}
                </span>
              </button>
            )}
          </div>
        </div>
        {/* Active milestone card */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-news-primary text-white flex items-center justify-center p-6 md:p-8">
              <div className="text-center">
                <div className="flex justify-center">
                  {activeMilestone.icon}
                </div>
                <div className="text-4xl font-bold mt-2">
                  {activeMilestone.year}
                </div>
                <Calendar className="h-5 w-5 mx-auto mt-2 opacity-70" />
              </div>
            </div>
            <div className="p-8">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {activeMilestone.title}
              </div>
              <p className="text-gray-600 mb-6">
                {activeMilestone.description}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-news-primary">
                    {activeMilestone.stats.communities}
                  </div>
                  <div className="text-sm text-gray-500">Communities</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-news-primary">
                    {activeMilestone.stats.stories.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Stories</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-news-primary">
                    {activeMilestone.stats.team}
                  </div>
                  <div className="text-sm text-gray-500">Team Members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={activeIndex === 0}
            className={`p-2 rounded-full ${activeIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>

            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === milestones.length - 1}
            className={`p-2 rounded-full ${activeIndex === milestones.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>

            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>);

};