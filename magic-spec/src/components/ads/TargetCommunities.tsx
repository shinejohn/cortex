import React, { useEffect, useState } from 'react';
import {
  Search,
  Sliders,
  X,
  Check,
  ChevronDown,
  Plus,
  CheckCircle } from
'lucide-react';
import { CommunityCard } from './CommunityCard';
import { SelectedCommunitiesSidebar } from './SelectedCommunitiesSidebar';
interface TargetCommunitiesProps {
  onCommunitiesChange: (communities: Community[]) => void;
  selectedCommunities: Community[];
}
export interface Community {
  id: string;
  name: string;
  avatar: string;
  members: number;
  dailyActive: number;
  engagementRate: number;
  engagementText: string;
  topics: string[];
  price: number;
  ctr: number;
  category: string;
  size: string;
}
export const TargetCommunities: React.FC<TargetCommunitiesProps> = ({
  onCommunitiesChange,
  selectedCommunities
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    size: '',
    engagement: '',
    priceRange: [5, 100]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    []
  );
  // Load mock communities data
  useEffect(() => {
    // This would be an API call in a real application
    const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'r/webdev',
      avatar:
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 2400000,
      dailyActive: 45000,
      engagementRate: 5,
      engagementText: 'Very High',
      topics: ['Web Development', 'JavaScript', 'Career'],
      price: 25,
      ctr: 3.2,
      category: 'Technology',
      size: '1M+'
    },
    {
      id: '2',
      name: 'r/programming',
      avatar:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 5200000,
      dailyActive: 82000,
      engagementRate: 4,
      engagementText: 'High',
      topics: ['Programming', 'Computer Science', 'Software Engineering'],
      price: 35,
      ctr: 2.8,
      category: 'Technology',
      size: '1M+'
    },
    {
      id: '3',
      name: 'r/javascript',
      avatar:
      'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 1800000,
      dailyActive: 32000,
      engagementRate: 5,
      engagementText: 'Very High',
      topics: ['JavaScript', 'Web Development', 'Frontend'],
      price: 22,
      ctr: 3.5,
      category: 'Technology',
      size: '1M+'
    },
    {
      id: '4',
      name: 'r/gaming',
      avatar:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 34000000,
      dailyActive: 520000,
      engagementRate: 5,
      engagementText: 'Very High',
      topics: ['Video Games', 'Gaming News', 'Esports'],
      price: 50,
      ctr: 2.9,
      category: 'Gaming',
      size: '1M+'
    },
    {
      id: '5',
      name: 'r/pcgaming',
      avatar:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 2800000,
      dailyActive: 42000,
      engagementRate: 4,
      engagementText: 'High',
      topics: ['PC Gaming', 'Hardware', 'Game Development'],
      price: 28,
      ctr: 3.0,
      category: 'Gaming',
      size: '1M+'
    },
    {
      id: '6',
      name: 'r/startups',
      avatar:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 980000,
      dailyActive: 15000,
      engagementRate: 4,
      engagementText: 'High',
      topics: ['Startups', 'Entrepreneurship', 'Business'],
      price: 18,
      ctr: 2.7,
      category: 'Business',
      size: '100K-1M'
    },
    {
      id: '7',
      name: 'r/fitness',
      avatar:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 8500000,
      dailyActive: 95000,
      engagementRate: 3,
      engagementText: 'Medium',
      topics: ['Fitness', 'Health', 'Nutrition'],
      price: 32,
      ctr: 2.4,
      category: 'Lifestyle',
      size: '1M+'
    },
    {
      id: '8',
      name: 'r/localguides',
      avatar:
      'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 75000,
      dailyActive: 8000,
      engagementRate: 5,
      engagementText: 'Very High',
      topics: ['Local Events', 'City Guides', 'Travel'],
      price: 12,
      ctr: 4.1,
      category: 'Local',
      size: '10K-100K'
    },
    {
      id: '9',
      name: 'r/smallbusiness',
      avatar:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 650000,
      dailyActive: 12000,
      engagementRate: 4,
      engagementText: 'High',
      topics: ['Small Business', 'Entrepreneurship', 'Marketing'],
      price: 15,
      ctr: 3.3,
      category: 'Business',
      size: '100K-1M'
    },
    {
      id: '10',
      name: 'r/techstartups',
      avatar:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 85000,
      dailyActive: 7500,
      engagementRate: 5,
      engagementText: 'Very High',
      topics: ['Tech Startups', 'Venture Capital', 'Innovation'],
      price: 14,
      ctr: 3.8,
      category: 'Technology',
      size: '10K-100K'
    },
    {
      id: '11',
      name: 'r/homeimprovement',
      avatar:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 3200000,
      dailyActive: 38000,
      engagementRate: 3,
      engagementText: 'Medium',
      topics: ['DIY', 'Home Improvement', 'Interior Design'],
      price: 22,
      ctr: 2.6,
      category: 'Lifestyle',
      size: '1M+'
    },
    {
      id: '12',
      name: 'r/localdeals',
      avatar:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      members: 42000,
      dailyActive: 5000,
      engagementRate: 4,
      engagementText: 'High',
      topics: ['Local Deals', 'Coupons', 'Shopping'],
      price: 8,
      ctr: 3.7,
      category: 'Local',
      size: '10K-100K'
    }];

    setCommunities(mockCommunities);
    setFilteredCommunities(mockCommunities);
  }, []);
  // Apply filters and search
  useEffect(() => {
    let filtered = [...communities];
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (community) =>
        community.name.toLowerCase().includes(query) ||
        community.topics.some((topic) => topic.toLowerCase().includes(query))
      );
    }
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (community) => community.category === filters.category
      );
    }
    // Apply size filter
    if (filters.size) {
      filtered = filtered.filter((community) => community.size === filters.size);
    }
    // Apply engagement filter
    if (filters.engagement) {
      const engagementMap: Record<string, string> = {
        'Very High': 'Very High',
        High: 'High',
        Medium: 'Medium'
      };
      filtered = filtered.filter(
        (community) =>
        community.engagementText === engagementMap[filters.engagement]
      );
    }
    // Apply price range filter
    filtered = filtered.filter(
      (community) =>
      community.price >= filters.priceRange[0] &&
      community.price <= filters.priceRange[1]
    );
    setFilteredCommunities(filtered);
  }, [searchQuery, filters, communities]);
  const toggleCommunity = (community: Community) => {
    const isSelected = selectedCommunities.some((c) => c.id === community.id);
    if (isSelected) {
      const updated = selectedCommunities.filter((c) => c.id !== community.id);
      onCommunitiesChange(updated);
    } else {
      onCommunitiesChange([...selectedCommunities, community]);
    }
  };
  const handleFilterChange = (filterType: string, value: string | number[]) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };
  const clearFilters = () => {
    setFilters({
      category: '',
      size: '',
      engagement: '',
      priceRange: [5, 100]
    });
    setSearchQuery('');
  };
  const selectAllTech = () => {
    const techCommunities = communities.filter(
      (c) => c.category === 'Technology'
    );
    onCommunitiesChange([
    ...selectedCommunities,
    ...techCommunities.filter(
      (tech) => !selectedCommunities.some((s) => s.id === tech.id)
    )]
    );
  };
  const selectTopEngagement = () => {
    const topByEngagement = [...communities].
    sort((a, b) => b.engagementRate - a.engagementRate).
    slice(0, 10);
    onCommunitiesChange([
    ...selectedCommunities,
    ...topByEngagement.filter(
      (top) => !selectedCommunities.some((s) => s.id === top.id)
    )]
    );
  };
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left section - Search, filters, and community grid */}
      <div className="w-full lg:w-2/3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choose your target communities
        </h1>
        <p className="text-gray-600 mb-6">
          Select the communities where your ad will appear
        </p>
        {/* Search and filter section */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search communities by name or topic"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

              {searchQuery &&
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">

                  <X className="h-5 w-5" />
                </button>
              }
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700">

              <Sliders className="h-5 w-5 mr-2" />
              Filters
              {(filters.category ||
              filters.size ||
              filters.engagement ||
              filters.priceRange[0] !== 5 ||
              filters.priceRange[1] !== 100) &&
              <span className="ml-2 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {
                Object.values(filters).filter(
                  (v) =>
                  v && (
                  Array.isArray(v) ? v[0] !== 5 || v[1] !== 100 : true)
                ).length
                }
                </span>
              }
            </button>
          </div>
          {/* Filters section */}
          {showFilters &&
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">Filters</h3>
                <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800">

                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Category filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                  value={filters.category}
                  onChange={(e) =>
                  handleFilterChange('category', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                    <option value="">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Business">Business</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
                {/* Size filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                    <option value="">All Sizes</option>
                    <option value="Under 10K">Under 10K</option>
                    <option value="10K-100K">10K-100K</option>
                    <option value="100K-1M">100K-1M</option>
                    <option value="1M+">1M+</option>
                  </select>
                </div>
                {/* Engagement filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engagement
                  </label>
                  <select
                  value={filters.engagement}
                  onChange={(e) =>
                  handleFilterChange('engagement', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                    <option value="">All Engagement Levels</option>
                    <option value="Very High">Very High</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>
              {/* Price range slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Price Range (per day)
                  </label>
                  <span className="text-sm text-gray-600">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </span>
                </div>
                <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={filters.priceRange[1]}
                onChange={(e) =>
                handleFilterChange('priceRange', [
                filters.priceRange[0],
                parseInt(e.target.value)]
                )
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$5</span>
                  <span>$100</span>
                </div>
              </div>
            </div>
          }
          {/* Bulk action buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={selectAllTech}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md">

              Select all Tech communities
            </button>
            <button
              onClick={selectTopEngagement}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md">

              Add top 10 by engagement
            </button>
            <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md">
              Import from previous campaign
            </button>
          </div>
        </div>
        {/* Community grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommunities.length > 0 ?
          filteredCommunities.map((community) =>
          <CommunityCard
            key={community.id}
            community={community}
            isSelected={selectedCommunities.some(
              (c) => c.id === community.id
            )}
            onToggle={() => toggleCommunity(community)} />

          ) :

          <div className="col-span-2 py-12 text-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-gray-400 mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                No communities found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search query
              </p>
              <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium">

                Clear all filters
              </button>
            </div>
          }
        </div>
      </div>
      {/* Right section - Selected communities sidebar */}
      <div className="w-full lg:w-1/3">
        <SelectedCommunitiesSidebar
          selectedCommunities={selectedCommunities}
          onRemove={(id) =>
          onCommunitiesChange(selectedCommunities.filter((c) => c.id !== id))
          } />

      </div>
    </div>);

};