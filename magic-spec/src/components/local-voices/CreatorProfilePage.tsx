import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  ChevronDown,
  Clock,
  DollarSign,
  Heart,
  MapPin,
  MessageCircle,
  Mic,
  Play,
  Share2,
  Star,
  Users,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  FileText,
  Coffee,
  ArrowRight,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Link as LinkIcon,
  ExternalLink,
  Pause,
  Volume2,
  SkipBack,
  SkipForward,
  Info,
  Headphones,
  Flag,
  PenTool,
  Search,
  Filter,
  Rss,
  Gift,
  User,
  X } from
'lucide-react';
import TipJarModal from './TipJarModal';
interface CreatorProfileProps {}
export const CreatorProfilePage: React.FC<CreatorProfileProps> = () => {
  const { creator_slug } = useParams<{
    creator_slug: string;
  }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isSubNavSticky, setIsSubNavSticky] = useState<boolean>(false);
  const [expandedBio, setExpandedBio] = useState<boolean>(false);
  const [visibleEpisodes, setVisibleEpisodes] = useState<number>(9);
  const [showTipJarModal, setShowTipJarModal] = useState<boolean>(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentlyPlayingEpisode, setCurrentlyPlayingEpisode] =
  useState<any>(null);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const [showNotificationOptions, setShowNotificationOptions] =
  useState<boolean>(false);
  const [episodeFilter, setEpisodeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [reviewSortOrder, setReviewSortOrder] = useState<string>('recent');
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const heroSectionRef = useRef<HTMLElement>(null);
  const shareOptionsRef = useRef<HTMLDivElement>(null);
  const notificationOptionsRef = useRef<HTMLDivElement>(null);
  const filterOptionsRef = useRef<HTMLDivElement>(null);
  // Mock data - in a real implementation, this would come from an API call using the creator_slug
  const creatorData = {
    id: '1',
    display_name: 'The Clearwater Report',
    tagline: 'Your weekly deep dive into local politics',
    bio: 'Award-winning podcast bringing you the latest news, interviews, and stories from Clearwater and surrounding communities. Hosted by veteran journalist Sarah Johnson, The Clearwater Report focuses on local politics, community development, and the issues that matter most to residents.\n\nLaunched in March 2021, our podcast quickly gained a following for its in-depth analysis and exclusive interviews with local officials, business leaders, and community advocates. We believe in transparent, fact-based reporting that helps citizens understand the complex issues affecting their daily lives.\n\nSarah brings over 15 years of journalism experience to the podcast, having previously worked as a political correspondent for the Tampa Bay Times and as a field reporter for WFLA News Channel 8. Her investigative reporting has earned multiple Florida Press Association awards.\n\nNew episodes are released every Wednesday, with special editions following major local events and developments. We also host quarterly live events where listeners can participate in discussions with guests and the host.',
    profile_image_url:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    category: 'Politics',
    tags: ['investigative', 'local-government', 'interviews'],
    location_display: 'Clearwater, FL',
    performing_since: '2021-03-15',
    verified_badge: true,
    follower_count: 1247,
    total_plays: 28450,
    average_rating: 4.8,
    review_count: 156,
    episodes_count: 87,
    shows_count: 3,
    venmo_handle: 'ClearwaterReport',
    cashapp_handle: 'ClearwaterReport',
    patreon_url: 'https://www.patreon.com/clearwaterreport',
    instagram_url: 'https://www.instagram.com/clearwaterreport',
    twitter_url: 'https://twitter.com/clearwaterreport',
    facebook_url: 'https://www.facebook.com/clearwaterreport',
    youtube_url: 'https://www.youtube.com/c/clearwaterreport',
    website_url: 'https://clearwaterreport.com',
    email: 'contact@clearwaterreport.com',
    rss_feed: 'https://feeds.megaphone.fm/clearwaterreport'
  };
  // Mock episodes data - in a real implementation, this would come from an API call
  const episodesData = [
  {
    id: '1',
    creator_id: '1',
    title: 'City Council Approves New Downtown Development Plan',
    episode_number: 87,
    description:
    'In this episode, we break down the controversial new downtown development plan that was approved in a 4-1 vote by the Clearwater City Council. We interview Mayor Frank Hibbard about the vision for downtown, speak with local business owners about their concerns, and analyze the potential impact on traffic, housing prices, and the character of the city center.',
    publish_date: '2023-08-01T08:00:00Z',
    duration_seconds: 3245,
    thumbnail_url:
    'https://images.unsplash.com/photo-1616763355548-1b606f439f86?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=338&q=80',
    audio_url: 'https://example.com/episodes/87.mp3',
    transcript_text: 'Full transcript text would be here...',
    play_count: 1247,
    comment_count: 37,
    tip_amount_received: 124.5,
    show_id: '1',
    show_title: 'The Clearwater Report',
    category: 'Politics'
  },
  {
    id: '2',
    creator_id: '1',
    title: 'Beach Erosion Crisis: Environmental Experts Weigh In',
    episode_number: 86,
    description:
    'Clearwater Beach is facing its worst erosion in decades. We talk with environmental scientists, city planners, and residents about the causes, the impact on tourism, and the proposed $15 million restoration project. Is climate change accelerating the problem, and are temporary fixes just delaying the inevitable?',
    publish_date: '2023-07-25T08:00:00Z',
    duration_seconds: 2987,
    thumbnail_url:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=338&q=80',
    audio_url: 'https://example.com/episodes/86.mp3',
    transcript_text: null,
    play_count: 1089,
    comment_count: 29,
    tip_amount_received: 87.25,
    show_id: '1',
    show_title: 'The Clearwater Report',
    category: 'Environment'
  }
  // ... rest of episode data remains the same
  ];
  // Mock shows data
  const showsData = [
  {
    id: '1',
    creator_id: '1',
    title: 'The Clearwater Report',
    description:
    'Your weekly deep dive into local politics and community issues affecting Clearwater residents.',
    category: 'Politics',
    episode_count: 72,
    thumbnail_url:
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=338&q=80',
    publish_frequency: 'Weekly',
    latest_episode: {
      id: '1',
      title: 'City Council Approves New Downtown Development Plan',
      publish_date: '2023-08-01T08:00:00Z'
    },
    average_rating: 4.8,
    review_count: 124
  },
  {
    id: '2',
    creator_id: '1',
    title: 'Clearwater After Hours',
    description:
    'A monthly special featuring in-depth interviews with community leaders and change-makers.',
    category: 'Interviews',
    episode_count: 12,
    thumbnail_url:
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=338&q=80',
    publish_frequency: 'Monthly',
    latest_episode: {
      id: '15',
      title: 'A Conversation with Police Chief Dan Slaughter',
      publish_date: '2023-07-15T20:00:00Z'
    },
    average_rating: 4.9,
    review_count: 28
  },
  {
    id: '3',
    creator_id: '1',
    title: 'Election Special',
    description:
    'Special coverage of local elections, including candidate interviews and analysis.',
    category: 'Politics',
    episode_count: 3,
    thumbnail_url:
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=338&q=80',
    publish_frequency: 'Seasonal',
    latest_episode: {
      id: '45',
      title: 'City Council Election Results and Analysis',
      publish_date: '2023-03-20T08:00:00Z'
    },
    average_rating: 4.7,
    review_count: 14
  }];

  // Mock reviews data
  const reviewsData = [
  {
    id: '1',
    creator_id: '1',
    user: {
      id: '101',
      name: 'Jennifer Martinez',
      avatar_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    rating: 5,
    title: 'Essential local reporting',
    content:
    "The Clearwater Report has become my go-to source for understanding what's happening in our city. Sarah does an excellent job breaking down complex issues and getting perspectives from all sides. The episode on the downtown development plan was particularly enlightening.",
    date: '2023-07-28T14:25:00Z',
    helpful_count: 24,
    reply: {
      content:
      "Thank you so much for your kind words, Jennifer! We work hard to provide balanced coverage of local issues, and I'm glad you found the downtown development episode helpful.",
      date: '2023-07-29T09:15:00Z'
    }
  },
  {
    id: '2',
    creator_id: '1',
    user: {
      id: '102',
      name: 'Michael Johnson',
      avatar_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    rating: 4,
    title: 'Great content, wish it was more frequent',
    content:
    'I always learn something new from this podcast. The interviews are insightful and the analysis is spot on. My only wish is that it came out more than once a week!',
    date: '2023-07-15T18:42:00Z',
    helpful_count: 16,
    reply: null
  },
  {
    id: '3',
    creator_id: '1',
    user: {
      id: '103',
      name: 'David Thompson',
      avatar_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    rating: 5,
    title: 'Journalism at its finest',
    content:
    'As a longtime Clearwater resident, I appreciate the depth and accuracy of reporting on The Clearwater Report. Sarah asks the tough questions that other local media often avoid. The recent series on beach erosion was particularly well-researched and presented multiple perspectives fairly.',
    date: '2023-07-02T11:19:00Z',
    helpful_count: 31,
    reply: {
      content:
      "Thank you, David! The beach erosion series took a lot of research, and I'm glad you appreciated the multiple perspectives. Your support means a lot to us.",
      date: '2023-07-03T13:45:00Z'
    }
  },
  {
    id: '4',
    creator_id: '1',
    user: {
      id: '104',
      name: 'Emily Rodriguez',
      avatar_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    rating: 5,
    title: 'Indispensable for local politics',
    content:
    "If you want to understand what's happening in Clearwater politics, this podcast is essential listening. The host has incredible access to local officials and asks substantive questions that get beyond the talking points.",
    date: '2023-06-18T09:33:00Z',
    helpful_count: 19,
    reply: null
  },
  {
    id: '5',
    creator_id: '1',
    user: {
      id: '105',
      name: 'Robert Chen',
      avatar_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
    },
    rating: 3,
    title: 'Good content but audio quality varies',
    content:
    'I enjoy the reporting and interviews, but the audio quality can be inconsistent, especially for remote interviews. Some episodes are crystal clear while others have noticeable issues. Still worth listening to for the content.',
    date: '2023-06-05T16:50:00Z',
    helpful_count: 12,
    reply: {
      content:
      "Thanks for the feedback, Robert. We're investing in better remote recording equipment to address this issue. We appreciate your patience as we work to improve the listening experience.",
      date: '2023-06-06T10:22:00Z'
    }
  }];

  // Simulated API call to fetch creator data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      if (creator_slug) {
        // In a real app, this would be an API call using the creator_slug
        setIsLoading(false);
      } else {
        setError('Creator not found');
        setIsLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [creator_slug]);
  // Handle scroll events to determine when to make sub-nav sticky
  useEffect(() => {
    const handleScroll = () => {
      if (heroSectionRef.current) {
        const heroBottom =
        heroSectionRef.current.offsetTop + heroSectionRef.current.offsetHeight;
        setIsSubNavSticky(window.scrollY > heroBottom - 60);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      shareOptionsRef.current &&
      !shareOptionsRef.current.contains(event.target as Node))
      {
        setShowShareOptions(false);
      }
      if (
      notificationOptionsRef.current &&
      !notificationOptionsRef.current.contains(event.target as Node))
      {
        setShowNotificationOptions(false);
      }
      if (
      filterOptionsRef.current &&
      !filterOptionsRef.current.contains(event.target as Node))
      {
        setShowFilterOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };
  // Format publish date for episodes
  const formatPublishDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  // Format relative time for reviews
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return 'just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  };
  // Handle follow/unfollow action
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // Show confirmation toast/alert
    if (!isFollowing) {
      // In a real app, this would make an API call to follow the creator
      alert(`You are now following ${creatorData.display_name}!`);
    } else {
      // In a real app, this would make an API call to unfollow the creator
      alert(`You have unfollowed ${creatorData.display_name}.`);
    }
  };
  // Handle subscription toggle
  const handleSubscriptionToggle = () => {
    setIsSubscribed(!isSubscribed);
    // Show confirmation toast/alert
    if (!isSubscribed) {
      // In a real app, this would make an API call to subscribe to notifications
      alert(`You are now subscribed to ${creatorData.display_name}'s updates!`);
    } else {
      // In a real app, this would make an API call to unsubscribe from notifications
      alert(`You have unsubscribed from ${creatorData.display_name}'s updates.`);
    }
  };
  // Handle load more episodes
  const handleLoadMoreEpisodes = () => {
    setVisibleEpisodes((prevCount) => prevCount + 9);
  };
  // Handle play/pause episode
  const handlePlayEpisode = (episode: any) => {
    if (currentlyPlayingEpisode && currentlyPlayingEpisode.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlayingEpisode(episode);
      setIsPlaying(true);
    }
    // In a real app, this would control the audio player
    alert(`${isPlaying ? 'Pausing' : 'Playing'} episode: ${episode.title}`);
  };
  // Handle share episode
  const handleShareEpisode = (episode: any) => {
    // In a real app, this would open a share dialog or copy link to clipboard
    navigator.clipboard.writeText(
      `https://daynews.com/local-voices/creator/${creator_slug}/episode/${episode.id}`
    );
    alert(`Link to episode "${episode.title}" copied to clipboard!`);
  };
  // Handle share profile
  const handleShareProfile = () => {
    // In a real app, this would open a share dialog or copy link to clipboard
    navigator.clipboard.writeText(
      `https://daynews.com/local-voices/creator/${creator_slug}`
    );
    alert(`Link to ${creatorData.display_name}'s profile copied to clipboard!`);
    setShowShareOptions(false);
  };
  // Handle review helpfulness
  const handleReviewHelpful = (reviewId: string) => {
    // In a real app, this would make an API call to mark review as helpful
    alert(`You marked this review as helpful`);
  };
  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setEpisodeFilter(filter);
    setShowFilterOptions(false);
  };
  // Handle sort order change
  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
  };
  // Handle review sort order change
  const handleReviewSortOrderChange = (order: string) => {
    setReviewSortOrder(order);
  };
  // Truncate text to a specified length
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };
  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) =>
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : i < rating ? 'text-yellow-400 fill-yellow-400 opacity-50' : 'text-gray-300'}`} />

        )}
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>);

  };
  // Format bio with paragraph breaks
  const formatBio = (bio: string) => {
    return bio.split('\n\n').map((paragraph, index) =>
    <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    );
  };
  // Get bio excerpt
  const getBioExcerpt = (bio: string, maxLength: number = 500) => {
    if (bio.length <= maxLength) return bio;
    // Find the last space before maxLength to avoid cutting words
    const lastSpace = bio.substring(0, maxLength).lastIndexOf(' ');
    return bio.substring(0, lastSpace) + '...';
  };
  // Handle tip jar button click
  const handleTipJarClick = (episode: any = null) => {
    setSelectedEpisode(episode);
    setShowTipJarModal(true);
  };
  // Filter episodes based on search and filters
  const getFilteredEpisodes = () => {
    let filtered = [...episodesData];
    // Apply category filter
    if (episodeFilter !== 'all') {
      filtered = filtered.filter(
        (episode) => episode.category === episodeFilter
      );
    }
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (episode) =>
        episode.title.toLowerCase().includes(query) ||
        episode.description.toLowerCase().includes(query)
      );
    }
    // Apply sort order
    if (sortOrder === 'newest') {
      filtered.sort(
        (a, b) =>
        new Date(b.publish_date).getTime() -
        new Date(a.publish_date).getTime()
      );
    } else if (sortOrder === 'oldest') {
      filtered.sort(
        (a, b) =>
        new Date(a.publish_date).getTime() -
        new Date(b.publish_date).getTime()
      );
    } else if (sortOrder === 'most_played') {
      filtered.sort((a, b) => b.play_count - a.play_count);
    } else if (sortOrder === 'most_tipped') {
      filtered.sort((a, b) => b.tip_amount_received - a.tip_amount_received);
    }
    return filtered;
  };
  // Sort reviews
  const getSortedReviews = () => {
    let sorted = [...reviewsData];
    if (reviewSortOrder === 'recent') {
      sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (reviewSortOrder === 'highest') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (reviewSortOrder === 'lowest') {
      sorted.sort((a, b) => a.rating - b.rating);
    } else if (reviewSortOrder === 'helpful') {
      sorted.sort((a, b) => b.helpful_count - a.helpful_count);
    }
    return sorted;
  };
  // Get unique episode categories for filter
  const getEpisodeCategories = () => {
    const categories = new Set(episodesData.map((episode) => episode.category));
    return ['all', ...Array.from(categories)];
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-news-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator profile...</p>
        </div>
      </div>);

  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Profile
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/local-voices')}
            className="bg-news-primary text-white px-4 py-2 rounded-md hover:bg-news-primary-dark">

            Return to Local Voices
          </button>
        </div>
      </div>);

  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="font-display text-2xl font-bold text-news-primary">

                Day.News
              </Link>
            </div>
            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-news-primary font-medium">

                Home
              </Link>
              <Link
                to="/news"
                className="text-gray-600 hover:text-news-primary font-medium">

                News
              </Link>
              <Link
                to="/business"
                className="text-gray-600 hover:text-news-primary font-medium">

                Business
              </Link>
              <Link
                to="/eventsCalendar"
                className="text-gray-600 hover:text-news-primary font-medium">

                Events
              </Link>
              <Link
                to="/local-voices"
                className="text-news-primary font-semibold">

                Local Voices
              </Link>
              <Link
                to="/government"
                className="text-gray-600 hover:text-news-primary font-medium">

                Government
              </Link>
              <Link
                to="/sports"
                className="text-gray-600 hover:text-news-primary font-medium">

                Sports
              </Link>
            </nav>
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-600 hover:text-news-primary relative"
                aria-label="Notifications"
                onClick={() => navigate('/announcements')}>

                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="relative user-menu">
                <button
                  className="flex items-center"
                  aria-label="User menu"
                  onClick={() => navigate('/profile')}>

                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User profile"
                    className="h-8 w-8 rounded-full object-cover" />

                  <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Sticky Sub-Navigation */}
      <div
        className={`${isSubNavSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-md transform translate-y-0 transition-transform duration-300' : 'relative transform -translate-y-full opacity-0 transition-transform duration-300'} bg-white border-b border-gray-200 py-3`}
        style={{
          opacity: isSubNavSticky ? 1 : 0
        }}>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={creatorData.profile_image_url}
                alt={creatorData.display_name}
                className="h-8 w-8 rounded-full object-cover mr-3" />

              <h2 className="font-medium text-gray-900 truncate max-w-xs">
                {creatorData.display_name}
                {creatorData.verified_badge &&
                <CheckCircle className="inline-block h-4 w-4 ml-1 text-blue-500" />
                }
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${isFollowing ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-news-primary text-white hover:bg-news-primary-dark'}`}
                aria-label={isFollowing ? 'Unfollow' : 'Follow'}>

                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <div className="flex items-center space-x-2">
                <div className="relative" ref={shareOptionsRef}>
                  <button
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                    aria-label="Share"
                    onClick={() => setShowShareOptions(!showShareOptions)}>

                    <Share2 className="h-4 w-4 text-gray-700" />
                  </button>
                  {showShareOptions &&
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleShareProfile}>

                        <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Copy profile link
                      </button>
                      <a
                      href={`https://twitter.com/intent/tweet?url=https://daynews.com/local-voices/creator/${creator_slug}&text=Check out ${creatorData.display_name} on Day.News!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                        <Twitter className="h-4 w-4 mr-2 text-gray-500" />
                        Share on Twitter
                      </a>
                      <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=https://daynews.com/local-voices/creator/${creator_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                        <Facebook className="h-4 w-4 mr-2 text-gray-500" />
                        Share on Facebook
                      </a>
                    </div>
                  }
                </div>
                <div className="relative" ref={notificationOptionsRef}>
                  <button
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                    aria-label="Notifications"
                    onClick={() =>
                    setShowNotificationOptions(!showNotificationOptions)
                    }>

                    <Bell className="h-4 w-4 text-gray-700" />
                  </button>
                  {showNotificationOptions &&
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSubscriptionToggle}>

                        {isSubscribed ?
                      <>
                            <Bell className="h-4 w-4 mr-2 text-gray-500" />
                            Unsubscribe from updates
                          </> :

                      <>
                            <Bell className="h-4 w-4 mr-2 text-gray-500" />
                            Subscribe to all updates
                          </>
                      }
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Rss className="h-4 w-4 mr-2 text-gray-500" />
                        Subscribe via RSS
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        Email notifications
                      </button>
                    </div>
                  }
                </div>
                <button
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                  aria-label="Tip creator"
                  onClick={() => handleTipJarClick()}>

                  <DollarSign className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hero Banner Section */}
      <section
        id="hero-section"
        ref={heroSectionRef}
        className="relative bg-cover bg-center h-96"
        style={{
          backgroundImage: `url(${creatorData.banner_image_url})`
        }}>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        <div className="container mx-auto px-4 max-w-7xl relative h-full">
          <div className="absolute bottom-8 left-0 right-0 flex flex-col md:flex-row items-start md:items-end justify-between">
            {/* Profile Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end">
              {/* Profile Image */}
              <div className="mb-4 md:mb-0 md:mr-6">
                <div className="h-36 w-36 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img
                    src={creatorData.profile_image_url}
                    alt={creatorData.display_name}
                    className="h-full w-full object-cover" />

                </div>
              </div>
              {/* Creator Info */}
              <div className="text-white">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold mr-2">
                    {creatorData.display_name}
                  </h1>
                  {creatorData.verified_badge &&
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  }
                </div>
                <p className="text-gray-200 text-lg mb-3">
                  {creatorData.tagline}
                </p>
                <div className="flex flex-wrap items-center text-sm text-gray-300 mb-4">
                  <span className="bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full mr-2 mb-2">
                    {creatorData.category}
                  </span>
                  <div className="flex items-center mr-4 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{creatorData.location_display}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Creating since {formatDate(creatorData.performing_since)}
                    </span>
                  </div>
                </div>
                {/* Stats Row */}
                <div className="flex flex-wrap items-center text-sm">
                  <div className="mr-6 mb-2">
                    {renderStarRating(creatorData.average_rating)}
                    <span className="text-gray-300 text-xs ml-1">
                      ({creatorData.review_count})
                    </span>
                  </div>
                  <div className="flex items-center mr-6 mb-2">
                    <Users className="h-4 w-4 mr-1 text-gray-300" />
                    <span className="text-white font-medium">
                      {creatorData.follower_count.toLocaleString()}
                    </span>
                    <span className="text-gray-300 ml-1">followers</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Play className="h-4 w-4 mr-1 text-gray-300" />
                    <span className="text-white font-medium">
                      {creatorData.total_plays.toLocaleString()}
                    </span>
                    <span className="text-gray-300 ml-1">plays</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2 rounded-full font-medium ${isFollowing ? 'bg-white text-gray-800 hover:bg-gray-100' : 'bg-news-primary text-white hover:bg-news-primary-dark'}`}
                aria-label={isFollowing ? 'Unfollow' : 'Follow'}>

                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <div className="relative" ref={shareOptionsRef}>
                <button
                  className="px-5 py-2 bg-white bg-opacity-20 text-white rounded-full font-medium hover:bg-opacity-30 backdrop-blur-sm flex items-center"
                  aria-label="Share"
                  onClick={() => setShowShareOptions(!showShareOptions)}>

                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
                {showShareOptions &&
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleShareProfile}>

                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      Copy profile link
                    </button>
                    <a
                    href={`https://twitter.com/intent/tweet?url=https://daynews.com/local-voices/creator/${creator_slug}&text=Check out ${creatorData.display_name} on Day.News!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                      <Twitter className="h-4 w-4 mr-2 text-gray-500" />
                      Share on Twitter
                    </a>
                    <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=https://daynews.com/local-voices/creator/${creator_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                      <Facebook className="h-4 w-4 mr-2 text-gray-500" />
                      Share on Facebook
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Overview tab">

              Overview
            </button>
            <button
              onClick={() => setActiveTab('episodes')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'episodes' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Episodes tab">

              Episodes ({creatorData.episodes_count})
            </button>
            <button
              onClick={() => setActiveTab('shows')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'shows' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Shows tab">

              Shows ({creatorData.shows_count})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'about' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="About tab">

              About
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'reviews' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Reviews tab">

              Reviews ({creatorData.review_count})
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'support' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-label="Support tab">

              Support
            </button>
          </div>
        </div>
      </div>
      {/* Tab Content */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' &&
        <div className="space-y-8">
            {/* Biography and Support Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Biography - Left Column (70%) */}
                <div className="lg:w-[70%]">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About {creatorData.display_name}
                  </h2>
                  <div className="text-gray-700">
                    {expandedBio ?
                  formatBio(creatorData.bio) :
                  formatBio(getBioExcerpt(creatorData.bio))}
                  </div>
                  {creatorData.bio.length > 500 &&
                <button
                  onClick={() => setExpandedBio(!expandedBio)}
                  className="mt-4 text-news-primary hover:text-news-primary-dark font-medium flex items-center"
                  aria-label={expandedBio ? 'Read less' : 'Read more'}>

                      {expandedBio ?
                  <>
                          Read less
                          <ChevronUp className="ml-1 h-4 w-4" />
                        </> :

                  <>
                          Read more
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                  }
                    </button>
                }
                  <div className="flex flex-wrap gap-2 mt-6">
                    {creatorData.tags.map((tag) =>
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">

                        #{tag}
                      </span>
                  )}
                  </div>
                </div>
                {/* Support Creator Sidebar - Right Column (30%) */}
                <div className="lg:w-[30%] border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Support {creatorData.display_name}
                  </h3>
                  <div className="space-y-3">
                    <button
                    className="w-full bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center"
                    onClick={() => handleTipJarClick()}
                    aria-label="Open tip jar">

                      <DollarSign className="h-5 w-5 mr-2" />
                      Tip Jar
                    </button>
                    {creatorData.patreon_url &&
                  <a
                    href={creatorData.patreon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#FF424D] hover:bg-[#E23440] text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center"
                    aria-label="Become a Patron on Patreon">

                        Become a Patron
                      </a>
                  }
                    <button
                    className="w-full bg-[#FFDD00] hover:bg-[#E5C700] text-[#734F22] font-medium py-2.5 px-4 rounded-lg flex items-center justify-center"
                    aria-label="Buy me a coffee"
                    onClick={() =>
                    window.open(
                      'https://www.buymeacoffee.com/clearwaterreport',
                      '_blank'
                    )
                    }>

                      <Coffee className="h-5 w-5 mr-2" />
                      Buy Me a Coffee
                    </button>
                    {creatorData.venmo_handle &&
                  <button
                    className="w-full bg-[#008CFF] hover:bg-[#0074D4] text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center"
                    aria-label="Pay with Venmo"
                    onClick={() =>
                    window.open(
                      `https://venmo.com/${creatorData.venmo_handle}`,
                      '_blank'
                    )
                    }>

                        Venmo @{creatorData.venmo_handle}
                      </button>
                  }
                    {creatorData.cashapp_handle &&
                  <button
                    className="w-full bg-[#00D632] hover:bg-[#00B82B] text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center"
                    aria-label="Pay with Cash App"
                    onClick={() =>
                    window.open(
                      `https://cash.app/$${creatorData.cashapp_handle}`,
                      '_blank'
                    )
                    }>

                        CashApp ${creatorData.cashapp_handle}
                      </button>
                  }
                  </div>
                  {/* Connect Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Connect
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {creatorData.instagram_url &&
                    <a
                      href={creatorData.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      aria-label="Instagram">

                          <Instagram className="h-5 w-5" />
                        </a>
                    }
                      {creatorData.twitter_url &&
                    <a
                      href={creatorData.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      aria-label="Twitter">

                          <Twitter className="h-5 w-5" />
                        </a>
                    }
                      {creatorData.facebook_url &&
                    <a
                      href={creatorData.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      aria-label="Facebook">

                          <Facebook className="h-5 w-5" />
                        </a>
                    }
                      {creatorData.youtube_url &&
                    <a
                      href={creatorData.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      aria-label="YouTube">

                          <Youtube className="h-5 w-5" />
                        </a>
                    }
                      {creatorData.website_url &&
                    <a
                      href={creatorData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      aria-label="Website">

                          <ExternalLink className="h-5 w-5" />
                        </a>
                    }
                      {creatorData.email &&
                    <a
                      href={`mailto:${creatorData.email}`}
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      aria-label="Email">

                          <Mail className="h-5 w-5" />
                        </a>
                    }
                      {creatorData.rss_feed &&
                    <a
                      href={creatorData.rss_feed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      aria-label="RSS Feed">

                          <Rss className="h-5 w-5" />
                        </a>
                    }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Episodes Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Episodes
                </h2>
                <button
                onClick={() => setActiveTab('episodes')}
                className="text-news-primary hover:text-news-primary-dark font-medium text-sm flex items-center"
                aria-label="View all episodes">

                  View all episodes
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              {/* Episodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {episodesData.slice(0, 6).map((episode) =>
              <div
                key={episode.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                    {/* Thumbnail */}
                    <div className="relative aspect-video">
                      <img
                    src={episode.thumbnail_url}
                    alt={episode.title}
                    className="w-full h-full object-cover" />

                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                      className="w-12 h-12 bg-news-primary rounded-full flex items-center justify-center"
                      aria-label={`Play episode: ${episode.title}`}
                      onClick={() => handlePlayEpisode(episode)}>

                          <Play className="h-6 w-6 text-white" fill="white" />
                        </button>
                      </div>
                    </div>
                    {/* Episode Info */}
                    <div className="p-4">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span className="font-medium text-news-primary">
                          EP {episode.episode_number}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{formatDuration(episode.duration_seconds)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatPublishDate(episode.publish_date)}</span>
                        {episode.category &&
                    <>
                            <span className="mx-2">•</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                              {episode.category}
                            </span>
                          </>
                    }
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-news-primary">
                        <button
                      onClick={() => handlePlayEpisode(episode)}
                      className="text-left hover:underline"
                      aria-label={`Play episode: ${episode.title}`}>

                          {episode.title}
                        </button>
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {truncateText(episode.description, 100)}
                      </p>
                      {/* Stats Bar */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Play className="h-3.5 w-3.5 mr-1" />
                          <span>{episode.play_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          <span>{episode.comment_count}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {formatCurrency(episode.tip_amount_received)}
                          </span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                      className="flex-1 py-1.5 bg-news-primary text-white text-sm font-medium rounded-md hover:bg-news-primary-dark"
                      aria-label={`Play episode: ${episode.title}`}
                      onClick={() => handlePlayEpisode(episode)}>

                          Play
                        </button>
                        {episode.transcript_text &&
                    <button
                      className="flex-1 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 flex items-center justify-center"
                      aria-label="View transcript"
                      onClick={() =>
                      alert(`Viewing transcript for: ${episode.title}`)
                      }>

                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            Transcript
                          </button>
                    }
                        <button
                      className="py-1.5 px-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                      aria-label="Tip for this episode"
                      onClick={() => handleTipJarClick(episode)}>

                          <DollarSign className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
              )}
              </div>
              {/* View All Link */}
              <div className="mt-8 text-center">
                <button
                onClick={() => setActiveTab('episodes')}
                className="inline-flex items-center px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                aria-label="View all episodes">

                  View all {creatorData.episodes_count} episodes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        }
        {/* EPISODES TAB */}
        {activeTab === 'episodes' &&
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All Episodes
            </h2>
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                type="text"
                placeholder="Search episodes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-news-primary focus:border-news-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search episodes" />

                {searchQuery &&
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search">

                    <X className="h-5 w-5" />
                  </button>
              }
              </div>
              <div className="flex space-x-3">
                <div className="relative" ref={filterOptionsRef}>
                  <button
                  className="px-4 py-2 border border-gray-300 rounded-lg flex items-center bg-white hover:bg-gray-50"
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
                  aria-label="Filter episodes"
                  aria-expanded={showFilterOptions}
                  aria-haspopup="true">

                    <Filter className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      {episodeFilter === 'all' ?
                    'All Categories' :
                    episodeFilter}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
                  </button>
                  {showFilterOptions &&
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      {getEpisodeCategories().map((category) =>
                  <button
                    key={category}
                    className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${episodeFilter === category ? 'text-news-primary font-medium' : 'text-gray-700'}`}
                    onClick={() => handleFilterChange(category)}>

                          {category === 'all' ? 'All Categories' : category}
                        </button>
                  )}
                    </div>
                }
                </div>
                <select
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                aria-label="Sort episodes">

                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_played">Most Played</option>
                  <option value="most_tipped">Most Tipped</option>
                </select>
              </div>
            </div>
            {/* Episodes List */}
            <div className="space-y-6">
              {getFilteredEpisodes().length > 0 ?
            getFilteredEpisodes().
            slice(0, visibleEpisodes).
            map((episode) =>
            <div
              key={episode.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">

                      <div className="flex flex-col md:flex-row">
                        {/* Thumbnail */}
                        <div className="md:w-1/3 lg:w-1/4 relative">
                          <img
                    src={episode.thumbnail_url}
                    alt={episode.title}
                    className="w-full h-full object-cover md:h-40 lg:h-48" />

                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button
                      className="w-12 h-12 bg-news-primary rounded-full flex items-center justify-center"
                      aria-label={`Play episode: ${episode.title}`}
                      onClick={() => handlePlayEpisode(episode)}>

                              <Play
                        className="h-6 w-6 text-white"
                        fill="white" />

                            </button>
                          </div>
                        </div>
                        {/* Episode Info */}
                        <div className="p-4 md:p-6 md:w-2/3 lg:w-3/4">
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <span className="font-medium text-news-primary">
                              EP {episode.episode_number}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {formatDuration(episode.duration_seconds)}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {formatPublishDate(episode.publish_date)}
                            </span>
                            {episode.category &&
                    <>
                                <span className="mx-2">•</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                  {episode.category}
                                </span>
                              </>
                    }
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-news-primary">
                            <button
                      onClick={() => handlePlayEpisode(episode)}
                      className="text-left hover:underline"
                      aria-label={`Play episode: ${episode.title}`}>

                              {episode.title}
                            </button>
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 md:line-clamp-3">
                            {episode.description}
                          </p>
                          {/* Stats and Actions */}
                          <div className="flex flex-wrap items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3 md:mb-0">
                              <div className="flex items-center">
                                <Play className="h-4 w-4 mr-1" />
                                <span>
                                  {episode.play_count.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span>{episode.comment_count}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>
                                  {formatCurrency(episode.tip_amount_received)}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                        className="py-1.5 px-4 bg-news-primary text-white text-sm font-medium rounded-md hover:bg-news-primary-dark"
                        aria-label={`Play episode: ${episode.title}`}
                        onClick={() => handlePlayEpisode(episode)}>

                                Play
                              </button>
                              {episode.transcript_text &&
                      <button
                        className="py-1.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 flex items-center"
                        aria-label="View transcript"
                        onClick={() =>
                        alert(
                          `Viewing transcript for: ${episode.title}`
                        )
                        }>

                                  <FileText className="h-4 w-4 mr-1.5" />
                                  Transcript
                                </button>
                      }
                              <button
                        className="py-1.5 px-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                        aria-label="Share episode"
                        onClick={() => handleShareEpisode(episode)}>

                                <Share2 className="h-4 w-4" />
                              </button>
                              <button
                        className="py-1.5 px-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                        aria-label="Tip for this episode"
                        onClick={() => handleTipJarClick(episode)}>

                                <DollarSign className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
            ) :

            <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No episodes found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find any episodes matching your search criteria.
                    Try adjusting your filters or search terms.
                  </p>
                  <button
                onClick={() => {
                  setSearchQuery('');
                  setEpisodeFilter('all');
                  setSortOrder('newest');
                }}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                aria-label="Reset filters">

                    Reset Filters
                  </button>
                </div>
            }
            </div>
            {/* Load More Button */}
            {getFilteredEpisodes().length > visibleEpisodes &&
          <div className="mt-8 text-center">
                <button
              onClick={handleLoadMoreEpisodes}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              aria-label="Load more episodes">

                  Load More Episodes
                </button>
              </div>
          }
          </div>
        }
        {/* SHOWS TAB */}
        {activeTab === 'shows' &&
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shows</h2>
            <div className="space-y-8">
              {showsData.map((show) =>
            <div
              key={show.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">

                  <div className="flex flex-col md:flex-row">
                    {/* Show Thumbnail */}
                    <div className="md:w-1/3 lg:w-1/4">
                      <img
                    src={show.thumbnail_url}
                    alt={show.title}
                    className="w-full h-48 md:h-full object-cover" />

                    </div>
                    {/* Show Info */}
                    <div className="p-6 md:w-2/3 lg:w-3/4">
                      <div className="flex flex-wrap items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {show.title}
                        </h3>
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                          {show.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{show.description}</p>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-x-4 gap-y-2">
                        <div className="flex items-center">
                          <Mic className="h-4 w-4 mr-1" />
                          <span>{show.episode_count} episodes</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{show.publish_frequency}</span>
                        </div>
                        <div className="flex items-center">
                          {renderStarRating(show.average_rating)}
                          <span className="ml-1">({show.review_count})</span>
                        </div>
                      </div>
                      {/* Latest Episode */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Latest Episode
                        </p>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {show.latest_episode.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Released{' '}
                          {formatPublishDate(show.latest_episode.publish_date)}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button
                      className="px-4 py-2 bg-news-primary text-white text-sm font-medium rounded-md hover:bg-news-primary-dark flex items-center"
                      aria-label={`Browse ${show.title} episodes`}
                      onClick={() => {
                        setActiveTab('episodes');
                        setEpisodeFilter(show.category);
                      }}>

                          <Play className="h-4 w-4 mr-2" />
                          Browse Episodes
                        </button>
                        <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 flex items-center"
                      aria-label={`Subscribe to ${show.title}`}
                      onClick={() => alert(`Subscribed to ${show.title}`)}>

                          <Rss className="h-4 w-4 mr-2" />
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </div>
        }
        {/* ABOUT TAB */}
        {activeTab === 'about' &&
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              About {creatorData.display_name}
            </h2>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <div className="prose prose-lg max-w-none text-gray-700">
                  {formatBio(creatorData.bio)}
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Creator Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        CATEGORY
                      </h4>
                      <p className="text-gray-900">{creatorData.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        LOCATION
                      </h4>
                      <p className="text-gray-900">
                        {creatorData.location_display}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        CREATING SINCE
                      </h4>
                      <p className="text-gray-900">
                        {formatDate(creatorData.performing_since)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        EPISODES
                      </h4>
                      <p className="text-gray-900">
                        {creatorData.episodes_count}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        SHOWS
                      </h4>
                      <p className="text-gray-900">{creatorData.shows_count}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        FOLLOWERS
                      </h4>
                      <p className="text-gray-900">
                        {creatorData.follower_count.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {creatorData.tags.map((tag) =>
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm">

                        #{tag}
                      </span>
                  )}
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="lg:w-1/3">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Connect
                  </h3>
                  <div className="space-y-4">
                    {creatorData.website_url &&
                  <a
                    href={creatorData.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-news-primary hover:text-news-primary-dark">

                        <ExternalLink className="h-5 w-5 mr-2" />
                        <span>Official Website</span>
                      </a>
                  }
                    {creatorData.email &&
                  <a
                    href={`mailto:${creatorData.email}`}
                    className="flex items-center text-news-primary hover:text-news-primary-dark">

                        <Mail className="h-5 w-5 mr-2" />
                        <span>{creatorData.email}</span>
                      </a>
                  }
                    {creatorData.rss_feed &&
                  <a
                    href={creatorData.rss_feed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-news-primary hover:text-news-primary-dark">

                        <Rss className="h-5 w-5 mr-2" />
                        <span>RSS Feed</span>
                      </a>
                  }
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Social Media
                    </h4>
                    <div className="space-y-3">
                      {creatorData.instagram_url &&
                    <a
                      href={creatorData.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-news-primary">

                          <Instagram className="h-5 w-5 mr-2" />
                          <span>Instagram</span>
                        </a>
                    }
                      {creatorData.twitter_url &&
                    <a
                      href={creatorData.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-news-primary">

                          <Twitter className="h-5 w-5 mr-2" />
                          <span>Twitter</span>
                        </a>
                    }
                      {creatorData.facebook_url &&
                    <a
                      href={creatorData.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-news-primary">

                          <Facebook className="h-5 w-5 mr-2" />
                          <span>Facebook</span>
                        </a>
                    }
                      {creatorData.youtube_url &&
                    <a
                      href={creatorData.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-news-primary">

                          <Youtube className="h-5 w-5 mr-2" />
                          <span>YouTube</span>
                        </a>
                    }
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Support {creatorData.display_name}
                  </h3>
                  <div className="space-y-3">
                    <button
                    className="w-full bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center"
                    onClick={() => handleTipJarClick()}
                    aria-label="Open tip jar">

                      <DollarSign className="h-5 w-5 mr-2" />
                      Tip Jar
                    </button>
                    {creatorData.patreon_url &&
                  <a
                    href={creatorData.patreon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#FF424D] text-white font-medium rounded-lg hover:bg-[#E23440] inline-block"
                    aria-label="Become a Patron on Patreon">

                        Become a Patron
                      </a>
                  }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        {/* REVIEWS TAB */}
        {activeTab === 'reviews' &&
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
              <div className="mt-3 md:mt-0">
                <select
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                value={reviewSortOrder}
                onChange={(e) => handleReviewSortOrderChange(e.target.value)}
                aria-label="Sort reviews">

                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>
            {/* Rating Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/3 text-center mb-6 md:mb-0">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {creatorData.average_rating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStarRating(creatorData.average_rating)}
                  </div>
                  <p className="text-gray-500 text-sm">
                    Based on {creatorData.review_count} reviews
                  </p>
                </div>
                <div className="md:w-2/3 md:pl-8 md:border-l md:border-gray-200">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                    // Calculate percentage (mock data)
                    const percentage =
                    rating === 5 ?
                    62 :
                    rating === 4 ?
                    28 :
                    rating === 3 ?
                    7 :
                    rating === 2 ?
                    2 :
                    1;
                    return (
                      <div key={rating} className="flex items-center">
                          <div className="flex items-center w-20">
                            <span className="text-sm text-gray-700 mr-2">
                              {rating}
                            </span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{
                              width: `${percentage}%`
                            }}>
                          </div>
                          </div>
                          <span className="ml-3 text-sm text-gray-500 w-12">
                            {percentage}%
                          </span>
                        </div>);

                  })}
                  </div>
                </div>
              </div>
            </div>
            {/* Reviews List */}
            <div className="space-y-8">
              {getSortedReviews().map((review) =>
            <div
              key={review.id}
              className="border-b border-gray-200 pb-8 last:border-b-0">

                  <div className="flex items-start">
                    <img
                  src={review.user.avatar_url}
                  alt={review.user.name}
                  className="h-10 w-10 rounded-full object-cover mr-4" />

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center mb-2">
                        <h3 className="font-bold text-gray-900 mr-3">
                          {review.user.name}
                        </h3>
                        <div className="flex items-center mr-3">
                          {[...Array(5)].map((_, i) =>
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />

                      )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(review.date)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {review.title}
                      </h4>
                      <p className="text-gray-700 mb-3">{review.content}</p>
                      <div className="flex items-center mb-4">
                        <button
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                      onClick={() => handleReviewHelpful(review.id)}
                      aria-label="Mark review as helpful">

                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful ({review.helpful_count})
                        </button>
                        <button
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center ml-4"
                      onClick={() => alert('Report submitted')}
                      aria-label="Report review">

                          <Flag className="h-4 w-4 mr-1" />
                          Report
                        </button>
                      </div>
                      {/* Creator Reply */}
                      {review.reply &&
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-news-primary">
                          <div className="flex items-center mb-2">
                            <img
                        src={creatorData.profile_image_url}
                        alt={creatorData.display_name}
                        className="h-6 w-6 rounded-full object-cover mr-2" />

                            <span className="font-medium text-gray-900">
                              {creatorData.display_name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatRelativeTime(review.reply.date)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {review.reply.content}
                          </p>
                        </div>
                  }
                    </div>
                  </div>
                </div>
            )}
            </div>
            {/* Write Review CTA */}
            <div className="mt-8 text-center">
              <button
              className="px-6 py-2.5 bg-news-primary text-white font-medium rounded-lg hover:bg-news-primary-dark"
              onClick={() => alert('Write a review feature coming soon!')}
              aria-label="Write a review">

                Write a Review
              </button>
            </div>
          </div>
        }
        {/* SUPPORT TAB */}
        {activeTab === 'support' &&
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Support {creatorData.display_name}
            </h2>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <p className="text-gray-700 mb-8">
                  Your support helps {creatorData.display_name} create quality
                  content about local issues that matter to the community.
                  Choose from multiple ways to support below:
                </p>
                {/* Support Options */}
                <div className="space-y-6">
                  {/* Tip Jar */}
                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-news-primary-light flex items-center justify-center mr-4">
                        <DollarSign className="h-6 w-6 text-news-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Tip Jar
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Send a one-time tip of any amount to show your
                          appreciation for specific episodes or general support.
                        </p>
                        <button
                        className="px-5 py-2 bg-news-primary text-white font-medium rounded-lg hover:bg-news-primary-dark"
                        onClick={() => handleTipJarClick()}
                        aria-label="Open tip jar">

                          Send a Tip
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Patreon */}
                  {creatorData.patreon_url &&
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                          <svg
                        className="h-6 w-6 text-[#FF424D]"
                        viewBox="0 0 24 24"
                        fill="currentColor">

                            <path d="M14.82 2.41C18.78 2.41 22 5.65 22 9.62C22 13.58 18.78 16.8 14.82 16.8C10.85 16.8 7.61 13.58 7.61 9.62C7.61 5.65 10.85 2.41 14.82 2.41M2 21.6H5.5V2.41H2V21.6Z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Become a Patron
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Join the community on Patreon for exclusive content,
                            early access to episodes, and behind-the-scenes
                            updates.
                          </p>
                          <a
                        href={creatorData.patreon_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 bg-[#FF424D] text-white font-medium rounded-lg hover:bg-[#E23440] inline-block"
                        aria-label="Become a Patron on Patreon">

                            Join on Patreon
                          </a>
                        </div>
                      </div>
                    </div>
                }
                  {/* Buy Me a Coffee */}
                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                        <Coffee className="h-6 w-6 text-[#FFDD00]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Buy Me a Coffee
                        </h3>
                        <p className="text-gray-600 mb-4">
                          A simple way to send support, similar to buying a
                          coffee for a friend. One-time or recurring support
                          options available.
                        </p>
                        <button
                        className="px-5 py-2 bg-[#FFDD00] text-[#734F22] font-medium rounded-lg hover:bg-[#E5C700]"
                        aria-label="Buy me a coffee"
                        onClick={() =>
                        window.open(
                          'https://www.buymeacoffee.com/clearwaterreport',
                          '_blank'
                        )
                        }>

                          Buy a Coffee
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Payment Apps */}
                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <CreditCard className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Payment Apps
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Send support directly through popular payment apps.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {creatorData.venmo_handle &&
                        <button
                          className="px-4 py-2 bg-[#008CFF] hover:bg-[#0074D4] text-white font-medium rounded-lg"
                          aria-label="Pay with Venmo"
                          onClick={() =>
                          window.open(
                            `https://venmo.com/${creatorData.venmo_handle}`,
                            '_blank'
                          )
                          }>

                              Venmo
                            </button>
                        }
                          {creatorData.cashapp_handle &&
                        <button
                          className="px-4 py-2 bg-[#00D632] hover:bg-[#00B82B] text-white font-medium rounded-lg"
                          aria-label="Pay with Cash App"
                          onClick={() =>
                          window.open(
                            `https://cash.app/$${creatorData.cashapp_handle}`,
                            '_blank'
                          )
                          }>

                              Cash App
                            </button>
                        }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="lg:w-1/3">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Why Support?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 bg-news-primary rounded-full flex items-center justify-center mr-3">
                        <Mic className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Enable Quality Content
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your support helps fund equipment, research, and
                          production costs.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 bg-news-primary rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Support Local Journalism
                        </h4>
                        <p className="text-sm text-gray-600">
                          Help keep independent local reporting alive in your
                          community.
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 bg-news-primary rounded-full flex items-center justify-center mr-3">
                        <Gift className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Get Exclusive Benefits
                        </h4>
                        <p className="text-sm text-gray-600">
                          Supporters often receive special perks, early access,
                          and exclusive content.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Supporter Testimonials
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 italic mb-2">
                          "The Clearwater Report has become essential listening
                          for understanding local issues. Happy to support
                          quality journalism!"
                        </p>
                        <p className="text-xs text-gray-500">
                          — Michael T., Monthly Supporter
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 italic mb-2">
                          "Sarah's in-depth reporting on our city council
                          meetings has helped me stay informed as a resident.
                          Worth every penny."
                        </p>
                        <p className="text-xs text-gray-500">
                          — Jennifer K., Patron since 2022
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
      {/* Audio Player (Fixed at bottom) */}
      {currentlyPlayingEpisode &&
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 shadow-lg z-50">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center">
              <img
              src={currentlyPlayingEpisode.thumbnail_url}
              alt={currentlyPlayingEpisode.title}
              className="h-12 w-12 object-cover rounded mr-3" />

              <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-medium text-gray-900 truncate">
                  {currentlyPlayingEpisode.title}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {creatorData.display_name} • EP{' '}
                  {currentlyPlayingEpisode.episode_number}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                className="p-1.5 text-gray-500 hover:text-gray-700"
                aria-label="Skip backwards">

                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                className="p-2 bg-news-primary text-white rounded-full hover:bg-news-primary-dark"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={() => setIsPlaying(!isPlaying)}>

                  {isPlaying ?
                <Pause className="h-5 w-5" /> :

                <Play className="h-5 w-5" fill="white" />
                }
                </button>
                <button
                className="p-1.5 text-gray-500 hover:text-gray-700"
                aria-label="Skip forwards">

                  <SkipForward className="h-5 w-5" />
                </button>
                <button
                className="p-1.5 text-gray-500 hover:text-gray-700"
                aria-label="Adjust volume">

                  <Volume2 className="h-5 w-5" />
                </button>
                <button
                className="p-1.5 text-gray-500 hover:text-gray-700 ml-2"
                aria-label="Close player"
                onClick={() => {
                  setCurrentlyPlayingEpisode(null);
                  setIsPlaying(false);
                }}>

                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                className="h-full bg-news-primary rounded-full"
                style={{
                  width: '35%'
                }}>
              </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1:53</span>
                <span>
                  {formatDuration(currentlyPlayingEpisode.duration_seconds)}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Tip Jar Modal */}
      <TipJarModal
        isOpen={showTipJarModal}
        onClose={() => setShowTipJarModal(false)}
        creatorName={creatorData.display_name}
        creatorId={creatorData.id}
        venmoHandle={creatorData.venmo_handle}
        cashappHandle={creatorData.cashapp_handle}
        episodeTitle={selectedEpisode?.title}
        episodeId={selectedEpisode?.id} />

    </div>);

};