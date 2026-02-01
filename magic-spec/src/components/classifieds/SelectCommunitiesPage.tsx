import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, MapPin, ChevronRight } from 'lucide-react';
export const SelectCommunitiesPage = () => {
  const navigate = useNavigate();
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [communityList, setCommunityList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // If no form data was passed, redirect back to the post listing page
    if (!formData) {
      navigate('/postListing');
      return;
    }
    // Simulate loading communities from API
    setLoading(true);
    setTimeout(() => {
      // Mock community data
      const mockCommunities = [
      {
        id: 'clearwater',
        name: 'Clearwater',
        state: 'FL',
        members: 24500,
        active: true,
        description:
        'The official community for Clearwater, Florida residents.',
        image:
        'https://images.unsplash.com/photo-1593534560771-4f0fc0cabd94?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'dunedin',
        name: 'Dunedin',
        state: 'FL',
        members: 18300,
        active: true,
        description: 'Connect with neighbors in Dunedin, Florida.',
        image:
        'https://images.unsplash.com/photo-1534430480872-3498386e7856?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'stpetersburg',
        name: 'St. Petersburg',
        state: 'FL',
        members: 32700,
        active: true,
        description:
        'St. Petersburg community news, events, and classifieds.',
        image:
        'https://images.unsplash.com/photo-1580742471944-c1c187a943e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'tampa',
        name: 'Tampa',
        state: 'FL',
        members: 41200,
        active: true,
        description: 'Tampa Bay area community board.',
        image:
        'https://images.unsplash.com/photo-1606922619305-aae5c19a6593?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'palmharbor',
        name: 'Palm Harbor',
        state: 'FL',
        members: 15800,
        active: true,
        description: 'Palm Harbor community discussion and marketplace.',
        image:
        'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sarasota',
        name: 'Sarasota',
        state: 'FL',
        members: 28900,
        active: true,
        description: 'Sarasota community for local residents.',
        image:
        'https://images.unsplash.com/photo-1543039625-14cbd3802e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'largo',
        name: 'Largo',
        state: 'FL',
        members: 13600,
        active: true,
        description: 'Largo, FL community board and marketplace.',
        image:
        'https://images.unsplash.com/photo-1517404215738-15263e9f9178?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'oldsmar',
        name: 'Oldsmar',
        state: 'FL',
        members: 9200,
        active: true,
        description: 'Oldsmar community news and discussion.',
        image:
        'https://images.unsplash.com/photo-1565005691280-74f498c3e0b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'safetyharbor',
        name: 'Safety Harbor',
        state: 'FL',
        members: 11400,
        active: true,
        description: 'Safety Harbor local community and events.',
        image:
        'https://images.unsplash.com/photo-1567601169793-2c546f9d5526?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      }];

      setCommunityList(mockCommunities);
      // If preselected communities were passed (for rerun), set them
      if (
      isRerun &&
      preselectedCommunities &&
      preselectedCommunities.length > 0)
      {
        setSelectedCommunities(
          preselectedCommunities.map((community) => community.id)
        );
      }
      setLoading(false);
    }, 1000);
  }, [formData, isRerun, preselectedCommunities, navigate]);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const toggleCommunity = (communityId) => {
    if (selectedCommunities.includes(communityId)) {
      setSelectedCommunities(
        selectedCommunities.filter((id) => id !== communityId)
      );
    } else {
      setSelectedCommunities([...selectedCommunities, communityId]);
    }
  };
  const filteredCommunities = communityList.filter(
    (community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleBack = () => {
    navigate(-1);
  };
  const handleContinue = () => {
    if (selectedCommunities.length === 0) {
      alert('Please select at least one community');
      return;
    }
    // Get the full community objects for the selected IDs
    const selectedCommunityObjects = communityList.filter((community) =>
    selectedCommunities.includes(community.id)
    );
    // Navigate to timeframe selection with both form data and selected communities
    navigate('/classifieds/select-timeframe', {
      state: {
        formData,
        selectedCommunities: selectedCommunityObjects,
        isRerun
      }
    });
  };
  // Calculate pricing
  const calculatePrice = () => {
    const basePrice = 10; // $10 for up to 3 communities
    const additionalCommunityPrice = 2; // $2 per additional community
    if (selectedCommunities.length <= 3) {
      return basePrice;
    } else {
      return (
        basePrice + (selectedCommunities.length - 3) * additionalCommunityPrice);

    }
  };
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Select Communities
      </h1>
      {/* Updated pricing info section */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-800 font-medium mb-1">
              Pricing Information
            </h3>
            <p className="text-sm text-blue-700">
              Flat rate: $19 for 30 days
              <br />
              Includes listing in all selected communities
            </p>
          </div>
        </div>
      </div>
      {/* Search box */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary"
          aria-label="Search communities" />

      </div>
      {/* Communities list */}
      {loading ?
      <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-news-primary mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </div> :

      <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {filteredCommunities.map((community) =>
          <div
            key={community.id}
            onClick={() => toggleCommunity(community.id)}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${selectedCommunities.includes(community.id) ? 'border-news-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            role="checkbox"
            aria-checked={selectedCommunities.includes(community.id)}
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleCommunity(community.id);
              }
            }}>

                <div className="flex p-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                    <img
                  src={community.image}
                  alt={`${community.name} community`}
                  className="w-full h-full object-cover" />

                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">
                        {community.name}, {community.state}
                      </h3>
                      <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCommunities.includes(community.id) ? 'bg-news-primary border-news-primary' : 'border-gray-300'}`}>

                        {selectedCommunities.includes(community.id) &&
                    <Check className="h-3 w-3 text-white" />
                    }
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{community.members.toLocaleString()} members</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {community.description}
                    </p>
                  </div>
                </div>
              </div>
          )}
          </div>
          {filteredCommunities.length === 0 &&
        <div className="text-center py-8 border border-gray-200 rounded-lg">
              <p className="text-gray-500">
                No communities found matching your search.
              </p>
              <button
            onClick={() => setSearchQuery('')}
            className="text-news-primary mt-2 hover:underline"
            aria-label="Clear search">

                Clear search
              </button>
            </div>
        }
        </>
      }
      {/* Selected communities summary */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">
            Selected Communities: {selectedCommunities.length}
          </h3>
          <span className="font-medium text-news-primary">
            ${calculatePrice()}/month
          </span>
        </div>
        {selectedCommunities.length > 0 ?
        <div className="flex flex-wrap gap-2 mb-4">
            {selectedCommunities.map((communityId) => {
            const community = communityList.find((c) => c.id === communityId);
            return community ?
            <div
              key={community.id}
              className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">

                  <span className="text-gray-800">{community.name}</span>
                  <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCommunity(community.id);
                }}
                className="ml-2 text-gray-500 hover:text-gray-700"
                aria-label={`Remove ${community.name} from selection`}>

                    ✕
                  </button>
                </div> :
            null;
          })}
          </div> :

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Please select at least one community where your ad will be
                displayed.
              </p>
            </div>
          </div>
        }
      </div>
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/postListing')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">

          Back
        </button>
        <button
          onClick={() => navigate('/classifieds/select-timeframe')}
          className="px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark flex items-center"
          disabled={selectedCommunities.length === 0}>

          Continue
          <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>);

};