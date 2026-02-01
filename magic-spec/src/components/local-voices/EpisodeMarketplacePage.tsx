import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronDown,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Star,
  Users,
  Headphones,
  Video,
  Mic,
  Bookmark,
  BookmarkCheck,
  Eye,
  TrendingUp,
  LayoutGrid,
  List,
  Sliders,
  X,
  Calendar,
  Tag,
  User,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  ChevronRight,
  Loader,
  RefreshCw,
  AlertCircle,
  ArrowUpRight } from
'lucide-react';
export const EpisodeMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // View mode state (episodes or creators)
  const [viewMode, setViewMode] = useState<'episodes' | 'creators'>(
    searchParams.get('view') === 'creators' ? 'creators' : 'episodes'
  );
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('q') || ''
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [creatorFilter, setCreatorFilter] = useState<string>(
    searchParams.get('creator') || 'all'
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get('sort') || 'newest'
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  // Audio playback states
  const [isPlaying, setIsPlaying] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [currentAudioInfo, setCurrentAudioInfo] = useState<any>(null);
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  // Viewed episodes tracking
  const [viewedEpisodes, setViewedEpisodes] = useState<{
    [key: string]: {
      timestamp: number;
      creatorId: string;
    };
  }>({});
  // Followed creators tracking
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  // Category options for filter
  const categoryOptions = [
  {
    id: 'all',
    name: 'All Categories'
  },
  {
    id: 'news',
    name: 'News & Politics'
  },
  {
    id: 'business',
    name: 'Business'
  },
  {
    id: 'culture',
    name: 'Culture & Arts'
  },
  {
    id: 'sports',
    name: 'Sports'
  },
  {
    id: 'education',
    name: 'Education'
  },
  {
    id: 'entertainment',
    name: 'Entertainment'
  },
  {
    id: 'technology',
    name: 'Technology'
  },
  {
    id: 'health',
    name: 'Health & Wellness'
  },
  {
    id: 'family',
    name: 'Family & Parenting'
  }];

  // Sort options
  const sortOptions = [
  {
    id: 'newest',
    name: 'Most Recent',
    icon: <Clock className="h-4 w-4" />
  },
  {
    id: 'oldest',
    name: 'Least Recent',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'popular',
    name: 'Most Popular',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    id: 'highest_rated',
    name: 'Highest Rated',
    icon: <Star className="h-4 w-4" />
  }];

  // Mock data for episodes
  const episodesData = [
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
    listen_count: 1247,
    average_rating: 4.8,
    review_count: 56,
    is_featured: true,
    is_new: false,
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
    listen_count: 892,
    average_rating: 4.6,
    review_count: 42,
    is_featured: true,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep3',
    title: 'Fall Football Preview: Teams to Watch This Season',
    description:
    'We break down the top high school football teams in the county and make our predictions for the upcoming season.',
    publish_date: '2023-07-30T16:00:00Z',
    duration: '38:42',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '3',
    creator_name: 'Pinellas Sports Talk',
    creator_image:
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Sports',
    listen_count: 753,
    average_rating: 4.7,
    review_count: 38,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep4',
    title: "Hidden Gems: The Best Seafood Spots You've Never Heard Of",
    description:
    'Discover the best under-the-radar seafood restaurants along the Gulf Coast that locals love but tourists rarely find.',
    publish_date: '2023-07-27T12:00:00Z',
    duration: '28:15',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '4',
    creator_name: 'Gulf Coast Foodie',
    creator_image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Culture',
    listen_count: 1105,
    average_rating: 4.9,
    review_count: 67,
    is_featured: true,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep5',
    title: "Summer Concert Series: What's Coming to Dunedin",
    description:
    'A complete guide to all the upcoming summer concerts and music festivals in Dunedin and surrounding areas.',
    publish_date: '2023-07-25T20:00:00Z',
    duration: '41:08',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '5',
    creator_name: 'Dunedin After Dark',
    creator_image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Entertainment',
    listen_count: 687,
    average_rating: 4.5,
    review_count: 31,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep6',
    title: 'The Founding Families: Who Really Built Safety Harbor?',
    description:
    'Exploring the untold stories of the founding families who established Safety Harbor and their lasting impact on the community.',
    publish_date: '2023-07-24T14:00:00Z',
    duration: '52:24',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1582034986517-30d382cc23d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '6',
    creator_name: 'Safety Harbor History',
    creator_image:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Education',
    listen_count: 512,
    average_rating: 4.7,
    review_count: 29,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep7',
    title: 'Palm Harbor City Council Meeting Recap',
    description:
    'A detailed analysis of the latest Palm Harbor City Council meeting and the key decisions that will affect residents.',
    publish_date: '2023-08-02T09:30:00Z',
    duration: '25:18',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '7',
    creator_name: 'Palm Harbor Daily',
    creator_image:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'News',
    listen_count: 423,
    average_rating: 4.3,
    review_count: 18,
    is_featured: false,
    is_new: true,
    media_type: 'audio'
  },
  {
    id: 'ep8',
    title: 'The Future of Tech in Tampa Bay',
    description:
    "An exploration of Tampa Bay's growing tech scene and what it means for the future of the region's economy.",
    publish_date: '2023-08-03T15:45:00Z',
    duration: '34:45',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '8',
    creator_name: 'Tampa Tech Talk',
    creator_image:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Technology',
    listen_count: 657,
    average_rating: 4.6,
    review_count: 27,
    is_featured: false,
    is_new: true,
    media_type: 'audio'
  },
  {
    id: 'ep9',
    title: 'Best Hiking Trails Around Clearwater',
    description:
    'A guide to the most scenic and accessible hiking trails in and around the Clearwater area for all experience levels.',
    publish_date: '2023-08-04T07:15:00Z',
    duration: '42:10',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '9',
    creator_name: 'Clearwater Outdoors',
    creator_image:
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Recreation',
    listen_count: 712,
    average_rating: 4.8,
    review_count: 34,
    is_featured: false,
    is_new: true,
    media_type: 'audio'
  },
  {
    id: 'ep10',
    title: 'Interview with Local Muralist Sarah James',
    description:
    "St. Pete's vibrant art scene through the eyes of one of its most prominent muralists, Sarah James.",
    publish_date: '2023-08-05T11:20:00Z',
    duration: '36:22',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1551913902-c92207136625?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '10',
    creator_name: 'St. Pete Arts Beat',
    creator_image:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Arts',
    listen_count: 548,
    average_rating: 4.7,
    review_count: 22,
    is_featured: false,
    is_new: true,
    media_type: 'video'
  },
  {
    id: 'ep11',
    title: 'Tampa Bay Housing Market Update: July 2023',
    description:
    "A comprehensive analysis of the current state of Tampa Bay's housing market with insights for buyers and sellers.",
    publish_date: '2023-07-31T13:45:00Z',
    duration: '29:54',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '11',
    creator_name: 'Bay Area Real Estate',
    creator_image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Business',
    listen_count: 389,
    average_rating: 4.4,
    review_count: 16,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep12',
    title: 'Largo Community Center Expansion Plans',
    description:
    'Details on the upcoming expansion of the Largo Community Center and what new amenities residents can expect.',
    publish_date: '2023-07-15T12:00:00Z',
    duration: '22:36',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '12',
    creator_name: 'Largo Local',
    creator_image:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'News',
    listen_count: 87,
    average_rating: 4.2,
    review_count: 6,
    is_featured: false,
    is_new: false,
    media_type: 'video'
  },
  {
    id: 'ep13',
    title: 'Where to Find Redfish This Summer',
    description:
    'Expert fishing tips on the best spots and techniques for catching redfish in Tampa Bay waters this summer.',
    publish_date: '2023-07-10T08:00:00Z',
    duration: '31:48',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1545489379-1370f9a84c27?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '13',
    creator_name: 'Tampa Bay Fishing Report',
    creator_image:
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Recreation',
    listen_count: 134,
    average_rating: 4.5,
    review_count: 8,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep14',
    title: 'Hurricane Season Preparation Guide',
    description:
    'Essential tips and strategies for Tampa Bay residents to prepare for the hurricane season and stay safe during storms.',
    publish_date: '2023-07-05T16:00:00Z',
    duration: '44:12',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1514632595-4944383f2737?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '14',
    creator_name: 'Gulf Coast Weather',
    creator_image:
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'News',
    listen_count: 212,
    average_rating: 4.6,
    review_count: 12,
    is_featured: false,
    is_new: false,
    media_type: 'video'
  },
  {
    id: 'ep15',
    title: 'Back to School Shopping Tips',
    description:
    'Money-saving strategies and essential shopping lists for parents preparing for the new school year in Pinellas County.',
    publish_date: '2023-07-01T10:00:00Z',
    duration: '26:19',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '15',
    creator_name: 'Pinellas Parents',
    creator_image:
    'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Family',
    listen_count: 176,
    average_rating: 4.8,
    review_count: 9,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep16',
    title: 'Small Business Spotlight: Clearwater Bakery',
    description:
    'An interview with the owners of the popular Clearwater Bakery about their journey and secrets to success.',
    publish_date: '2023-06-28T14:00:00Z',
    duration: '33:51',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '16',
    creator_name: 'Clearwater Business Journal',
    creator_image:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Business',
    listen_count: 143,
    average_rating: 4.3,
    review_count: 7,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep17',
    title: 'Rays Trade Deadline Special',
    description:
    "Breaking down the Tampa Bay Rays' moves at the MLB trade deadline and what they mean for the team's playoff prospects.",
    publish_date: '2023-08-01T18:30:00Z',
    duration: '47:33',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '17',
    creator_name: 'Tampa Bay Sports Central',
    creator_image:
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Sports',
    listen_count: 1156,
    average_rating: 4.7,
    review_count: 53,
    is_featured: true,
    is_new: true,
    media_type: 'video'
  },
  {
    id: 'ep18',
    title: 'Hidden History of Downtown St. Petersburg',
    description:
    "Uncovering the fascinating and little-known historical stories behind St. Petersburg's most iconic buildings and streets.",
    publish_date: '2023-07-29T09:15:00Z',
    duration: '39:47',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1449824913935-502baa1986e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '18',
    creator_name: 'St. Pete Uncovered',
    creator_image:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    category: 'Culture',
    listen_count: 978,
    average_rating: 4.6,
    review_count: 47,
    is_featured: false,
    is_new: false,
    media_type: 'audio'
  },
  {
    id: 'ep19',
    title: 'Mental Health Resources in Pinellas County',
    description:
    'A comprehensive guide to mental health services and resources available to residents of Pinellas County.',
    publish_date: '2023-08-06T14:00:00Z',
    duration: '35:22',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1493836512294-502baa1986e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '19',
    creator_name: 'Pinellas Health Connect',
    creator_image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Health',
    listen_count: 321,
    average_rating: 4.9,
    review_count: 14,
    is_featured: false,
    is_new: true,
    media_type: 'audio'
  },
  {
    id: 'ep20',
    title: 'Clearwater Beach Cleanup Initiative',
    description:
    'How local volunteers are working to keep Clearwater Beach pristine and how you can get involved in upcoming cleanup events.',
    publish_date: '2023-08-07T10:30:00Z',
    duration: '28:45',
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3',
    thumbnail_url:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80',
    creator_id: '20',
    creator_name: 'Clearwater Environmental Alliance',
    creator_image:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    category: 'Environment',
    listen_count: 187,
    average_rating: 4.7,
    review_count: 8,
    is_featured: false,
    is_new: true,
    media_type: 'video'
  }];

  // Mock data for creators
  const creatorsData = [
  {
    id: '1',
    display_name: 'The Clearwater Report',
    tagline: 'Your weekly deep dive into local politics',
    category: 'Politics',
    location_display: 'Clearwater, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 1247,
    average_rating: 4.8,
    review_count: 156,
    verified_badge: true,
    episode_count: 87,
    media_types: ['audio']
  },
  {
    id: '2',
    display_name: 'Tampa Bay Business Weekly',
    tagline: "Insights from Tampa Bay's business leaders",
    category: 'Business',
    location_display: 'Tampa, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 892,
    average_rating: 4.6,
    review_count: 98,
    verified_badge: true,
    episode_count: 64,
    media_types: ['audio']
  },
  {
    id: '3',
    display_name: 'Pinellas Sports Talk',
    tagline: 'Coverage of high school and local sports',
    category: 'Sports',
    location_display: 'St. Petersburg, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 753,
    average_rating: 4.7,
    review_count: 82,
    verified_badge: false,
    episode_count: 42,
    media_types: ['audio']
  },
  {
    id: '4',
    display_name: 'Gulf Coast Foodie',
    tagline: 'Exploring the best local restaurants and cuisine',
    category: 'Culture',
    location_display: 'Clearwater, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 1105,
    average_rating: 4.9,
    review_count: 143,
    verified_badge: true,
    episode_count: 78,
    media_types: ['audio', 'video']
  },
  {
    id: '5',
    display_name: 'Dunedin After Dark',
    tagline: 'Nightlife, music, and entertainment coverage',
    category: 'Entertainment',
    location_display: 'Dunedin, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 687,
    average_rating: 4.5,
    review_count: 76,
    verified_badge: false,
    episode_count: 53,
    media_types: ['audio']
  },
  {
    id: '6',
    display_name: 'Safety Harbor History',
    tagline: "Stories from our city's rich past",
    category: 'Education',
    location_display: 'Safety Harbor, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1582034986517-30d382cc23d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 512,
    average_rating: 4.7,
    review_count: 68,
    verified_badge: true,
    episode_count: 36,
    media_types: ['audio']
  },
  {
    id: '7',
    display_name: 'Palm Harbor Daily',
    tagline: 'Your source for Palm Harbor news',
    category: 'News',
    location_display: 'Palm Harbor, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 423,
    average_rating: 4.3,
    review_count: 45,
    verified_badge: true,
    episode_count: 156,
    media_types: ['audio', 'video']
  },
  {
    id: '8',
    display_name: 'Tampa Tech Talk',
    tagline: "Exploring Tampa Bay's tech ecosystem",
    category: 'Technology',
    location_display: 'Tampa, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 657,
    average_rating: 4.6,
    review_count: 72,
    verified_badge: false,
    episode_count: 89,
    media_types: ['audio']
  },
  {
    id: '9',
    display_name: 'Clearwater Outdoors',
    tagline: 'Your guide to outdoor recreation',
    category: 'Recreation',
    location_display: 'Clearwater, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 712,
    average_rating: 4.8,
    review_count: 95,
    verified_badge: true,
    episode_count: 112,
    media_types: ['audio', 'video']
  },
  {
    id: '10',
    display_name: 'St. Pete Arts Beat',
    tagline: 'Covering the vibrant arts scene',
    category: 'Arts',
    location_display: 'St. Petersburg, FL',
    profile_image_url:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    banner_image_url:
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80',
    follower_count: 548,
    average_rating: 4.7,
    review_count: 63,
    verified_badge: false,
    episode_count: 78,
    media_types: ['audio', 'video']
  }];

  // Function to get unique creators from episodes
  const getUniqueCreators = () => {
    const uniqueCreatorIds = [
    ...new Set(episodesData.map((episode) => episode.creator_id))];

    return uniqueCreatorIds.map((id) => {
      const creator = creatorsData.find((c) => c.id === id);
      if (creator) return creator;
      // If creator not found in creatorsData, create from episode data
      const episode = episodesData.find((e) => e.creator_id === id);
      return {
        id: id,
        display_name: episode?.creator_name || 'Unknown Creator',
        profile_image_url: episode?.creator_image || '',
        category: episode?.category || 'Uncategorized',
        follower_count: 0,
        average_rating: 0,
        review_count: 0,
        verified_badge: false,
        episode_count: episodesData.filter((e) => e.creator_id === id).length,
        media_types: ['audio']
      };
    });
  };
  // Initialize viewed episodes from localStorage
  useEffect(() => {
    try {
      // Load viewed episodes from localStorage
      const storedViewedEpisodes = localStorage.getItem('viewedEpisodes');
      if (storedViewedEpisodes) {
        setViewedEpisodes(JSON.parse(storedViewedEpisodes));
      }
      // Load followed creators from localStorage
      const storedFollowedCreators = localStorage.getItem('followedCreators');
      if (storedFollowedCreators) {
        setFollowedCreators(JSON.parse(storedFollowedCreators));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    // Update URL with current filters
    updateUrlWithFilters();
  }, []);
  // Load saved filters on component mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('episodeMarketplaceFilters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        if (filters.viewMode) setViewMode(filters.viewMode);
        if (filters.categoryFilter) setCategoryFilter(filters.categoryFilter);
        if (filters.creatorFilter) setCreatorFilter(filters.creatorFilter);
        if (filters.sortBy) setSortBy(filters.sortBy);
        if (filters.mediaTypeFilter) setMediaTypeFilter(filters.mediaTypeFilter);
        if (filters.viewLayout) setViewLayout(filters.viewLayout);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }, []);
  // Update URL when filters change
  useEffect(() => {
    updateUrlWithFilters();
  }, [
  viewMode,
  searchQuery,
  categoryFilter,
  creatorFilter,
  sortBy,
  mediaTypeFilter]
  );
  // Update URL with current filters
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    if (viewMode !== 'episodes') params.set('view', viewMode);
    if (searchQuery) params.set('q', searchQuery);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (creatorFilter !== 'all') params.set('creator', creatorFilter);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (mediaTypeFilter !== 'all') params.set('mediaType', mediaTypeFilter);
    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Show loading state
    setIsLoading(true);
    // Simulate search API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    switch (filter) {
      case 'category':
        setCategoryFilter(value);
        break;
      case 'creator':
        setCreatorFilter(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      default:
        break;
    }
  };
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  // Handle layout change
  const handleLayoutChange = (layout) => {
    setViewLayout(layout);
  };
  // Handle media type change
  const handleMediaTypeChange = (type) => {
    setMediaTypeFilter(type);
  };
  // Handle play/pause audio
  const handlePlayPause = (e, episodeId, audioUrl, episodeInfo) => {
    e.stopPropagation();
    e.preventDefault();
    // Mark episode as viewed
    markEpisodeAsViewed(episodeId, episodeInfo.creator_id);
    // If already playing this audio, pause it
    if (isPlaying[episodeId]) {
      setIsPlaying((prev) => ({
        ...prev,
        [episodeId]: false
      }));
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (currentAudio === audioUrl) {
        setShowAudioPlayer(false);
        setCurrentAudio(null);
        setCurrentAudioInfo(null);
      }
      return;
    }
    // If playing a different audio, stop it first
    if (currentAudio && currentAudio !== audioUrl && audioRef.current) {
      audioRef.current.pause();
      // Reset all other playing states
      const newPlayingState = {};
      Object.keys(isPlaying).forEach((id) => {
        newPlayingState[id] = id === episodeId;
      });
      setIsPlaying(newPlayingState);
    } else {
      // Just set this one to playing
      setIsPlaying((prev) => ({
        ...prev,
        [episodeId]: true
      }));
    }
    // Set new current audio
    setCurrentAudio(audioUrl);
    setCurrentAudioInfo({
      episodeId,
      episodeTitle: episodeInfo.title,
      episodeThumbnail: episodeInfo.thumbnail_url,
      creatorName: episodeInfo.creator_name,
      creatorImage: episodeInfo.creator_image,
      duration: episodeInfo.duration
    });
    // Show audio player
    setShowAudioPlayer(true);
    // Play the audio
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = audioVolume;
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        // Reset playing state
        setIsPlaying((prev) => ({
          ...prev,
          [episodeId]: false
        }));
      });
    }
  };
  // Mark episode as viewed
  const markEpisodeAsViewed = (episodeId, creatorId) => {
    if (!viewedEpisodes[episodeId]) {
      const updatedViewedEpisodes = {
        ...viewedEpisodes,
        [episodeId]: {
          timestamp: Date.now(),
          creatorId: creatorId
        }
      };
      setViewedEpisodes(updatedViewedEpisodes);
      // Save to localStorage
      try {
        localStorage.setItem(
          'viewedEpisodes',
          JSON.stringify(updatedViewedEpisodes)
        );
      } catch (error) {
        console.error('Error saving viewed episodes:', error);
      }
    }
  };
  // Navigate to episode detail
  const navigateToEpisode = (episodeId, creatorId) => {
    markEpisodeAsViewed(episodeId, creatorId);
    navigate(`/local-voices/episode/${episodeId}`);
  };
  // Navigate to creator profile
  const navigateToCreator = (creatorId) => {
    navigate(`/local-voices/creator/${creatorId}`);
  };
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Format time since
  const formatTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };
  // Render star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) =>
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : i < rating ? 'text-yellow-400 fill-yellow-400 opacity-50' : 'text-gray-300'}`}
          aria-hidden="true" />

        )}
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>);

  };
  // Handle audio progress
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
      audioRef.current.currentTime / audioRef.current.duration * 100;
      setAudioProgress(progress);
    }
  };
  // Handle audio progress bar click
  const handleProgressBarClick = (e) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = clickPosition * audioRef.current.duration;
    }
  };
  // Handle volume change
  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setAudioVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (volume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = audioVolume;
      }
    }
  };
  // Handle audio ended
  const handleAudioEnded = () => {
    // Reset all playing states
    const newPlayingState = {};
    Object.keys(isPlaying).forEach((id) => {
      newPlayingState[id] = false;
    });
    setIsPlaying(newPlayingState);
    setAudioProgress(0);
    setShowAudioPlayer(false);
    setCurrentAudio(null);
    setCurrentAudioInfo(null);
  };
  // Initialize audio event listeners
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleAudioTimeUpdate);
      audioRef.current.addEventListener('ended', handleAudioEnded);
      return () => {
        audioRef.current?.removeEventListener(
          'timeupdate',
          handleAudioTimeUpdate
        );
        audioRef.current?.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, [currentAudio]);
  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
      showFilters &&
      filtersRef.current &&
      !filtersRef.current.contains(event.target))
      {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);
  // Filter episodes based on search and filters
  const getFilteredEpisodes = () => {
    return episodesData.
    filter((episode) => {
      // Search query filter
      if (
      searchQuery &&
      !episode.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !episode.description.
      toLowerCase().
      includes(searchQuery.toLowerCase()) &&
      !episode.creator_name.
      toLowerCase().
      includes(searchQuery.toLowerCase()))
      {
        return false;
      }
      // Category filter
      if (
      categoryFilter !== 'all' &&
      episode.category.toLowerCase() !== categoryFilter.toLowerCase())
      {
        return false;
      }
      // Creator filter
      if (creatorFilter !== 'all' && episode.creator_id !== creatorFilter) {
        return false;
      }
      // Media type filter
      if (
      mediaTypeFilter !== 'all' &&
      episode.media_type !== mediaTypeFilter)
      {
        return false;
      }
      return true;
    }).
    sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.publish_date).getTime() -
            new Date(a.publish_date).getTime());

        case 'oldest':
          return (
            new Date(a.publish_date).getTime() -
            new Date(b.publish_date).getTime());

        case 'popular':
          return b.listen_count - a.listen_count;
        case 'highest_rated':
          return b.average_rating - a.average_rating;
        default:
          return (
            new Date(b.publish_date).getTime() -
            new Date(a.publish_date).getTime());

      }
    });
  };
  // Filter creators based on search and filters
  const getFilteredCreators = () => {
    const creators = getUniqueCreators();
    return creators.
    filter((creator) => {
      // Search query filter
      if (
      searchQuery &&
      !creator.display_name.
      toLowerCase().
      includes(searchQuery.toLowerCase()))
      {
        return false;
      }
      // Category filter
      if (
      categoryFilter !== 'all' &&
      creator.category.toLowerCase() !== categoryFilter.toLowerCase())
      {
        return false;
      }
      return true;
    }).
    sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case 'newest':
          // For creators, sort by most recent episode
          const aLatestEpisode = episodesData.
          filter((ep) => ep.creator_id === a.id).
          sort(
            (x, y) =>
            new Date(y.publish_date).getTime() -
            new Date(x.publish_date).getTime()
          )[0];
          const bLatestEpisode = episodesData.
          filter((ep) => ep.creator_id === b.id).
          sort(
            (x, y) =>
            new Date(y.publish_date).getTime() -
            new Date(x.publish_date).getTime()
          )[0];
          if (!aLatestEpisode) return 1;
          if (!bLatestEpisode) return -1;
          return (
            new Date(bLatestEpisode.publish_date).getTime() -
            new Date(aLatestEpisode.publish_date).getTime());

        case 'popular':
          return b.follower_count - a.follower_count;
        case 'highest_rated':
          return b.average_rating - a.average_rating;
        default:
          return b.follower_count - a.follower_count;
      }
    });
  };
  // Get episodes for a specific creator
  const getCreatorEpisodes = (creatorId) => {
    return episodesData.
    filter((episode) => episode.creator_id === creatorId).
    sort(
      (a, b) =>
      new Date(b.publish_date).getTime() -
      new Date(a.publish_date).getTime()
    );
  };
  // Add a function to check if an episode is new (published within the last month)
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
  // Add a function to check if a creator has new episodes
  const creatorHasNewEpisodes = (creatorId) => {
    return episodesData.some(
      (episode) =>
      episode.creator_id === creatorId && isNewEpisode(episode.publish_date)
    );
  };
  // Add a function to follow/unfollow creators
  const toggleFollowCreator = (creatorId) => {
    let updatedFollowedCreators;
    if (followedCreators.includes(creatorId)) {
      updatedFollowedCreators = followedCreators.filter(
        (id) => id !== creatorId
      );
    } else {
      updatedFollowedCreators = [...followedCreators, creatorId];
    }
    setFollowedCreators(updatedFollowedCreators);
    // Save to localStorage
    try {
      localStorage.setItem(
        'followedCreators',
        JSON.stringify(updatedFollowedCreators)
      );
    } catch (error) {
      console.error('Error saving followed creators:', error);
    }
  };
  // Render episode card
  const renderEpisodeCard = (episode) => {
    const isViewed = viewedEpisodes[episode.id];
    const isNew = isNewEpisode(episode.publish_date);
    return (
      <div
        key={episode.id}
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative ${isViewed ? 'opacity-80' : ''}`}
        onClick={() => navigateToEpisode(episode.id, episode.creator_id)}>

        {/* Thumbnail */}
        <div className="relative h-40 bg-gray-100">
          <img
            src={episode.thumbnail_url}
            alt=""
            className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <button
              className="h-12 w-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center hover:bg-opacity-100 transition-colors focus:outline-none focus:ring-2 focus:ring-news-primary"
              onClick={(e) =>
              handlePlayPause(e, episode.id, episode.audio_url, episode)
              }
              aria-label={isPlaying[episode.id] ? 'Pause' : 'Play'}>

              {isPlaying[episode.id] ?
              <Pause className="h-6 w-6 text-news-primary" /> :

              <Play className="h-6 w-6 text-news-primary" />
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
          {/* New episode badge */}
          {isNew &&
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs py-1 px-2 rounded-full">
              New
            </div>
          }
          {/* Viewed badge */}
          {isViewed &&
          <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white text-xs py-1 px-2 rounded-full flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>Viewed</span>
            </div>
          }
        </div>
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start mb-2">
            <img
              src={episode.creator_image}
              alt={episode.creator_name}
              className="h-8 w-8 rounded-full object-cover mr-2" />

            <div>
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {episode.title}
              </h3>
              <p className="text-sm text-gray-600">{episode.creator_name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTimeSince(episode.publish_date)}</span>
            </div>
            <div className="flex items-center">
              <Headphones className="h-3 w-3 mr-1" />
              <span>{episode.duration}</span>
            </div>
          </div>
        </div>
      </div>);

  };
  // Render episode list item
  const renderEpisodeListItem = (episode) => {
    const isViewed = viewedEpisodes[episode.id];
    const isNew = isNewEpisode(episode.publish_date);
    return (
      <div
        key={episode.id}
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${isViewed ? 'opacity-80' : ''}`}
        onClick={() => navigateToEpisode(episode.id, episode.creator_id)}>

        <div className="flex">
          {/* Thumbnail */}
          <div className="relative h-24 w-36 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <img
              src={episode.thumbnail_url}
              alt=""
              className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <button
                className="h-10 w-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center hover:bg-opacity-100 transition-colors focus:outline-none focus:ring-2 focus:ring-news-primary"
                onClick={(e) =>
                handlePlayPause(e, episode.id, episode.audio_url, episode)
                }
                aria-label={isPlaying[episode.id] ? 'Pause' : 'Play'}>

                {isPlaying[episode.id] ?
                <Pause className="h-5 w-5 text-news-primary" /> :

                <Play className="h-5 w-5 text-news-primary" />
                }
              </button>
            </div>
            {/* Media type badge */}
            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs py-0.5 px-1.5 rounded-full flex items-center">
              {episode.media_type === 'audio' ?
              <>
                  <Headphones className="h-2.5 w-2.5 mr-0.5" />
                  <span className="text-xs">Audio</span>
                </> :

              <>
                  <Video className="h-2.5 w-2.5 mr-0.5" />
                  <span className="text-xs">Video</span>
                </>
              }
            </div>
            {/* Viewed badge */}
            {isViewed &&
            <div className="absolute bottom-1 right-1 bg-gray-800 bg-opacity-70 text-white text-xs py-0.5 px-1.5 rounded-full flex items-center">
                <Eye className="h-2.5 w-2.5 mr-0.5" />
                <span className="text-xs">Viewed</span>
              </div>
            }
          </div>
          {/* Content */}
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={episode.creator_image}
                  alt={episode.creator_name}
                  className="h-6 w-6 rounded-full object-cover mr-2" />

                <p className="text-sm text-gray-600 truncate">
                  {episode.creator_name}
                </p>
                {/* New episode badge */}
                {isNew &&
                <span className="ml-2 bg-green-500 text-white text-xs py-0.5 px-1.5 rounded-full">
                    New
                  </span>
                }
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatTimeSince(episode.publish_date)}</span>
              </div>
            </div>
            <h3 className="font-medium text-gray-900 mt-1 line-clamp-2">
              {episode.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
              {episode.description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <div className="flex items-center">
                <Headphones className="h-3 w-3 mr-1" />
                <span>{episode.listen_count.toLocaleString()} listens</span>
              </div>
              <div className="flex items-center">
                <span>{episode.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>);

  };
  // Render creator card
  const renderCreatorCard = (creator) => {
    const creatorEpisodes = getCreatorEpisodes(creator.id);
    const latestEpisode = creatorEpisodes[0];
    const hasNewEpisodes = creatorHasNewEpisodes(creator.id);
    const isFollowed = followedCreators.includes(creator.id);
    return (
      <div
        key={creator.id}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigateToCreator(creator.id)}>

        {/* Profile Image */}
        <div className="p-4 flex items-center">
          <div className="h-16 w-16 rounded-full overflow-hidden mr-3 relative">
            <img
              src={creator.profile_image_url}
              alt=""
              className="h-full w-full object-cover" />

            {hasNewEpisodes &&
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                <span className="sr-only">New episodes</span>
                <span aria-hidden="true">•</span>
              </div>
            }
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {creator.display_name}
              {creator.verified_badge &&
              <CheckCircle
                className="h-4 w-4 text-blue-500 inline ml-1"
                aria-label="Verified creator" />

              }
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              {creator.tagline || creator.category}
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Users className="h-3 w-3 mr-1" />
              <span>{creator.follower_count.toLocaleString()} followers</span>
              <span className="mx-2">•</span>
              <Mic className="h-3 w-3 mr-1" />
              <span>{creator.episode_count} episodes</span>
              {hasNewEpisodes &&
              <span className="ml-2 bg-green-500 text-white text-xs py-0.5 px-1.5 rounded-full">
                  New
                </span>
              }
            </div>
          </div>
        </div>
        {/* Latest Episode - Now clickable */}
        {latestEpisode &&
        <div className="border-t border-gray-100">
            <div
            className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent onClick
              navigateToEpisode(latestEpisode.id, latestEpisode.creator_id);
            }}>

              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-500">Latest Episode</p>
                <p className="text-xs text-gray-500">
                  {formatTimeSince(latestEpisode.publish_date)}
                </p>
              </div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                {latestEpisode.title}
              </h4>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  {latestEpisode.media_type === 'audio' ?
                <Headphones className="h-3 w-3 mr-1" /> :

                <Video className="h-3 w-3 mr-1" />
                }
                  <span>{latestEpisode.duration}</span>
                  {isNewEpisode(latestEpisode.publish_date) &&
                <span className="ml-2 bg-green-500 text-white text-xs py-0.5 px-1.5 rounded-full">
                      New
                    </span>
                }
                </div>
                <button
                className={`h-8 w-8 rounded-full flex items-center justify-center ${isPlaying[latestEpisode.id] ? 'bg-news-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors focus:outline-none focus:ring-2 focus:ring-news-primary focus:ring-offset-2`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause(
                    e,
                    latestEpisode.id,
                    latestEpisode.audio_url,
                    latestEpisode
                  );
                }}
                aria-label={
                isPlaying[latestEpisode.id] ?
                'Pause episode' :
                'Play episode'
                }>

                  {isPlaying[latestEpisode.id] ?
                <Pause className="h-4 w-4" /> :

                <Play className="h-4 w-4" />
                }
                </button>
              </div>
            </div>
          </div>
        }
        {/* Follow button */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFollowCreator(creator.id);
            }}
            className={`w-full py-1.5 rounded-md text-sm font-medium ${isFollowed ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-news-primary text-white hover:bg-news-primary-dark'}`}>

            {isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>);

  };
  // Get all creators for the creator filter
  const allCreators = getUniqueCreators();
  // Get filtered content based on view mode
  const filteredEpisodes = getFilteredEpisodes();
  const filteredCreators = getFilteredCreators();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden audio element for playing episodes */}
      <audio ref={audioRef} className="hidden" />
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {viewMode === 'episodes' ?
              'Episode Marketplace' :
              'Creator Marketplace'}
            </h1>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="bg-gray-100 rounded-lg p-0.5 flex">
                <button
                  className={`px-2 py-1 rounded-md text-sm font-medium ${viewMode === 'episodes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => handleViewModeChange('episodes')}
                  aria-pressed={viewMode === 'episodes'}
                  aria-label="View episodes">

                  Episodes
                </button>
                <button
                  className={`px-2 py-1 rounded-md text-sm font-medium ${viewMode === 'creators' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => handleViewModeChange('creators')}
                  aria-pressed={viewMode === 'creators'}
                  aria-label="View creators">

                  Creators
                </button>
              </div>
              {/* Media Type Filter */}
              {viewMode === 'episodes' &&
              <div className="bg-gray-100 rounded-lg p-0.5 flex">
                  <button
                  className={`px-2 py-1 rounded-md text-sm font-medium ${mediaTypeFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => handleMediaTypeChange('all')}
                  aria-pressed={mediaTypeFilter === 'all'}
                  aria-label="View all media types">

                    All
                  </button>
                  <button
                  className={`px-2 py-1 rounded-md text-sm font-medium ${mediaTypeFilter === 'audio' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => handleMediaTypeChange('audio')}
                  aria-pressed={mediaTypeFilter === 'audio'}
                  aria-label="View audio only">

                    <Headphones className="h-3 w-3 inline mr-1" />
                    Audio
                  </button>
                  <button
                  className={`px-2 py-1 rounded-md text-sm font-medium ${mediaTypeFilter === 'video' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => handleMediaTypeChange('video')}
                  aria-pressed={mediaTypeFilter === 'video'}
                  aria-label="View video only">

                    <Video className="h-3 w-3 inline mr-1" />
                    Video
                  </button>
                </div>
              }
              {/* Layout Toggle (only for episodes) */}
              {viewMode === 'episodes' &&
              <div className="bg-gray-100 rounded-lg p-0.5 flex">
                  <button
                  className={`p-1 rounded-md ${viewLayout === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => handleLayoutChange('grid')}
                  aria-pressed={viewLayout === 'grid'}
                  aria-label="Grid view">

                    <LayoutGrid className="h-3 w-3" />
                  </button>
                  <button
                  className={`p-1 rounded-md ${viewLayout === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => handleLayoutChange('list')}
                  aria-pressed={viewLayout === 'list'}
                  aria-label="List view">

                    <List className="h-3 w-3" />
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </header>
      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200 py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            {/* Search Form */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={`Search ${viewMode === 'episodes' ? 'episodes' : 'creators'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  ref={searchInputRef}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-1.5 pl-9 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors text-sm"
                  aria-label={`Search ${viewMode === 'episodes' ? 'episodes' : 'creators'}`} />

                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true" />

                {searchQuery &&
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search">

                    <X className="h-3 w-3" />
                  </button>
                }
              </form>
            </div>
            {/* Filter Button */}
            <div className="relative" ref={filtersRef}>
              <button
                className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-news-primary text-sm"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="filters-panel">

                <Filter className="h-4 w-4 mr-1.5" />
                <span>Filters</span>
                <ChevronDown className="h-3 w-3 ml-1.5" />
              </button>
              {/* Filters Panel */}
              {showFilters &&
              <div
                id="filters-panel"
                className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-3">

                  <h3 className="text-xs font-medium text-gray-900 mb-2">
                    Filters
                  </h3>
                  {/* Category Filter */}
                  <div className="mb-3">
                    <label
                    htmlFor="category-filter"
                    className="block text-xs font-medium text-gray-700 mb-1">

                      Category
                    </label>
                    <select
                    id="category-filter"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors text-sm"
                    value={categoryFilter}
                    onChange={(e) =>
                    handleFilterChange('category', e.target.value)
                    }
                    aria-label="Filter by category">

                      {categoryOptions.map((option) =>
                    <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                    )}
                    </select>
                  </div>
                  {/* Creator Filter (only for episodes view) */}
                  {viewMode === 'episodes' &&
                <div className="mb-3">
                      <label
                    htmlFor="creator-filter"
                    className="block text-xs font-medium text-gray-700 mb-1">

                        Creator
                      </label>
                      <select
                    id="creator-filter"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors text-sm"
                    value={creatorFilter}
                    onChange={(e) =>
                    handleFilterChange('creator', e.target.value)
                    }
                    aria-label="Filter by creator">

                        <option value="all">All Creators</option>
                        {allCreators.map((creator) =>
                    <option key={creator.id} value={creator.id}>
                            {creator.display_name}
                          </option>
                    )}
                      </select>
                    </div>
                }
                  {/* Sort By */}
                  <div>
                    <label
                    htmlFor="sort-by"
                    className="block text-xs font-medium text-gray-700 mb-1">

                      Sort By
                    </label>
                    <select
                    id="sort-by"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors text-sm"
                    value={sortBy}
                    onChange={(e) =>
                    handleFilterChange('sort', e.target.value)
                    }
                    aria-label="Sort by">

                      {sortOptions.map((option) =>
                    <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                    )}
                    </select>
                  </div>
                  {/* Reset Filters */}
                  <div className="mt-3 flex justify-end">
                    <button
                    className="text-xs text-news-primary hover:text-news-primary-dark focus:outline-none focus:underline"
                    onClick={() => {
                      setCategoryFilter('all');
                      setCreatorFilter('all');
                      setSortBy('newest');
                    }}>

                      Reset Filters
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
          {/* Active Filters */}
          {(categoryFilter !== 'all' ||
          creatorFilter !== 'all' ||
          sortBy !== 'newest' ||
          searchQuery) &&
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs text-gray-600">Active filters:</span>
              {searchQuery &&
            <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-800 flex items-center">
                  <Search className="h-2.5 w-2.5 mr-1" />
                  <span>{searchQuery}</span>
                  <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchQuery('')}
                aria-label="Remove search filter">

                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
            }
              {categoryFilter !== 'all' &&
            <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-800 flex items-center">
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  <span>
                    {categoryOptions.find((c) => c.id === categoryFilter)?.name}
                  </span>
                  <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => setCategoryFilter('all')}
                aria-label="Remove category filter">

                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
            }
              {creatorFilter !== 'all' && viewMode === 'episodes' &&
            <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-800 flex items-center">
                  <User className="h-2.5 w-2.5 mr-1" />
                  <span>
                    {
                allCreators.find((c) => c.id === creatorFilter)?.
                display_name
                }
                  </span>
                  <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => setCreatorFilter('all')}
                aria-label="Remove creator filter">

                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
            }
              {sortBy !== 'newest' &&
            <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-800 flex items-center">
                  <Sliders className="h-2.5 w-2.5 mr-1" />
                  <span>
                    Sort: {sortOptions.find((s) => s.id === sortBy)?.name}
                  </span>
                  <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => setSortBy('newest')}
                aria-label="Remove sort filter">

                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
            }
              <button
              className="text-xs text-news-primary hover:text-news-primary-dark focus:outline-none focus:underline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setCreatorFilter('all');
                setSortBy('newest');
              }}>

                Clear all
              </button>
            </div>
          }
        </div>
      </section>
      {/* Loading State */}
      {isLoading &&
      <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader
            className="h-10 w-10 text-news-primary animate-spin mx-auto mb-4"
            aria-hidden="true" />

            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      }
      {/* Error State */}
      {hasError && !isLoading &&
      <div className="flex justify-center items-center py-20">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <AlertCircle
            className="h-10 w-10 text-red-500 mx-auto mb-4"
            aria-hidden="true" />

            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {errorMessage ||
            'Failed to load content. Please try again later.'}
            </p>
            <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              // Simulate reloading data
              setTimeout(() => {
                setIsLoading(false);
              }, 1000);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-news-primary hover:bg-news-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary transition-colors"
            aria-label="Try again">

              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      }
      {/* Main Content - Only show when not loading and no error */}
      {!isLoading && !hasError &&
      <main className="container mx-auto px-4 max-w-7xl py-3">
          {/* Episodes View */}
          {viewMode === 'episodes' &&
        <>
              <div className="mb-3 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {filteredEpisodes.length}{' '}
                  {filteredEpisodes.length === 1 ? 'Episode' : 'Episodes'}
                </h2>
                <div className="text-xs text-gray-600">
                  Sorted by:{' '}
                  <span className="font-medium">
                    {sortOptions.find((s) => s.id === sortBy)?.name}
                  </span>
                </div>
              </div>
              {filteredEpisodes.length > 0 ?
          <>
                  {/* Grid View */}
                  {viewLayout === 'grid' &&
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredEpisodes.map((episode) =>
              renderEpisodeCard(episode)
              )}
                    </div>
            }
                  {/* List View */}
                  {viewLayout === 'list' &&
            <div className="space-y-4">
                      {filteredEpisodes.map((episode) =>
              renderEpisodeListItem(episode)
              )}
                    </div>
            }
                </> :

          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No episodes found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria.
                  </p>
                  <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setCreatorFilter('all');
                setSortBy('newest');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-news-primary hover:bg-news-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary transition-colors">

                    Reset Filters
                  </button>
                </div>
          }
            </>
        }
          {/* Creators View */}
          {viewMode === 'creators' &&
        <>
              <div className="mb-3 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {filteredCreators.length}{' '}
                  {filteredCreators.length === 1 ? 'Creator' : 'Creators'}
                </h2>
                <div className="text-xs text-gray-600">
                  Sorted by:{' '}
                  <span className="font-medium">
                    {sortOptions.find((s) => s.id === sortBy)?.name}
                  </span>
                </div>
              </div>
              {filteredCreators.length > 0 ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCreators.map((creator) =>
            renderCreatorCard(creator)
            )}
                </div> :

          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No creators found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria.
                  </p>
                  <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setSortBy('newest');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-news-primary hover:bg-news-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary transition-colors">

                    Reset Filters
                  </button>
                </div>
          }
            </>
        }
        </main>
      }
      {/* Floating Audio Player */}
      {showAudioPlayer && currentAudioInfo &&
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-40 transition-transform"
        ref={audioPlayerRef}
        aria-live="polite"
        aria-label="Audio player">

          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              {/* Episode Info */}
              <div className="flex items-center flex-1 min-w-0 mr-4">
                {currentAudioInfo.episodeThumbnail &&
              <img
                src={currentAudioInfo.episodeThumbnail}
                alt=""
                className="h-10 w-16 object-cover rounded mr-3 hidden sm:block"
                aria-hidden="true" />

              }
                <img
                src={currentAudioInfo.creatorImage}
                alt=""
                className="h-10 w-10 rounded-full object-cover mr-3"
                aria-hidden="true" />

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {currentAudioInfo.episodeTitle}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {currentAudioInfo.creatorName}
                  </p>
                </div>
              </div>
              {/* Player Controls */}
              <div className="flex items-center">
                {/* Progress Bar */}
                <div
                className="hidden md:block w-48 lg:w-96 bg-gray-200 h-1.5 rounded-full mx-4 relative cursor-pointer"
                onClick={handleProgressBarClick}
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={audioProgress}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.min(
                        audioRef.current.duration,
                        audioRef.current.currentTime + 5
                      );
                    }
                  } else if (e.key === 'ArrowLeft') {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(
                        0,
                        audioRef.current.currentTime - 5
                      );
                    }
                  }
                }}>

                  <div
                  className="absolute top-0 left-0 h-full bg-news-primary rounded-full"
                  style={{
                    width: `${audioProgress}%`
                  }}>
                </div>
                </div>
                {/* Controls */}
                <div className="flex items-center space-x-3">
                  {/* Skip Back 10s */}
                  <button
                  className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-news-primary"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(
                        0,
                        audioRef.current.currentTime - 10
                      );
                    }
                  }}
                  aria-label="Skip back 10 seconds">

                    <SkipBack className="h-5 w-5" />
                  </button>
                  {/* Play/Pause */}
                  <button
                  className="h-10 w-10 rounded-full bg-news-primary text-white flex items-center justify-center hover:bg-news-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-news-primary focus:ring-offset-2"
                  onClick={() => {
                    if (audioRef.current) {
                      if (audioRef.current.paused) {
                        audioRef.current.play();
                        // Update playing state
                        if (currentAudioInfo) {
                          setIsPlaying((prev) => ({
                            ...prev,
                            [currentAudioInfo.episodeId]: true
                          }));
                        }
                      } else {
                        audioRef.current.pause();
                        // Update playing state
                        if (currentAudioInfo) {
                          setIsPlaying((prev) => ({
                            ...prev,
                            [currentAudioInfo.episodeId]: false
                          }));
                        }
                      }
                    }
                  }}
                  aria-label={audioRef.current?.paused ? 'Play' : 'Pause'}>

                    {audioRef.current?.paused ?
                  <Play className="h-5 w-5" /> :

                  <Pause className="h-5 w-5" />
                  }
                  </button>
                  {/* Skip Forward 10s */}
                  <button
                  className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-news-primary"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.min(
                        audioRef.current.duration,
                        audioRef.current.currentTime + 10
                      );
                    }
                  }}
                  aria-label="Skip forward 10 seconds">

                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>
                {/* Volume Control */}
                <div className="hidden md:flex items-center ml-6">
                  <button
                  className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-news-primary"
                  onClick={handleMuteToggle}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}>

                    {isMuted ?
                  <VolumeX className="h-5 w-5" /> :

                  <Volume2 className="h-5 w-5" />
                  }
                  </button>
                  <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : audioVolume}
                  onChange={handleVolumeChange}
                  className="ml-2 w-20"
                  aria-label="Volume" />

                </div>
                {/* Close Button */}
                <button
                className="ml-6 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-news-primary"
                onClick={() => {
                  setShowAudioPlayer(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  setCurrentAudio(null);
                  setCurrentAudioInfo(null);
                  // Reset all playing states
                  const newPlayingState = {};
                  Object.keys(isPlaying).forEach((id) => {
                    newPlayingState[id] = false;
                  });
                  setIsPlaying(newPlayingState);
                }}
                aria-label="Close audio player">

                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Mobile Progress Bar */}
            <div
            className="md:hidden w-full bg-gray-200 h-1.5 rounded-full mt-2 relative cursor-pointer"
            onClick={handleProgressBarClick}
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={audioProgress}>

              <div
              className="absolute top-0 left-0 h-full bg-news-primary rounded-full"
              style={{
                width: `${audioProgress}%`
              }}>
            </div>
            </div>
          </div>
        </div>
      }
      {/* Back to Top Button */}
      <button
        className="fixed bottom-20 right-4 bg-news-primary text-white rounded-full p-3 shadow-lg hover:bg-news-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary"
        onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
        }
        aria-label="Back to top">

        <ArrowUpRight className="h-5 w-5" />
      </button>
    </div>);

};