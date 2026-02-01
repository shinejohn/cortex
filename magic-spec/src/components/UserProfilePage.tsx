import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Settings,
  FileText,
  Bell,
  Bookmark,
  Heart,
  Tag,
  Pen,
  Users,
  Award,
  Headphones,
  Video,
  Mic,
  Play,
  Pause,
  Eye,
  Clock,
  CheckCircle } from
'lucide-react';
import { Link } from 'react-router-dom';
export const UserProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  // Add state for viewed episodes and followed creators
  const [viewedEpisodes, setViewedEpisodes] = useState({});
  const [followedCreators, setFollowedCreators] = useState([]);
  const [isPlaying, setIsPlaying] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);
  // Load viewed episodes and followed creators from localStorage
  useEffect(() => {
    try {
      const storedViewedEpisodes = localStorage.getItem('viewedEpisodes');
      if (storedViewedEpisodes) {
        setViewedEpisodes(JSON.parse(storedViewedEpisodes));
      }
      const storedFollowedCreators = localStorage.getItem('followedCreators');
      if (storedFollowedCreators) {
        setFollowedCreators(JSON.parse(storedFollowedCreators));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);
  // Mock data for Local Voices episodes
  const localVoicesEpisodes = [
  {
    id: 'ep1',
    title: 'City Council Approves New Downtown Development Plan',
    description:
    'In this episode, we discuss the recent approval of the downtown development plan and what it means for local businesses and residents.',
    publish_date: '2023-08-01T08:00:00Z',
    duration: '32:15',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '1',
    creator_name: 'The Clearwater Report',
    creator_image:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Politics',
    media_type: 'audio'
  },
  {
    id: 'ep2',
    title: 'How Local Startups Are Weathering Economic Uncertainty',
    description:
    'Local startup founders share their strategies for navigating the current economic climate and planning for future growth.',
    publish_date: '2023-07-28T10:00:00Z',
    duration: '45:30',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '2',
    creator_name: 'Tampa Bay Business Weekly',
    creator_image:
    'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Business',
    media_type: 'audio'
  },
  {
    id: 'ep17',
    title: 'Rays Trade Deadline Special',
    description:
    "Breaking down the Tampa Bay Rays' moves at the MLB trade deadline and what they mean for the team's playoff prospects.",
    publish_date: new Date().toISOString(),
    duration: '47:33',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '1',
    creator_name: 'The Clearwater Report',
    creator_image:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Sports',
    media_type: 'video'
  }];

  // Function to check if an episode is new (published within the last month)
  const isNewEpisode = (publishDate) => {
    const now = new Date();
    const episodeDate = new Date(publishDate);
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    return episodeDate >= oneMonthAgo;
  };
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Function to handle play/pause
  const handlePlayPause = (episodeId, audioUrl) => {
    if (isPlaying === episodeId) {
      // Currently playing this episode, so pause it
      setIsPlaying(null);
      audioRef.current.pause();
    } else {
      // Play this episode
      setIsPlaying(episodeId);
      setCurrentAudio(audioUrl);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(null);
        });
      }
    }
  };
  // Get viewed episodes
  const getViewedEpisodes = () => {
    return localVoicesEpisodes.filter((episode) => viewedEpisodes[episode.id]);
  };
  // Get new episodes from creators the user has watched
  const getNewEpisodesFromWatchedCreators = () => {
    // Get unique creator IDs from viewed episodes
    const watchedCreatorIds = new Set(
      Object.values(viewedEpisodes).map((item) => item.creatorId)
    );
    // Get new episodes from those creators
    return localVoicesEpisodes.filter(
      (episode) =>
      watchedCreatorIds.has(episode.creator_id) &&
      isNewEpisode(episode.publish_date) &&
      !viewedEpisodes[episode.id] // Only show unwatched new episodes
    );
  };
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-news-primary h-32 relative"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md z-10">
                <img
                  src={userData.profileImage}
                  alt={userData.name}
                  className="w-full h-full object-cover" />

              </div>
              <div className="mt-4 md:mt-0 md:ml-6 md:pb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name}
                </h1>
                <p className="text-gray-600">{userData.location}</p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
                <button
                  onClick={() => navigate('/settings')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center">

                  <Settings className="h-4 w-4 mr-1.5" />
                  Edit Profile
                </button>
              </div>
            </div>
            <div className="text-gray-600">
              <p>{userData.bio}</p>
              <div className="flex flex-wrap gap-y-2 mt-4 text-sm">
                <div className="flex items-center mr-6">
                  <Mail className="h-4 w-4 text-gray-500 mr-1.5" />
                  {userData.email}
                </div>
                <div className="flex items-center mr-6">
                  <Phone className="h-4 w-4 text-gray-500 mr-1.5" />
                  {userData.phone}
                </div>
                <div className="flex items-center mr-6">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1.5" />
                  {userData.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
                  Member since {userData.joinDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'profile' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Activity
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'saved' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Saved Articles
            </button>
            <button
              onClick={() => setActiveTab('local-voices')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'local-voices' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Local Voices
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'comments' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Comments
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'announcements' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Your Announcements
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'events' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>

              Your Events
            </button>
          </div>
        </div>

        {/* Become an Author Banner */}
        {userActivity.articles.length === 0 &&
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="px-6 py-6 text-white flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h2 className="text-xl font-bold mb-2">
                  Become a Community Author/Reporter
                </h2>
                <p className="text-blue-100 max-w-xl">
                  Share your unique perspective, report on local events, and
                  build your reputation as a trusted voice in our community.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                onClick={() => navigate('/author/profile-creator')}
                className="px-4 py-2 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors flex items-center">

                  <Pen className="h-4 w-4 mr-1.5" />
                  Create Author Profile
                </button>
                <button
                onClick={() => navigate('/create-article')}
                className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-400 border border-blue-400 transition-colors flex items-center">

                  <FileText className="h-4 w-4 mr-1.5" />
                  Write First Article
                </button>
              </div>
            </div>
          </div>
        }

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'profile' &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              {/* Activity summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Articles</h3>
                    <FileText className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.articles.length}
                  </p>
                  <p className="text-sm text-gray-600">Published articles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Saved</h3>
                    <Bookmark className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.savedArticles.length}
                  </p>
                  <p className="text-sm text-gray-600">Saved articles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Announcements</h3>
                    <Bell className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.announcements.length}
                  </p>
                  <p className="text-sm text-gray-600">Your announcements</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Events</h3>
                    <Calendar className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.events.length}
                  </p>
                  <p className="text-sm text-gray-600">Your events</p>
                </div>
              </div>
              {/* Call to action cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Write an Article
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Share news and stories with your community
                  </p>
                  <button
                  onClick={() => navigate('/create-article')}
                  className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">

                    Start Writing
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Post an Announcement
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Share important updates with the community
                  </p>
                  <button
                  onClick={() => navigate('/announcementCreator')}
                  className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">

                    Create Announcement
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Post a Listing
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sell items or services to the community
                  </p>
                  <button
                  onClick={() => navigate('/postListing')}
                  className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">

                    Create Listing
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Become an Author
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create your author profile and share your expertise
                  </p>
                  <button
                  onClick={() => navigate('/create-article')}
                  className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">

                    Create Profile
                  </button>
                </div>
              </div>
            </div>
          }

          {activeTab === 'saved' &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Saved Articles
              </h2>
              {userActivity.savedArticles.length > 0 ?
            <div className="space-y-4">
                  {userActivity.savedArticles.map((article) =>
              <div
                key={article.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-news-primary hover:shadow-sm transition-all">

                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {article.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{article.date}</span>
                            <span className="mx-2">•</span>
                            <span>{article.category}</span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-red-500">
                          <Bookmark className="h-5 w-5 fill-current" />
                        </button>
                      </div>
                    </div>
              )}
                </div> :

            <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No saved articles yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Articles you save will appear here
                  </p>
                  <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors">

                    Browse Articles
                  </button>
                </div>
            }
            </div>
          }

          {activeTab === 'comments' &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Comments
              </h2>
              {userActivity.comments.length > 0 ?
            <div className="space-y-4">
                  {userActivity.comments.map((comment) =>
              <div
                key={comment.id}
                className="border border-gray-200 rounded-lg p-4">

                      <h3 className="font-medium text-gray-900 mb-1">
                        On: {comment.articleTitle}
                      </h3>
                      <p className="text-gray-700 mb-2">"{comment.comment}"</p>
                      <div className="text-xs text-gray-500">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        <span>{comment.date}</span>
                      </div>
                    </div>
              )}
                </div> :

            <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No comments yet
                  </h3>
                  <p className="text-gray-600">
                    Join the conversation by commenting on articles
                  </p>
                </div>
            }
            </div>
          }

          {activeTab === 'announcements' &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Announcements
              </h2>
              {userActivity.announcements.length > 0 ?
            <div className="space-y-4">
                  {userActivity.announcements.map((announcement) =>
              <div
                key={announcement.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-news-primary hover:shadow-sm transition-all">

                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {announcement.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{announcement.date}</span>
                          </div>
                        </div>
                        <div>
                          <button className="text-gray-500 hover:text-gray-700 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
              )}
                </div> :

            <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No announcements yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share important updates with your community
                  </p>
                  <button
                onClick={() => navigate('/announcementCreator')}
                className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors">

                    Create Announcement
                  </button>
                </div>
            }
            </div>
          }

          {activeTab === 'events' &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Events
              </h2>
              {userActivity.events.length > 0 ?
            <div className="space-y-4">
                  {userActivity.events.map((event) =>
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-news-primary hover:shadow-sm transition-all">

                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {event.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{event.date}</span>
                            <span className="mx-2">•</span>
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div>
                          <button className="text-gray-500 hover:text-gray-700 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
              )}
                </div> :

            <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No events yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create and manage community events
                  </p>
                  <button
                onClick={() => navigate('/eventCreator')}
                className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors">

                    Create Event
                  </button>
                </div>
            }
            </div>
          }

          {activeTab === 'local-voices' &&
          <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Local Voices
              </h2>
              {/* Activity summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      Episodes Watched
                    </h3>
                    <Eye className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(viewedEpisodes).length}
                  </p>
                  <p className="text-sm text-gray-600">Total episodes viewed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      Creators Followed
                    </h3>
                    <Users className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {followedCreators.length}
                  </p>
                  <p className="text-sm text-gray-600">Creators you follow</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">New Episodes</h3>
                    <Mic className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {getNewEpisodesFromWatchedCreators().length}
                  </p>
                  <p className="text-sm text-gray-600">
                    From creators you've watched
                  </p>
                </div>
              </div>
              {/* New Episodes Section */}
              {getNewEpisodesFromWatchedCreators().length > 0 &&
            <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <span className="bg-green-500 h-2 w-2 rounded-full mr-2"></span>
                    New Episodes From Creators You Watch
                  </h3>
                  <div className="space-y-4">
                    {getNewEpisodesFromWatchedCreators().map((episode) =>
                <div
                  key={episode.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">

                        <div className="flex flex-col sm:flex-row">
                          {/* Thumbnail */}
                          <div className="sm:w-48 relative">
                            <img
                        src={episode.thumbnail_url}
                        alt={episode.title}
                        className="w-full h-40 sm:h-full object-cover" />

                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button
                          onClick={() =>
                          handlePlayPause(episode.id, episode.audio_url)
                          }
                          className="h-12 w-12 bg-news-primary rounded-full flex items-center justify-center"
                          aria-label={
                          isPlaying === episode.id ? 'Pause' : 'Play'
                          }>

                                {isPlaying === episode.id ?
                          <Pause className="h-6 w-6 text-white" /> :

                          <Play
                            className="h-6 w-6 text-white"
                            fill="white" />

                          }
                              </button>
                            </div>
                            {/* Media type badge */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded-full flex items-center">
                              {episode.media_type === 'audio' ?
                        <>
                                  <Headphones className="h-3 w-3 mr-1" />
                                  <span>Audio</span>
                                </> :

                        <>
                                  <Video className="h-3 w-3 mr-1" />
                                  <span>Video</span>
                                </>
                        }
                            </div>
                            {/* New badge */}
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs py-1 px-2 rounded-full">
                              New
                            </div>
                          </div>
                          {/* Content */}
                          <div className="p-4 flex-1">
                            <div className="flex items-center mb-2">
                              <img
                          src={episode.creator_image}
                          alt={episode.creator_name}
                          className="h-6 w-6 rounded-full mr-2" />

                              <p className="text-sm text-gray-600">
                                {episode.creator_name}
                              </p>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {episode.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {episode.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(episode.publish_date)}</span>
                              <span className="mx-2">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{episode.duration}</span>
                            </div>
                            <div className="mt-3 flex space-x-2">
                              <button
                          onClick={() =>
                          handlePlayPause(episode.id, episode.audio_url)
                          }
                          className="px-3 py-1.5 bg-news-primary text-white text-sm font-medium rounded-md hover:bg-news-primary-dark flex items-center">

                                {isPlaying === episode.id ?
                          <>
                                    <Pause className="h-4 w-4 mr-1.5" />
                                    Pause
                                  </> :

                          <>
                                    <Play className="h-4 w-4 mr-1.5" />
                                    Play
                                  </>
                          }
                              </button>
                              <Link
                          to={`/local-voices/episode/${episode.id}`}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">

                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                )}
                  </div>
                </div>
            }
              {/* Recently Watched Episodes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-gray-500" />
                  Episodes You've Watched
                </h3>
                {getViewedEpisodes().length > 0 ?
              <div className="space-y-4">
                    {getViewedEpisodes().map((episode) =>
                <div
                  key={episode.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">

                        <div className="flex">
                          {/* Thumbnail */}
                          <div className="h-20 w-32 rounded overflow-hidden flex-shrink-0 relative">
                            <img
                        src={episode.thumbnail_url}
                        alt={episode.title}
                        className="w-full h-full object-cover" />

                            {/* Media type indicator */}
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs py-0.5 px-1 rounded-sm flex items-center">
                              {episode.media_type === 'audio' ?
                        <Headphones className="h-3 w-3" /> :

                        <Video className="h-3 w-3" />
                        }
                            </div>
                            {/* Viewed indicator */}
                            <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white text-xs p-0.5 rounded-full">
                              <Eye className="h-3 w-3" />
                            </div>
                          </div>
                          {/* Content */}
                          <div className="ml-4 flex-1">
                            <div className="flex items-center mb-1">
                              <img
                          src={episode.creator_image}
                          alt={episode.creator_name}
                          className="h-5 w-5 rounded-full mr-1.5" />

                              <p className="text-xs text-gray-600">
                                {episode.creator_name}
                              </p>
                              {isNewEpisode(episode.publish_date) &&
                        <span className="ml-2 bg-green-500 text-white text-xs py-0.5 px-1.5 rounded-full">
                                  New
                                </span>
                        }
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              {episode.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(episode.publish_date)}</span>
                              <span className="mx-1.5">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{episode.duration}</span>
                              <span className="mx-1.5">•</span>
                              <span>
                                Watched:{' '}
                                {formatDate(
                            new Date(
                              viewedEpisodes[episode.id]?.timestamp
                            )
                          )}
                              </span>
                            </div>
                            <div className="mt-2 flex space-x-2">
                              <button
                          onClick={() =>
                          handlePlayPause(episode.id, episode.audio_url)
                          }
                          className="px-2 py-1 text-xs bg-news-primary text-white rounded flex items-center">

                                {isPlaying === episode.id ?
                          <>
                                    <Pause className="h-3 w-3 mr-1" />
                                    Pause
                                  </> :

                          <>
                                    <Play className="h-3 w-3 mr-1" />
                                    Play Again
                                  </>
                          }
                              </button>
                              <Link
                          to={`/local-voices/episode/${episode.id}`}
                          className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">

                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                )}
                  </div> :

              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Headphones className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      No episodes watched yet
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Start exploring Local Voices to discover great content
                    </p>
                    <Link
                  to="/local-voices/episodes"
                  className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark">

                      Browse Episodes
                    </Link>
                  </div>
              }
              </div>
              {/* Discover More CTA */}
              <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">
                      Discover More Local Voices
                    </h3>
                    <p className="text-blue-100 max-w-xl">
                      Explore our marketplace of local podcasts, news shows, and
                      video content from creators in your community.
                    </p>
                  </div>
                  <Link
                  to="/local-voices/episodes"
                  className="px-5 py-2.5 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors">

                    Browse Episodes
                  </Link>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

};