import React, { useEffect, useState } from 'react';
// ssr-csr=ssr
// mockdata=yes
// mockdataon=yes

import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Calendar,
  Upload,
  User,
  Heart,
  MessageSquare,
  Plus,
  ChevronDown } from
'lucide-react';
import { PageHeader } from '../PageHeader';
import { PhotoGrid } from './PhotoGrid';
import { PhotoList } from './PhotoList';
export const PhotoGalleryPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCommunity, setSelectedCommunity] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All time');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPhotos([
      {
        id: '1',
        title: 'Clearwater Beach Sunset',
        description:
        'Beautiful sunset at Clearwater Beach with palm trees silhouette',
        imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'John Shine',
        authorId: '123',
        community: 'Clearwater',
        category: 'Nature',
        date: '2025-07-28T18:30:00',
        likes: 42,
        comments: 7
      },
      {
        id: '2',
        title: 'Downtown Farmers Market',
        description:
        'Local vendors at the Saturday morning farmers market in downtown Dunedin',
        imageUrl:
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Sarah Johnson',
        authorId: '124',
        community: 'Dunedin',
        category: 'Events',
        date: '2025-07-25T10:15:00',
        likes: 38,
        comments: 12
      },
      {
        id: '3',
        title: 'Pier 60 Fishing',
        description:
        'Early morning fishing at Pier 60 with the sunrise in the background',
        imageUrl:
        'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Mike Peterson',
        authorId: '125',
        community: 'Clearwater',
        category: 'Recreation',
        date: '2025-07-22T06:45:00',
        likes: 27,
        comments: 5
      },
      {
        id: '4',
        title: 'Community Garden Harvest',
        description:
        'Volunteers harvesting vegetables at the Palm Harbor community garden',
        imageUrl:
        'https://images.unsplash.com/photo-1592419044706-39796d40f98c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Lisa Wong',
        authorId: '126',
        community: 'Palm Harbor',
        category: 'Community',
        date: '2025-07-20T09:30:00',
        likes: 51,
        comments: 8
      },
      {
        id: '5',
        title: 'Honeymoon Island Beach Cleanup',
        description:
        'Local volunteers participating in the monthly beach cleanup event',
        imageUrl:
        'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'John Shine',
        authorId: '123',
        community: 'Dunedin',
        category: 'Environment',
        date: '2025-07-19T08:00:00',
        likes: 64,
        comments: 15
      },
      {
        id: '6',
        title: 'Local Baseball Tournament',
        description:
        'Youth baseball tournament at Clearwater, Bright, House, Field. Image URL: https://images.unsplash.com/photo-1508344928928-7165b0c40767?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'David Miller',
        authorId: '127',
        community: 'Clearwater',
        category: 'Sports',
        date: '2025-07-18T14:00:00',
        likes: 33,
        comments: 6
      },
      {
        id: '7',
        title: 'Historic Downtown Architecture',
        description:
        'Beautiful historic buildings in downtown Dunedin showcasing early 20th century architecture',
        imageUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Sarah Johnson',
        authorId: '124',
        community: 'Dunedin',
        category: 'Architecture',
        date: '2025-07-15T11:20:00',
        likes: 47,
        comments: 9
      },
      {
        id: '8',
        title: 'Sunset at Safety Harbor Pier',
        description:
        'Breathtaking sunset views from the Safety Harbor fishing pier',
        imageUrl:
        'https://images.unsplash.com/photo-1500245804862-0045f7f49e37?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Mike Peterson',
        authorId: '125',
        community: 'Safety Harbor',
        category: 'Nature',
        date: '2025-07-12T19:45:00',
        likes: 58,
        comments: 11
      }]
      );
      setLoading(false);
    }, 1000);
  }, []);
  // Filter photos based on search query and filters
  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch =
    searchQuery === '' ||
    photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
    selectedCategory === 'All' || photo.category === selectedCategory;
    const matchesCommunity =
    selectedCommunity === 'All' || photo.community === selectedCommunity;
    // Time filter logic
    let matchesTimeframe = true;
    const photoDate = new Date(photo.date);
    const now = new Date();
    if (selectedTimeframe === 'Today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      matchesTimeframe = photoDate >= today;
    } else if (selectedTimeframe === 'This week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesTimeframe = photoDate >= weekAgo;
    } else if (selectedTimeframe === 'This month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesTimeframe = photoDate >= monthAgo;
    }
    return (
      matchesSearch && matchesCategory && matchesCommunity && matchesTimeframe);

  });
  const handlePhotoClick = (photoId) => {
    navigate(`/photos/${photoId}`);
  };
  const handleUploadClick = () => {
    navigate('/photos/upload');
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            Community Photo Gallery
          </h1>
          <button
            onClick={handleUploadClick}
            className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-news-primary-dark transition-colors">

            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </button>
        </div>
        {/* Search and filter bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent" />

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium">

                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-news-primary text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>

                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-news-primary text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>

                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Filter options */}
          {filterOpen &&
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent">

                  <option value="All">All Categories</option>
                  <option value="Nature">Nature</option>
                  <option value="Events">Events</option>
                  <option value="Recreation">Recreation</option>
                  <option value="Community">Community</option>
                  <option value="Environment">Environment</option>
                  <option value="Sports">Sports</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community
                </label>
                <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent">

                  <option value="All">All Communities</option>
                  <option value="Clearwater">Clearwater</option>
                  <option value="Dunedin">Dunedin</option>
                  <option value="Palm Harbor">Palm Harbor</option>
                  <option value="Safety Harbor">Safety Harbor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </label>
                <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent">

                  <option value="All time">All time</option>
                  <option value="Today">Today</option>
                  <option value="This week">This week</option>
                  <option value="This month">This month</option>
                </select>
              </div>
            </div>
          }
        </div>
        {/* Photo display */}
        {loading ?
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-news-primary"></div>
          </div> :
        filteredPhotos.length > 0 ?
        viewMode === 'grid' ?
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={handlePhotoClick} /> :


        <PhotoList
          photos={filteredPhotos}
          onPhotoClick={handlePhotoClick} /> :



        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">No photos found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any photos matching your search criteria. Try
              adjusting your filters or upload a new photo.
            </p>
            <button
            onClick={handleUploadClick}
            className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center hover:bg-news-primary-dark transition-colors">

              <Plus className="h-4 w-4 mr-2" />
              Upload a Photo
            </button>
          </div>
        }
      </div>
    </div>);

};