import React from 'react';
import { Clock, MapPin, Bookmark } from 'lucide-react';
export const HeroStory = ({
  category = null,
  fullWidth = false,
  onArticleClick
}) => {
  const allStories = [
  {
    id: 1,
    title:
    'Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year',
    description:
    'The budget maintains the current millage rate while increasing funding for infrastructure and public safety initiatives.',
    image:
    'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    category: 'Government',
    location: 'City Hall',
    readTime: '5 min',
    date: 'Aug 2, 2024',
    author: 'Sarah Johnson',
    authorInitials: 'SJ',
    featured: true
  },
  {
    id: 2,
    title:
    'New Waterfront Development Project Breaks Ground in Downtown Clearwater',
    description:
    'The $120 million mixed-use development will feature retail, restaurants, and luxury condominiums.',
    image:
    'https://images.unsplash.com/photo-1545127398-14699f92334b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    category: 'Economy & Business News',
    location: 'Downtown',
    readTime: '4 min',
    date: 'Aug 1, 2024',
    author: 'Michael Chen',
    authorInitials: 'MC',
    featured: true
  },
  {
    id: 3,
    title: 'Clearwater Beach Named Top 10 Destination for Fall Travel',
    description:
    'National travel magazine ranks Clearwater Beach among the best fall getaways for its perfect weather and reduced crowds.',
    image:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    category: 'Tourism',
    location: 'Clearwater Beach',
    readTime: '3 min',
    date: 'Jul 30, 2024',
    author: 'Jessica Taylor',
    authorInitials: 'JT',
    featured: true
  },
  {
    id: 4,
    title: 'Local High School Football Team Advances to State Championship',
    description:
    'The Clearwater Tornadoes defeated their rivals 28-14 in a thrilling semifinal game.',
    image:
    'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    category: 'Sports',
    location: 'Memorial Stadium',
    readTime: '4 min',
    date: 'Jul 29, 2024',
    author: 'Robert Wilson',
    authorInitials: 'RW',
    featured: false
  },
  {
    id: 5,
    title: 'New STEM Program Announced for Clearwater Elementary Schools',
    description:
    'The initiative aims to boost science and technology education starting in the 2025 school year.',
    image:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    category: 'Education',
    location: 'School District HQ',
    readTime: '3 min',
    date: 'Jul 28, 2024',
    author: 'Amanda Lopez',
    authorInitials: 'AL',
    featured: false
  },
  {
    id: 6,
    title: 'Hurricane Preparedness: What Clearwater Residents Need to Know',
    description:
    'Officials outline evacuation routes and emergency procedures as hurricane season approaches its peak.',
    image:
    'https://images.unsplash.com/photo-1574724713425-fee7e2eacf84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    category: 'Weather & Environment',
    location: 'Emergency Operations Center',
    readTime: '6 min',
    date: 'Jul 27, 2024',
    author: 'Thomas Grant',
    authorInitials: 'TG',
    featured: false
  }];

  // Filter by category if provided
  const filteredStories = category ?
  allStories.filter((story) => story.category === category) :
  allStories;
  // Get the top story - either the first in the filtered list or the first featured story
  const topStory =
  filteredStories.length > 0 ?
  filteredStories[0] :
  allStories.find((story) => story.featured) || allStories[0];
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onArticleClick}>

      <div className="relative">
        <img
          src={topStory.image}
          alt={topStory.title}
          className={`w-full object-cover ${fullWidth ? 'h-96' : 'h-64'}`} />

        <div className="absolute top-4 left-4">
          <span className="bg-news-primary text-white px-3 py-1 rounded-md text-sm font-medium">
            {topStory.category.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {topStory.title}
        </h2>
        <p className="text-gray-600 mb-4">{topStory.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="mr-3">{topStory.location}</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{topStory.readTime}</span>
            <span className="mx-2">•</span>
            <span>{topStory.date}</span>
          </div>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Bookmark className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          <div className="h-8 w-8 bg-news-primary text-white rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {topStory.authorInitials}
            </span>
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium text-gray-900">
              {topStory.author}
            </div>
            <div className="text-xs text-gray-500">Staff Writer</div>
          </div>
        </div>
      </div>
    </div>);

};