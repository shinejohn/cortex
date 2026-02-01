import React from 'react';
import { Users, Edit, MessageSquare, Star, BookOpen } from 'lucide-react';
export const TrendingPeople = ({ people, timePeriod }) => {
  // Group people by type
  const authors = people.filter((person) => person.type === 'author');
  const commenters = people.filter((person) => person.type === 'commenter');
  const newContributors = people.filter((person) => person.type === 'new');
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2 text-news-primary" />
          Trending People
        </h3>
      </div>
      <div className="p-4">
        {/* Most-read Authors */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Edit className="h-4 w-4 mr-1.5 text-blue-500" />
            Most-read Authors
          </h4>
          <div className="space-y-3">
            {authors.slice(0, 2).map((person) =>
            <PersonCard
              key={person.id}
              person={person}
              metric="reads"
              timePeriod={timePeriod} />

            )}
          </div>
        </div>
        {/* Active Commenters */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5 text-green-500" />
            Active Commenters
          </h4>
          <div className="space-y-3">
            {commenters.slice(0, 2).map((person) =>
            <PersonCard
              key={person.id}
              person={person}
              metric="comments"
              timePeriod={timePeriod} />

            )}
          </div>
        </div>
        {/* New Contributors */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Star className="h-4 w-4 mr-1.5 text-yellow-500" />
            New Contributors
          </h4>
          <div className="space-y-3">
            {newContributors.slice(0, 2).map((person) =>
            <PersonCard
              key={person.id}
              person={person}
              metric="articles"
              timePeriod={timePeriod} />

            )}
          </div>
        </div>
      </div>
    </div>);

};
const PersonCard = ({ person, metric, timePeriod }) => {
  // Get the appropriate metric value and label
  const getMetricInfo = () => {
    switch (metric) {
      case 'reads':
        return {
          value: formatNumber(person.reads),
          label: 'reads',
          icon: <BookOpen className="h-3 w-3 mr-1 text-gray-500" />
        };
      case 'comments':
        return {
          value: formatNumber(person.comments),
          label: 'comments',
          icon: <MessageSquare className="h-3 w-3 mr-1 text-gray-500" />
        };
      case 'articles':
        return {
          value: person.articles,
          label: 'articles',
          icon: <Edit className="h-3 w-3 mr-1 text-gray-500" />
        };
      default:
        return {
          value: formatNumber(person.reads),
          label: 'reads',
          icon: <BookOpen className="h-3 w-3 mr-1 text-gray-500" />
        };
    }
  };
  const metricInfo = getMetricInfo();
  return (
    <div className="flex items-center">
      {/* Avatar */}
      <div className="mr-3 relative">
        <div className="h-10 w-10 rounded-full overflow-hidden">
          <img
            src={person.avatar}
            alt={person.name}
            className="h-full w-full object-cover" />

        </div>
        {person.trending &&
        <div className="absolute -top-1 -right-1 bg-red-500 h-4 w-4 rounded-full flex items-center justify-center">
            <div className="text-white text-xs">
              <TrendingDot />
            </div>
          </div>
        }
      </div>
      {/* Person info */}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{person.name}</div>
        <div className="text-xs text-gray-500">{person.role}</div>
      </div>
      {/* Metric */}
      <div className="text-right">
        <div className="font-medium text-gray-900">{metricInfo.value}</div>
        <div className="text-xs text-gray-500 flex items-center justify-end">
          {metricInfo.icon}
          <span>{metricInfo.label}</span>
        </div>
      </div>
    </div>);

};
// Small trending dot component with animation
const TrendingDot = () => {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">

      <circle cx="4" cy="4" r="3" fill="white">
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="1.5s"
          repeatCount="indefinite" />

      </circle>
    </svg>);

};
// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num;
  }
};