import React, { useEffect, useState, useRef, Component } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mic,
  Video,
  Edit,
  Trash2,
  Plus,
  BarChart2,
  Play,
  Pause,
  ChevronRight,
  Upload,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Image,
  Tag,
  Save,
  X,
  Calendar,
  Users,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Bell,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Download,
  ExternalLink,
  Eye,
  HelpCircle,
  Loader,
  AlertCircle,
  CheckCircle,
  User,
  MoreHorizontal,
  Volume2,
  VolumeX,
  RefreshCw,
  AlignLeft,
  FileText,
  DollarSign,
  Award,
  Zap,
  PieChart,
  Globe,
  TrendingUp,
  Map,
  Flag,
  Info,
  MessageCircle } from
'lucide-react';
// Mock data - In a real app, this would come from an API
const mockUserData = {
  id: 'user123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar:
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  subscription: {
    tier: 'professional_broadcaster',
    status: 'active',
    podcastLimit: 5,
    currentPodcastCount: 2
  },
  podcasts: [
  {
    id: 'podcast1',
    title: 'The Clearwater Report',
    description: 'Local news and insights from Clearwater, Florida',
    image:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    category: 'News & Politics',
    type: 'audio',
    episodeCount: 24,
    totalListens: 45600,
    recentListens: 2300,
    lastEpisodeDate: '2023-11-10',
    episodes: [
    {
      id: 'ep1',
      title: 'City Council Meeting Recap',
      description:
      'A detailed analysis of the latest city council meeting, including the new downtown development project and budget discussions.',
      publishDate: '2023-11-10',
      duration: '42:18',
      listens: 1250,
      image:
      'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      status: 'published',
      tags: ['City Council', 'Local Government', 'Development']
    },
    {
      id: 'ep2',
      title: 'Downtown Redevelopment Special',
      description:
      'An in-depth look at the plans for downtown redevelopment, featuring interviews with local business owners and city planners.',
      publishDate: '2023-11-03',
      duration: '38:45',
      listens: 980,
      image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      status: 'published',
      tags: ['Downtown', 'Development', 'Business']
    },
    {
      id: 'ep3',
      title: 'Interview with Mayor Johnson',
      description:
      'An exclusive interview with Mayor Johnson discussing his vision for the city, upcoming initiatives, and addressing community concerns.',
      publishDate: '2023-10-27',
      duration: '51:22',
      listens: 1430,
      image:
      'https://images.unsplash.com/photo-1560523159-4a9692d222f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      status: 'published',
      tags: ['Mayor', 'Interview', 'Politics']
    },
    {
      id: 'ep4',
      title: 'Local Business Spotlight: Harbor Cafe',
      description:
      'Featuring the popular Harbor Cafe, discussing their history, menu innovations, and community involvement.',
      publishDate: '2023-10-20',
      duration: '35:10',
      listens: 875,
      image:
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      status: 'published',
      tags: ['Business', 'Food', 'Community']
    },
    {
      id: 'ep5',
      title: 'School Board Update: New Educational Initiatives',
      description:
      'Coverage of the latest school board meeting with details on new educational programs and budget allocations.',
      publishDate: '2023-10-13',
      duration: '44:55',
      listens: 1050,
      image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      status: 'published',
      tags: ['Education', 'School Board', 'Youth']
    }],

    settings: {
      autoPublish: true,
      monetization: true,
      crossPosting: true,
      episodeTemplate:
      '<p>Welcome to {{episode_title}}!</p><p>In this episode, we discuss...</p>',
      defaultTags: ['Clearwater', 'Local News', 'Community'],
      distributionPlatforms: [
      'Spotify',
      'Apple Podcasts',
      'Google Podcasts',
      'YouTube']

    },
    analytics: {
      listenerDemographics: {
        ageGroups: [
        {
          group: '18-24',
          percentage: 15
        },
        {
          group: '25-34',
          percentage: 32
        },
        {
          group: '35-44',
          percentage: 28
        },
        {
          group: '45-54',
          percentage: 18
        },
        {
          group: '55+',
          percentage: 7
        }],

        gender: [
        {
          group: 'Male',
          percentage: 58
        },
        {
          group: 'Female',
          percentage: 41
        },
        {
          group: 'Other',
          percentage: 1
        }],

        topLocations: [
        {
          location: 'Clearwater, FL',
          percentage: 45
        },
        {
          location: 'Tampa, FL',
          percentage: 22
        },
        {
          location: 'St. Petersburg, FL',
          percentage: 18
        },
        {
          location: 'Orlando, FL',
          percentage: 8
        },
        {
          location: 'Other',
          percentage: 7
        }]

      },
      listeningTrends: {
        monthly: [
        {
          month: 'Jun',
          listens: 3200
        },
        {
          month: 'Jul',
          listens: 3800
        },
        {
          month: 'Aug',
          listens: 4100
        },
        {
          month: 'Sep',
          listens: 4500
        },
        {
          month: 'Oct',
          listens: 4800
        },
        {
          month: 'Nov',
          listens: 5200
        }],

        weeklyAverage: [
        {
          day: 'Mon',
          listens: 620
        },
        {
          day: 'Tue',
          listens: 580
        },
        {
          day: 'Wed',
          listens: 750
        },
        {
          day: 'Thu',
          listens: 890
        },
        {
          day: 'Fri',
          listens: 1200
        },
        {
          day: 'Sat',
          listens: 850
        },
        {
          day: 'Sun',
          listens: 710
        }],

        timeOfDay: [
        {
          time: '6am-9am',
          percentage: 28
        },
        {
          time: '9am-12pm',
          percentage: 15
        },
        {
          time: '12pm-3pm',
          percentage: 12
        },
        {
          time: '3pm-6pm',
          percentage: 18
        },
        {
          time: '6pm-9pm',
          percentage: 22
        },
        {
          time: '9pm-12am',
          percentage: 5
        }]

      },
      engagement: {
        averageListenTime: '36:24',
        completionRate: 78,
        shareRate: 3.2,
        downloadRate: 42
      }
    }
  },
  {
    id: 'podcast2',
    title: 'Tech Talk Tampa Bay',
    description: 'Technology news and interviews from Tampa Bay',
    image:
    'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    category: 'Technology',
    type: 'video',
    episodeCount: 18,
    totalListens: 28900,
    recentListens: 1800,
    lastEpisodeDate: '2023-11-05',
    episodes: [
    {
      id: 'ep4',
      title: 'Interview with Local Startup Founder',
      description:
      "A conversation with the founder of Tampa Bay's hottest new tech startup about their journey, challenges, and vision for the future.",
      publishDate: '2023-11-05',
      duration: '48:32',
      listens: 920,
      image:
      'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      status: 'published',
      tags: ['Startup', 'Entrepreneurship', 'Innovation']
    },
    {
      id: 'ep5',
      title: 'The Future of AI in Local Business',
      description:
      'Exploring how artificial intelligence is transforming small and medium businesses in the Tampa Bay area.',
      publishDate: '2023-10-29',
      duration: '36:15',
      listens: 845,
      image:
      'https://images.unsplash.com/photo-1535378620166-273708d44e4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      status: 'published',
      tags: ['AI', 'Technology', 'Business']
    },
    {
      id: 'ep6',
      title: 'Cybersecurity Essentials for Small Businesses',
      description:
      'A practical guide to cybersecurity for small business owners, featuring tips from local security experts.',
      publishDate: '2023-10-22',
      duration: '41:08',
      listens: 780,
      image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      status: 'published',
      tags: ['Cybersecurity', 'Small Business', 'Technology']
    },
    {
      id: 'ep7',
      title: 'Tampa Bay Tech Conference Highlights',
      description:
      'Recap of the annual Tampa Bay Tech Conference, featuring keynote summaries and exhibition highlights.',
      publishDate: '2023-10-15',
      duration: '52:40',
      listens: 910,
      image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
      audioUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      status: 'draft',
      tags: ['Conference', 'Tech Events', 'Networking']
    }],

    settings: {
      autoPublish: false,
      monetization: true,
      crossPosting: true,
      episodeTemplate:
      "<p>Welcome to Tech Talk Tampa Bay! Today we're discussing {{episode_title}}.</p>",
      defaultTags: ['Tech', 'Tampa Bay', 'Innovation'],
      distributionPlatforms: [
      'YouTube',
      'Spotify',
      'Apple Podcasts',
      'Twitch']

    },
    analytics: {
      listenerDemographics: {
        ageGroups: [
        {
          group: '18-24',
          percentage: 22
        },
        {
          group: '25-34',
          percentage: 40
        },
        {
          group: '35-44',
          percentage: 25
        },
        {
          group: '45-54',
          percentage: 10
        },
        {
          group: '55+',
          percentage: 3
        }],

        gender: [
        {
          group: 'Male',
          percentage: 72
        },
        {
          group: 'Female',
          percentage: 27
        },
        {
          group: 'Other',
          percentage: 1
        }],

        topLocations: [
        {
          location: 'Tampa, FL',
          percentage: 38
        },
        {
          location: 'St. Petersburg, FL',
          percentage: 21
        },
        {
          location: 'Clearwater, FL',
          percentage: 15
        },
        {
          location: 'Orlando, FL',
          percentage: 12
        },
        {
          location: 'Other',
          percentage: 14
        }]

      },
      listeningTrends: {
        monthly: [
        {
          month: 'Jun',
          listens: 2100
        },
        {
          month: 'Jul',
          listens: 2400
        },
        {
          month: 'Aug',
          listens: 2600
        },
        {
          month: 'Sep',
          listens: 2750
        },
        {
          month: 'Oct',
          listens: 2900
        },
        {
          month: 'Nov',
          listens: 3100
        }],

        weeklyAverage: [
        {
          day: 'Mon',
          listens: 380
        },
        {
          day: 'Tue',
          listens: 420
        },
        {
          day: 'Wed',
          listens: 510
        },
        {
          day: 'Thu',
          listens: 490
        },
        {
          day: 'Fri',
          listens: 520
        },
        {
          day: 'Sat',
          listens: 410
        },
        {
          day: 'Sun',
          listens: 370
        }],

        timeOfDay: [
        {
          time: '6am-9am',
          percentage: 15
        },
        {
          time: '9am-12pm',
          percentage: 22
        },
        {
          time: '12pm-3pm',
          percentage: 18
        },
        {
          time: '3pm-6pm',
          percentage: 16
        },
        {
          time: '6pm-9pm',
          percentage: 24
        },
        {
          time: '9pm-12am',
          percentage: 5
        }]

      },
      engagement: {
        averageListenTime: '32:15',
        completionRate: 72,
        shareRate: 4.8,
        downloadRate: 38
      }
    }
  }],

  notifications: [
  {
    id: 'notif1',
    type: 'performance',
    title: 'Performance Milestone',
    message:
    'Your podcast "The Clearwater Report" has reached 45,000 total listens!',
    date: '2023-11-10T10:23:00Z',
    read: false
  },
  {
    id: 'notif2',
    type: 'comment',
    title: 'New Comment',
    message:
    'Sarah Johnson commented on your episode "Interview with Mayor Johnson"',
    date: '2023-11-09T15:48:00Z',
    read: false
  },
  {
    id: 'notif3',
    type: 'system',
    title: 'System Update',
    message: 'New analytics features are now available in your dashboard',
    date: '2023-11-08T09:30:00Z',
    read: true
  },
  {
    id: 'notif4',
    type: 'share',
    title: 'Content Shared',
    message:
    'Your episode "Downtown Redevelopment Special" was shared 25 times yesterday',
    date: '2023-11-07T11:15:00Z',
    read: true
  }]

};
// Category options
const categories = [
'News & Politics',
'Business & Finance',
'Technology',
'Health & Wellness',
'Education',
'Arts & Culture',
'Sports',
'Entertainment',
'Music',
'Food & Cooking',
'Travel',
'Lifestyle',
'Science',
'History',
'Religion & Spirituality',
'True Crime',
'Comedy',
'Parenting',
'Hobbies & Interests',
'Other'];

const PodcastManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const episodeOptionsRef = useRef<HTMLDivElement>(null);
  const [showNewPodcastModal, setShowNewPodcastModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [podcastToDelete, setPodcastToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('episodes');
  const [selectedPodcast, setSelectedPodcast] = useState<string>(
    mockUserData.podcasts[0].id
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [episodeToShare, setEpisodeToShare] = useState<string | null>(null);
  const [showEpisodeOptions, setShowEpisodeOptions] = useState<string | null>(
    null
  );
  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<
    string | null>(
    null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('publishDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [settingsSection, setSettingsSection] = useState('general');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('6months');
  const [showEditEpisodeModal, setShowEditEpisodeModal] = useState(false);
  const [episodeToEdit, setEpisodeToEdit] = useState<any | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(
    mockUserData.notifications.filter((n) => !n.read).length
  );
  // Get the current podcast data
  const currentPodcast =
  mockUserData.podcasts.find((p) => p.id === selectedPodcast) ||
  mockUserData.podcasts[0];
  // Handle podcast selection
  const handlePodcastSelect = (podcastId: string) => {
    setSelectedPodcast(podcastId);
    // Reset other states when changing podcast
    setSearchQuery('');
    setFilterStatus('all');
    setSortField('publishDate');
    setSortDirection('desc');
    // Stop any playing audio when switching podcasts
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingEpisode(null);
    }
  };
  // Handle delete podcast
  const handleDeleteClick = (podcastId: string) => {
    setPodcastToDelete(podcastId);
    setShowDeleteConfirmation(true);
  };
  // Confirm delete podcast
  const confirmDelete = () => {
    // In a real app, this would call an API to delete the podcast
    setIsLoading(true);
    setTimeout(() => {
      // Simulate successful deletion
      setIsLoading(false);
      setShowDeleteConfirmation(false);
      setPodcastToDelete(null);
      // If the deleted podcast was the selected one, select the first available
      if (
      podcastToDelete === selectedPodcast &&
      mockUserData.podcasts.length > 1)
      {
        const remainingPodcasts = mockUserData.podcasts.filter(
          (p) => p.id !== podcastToDelete
        );
        if (remainingPodcasts.length > 0) {
          setSelectedPodcast(remainingPodcasts[0].id);
        }
      }
      // Show success message
      setError(null);
    }, 1500);
  };
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsLoading(true);
    // Simulate API call to load tab data
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  // Filter and sort episodes
  const filteredAndSortedEpisodes = currentPodcast.episodes.
  filter((episode) => {
    if (filterStatus !== 'all' && episode.status !== filterStatus)
    return false;
    if (searchQuery) {
      return (
        episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.description.
        toLowerCase().
        includes(searchQuery.toLowerCase()) ||
        episode.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    }
    return true;
  }).
  sort((a, b) => {
    if (sortField === 'publishDate') {
      return sortDirection === 'asc' ?
      new Date(a.publishDate).getTime() -
      new Date(b.publishDate).getTime() :
      new Date(b.publishDate).getTime() -
      new Date(a.publishDate).getTime();
    } else if (sortField === 'listens') {
      return sortDirection === 'asc' ?
      a.listens - b.listens :
      b.listens - a.listens;
    } else if (sortField === 'title') {
      return sortDirection === 'asc' ?
      a.title.localeCompare(b.title) :
      b.title.localeCompare(a.title);
    } else if (sortField === 'duration') {
      const getDurationInSeconds = (duration: string) => {
        const [minutes, seconds] = duration.split(':').map(Number);
        return minutes * 60 + seconds;
      };
      return sortDirection === 'asc' ?
      getDurationInSeconds(a.duration) - getDurationInSeconds(b.duration) :
      getDurationInSeconds(b.duration) - getDurationInSeconds(a.duration);
    }
    return 0;
  });
  // Handle audio playback
  const togglePlayback = (episodeId: string, audioUrl: string) => {
    if (currentPlayingEpisode === episodeId) {
      // Toggle play/pause for current episode
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch((error) => {
            console.error('Audio playback error:', error);
            setError('Failed to play audio. Please try again.');
          });
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      // Start playing a new episode
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((error) => {
          console.error('Audio playback error:', error);
          setError('Failed to play audio. Please try again.');
        });
        setCurrentPlayingEpisode(episodeId);
        setIsPlaying(true);
      }
    }
  };
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };
  // Handle episode edit
  const handleEditEpisode = (episode: any) => {
    setEpisodeToEdit(episode);
    setShowEditEpisodeModal(true);
  };
  // Handle episode share
  const handleShareEpisode = (episodeId: string) => {
    setEpisodeToShare(episodeId);
    setShowShareMenu(true);
  };
  // Share content
  const shareContent = (platform: string) => {
    const episode = currentPodcast.episodes.find(
      (ep) => ep.id === episodeToShare
    );
    const shareUrl = `https://day.news/local-voices/${currentPodcast.id}/episode/${episodeToShare}`;
    const shareText = `Listen to "${episode?.title}" on ${currentPodcast.title}`;
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Link copied to clipboard!');
        });
        setShowShareMenu(false);
        setEpisodeToShare(null);
        return;
    }
    window.open(shareLink, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
    setEpisodeToShare(null);
  };
  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    // In a real app, this would call an API
    const updatedNotifications = mockUserData.notifications.map((notif) =>
    notif.id === id ?
    {
      ...notif,
      read: true
    } :
    notif
    );
    // Update unread count
    setUnreadNotifications(updatedNotifications.filter((n) => !n.read).length);
  };
  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    // In a real app, this would call an API
    setUnreadNotifications(0);
  };
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node))
      {
        setShowNotifications(false);
      }
      if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target as Node))
      {
        setShowUserMenu(false);
      }
      if (
      shareMenuRef.current &&
      !shareMenuRef.current.contains(event.target as Node))
      {
        setShowShareMenu(false);
        setEpisodeToShare(null);
      }
      if (
      episodeOptionsRef.current &&
      !episodeOptionsRef.current.contains(event.target as Node))
      {
        setShowEpisodeOptions(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentPlayingEpisode(null);
    };
    const handleError = () => {
      setError('There was an error playing this audio file.');
      setIsPlaying(false);
    };
    if (audio) {
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      }
    };
  }, []);
  // Load tab data on tab change
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call to load tab data
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [activeTab, selectedPodcast]);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link
                to="/"
                className="font-display text-2xl font-bold text-news-primary"
                aria-label="Day.News Homepage">

                Day.News
              </Link>
              <span className="ml-2 text-gray-500">|</span>
              <span className="ml-2 font-semibold text-gray-700">
                Creator Dashboard
              </span>
            </div>
            {/* User and Notifications */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="text-gray-600 hover:text-news-primary transition-colors p-1 rounded-full hover:bg-gray-100 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label={`${unreadNotifications} unread notifications`}
                  aria-expanded={showNotifications}
                  aria-haspopup="true">

                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 &&
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  }
                </button>
                {showNotifications &&
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">
                        Notifications
                      </h3>
                      {unreadNotifications > 0 &&
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                      aria-label="Mark all as read">

                          Mark all as read
                        </button>
                    }
                    </div>
                    {mockUserData.notifications.length === 0 ?
                  <div className="px-4 py-6 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm">No notifications yet</p>
                      </div> :

                  mockUserData.notifications.map((notif) =>
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-gray-100 last:border-0 ${notif.read ? 'bg-white' : 'bg-blue-50'}`}>

                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              {notif.type === 'performance' &&
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Award className="h-4 w-4 text-green-600" />
                                </div>
                        }
                              {notif.type === 'comment' &&
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <MessageCircle className="h-4 w-4 text-indigo-600" />
                                </div>
                        }
                              {notif.type === 'system' &&
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Info className="h-4 w-4 text-gray-600" />
                                </div>
                        }
                              {notif.type === 'share' &&
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Share2 className="h-4 w-4 text-purple-600" />
                                </div>
                        }
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-700">
                                {notif.message}
                              </p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                  {formatDate(notif.date)} at{' '}
                                  {formatTime(notif.date)}
                                </p>
                                {!notif.read &&
                          <button
                            onClick={() =>
                            markNotificationAsRead(notif.id)
                            }
                            className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                            aria-label="Mark as read">

                                    Mark as read
                                  </button>
                          }
                              </div>
                            </div>
                          </div>
                        </div>
                  )
                  }
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <Link
                      to="/notifications"
                      className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                      aria-label="View all notifications">

                        View all notifications
                      </Link>
                    </div>
                  </div>
                }
              </div>
              {/* User Menu */}
              <div className="relative user-menu" ref={userMenuRef}>
                <button
                  className="flex items-center group"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true">

                  <img
                    src={mockUserData.avatar}
                    alt="User profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-news-primary transition-colors" />

                  <ChevronDown
                    className={`h-4 w-4 ml-1 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} />

                </button>
                {showUserMenu &&
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {mockUserData.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {mockUserData.email}
                      </p>
                    </div>
                    <Link
                    to="/local-voices/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <BarChart2 className="h-4 w-4 mr-3 text-gray-500" />
                      Dashboard
                    </Link>
                    <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      Your Profile
                    </Link>
                    <Link
                    to="/local-voices/dashboard/subscription"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <CreditCard className="h-4 w-4 mr-3 text-gray-500" />
                      Subscription
                    </Link>
                    <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <Link
                    to="/help"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Help Center
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                    onClick={() => {
                      navigate('/');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      Sign out
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex items-center space-x-6 border-t border-gray-200 pt-4">
            <Link
              to="/local-voices/dashboard"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to dashboard overview">

              Overview
            </Link>
            <Link
              to="/local-voices/dashboard/podcast"
              className="text-news-primary font-semibold"
              aria-current="page"
              aria-label="Currently on content page">

              Content
            </Link>
            <Link
              to="/local-voices/dashboard/analytics"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to analytics page">

              Analytics
            </Link>
            <Link
              to="/local-voices/dashboard/subscription"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to subscription page">

              Subscription
            </Link>
            <Link
              to="/local-voices/dashboard/settings"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to settings page">

              Settings
            </Link>
          </nav>
        </div>
      </header>
      {/* Now Playing Bar - Shows when audio is playing */}
      {currentPlayingEpisode &&
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 z-20 shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {currentPodcast.episodes.find(
                (ep) => ep.id === currentPlayingEpisode
              )?.image &&
              <img
                src={
                currentPodcast.episodes.find(
                  (ep) => ep.id === currentPlayingEpisode
                )?.image
                }
                alt="Episode thumbnail"
                className="h-10 w-10 rounded-md object-cover" />

              }
                <button
                onClick={() =>
                togglePlayback(
                  currentPlayingEpisode,
                  currentPodcast.episodes.find(
                    (ep) => ep.id === currentPlayingEpisode
                  )?.audioUrl || ''
                )
                }
                className="h-10 w-10 rounded-full bg-news-primary flex items-center justify-center text-white hover:bg-news-primary-dark transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}>

                  {isPlaying ?
                <Pause className="h-5 w-5" /> :

                <Play className="h-5 w-5" />
                }
                </button>
                <div>
                  <p className="font-medium text-gray-900">
                    {currentPodcast.episodes.find(
                    (ep) => ep.id === currentPlayingEpisode
                  )?.title || 'Unknown Episode'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentPodcast.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                  onClick={toggleMute}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}>

                    {isMuted ?
                  <VolumeX className="h-5 w-5" /> :

                  <Volume2 className="h-5 w-5" />
                  }
                  </button>
                  <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Volume control" />

                </div>
                <button
                onClick={() => {
                  setCurrentPlayingEpisode(null);
                  setIsPlaying(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = '';
                  }
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close player">

                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link
            to="/local-voices/dashboard"
            className="text-news-primary hover:text-news-primary-dark flex items-center text-sm font-medium transition-colors"
            aria-label="Back to dashboard">

            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Your Shows
            </h1>
            <button
              onClick={() => setShowNewPodcastModal(true)}
              className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
              disabled={
              mockUserData.subscription.currentPodcastCount >=
              mockUserData.subscription.podcastLimit
              }
              aria-label="Create new show">

              <Plus className="h-4 w-4 mr-2" />
              New Show
            </button>
          </div>
          <p className="text-gray-600">
            You have {mockUserData.subscription.currentPodcastCount} of{' '}
            {mockUserData.subscription.podcastLimit} allowed shows on your plan
          </p>
        </div>
        {/* Podcast Selection Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {mockUserData.podcasts.map((podcast) =>
          <button
            key={podcast.id}
            onClick={() => handlePodcastSelect(podcast.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedPodcast === podcast.id ? 'bg-news-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            aria-pressed={selectedPodcast === podcast.id}
            aria-label={`Select ${podcast.title}`}>

              {podcast.type === 'audio' ?
            <Mic className="h-4 w-4 mr-2" /> :

            <Video className="h-4 w-4 mr-2" />
            }
              {podcast.title}
            </button>
          )}
        </div>
        {/* Error Message */}
        {error &&
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start justify-between"
          role="alert">

            <div className="flex">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button
            onClick={() => setError(null)}
            className="text-red-700"
            aria-label="Dismiss error">

              <X className="w-5 h-5" />
            </button>
          </div>
        }
        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-6 px-6">
              <button
                className={`py-4 text-sm font-medium border-b-2 ${activeTab === 'episodes' ? 'border-news-primary text-news-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} transition-colors`}
                onClick={() => handleTabChange('episodes')}
                aria-pressed={activeTab === 'episodes'}
                aria-label="View episodes tab">

                Episodes
              </button>
              <button
                className={`py-4 text-sm font-medium border-b-2 ${activeTab === 'analytics' ? 'border-news-primary text-news-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} transition-colors`}
                onClick={() => handleTabChange('analytics')}
                aria-pressed={activeTab === 'analytics'}
                aria-label="View analytics tab">

                Analytics
              </button>
              <button
                className={`py-4 text-sm font-medium border-b-2 ${activeTab === 'settings' ? 'border-news-primary text-news-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} transition-colors`}
                onClick={() => handleTabChange('settings')}
                aria-pressed={activeTab === 'settings'}
                aria-label="View settings tab">

                Settings
              </button>
            </div>
          </div>
          {/* Tab Content */}
          <div className="p-6">
            {/* Loading State */}
            {isLoading &&
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-news-primary mx-auto mb-4" />
                  <p className="text-gray-600">Loading data...</p>
                </div>
              </div>
            }
            {/* Episodes Tab */}
            {activeTab === 'episodes' && !isLoading &&
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                    Episodes
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                      <input
                      type="text"
                      placeholder="Search episodes..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                      aria-label="Search episodes" />

                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {/* Filter */}
                    <div className="relative">
                      <select
                      value={filterStatus}
                      onChange={handleFilterChange}
                      className="pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary appearance-none"
                      aria-label="Filter by status">

                        <option value="all">All statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                      <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {/* Upload New Episode */}
                    <Link
                    to={`/local-voices/upload?podcast=${currentPodcast.id}`}
                    className="bg-news-primary hover:bg-news-primary-dark text-white text-sm font-medium py-1.5 px-3 rounded flex items-center transition-colors"
                    aria-label="Upload new episode">

                      <Upload className="h-4 w-4 mr-1" />
                      Upload New Episode
                    </Link>
                  </div>
                </div>
                {/* Episodes Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th
                        className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSortChange('title')}
                        aria-sort={
                        sortField === 'title' ?
                        sortDirection === 'asc' ?
                        'ascending' :
                        'descending' :
                        'none'
                        }>

                          <div className="flex items-center">
                            Title
                            {sortField === 'title' && (
                          sortDirection === 'asc' ?
                          <ArrowUp className="h-3 w-3 ml-1" /> :

                          <ArrowDown className="h-3 w-3 ml-1" />)
                          }
                          </div>
                        </th>
                        <th
                        className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSortChange('publishDate')}
                        aria-sort={
                        sortField === 'publishDate' ?
                        sortDirection === 'asc' ?
                        'ascending' :
                        'descending' :
                        'none'
                        }>

                          <div className="flex items-center">
                            Date
                            {sortField === 'publishDate' && (
                          sortDirection === 'asc' ?
                          <ArrowUp className="h-3 w-3 ml-1" /> :

                          <ArrowDown className="h-3 w-3 ml-1" />)
                          }
                          </div>
                        </th>
                        <th
                        className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSortChange('duration')}
                        aria-sort={
                        sortField === 'duration' ?
                        sortDirection === 'asc' ?
                        'ascending' :
                        'descending' :
                        'none'
                        }>

                          <div className="flex items-center">
                            Duration
                            {sortField === 'duration' && (
                          sortDirection === 'asc' ?
                          <ArrowUp className="h-3 w-3 ml-1" /> :

                          <ArrowDown className="h-3 w-3 ml-1" />)
                          }
                          </div>
                        </th>
                        <th
                        className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSortChange('listens')}
                        aria-sort={
                        sortField === 'listens' ?
                        sortDirection === 'asc' ?
                        'ascending' :
                        'descending' :
                        'none'
                        }>

                          <div className="flex items-center">
                            Listens
                            {sortField === 'listens' && (
                          sortDirection === 'asc' ?
                          <ArrowUp className="h-3 w-3 ml-1" /> :

                          <ArrowDown className="h-3 w-3 ml-1" />)
                          }
                          </div>
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedEpisodes.length === 0 ?
                    <tr>
                          <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500">

                            {searchQuery || filterStatus !== 'all' ?
                        'No episodes match your search criteria.' :
                        'No episodes available. Upload your first episode!'}
                          </td>
                        </tr> :

                    filteredAndSortedEpisodes.map((episode) =>
                    <tr
                      key={episode.id}
                      className="hover:bg-gray-50 transition-colors">

                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <img
                            src={episode.image}
                            alt={episode.title}
                            className="h-10 w-10 rounded-md object-cover mr-3 flex-shrink-0" />

                                <div className="truncate max-w-xs">
                                  <p className="text-sm font-medium text-gray-900">
                                    {episode.title}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {episode.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatDate(episode.publishDate)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                              {episode.duration}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                              {episode.listens.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${episode.status === 'published' ? 'bg-green-100 text-green-800' : episode.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>

                                {episode.status.charAt(0).toUpperCase() +
                          episode.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                            onClick={() =>
                            togglePlayback(episode.id, episode.audioUrl)
                            }
                            className={`p-1.5 rounded-full ${currentPlayingEpisode === episode.id && isPlaying ? 'bg-gray-200 text-gray-700' : 'bg-news-primary text-white hover:bg-news-primary-dark'} transition-colors`}
                            aria-label={
                            currentPlayingEpisode === episode.id &&
                            isPlaying ?
                            'Pause episode' :
                            'Play episode'
                            }>

                                  {currentPlayingEpisode === episode.id &&
                            isPlaying ?
                            <Pause className="h-3.5 w-3.5" /> :

                            <Play className="h-3.5 w-3.5" />
                            }
                                </button>
                                <button
                            onClick={() => handleShareEpisode(episode.id)}
                            className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            aria-label={`Share ${episode.title}`}>

                                  <Share2 className="h-3.5 w-3.5" />
                                </button>
                                <div
                            className="relative"
                            ref={episodeOptionsRef}>

                                  <button
                              onClick={() =>
                              setShowEpisodeOptions(
                                showEpisodeOptions === episode.id ?
                                null :
                                episode.id
                              )
                              }
                              className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              aria-label="More options"
                              aria-expanded={
                              showEpisodeOptions === episode.id
                              }
                              aria-haspopup="true">

                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </button>
                                  {showEpisodeOptions === episode.id &&
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                      <button
                                onClick={() =>
                                handleEditEpisode(episode)
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label={`Edit ${episode.title}`}>

                                        <Edit className="h-4 w-4 mr-3 text-gray-500" />
                                        Edit
                                      </button>
                                      <button
                                onClick={() => {
                                  // Analytics for specific episode
                                  handleTabChange('analytics');
                                }}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label={`View analytics for ${episode.title}`}>

                                        <BarChart2 className="h-4 w-4 mr-3 text-gray-500" />
                                        View Analytics
                                      </button>
                                      <button
                                onClick={() => {
                                  // Download episode
                                  window.open(
                                    episode.audioUrl,
                                    '_blank'
                                  );
                                }}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label={`Download ${episode.title}`}>

                                        <Download className="h-4 w-4 mr-3 text-gray-500" />
                                        Download
                                      </button>
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <button
                                onClick={() => {
                                  // Delete episode functionality would go here
                                  alert(
                                    `Delete episode: ${episode.title}`
                                  );
                                }}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                aria-label={`Delete ${episode.title}`}>

                                        <Trash2 className="h-4 w-4 mr-3 text-red-600" />
                                        Delete
                                      </button>
                                    </div>
                            }
                                </div>
                              </div>
                            </td>
                          </tr>
                    )
                    }
                    </tbody>
                  </table>
                </div>
                {/* Pagination - would be dynamic in a real app */}
                {filteredAndSortedEpisodes.length > 0 &&
              <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{' '}
                      <span className="font-medium">
                        {filteredAndSortedEpisodes.length}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">
                        {filteredAndSortedEpisodes.length}
                      </span>{' '}
                      episodes
                    </div>
                    <div className="flex space-x-2">
                      <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={true}
                    aria-label="Previous page">

                        Previous
                      </button>
                      <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={true}
                    aria-label="Next page">

                        Next
                      </button>
                    </div>
                  </div>
              }
              </div>
            }
            {/* Analytics Tab */}
            {activeTab === 'analytics' && !isLoading &&
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                    Analytics
                  </h2>
                  <div className="flex items-center space-x-3">
                    <select
                    value={analyticsTimeframe}
                    onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                    aria-label="Select timeframe">

                      <option value="30days">Last 30 Days</option>
                      <option value="3months">Last 3 Months</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="1year">Last Year</option>
                      <option value="all">All Time</option>
                    </select>
                    <button
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => setIsLoading(false), 800);
                    }}
                    className="flex items-center justify-center py-1.5 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Refresh analytics">

                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </button>
                    <button
                    onClick={() => {
                      alert('Analytics report would be downloaded');
                    }}
                    className="flex items-center justify-center py-1.5 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Download analytics report">

                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </button>
                  </div>
                </div>
                {/* Analytics Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Listens
                      </h3>
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentPodcast.totalListens.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">+12.5%</span>
                      <span className="text-gray-500 ml-1">
                        vs previous period
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">
                        Last 30 Days
                      </h3>
                      <BarChart2 className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentPodcast.recentListens.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">+8.3%</span>
                      <span className="text-gray-500 ml-1">
                        vs previous 30 days
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">
                        Avg. Completion Rate
                      </h3>
                      <PieChart className="h-4 w-4 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentPodcast.analytics.engagement.completionRate}%
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">+2.1%</span>
                      <span className="text-gray-500 ml-1">
                        vs previous period
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">
                        Avg. Listen Time
                      </h3>
                      <Clock className="h-4 w-4 text-teal-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentPodcast.analytics.engagement.averageListenTime}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">+4.7%</span>
                      <span className="text-gray-500 ml-1">
                        vs previous period
                      </span>
                    </div>
                  </div>
                </div>
                {/* Listener Demographics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Listener Demographics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Age Groups */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Age Groups
                      </h4>
                      <div className="space-y-2">
                        {currentPodcast.analytics.listenerDemographics.ageGroups.map(
                        (item) =>
                        <div key={item.group}>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{item.group}</span>
                                <span className="font-medium">
                                  {item.percentage}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${item.percentage}%`
                              }}>
                            </div>
                              </div>
                            </div>

                      )}
                      </div>
                    </div>
                    {/* Gender */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </h4>
                      <div className="space-y-2">
                        {currentPodcast.analytics.listenerDemographics.gender.map(
                        (item) =>
                        <div key={item.group}>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{item.group}</span>
                                <span className="font-medium">
                                  {item.percentage}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                              className="h-full bg-purple-500"
                              style={{
                                width: `${item.percentage}%`
                              }}>
                            </div>
                              </div>
                            </div>

                      )}
                      </div>
                    </div>
                    {/* Top Locations */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Top Locations
                      </h4>
                      <div className="space-y-2">
                        {currentPodcast.analytics.listenerDemographics.topLocations.map(
                        (item) =>
                        <div key={item.location}>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{item.location}</span>
                                <span className="font-medium">
                                  {item.percentage}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${item.percentage}%`
                              }}>
                            </div>
                              </div>
                            </div>

                      )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Listening Trends */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Listening Trends
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monthly Trends - Simple representation */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Monthly Listens
                      </h4>
                      <div className="h-48 flex items-end space-x-2">
                        {currentPodcast.analytics.listeningTrends.monthly.map(
                        (item) => {
                          const height =
                          item.listens /
                          Math.max(
                            ...currentPodcast.analytics.listeningTrends.monthly.map(
                              (i) => i.listens
                            )
                          ) *
                          100;
                          return (
                            <div
                              key={item.month}
                              className="flex-1 flex flex-col items-center">

                                <div
                                className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t"
                                style={{
                                  height: `${height}%`
                                }}>

                                  <div
                                  className="w-full bg-blue-500 rounded-t"
                                  style={{
                                    height: '4px'
                                  }}>
                                </div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {item.month}
                                </div>
                                <div className="text-xs font-medium">
                                  {(item.listens / 1000).toFixed(1)}k
                                </div>
                              </div>);

                        }
                      )}
                      </div>
                    </div>
                    {/* Weekly Average */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Weekly Average
                      </h4>
                      <div className="h-48 flex items-end space-x-2">
                        {currentPodcast.analytics.listeningTrends.weeklyAverage.map(
                        (item) => {
                          const height =
                          item.listens /
                          Math.max(
                            ...currentPodcast.analytics.listeningTrends.weeklyAverage.map(
                              (i) => i.listens
                            )
                          ) *
                          100;
                          return (
                            <div
                              key={item.day}
                              className="flex-1 flex flex-col items-center">

                                <div
                                className="w-full bg-green-100 hover:bg-green-200 transition-colors rounded-t"
                                style={{
                                  height: `${height}%`
                                }}>

                                  <div
                                  className="w-full bg-green-500 rounded-t"
                                  style={{
                                    height: '4px'
                                  }}>
                                </div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {item.day}
                                </div>
                                <div className="text-xs font-medium">
                                  {item.listens}
                                </div>
                              </div>);

                        }
                      )}
                      </div>
                    </div>
                  </div>
                  {/* Time of Day */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Time of Day
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {currentPodcast.analytics.listeningTrends.timeOfDay.map(
                      (item) =>
                      <div
                        key={item.time}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-100">

                            <div className="text-sm text-gray-700">
                              {item.time}
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {item.percentage}%
                            </div>
                            <div className="h-1 w-full bg-gray-200 rounded-full mt-2">
                              <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${item.percentage * 2}%`
                            }}>
                          </div>
                            </div>
                          </div>

                    )}
                    </div>
                  </div>
                </div>
                {/* Top Performing Episodes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Top Performing Episodes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Episode
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Listens
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completion Rate
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Engagement
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentPodcast.episodes.
                      sort((a, b) => b.listens - a.listens).
                      slice(0, 5).
                      map((episode) =>
                      <tr
                        key={episode.id}
                        className="hover:bg-gray-50 transition-colors">

                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <img
                              src={episode.image}
                              alt={episode.title}
                              className="h-8 w-8 rounded-md object-cover mr-3 flex-shrink-0" />

                                  <div className="truncate max-w-xs">
                                    <p className="text-sm font-medium text-gray-900">
                                      {episode.title}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {formatDate(episode.publishDate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {episode.listens.toLocaleString()}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {/* Random completion rate for demo */}
                                {Math.floor(65 + Math.random() * 25)}%
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex items-center mr-3">
                                    <Share2 className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-700">
                                      {Math.floor(1 + Math.random() * 5)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Download className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-700">
                                      {Math.floor(20 + Math.random() * 30)}%
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
            {/* Settings Tab */}
            {activeTab === 'settings' && !isLoading &&
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                    Show Settings
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                    onClick={() => {
                      alert('Settings saved successfully!');
                    }}
                    className="bg-news-primary hover:bg-news-primary-dark text-white text-sm font-medium py-1.5 px-3 rounded flex items-center transition-colors"
                    aria-label="Save settings">

                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Settings Navigation */}
                  <div className="md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <nav className="flex flex-col p-2">
                        <button
                        onClick={() => setSettingsSection('general')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${settingsSection === 'general' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors`}
                        aria-current={
                        settingsSection === 'general' ? 'page' : undefined
                        }>

                          <Settings className="h-4 w-4 mr-2" />
                          General
                        </button>
                        <button
                        onClick={() => setSettingsSection('distribution')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${settingsSection === 'distribution' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors`}
                        aria-current={
                        settingsSection === 'distribution' ?
                        'page' :
                        undefined
                        }>

                          <Globe className="h-4 w-4 mr-2" />
                          Distribution
                        </button>
                        <button
                        onClick={() => setSettingsSection('monetization')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${settingsSection === 'monetization' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors`}
                        aria-current={
                        settingsSection === 'monetization' ?
                        'page' :
                        undefined
                        }>

                          <DollarSign className="h-4 w-4 mr-2" />
                          Monetization
                        </button>
                        <button
                        onClick={() => setSettingsSection('templates')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${settingsSection === 'templates' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors`}
                        aria-current={
                        settingsSection === 'templates' ? 'page' : undefined
                        }>

                          <FileText className="h-4 w-4 mr-2" />
                          Templates
                        </button>
                        <button
                        onClick={() => setSettingsSection('advanced')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${settingsSection === 'advanced' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors`}
                        aria-current={
                        settingsSection === 'advanced' ? 'page' : undefined
                        }>

                          <Zap className="h-4 w-4 mr-2" />
                          Advanced
                        </button>
                      </nav>
                    </div>
                  </div>
                  {/* Settings Content */}
                  <div className="flex-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      {/* General Settings */}
                      {settingsSection === 'general' &&
                    <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            General Settings
                          </h3>
                          <div className="space-y-6">
                            {/* Show Information */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Show Information
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700 mb-1">

                                    Show Title
                                  </label>
                                  <input
                                type="text"
                                id="title"
                                name="title"
                                defaultValue={currentPodcast.title}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                                </div>
                                <div>
                                  <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1">

                                    Description
                                  </label>
                                  <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={currentPodcast.description}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary">
                              </textarea>
                                </div>
                                <div>
                                  <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 mb-1">

                                    Category
                                  </label>
                                  <select
                                id="category"
                                name="category"
                                defaultValue={currentPodcast.category}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary bg-white">

                                    {categories.map((category) =>
                                <option key={category} value={category}>
                                        {category}
                                      </option>
                                )}
                                  </select>
                                </div>
                                <div>
                                  <label
                                htmlFor="tags"
                                className="block text-sm font-medium text-gray-700 mb-1">

                                    Default Tags
                                  </label>
                                  <input
                                type="text"
                                id="tags"
                                name="tags"
                                defaultValue={currentPodcast.settings.defaultTags.join(
                                  ', '
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                                  <p className="mt-1 text-xs text-gray-500">
                                    Separate tags with commas
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Show Artwork */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Show Artwork
                              </h4>
                              <div className="flex items-start space-x-4">
                                <div className="h-32 w-32 rounded-md overflow-hidden border border-gray-300 flex-shrink-0">
                                  <img
                                src={currentPodcast.image}
                                alt={currentPodcast.title}
                                className="h-full w-full object-cover" />

                                </div>
                                <div className="flex-1">
                                  <button
                                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                                aria-label="Upload new artwork">

                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload New Artwork
                                  </button>
                                  <p className="mt-2 text-xs text-gray-500">
                                    Recommended: Square image, at least
                                    1400x1400px (3000x3000px ideal)
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Publishing Settings */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Publishing Settings
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="autoPublish"
                                  name="autoPublish"
                                  type="checkbox"
                                  defaultChecked={
                                  currentPodcast.settings.autoPublish
                                  }
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="autoPublish"
                                  className="font-medium text-gray-700">

                                      Auto-publish new episodes
                                    </label>
                                    <p className="text-gray-500">
                                      Automatically publish episodes when
                                      they're uploaded
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="crossPosting"
                                  name="crossPosting"
                                  type="checkbox"
                                  defaultChecked={
                                  currentPodcast.settings.crossPosting
                                  }
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="crossPosting"
                                  className="font-medium text-gray-700">

                                      Enable cross-posting
                                    </label>
                                    <p className="text-gray-500">
                                      Automatically share new episodes on
                                      connected social media accounts
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    }
                      {/* Distribution Settings */}
                      {settingsSection === 'distribution' &&
                    <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Distribution Settings
                          </h3>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Distribution Platforms
                              </h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Select the platforms where your podcast should
                                be distributed.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                            {
                              id: 'spotify',
                              name: 'Spotify',
                              icon: '🎧'
                            },
                            {
                              id: 'apple',
                              name: 'Apple Podcasts',
                              icon: '🍎'
                            },
                            {
                              id: 'google',
                              name: 'Google Podcasts',
                              icon: '🎵'
                            },
                            {
                              id: 'youtube',
                              name: 'YouTube',
                              icon: '📺'
                            },
                            {
                              id: 'amazon',
                              name: 'Amazon Music',
                              icon: '🎵'
                            },
                            {
                              id: 'stitcher',
                              name: 'Stitcher',
                              icon: '🎧'
                            },
                            {
                              id: 'pandora',
                              name: 'Pandora',
                              icon: '📻'
                            },
                            {
                              id: 'iheartradio',
                              name: 'iHeartRadio',
                              icon: '❤️'
                            },
                            {
                              id: 'tunein',
                              name: 'TuneIn',
                              icon: '📻'
                            },
                            {
                              id: 'castbox',
                              name: 'Castbox',
                              icon: '🎧'
                            },
                            {
                              id: 'pocketcasts',
                              name: 'Pocket Casts',
                              icon: '📱'
                            },
                            {
                              id: 'overcast',
                              name: 'Overcast',
                              icon: '☁️'
                            }].
                            map((platform) =>
                            <div
                              key={platform.id}
                              className="flex items-center">

                                    <input
                                id={platform.id}
                                name="platforms"
                                type="checkbox"
                                defaultChecked={currentPodcast.settings.distributionPlatforms.includes(
                                  platform.name
                                )}
                                className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                    <label
                                htmlFor={platform.id}
                                className="ml-2 text-sm text-gray-700">

                                      {platform.icon} {platform.name}
                                    </label>
                                  </div>
                            )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                RSS Feed
                              </h4>
                              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700 truncate">
                                  https://day.news/podcasts/feeds/
                                  {currentPodcast.id}.xml
                                </div>
                                <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `https://day.news/podcasts/feeds/${currentPodcast.id}.xml`
                                );
                                alert('RSS feed URL copied to clipboard!');
                              }}
                              className="ml-2 text-news-primary hover:text-news-primary-dark text-sm font-medium transition-colors"
                              aria-label="Copy RSS feed URL">

                                  Copy
                                </button>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">
                                Use this RSS feed URL to submit your podcast to
                                directories not listed above.
                              </p>
                            </div>
                          </div>
                        </div>
                    }
                      {/* Monetization Settings */}
                      {settingsSection === 'monetization' &&
                    <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Monetization Settings
                          </h3>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Monetization Options
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="enableAds"
                                  name="enableAds"
                                  type="checkbox"
                                  defaultChecked={
                                  currentPodcast.settings.monetization
                                  }
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="enableAds"
                                  className="font-medium text-gray-700">

                                      Enable dynamic ad insertion
                                    </label>
                                    <p className="text-gray-500">
                                      Allow automated insertion of
                                      advertisements in your episodes
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="enableSponsors"
                                  name="enableSponsors"
                                  type="checkbox"
                                  defaultChecked={true}
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="enableSponsors"
                                  className="font-medium text-gray-700">

                                      Accept sponsor opportunities
                                    </label>
                                    <p className="text-gray-500">
                                      Receive notifications about potential
                                      sponsor opportunities
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="enableTips"
                                  name="enableTips"
                                  type="checkbox"
                                  defaultChecked={false}
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="enableTips"
                                  className="font-medium text-gray-700">

                                      Enable listener tips & donations
                                    </label>
                                    <p className="text-gray-500">
                                      Allow listeners to support your show with
                                      one-time or recurring payments
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Payment Information
                              </h4>
                              <button
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                            aria-label="Set up payment information">

                                <DollarSign className="h-4 w-4 mr-2" />
                                Set Up Payment Information
                              </button>
                              <p className="mt-2 text-xs text-gray-500">
                                You'll need to set up payment information to
                                receive monetization earnings.
                              </p>
                            </div>
                          </div>
                        </div>
                    }
                      {/* Templates Settings */}
                      {settingsSection === 'templates' &&
                    <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Templates
                          </h3>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Episode Description Template
                              </h4>
                              <textarea
                            id="descriptionTemplate"
                            name="descriptionTemplate"
                            rows={5}
                            defaultValue={
                            currentPodcast.settings.episodeTemplate
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary">
                          </textarea>
                              <p className="mt-1 text-xs text-gray-500">
                                Use{' '}
                                {{
                              episode_title
                            }}
                                ,{' '}
                                {{
                              episode_number
                            }}
                                , and{' '}
                                {{
                              publish_date
                            }}{' '}
                                as placeholders.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Social Media Templates
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <label
                                htmlFor="twitterTemplate"
                                className="block text-sm font-medium text-gray-700 mb-1">

                                    Twitter Template
                                  </label>
                                  <input
                                type="text"
                                id="twitterTemplate"
                                name="twitterTemplate"
                                defaultValue="🎙️ New episode of {{show_title}}! Listen to {{episode_title}} now: {{episode_url}} #podcast"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                                </div>
                                <div>
                                  <label
                                htmlFor="facebookTemplate"
                                className="block text-sm font-medium text-gray-700 mb-1">

                                    Facebook Template
                                  </label>
                                  <textarea
                                id="facebookTemplate"
                                name="facebookTemplate"
                                rows={3}
                                defaultValue="🎙️ NEW EPISODE ALERT! 🎙️\n\n{{episode_title}} is now available on {{show_title}}!\n\nListen now: {{episode_url}}"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary">
                              </textarea>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    }
                      {/* Advanced Settings */}
                      {settingsSection === 'advanced' &&
                    <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Advanced Settings
                          </h3>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Audio Processing
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="normalizeAudio"
                                  name="normalizeAudio"
                                  type="checkbox"
                                  defaultChecked={true}
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="normalizeAudio"
                                  className="font-medium text-gray-700">

                                      Normalize audio levels
                                    </label>
                                    <p className="text-gray-500">
                                      Automatically adjust volume levels for
                                      consistency
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="enhanceAudio"
                                  name="enhanceAudio"
                                  type="checkbox"
                                  defaultChecked={true}
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="enhanceAudio"
                                  className="font-medium text-gray-700">

                                      Enhance audio quality
                                    </label>
                                    <p className="text-gray-500">
                                      Apply noise reduction and audio
                                      enhancement
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                  id="generateTranscripts"
                                  name="generateTranscripts"
                                  type="checkbox"
                                  defaultChecked={true}
                                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label
                                  htmlFor="generateTranscripts"
                                  className="font-medium text-gray-700">

                                      Auto-generate transcripts
                                    </label>
                                    <p className="text-gray-500">
                                      Automatically create transcripts for all
                                      episodes
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Danger Zone
                              </h4>
                              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <h5 className="text-sm font-medium text-red-800 mb-2">
                                  Delete Show
                                </h5>
                                <p className="text-sm text-red-700 mb-3">
                                  Permanently delete this show and all its
                                  episodes. This action cannot be undone.
                                </p>
                                <button
                              onClick={() =>
                              handleDeleteClick(currentPodcast.id)
                              }
                              className="bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium py-1.5 px-3 rounded flex items-center transition-colors"
                              aria-label="Delete this show">

                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete Show
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                    }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      {/* New Podcast Modal */}
      {showNewPodcastModal &&
      <NewPodcastModal onClose={() => setShowNewPodcastModal(false)} />
      }
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-labelledby="delete-confirmation-title"
          aria-describedby="delete-confirmation-description">

            <h3
            id="delete-confirmation-title"
            className="text-lg font-bold text-gray-900 mb-4">

              Confirm Deletion
            </h3>
            <p
            id="delete-confirmation-description"
            className="text-gray-600 mb-6">

              Are you sure you want to delete this show? This action cannot be
              undone, and all episodes will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
              onClick={() => setShowDeleteConfirmation(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Cancel deletion">

                Cancel
              </button>
              <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors flex items-center"
              aria-label="Confirm deletion">

                {isLoading ?
              <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Deleting...
                  </> :

              'Delete Show'
              }
              </button>
            </div>
          </div>
        </div>
      }
      {/* Edit Episode Modal */}
      {showEditEpisodeModal && episodeToEdit &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-labelledby="edit-episode-title"
          aria-describedby="edit-episode-description">

            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2
                id="edit-episode-title"
                className="text-xl font-bold text-gray-900">

                  Edit Episode
                </h2>
                <button
                onClick={() => {
                  setShowEditEpisodeModal(false);
                  setEpisodeToEdit(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                aria-label="Close dialog">

                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div id="edit-episode-description" className="p-6">
              <div className="space-y-6">
                <div>
                  <label
                  htmlFor="episodeTitle"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Episode Title
                  </label>
                  <input
                  type="text"
                  id="episodeTitle"
                  name="episodeTitle"
                  defaultValue={episodeToEdit.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                </div>
                <div>
                  <label
                  htmlFor="episodeDescription"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Description
                  </label>
                  <textarea
                  id="episodeDescription"
                  name="episodeDescription"
                  rows={4}
                  defaultValue={episodeToEdit.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary">
                </textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                    htmlFor="publishDate"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Publish Date
                    </label>
                    <input
                    type="date"
                    id="publishDate"
                    name="publishDate"
                    defaultValue={episodeToEdit.publishDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                  </div>
                  <div>
                    <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Status
                    </label>
                    <select
                    id="status"
                    name="status"
                    defaultValue={episodeToEdit.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary bg-white">

                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                  htmlFor="episodeTags"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Tags
                  </label>
                  <input
                  type="text"
                  id="episodeTags"
                  name="episodeTags"
                  defaultValue={episodeToEdit.tags.join(', ')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                  <p className="mt-1 text-xs text-gray-500">
                    Separate tags with commas
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-24 w-24 rounded-md overflow-hidden border border-gray-300">
                      <img
                      src={episodeToEdit.image}
                      alt={episodeToEdit.title}
                      className="h-full w-full object-cover" />

                    </div>
                    <button
                    className="mt-2 w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                    aria-label="Change episode image">

                      <Image className="h-3 w-3 mr-1" />
                      Change
                    </button>
                  </div>
                  <div className="flex-1">
                    <label
                    htmlFor="audioPreview"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Audio File
                    </label>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                        onClick={() =>
                        togglePlayback(
                          episodeToEdit.id,
                          episodeToEdit.audioUrl
                        )
                        }
                        className={`p-1.5 rounded-full ${currentPlayingEpisode === episodeToEdit.id && isPlaying ? 'bg-gray-200 text-gray-700' : 'bg-news-primary text-white hover:bg-news-primary-dark'} transition-colors mr-2`}
                        aria-label={
                        currentPlayingEpisode === episodeToEdit.id &&
                        isPlaying ?
                        'Pause episode' :
                        'Play episode'
                        }>

                          {currentPlayingEpisode === episodeToEdit.id &&
                        isPlaying ?
                        <Pause className="h-3.5 w-3.5" /> :

                        <Play className="h-3.5 w-3.5" />
                        }
                        </button>
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                          {episodeToEdit.audioUrl.split('/').pop()}
                        </span>
                      </div>
                      <button
                      className="text-news-primary hover:text-news-primary-dark text-sm font-medium transition-colors"
                      aria-label="Replace audio file">

                        Replace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                onClick={() => {
                  setShowEditEpisodeModal(false);
                  setEpisodeToEdit(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Cancel editing">

                  Cancel
                </button>
                <button
                onClick={() => {
                  // In a real app, this would save the changes
                  setIsLoading(true);
                  setTimeout(() => {
                    setShowEditEpisodeModal(false);
                    setEpisodeToEdit(null);
                    setIsLoading(false);
                    alert('Episode updated successfully!');
                  }, 1000);
                }}
                className="px-4 py-2 bg-news-primary hover:bg-news-primary-dark border border-transparent rounded-md text-sm font-medium text-white flex items-center transition-colors"
                aria-label="Save changes">

                  {isLoading ?
                <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </> :

                <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Share Menu */}
      {showShareMenu &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-labelledby="share-episode-title"
          ref={shareMenuRef}>

            <div className="flex justify-between items-start mb-4">
              <h3
              id="share-episode-title"
              className="text-lg font-bold text-gray-900">

                Share Episode
              </h3>
              <button
              onClick={() => {
                setShowShareMenu(false);
                setEpisodeToShare(null);
              }}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close dialog">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Share "
                {
              currentPodcast.episodes.find((ep) => ep.id === episodeToShare)?.
              title
              }
                " with your audience:
              </p>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between mb-4">
                <div className="text-sm text-gray-700 truncate">
                  https://day.news/local-voices/{currentPodcast.id}/episode/
                  {episodeToShare}
                </div>
                <button
                onClick={() => shareContent('copy')}
                className="ml-2 text-news-primary hover:text-news-primary-dark text-sm font-medium transition-colors"
                aria-label="Copy link">

                  Copy
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                onClick={() => shareContent('facebook')}
                className="flex flex-col items-center p-3 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                aria-label="Share on Facebook">

                  <Facebook className="h-6 w-6 text-blue-600 mb-1" />
                  <span className="text-xs font-medium">Facebook</span>
                </button>
                <button
                onClick={() => shareContent('twitter')}
                className="flex flex-col items-center p-3 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                aria-label="Share on Twitter">

                  <Twitter className="h-6 w-6 text-blue-400 mb-1" />
                  <span className="text-xs font-medium">Twitter</span>
                </button>
                <button
                onClick={() => shareContent('linkedin')}
                className="flex flex-col items-center p-3 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                aria-label="Share on LinkedIn">

                  <Linkedin className="h-6 w-6 text-blue-700 mb-1" />
                  <span className="text-xs font-medium">LinkedIn</span>
                </button>
                <button
                onClick={() => shareContent('email')}
                className="flex flex-col items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                aria-label="Share via Email">

                  <Mail className="h-6 w-6 text-gray-600 mb-1" />
                  <span className="text-xs font-medium">Email</span>
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Embed Player
              </h4>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-xs text-gray-700 font-mono mb-2">
                {`<iframe src="https://day.news/embed/${currentPodcast.id}/${episodeToShare}" width="100%" height="180" frameborder="0"></iframe>`}
              </div>
              <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `<iframe src="https://day.news/embed/${currentPodcast.id}/${episodeToShare}" width="100%" height="180" frameborder="0"></iframe>`
                );
                alert('Embed code copied to clipboard!');
              }}
              className="text-news-primary hover:text-news-primary-dark text-sm font-medium transition-colors"
              aria-label="Copy embed code">

                Copy Embed Code
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};
// New Podcast Modal Component
const NewPodcastModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'audio',
    explicit: false,
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const handleInputChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>

  {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = {
          ...prev
        };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          image: file
        }));
      };
      reader.readAsDataURL(file);
      // Clear error for image if it exists
      if (errors.image) {
        setErrors((prev) => {
          const newErrors = {
            ...prev
          };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Show title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.image) {
      newErrors.image = 'Show artwork is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // In a real app, this would redirect to the new podcast's settings page
    }, 1500);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="create-show-title"
        aria-describedby="create-show-description">

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2
              id="create-show-title"
              className="text-xl font-bold text-gray-900">

              Create New Show
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close dialog">

              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div id="create-show-description" className="sr-only">
          Create a new podcast or video show
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Show Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Type
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="audio"
                    checked={formData.type === 'audio'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-news-primary border-gray-300 focus:ring-news-primary"
                    aria-label="Audio podcast" />

                  <div className="ml-2 flex items-center">
                    <Mic className="h-5 w-5 text-blue-500 mr-1" />
                    <span className="text-gray-700">Audio Podcast</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="video"
                    checked={formData.type === 'video'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-news-primary border-gray-300 focus:ring-news-primary"
                    aria-label="Video podcast" />

                  <div className="ml-2 flex items-center">
                    <Video className="h-5 w-5 text-purple-500 mr-1" />
                    <span className="text-gray-700">Video Podcast</span>
                  </div>
                </label>
              </div>
            </div>
            {/* Show Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1">

                Show Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
                placeholder="Enter your show title"
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined} />

              {errors.title &&
              <p id="title-error" className="mt-1 text-sm text-red-500">
                  {errors.title}
                </p>
              }
            </div>
            {/* Show Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1">

                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
                placeholder="Describe your show to potential listeners"
                aria-required="true"
                aria-invalid={!!errors.description}
                aria-describedby={
                errors.description ? 'description-error' : 'description-help'
                }>
              </textarea>
              {errors.description ?
              <p id="description-error" className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p> :

              <p id="description-help" className="mt-1 text-xs text-gray-500">
                  Minimum 50 characters. This will appear in directories and
                  search results.
                </p>
              }
            </div>
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1">

                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary bg-white`}
                aria-required="true"
                aria-invalid={!!errors.category}
                aria-describedby={
                errors.category ? 'category-error' : undefined
                }>

                <option value="">Select a category</option>
                {categories.map((category) =>
                <option key={category} value={category}>
                    {category}
                  </option>
                )}
              </select>
              {errors.category &&
              <p id="category-error" className="mt-1 text-sm text-red-500">
                  {errors.category}
                </p>
              }
            </div>
            {/* Show Artwork */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Artwork <span className="text-red-500">*</span>
              </label>
              <div className="flex items-start space-x-4">
                <div
                  className={`relative h-32 w-32 overflow-hidden rounded-md border-2 ${errors.image ? 'border-red-500' : 'border-gray-300'} flex items-center justify-center bg-gray-100`}
                  aria-label="Show artwork preview">

                  {imagePreview ?
                  <img
                    src={imagePreview}
                    alt="Show artwork preview"
                    className="h-full w-full object-cover" /> :


                  <Image className="h-8 w-8 text-gray-400" />
                  }
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    id="show-image-upload"
                    aria-required="true"
                    aria-invalid={!!errors.image}
                    aria-describedby={
                    errors.image ? 'image-error' : 'image-help'
                    } />

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    aria-label="Upload artwork">

                    <Upload className="h-4 w-4 mr-2" />
                    Upload Artwork
                  </button>
                  <p id="image-help" className="mt-1 text-xs text-gray-500">
                    Recommended: Square image, at least 1400x1400px (3000x3000px
                    ideal)
                  </p>
                  {errors.image &&
                  <p id="image-error" className="mt-1 text-sm text-red-500">
                      {errors.image}
                    </p>
                  }
                </div>
              </div>
            </div>
            {/* Explicit Content */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="explicit"
                  name="explicit"
                  type="checkbox"
                  checked={formData.explicit}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary"
                  aria-describedby="explicit-description" />

              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="explicit" className="font-medium text-gray-700">
                  Explicit Content
                </label>
                <p id="explicit-description" className="text-gray-500">
                  Mark this if your show contains explicit language or adult
                  content
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Cancel creating new show">

              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-news-primary hover:bg-news-primary-dark border border-transparent rounded-md text-sm font-medium text-white flex items-center transition-colors"
              disabled={isSubmitting}
              aria-label="Create show">

              {isSubmitting ?
              <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </> :

              <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Show
                </>
              }
            </button>
          </div>
        </form>
      </div>
    </div>);

};
// Required additional icon components
function LogOut(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">

      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>);

}
export default PodcastManagementPage;