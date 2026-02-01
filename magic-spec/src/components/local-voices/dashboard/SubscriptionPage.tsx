import React, { useEffect, useState, useRef, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Download,
  FileText,
  HardDrive,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
  ChevronRight,
  Gift,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Bell,
  HelpCircle,
  ExternalLink,
  Info,
  Settings,
  LogOut,
  Menu,
  User,
  BarChart,
  Mic,
  Layers,
  Calendar,
  Zap,
  Shield,
  Edit,
  Trash,
  Archive,
  AlertTriangle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Share2,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  RefreshCw,
  Loader } from
'lucide-react';
import { Badge } from '../../ui/Badge';
import { StatusIndicator } from '../../ui/StatusIndicator';
// Mock data - In a real application, this would come from an API
const mockSubscriptionData = {
  id: '12345',
  tier_name: 'Professional Broadcaster',
  tier_price: 39.99,
  billing_cycle: 'monthly',
  status: 'active',
  current_period_start: '2023-05-01',
  current_period_end: '2023-06-01',
  next_billing_date: '2023-06-01',
  payment_method: {
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 2024
  },
  downloads_included: 25000,
  downloads_used: 18750,
  storage_included: 50,
  storage_used: 32,
  shows_included: 5,
  shows_used: 3,
  seo_boost_enabled: true,
  extra_storage: 10,
  extra_shows: 1,
  performance_credits: 120,
  performance_bonus_threshold: 50000,
  billing_history: [
  {
    id: 'inv_123456',
    date: '2023-05-01',
    description: 'Monthly subscription - Professional Broadcaster',
    amount: 39.99,
    status: 'paid',
    invoice_url: '#'
  },
  {
    id: 'inv_123455',
    date: '2023-05-01',
    description: 'Add-on: SEO Boost',
    amount: 5.0,
    status: 'paid',
    invoice_url: '#'
  },
  {
    id: 'inv_123454',
    date: '2023-05-01',
    description: 'Add-on: +10 hours storage',
    amount: 5.0,
    status: 'paid',
    invoice_url: '#'
  },
  {
    id: 'inv_123453',
    date: '2023-04-01',
    description: 'Monthly subscription - Professional Broadcaster',
    amount: 39.99,
    status: 'paid',
    invoice_url: '#'
  },
  {
    id: 'inv_123452',
    date: '2023-04-15',
    description: 'Overage charge: 2,000 downloads',
    amount: 12.0,
    status: 'paid',
    invoice_url: '#'
  }],

  latest_episodes: [
  {
    id: 'ep_1001',
    title: 'The Future of Local Journalism',
    duration: '32:15',
    publish_date: '2023-04-28',
    downloads: 1250,
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: 'ep_1002',
    title: 'Community Spotlight: Downtown Revitalization',
    duration: '45:30',
    publish_date: '2023-04-21',
    downloads: 980,
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnail:
    'https://images.unsplash.com/photo-1594749227919-3c1b380033a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: 'ep_1003',
    title: 'Interview with Mayor Thompson',
    duration: '28:45',
    publish_date: '2023-04-14',
    downloads: 1560,
    audio_url:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    thumbnail:
    'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80'
  }],

  notifications: [
  {
    id: 'notif_1',
    type: 'payment_success',
    message: 'Your payment for May 2023 was successful.',
    date: '2023-05-01T09:15:00Z',
    read: false
  },
  {
    id: 'notif_2',
    type: 'performance',
    message:
    'Congratulations! Your podcast has reached 20,000 downloads this month.',
    date: '2023-04-28T14:30:00Z',
    read: false
  },
  {
    id: 'notif_3',
    type: 'system',
    message: 'Scheduled maintenance on May 15 from 2-4 AM EST.',
    date: '2023-04-25T11:00:00Z',
    read: true
  },
  {
    id: 'notif_4',
    type: 'feature',
    message: 'New feature: Social media auto-sharing is now available.',
    date: '2023-04-20T16:45:00Z',
    read: true
  }]

};
const availableTiers = [
{
  id: 'local_creator',
  name: 'Local Creator',
  monthlyPrice: 19.99,
  annualPrice: 199.9,
  features: [
  'Up to 10 communities',
  '5,000 downloads/month included',
  '2 shows/podcasts',
  '10 hours storage',
  'Basic analytics']

},
{
  id: 'professional_broadcaster',
  name: 'Professional Broadcaster',
  monthlyPrice: 39.99,
  annualPrice: 399.9,
  features: [
  'Up to 50 communities',
  '25,000 downloads/month included',
  '5 shows/podcasts',
  '50 hours storage',
  'Video podcast support (1080p)',
  'Advanced analytics']

},
{
  id: 'county_broadcaster',
  name: 'County Broadcaster',
  monthlyPrice: 69.0,
  annualPrice: 690.0,
  features: [
  'Entire county coverage',
  '50,000 downloads/month included',
  '10 shows/podcasts',
  '100 hours storage',
  'Live streaming capability',
  '4K video support']

},
{
  id: 'national_distribution',
  name: 'National Distribution',
  monthlyPrice: 299.0,
  annualPrice: 2990.0,
  features: [
  'All 8,500+ Day.News communities',
  '200,000 downloads/month included',
  'Unlimited shows',
  '500 hours storage',
  'Unlimited team members']

}];

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(mockSubscriptionData);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [acceptRetentionOffer, setAcceptRetentionOffer] = useState(false);
  const [targetTier, setTargetTier] = useState<any>(null);
  const [showConfirmAddOnRemovalModal, setShowConfirmAddOnRemovalModal] =
  useState(false);
  const [addonToRemove, setAddonToRemove] = useState<string | null>(null);
  const [showPerformanceBonusModal, setShowPerformanceBonusModal] =
  useState(false);
  const [bonusAction, setBonusAction] = useState<'apply' | 'payout' | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<
    string | null>(
    null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  // Find current tier in available tiers
  const currentTier = availableTiers.find(
    (tier) => tier.name === subscription.tier_name
  );
  // Calculate usage percentages
  const downloadPercentage =
  subscription.downloads_used / subscription.downloads_included * 100;
  const storagePercentage =
  subscription.storage_used / subscription.storage_included * 100;
  const showsPercentage =
  subscription.shows_used / subscription.shows_included * 100;
  // Determine color based on usage
  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
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
  // Calculate price difference between current and target tier
  const calculatePriceDifference = (targetTier: any) => {
    if (!currentTier) return 0;
    const currentPrice =
    subscription.billing_cycle === 'monthly' ?
    currentTier.monthlyPrice :
    currentTier.annualPrice;
    const targetPrice =
    subscription.billing_cycle === 'monthly' ?
    targetTier.monthlyPrice :
    targetTier.annualPrice;
    return targetPrice - currentPrice;
  };
  // Handle plan change
  const handlePlanChange = (tier: any) => {
    const priceDiff = calculatePriceDifference(tier);
    if (priceDiff > 0) {
      setTargetTier(tier);
      setShowUpgradeModal(true);
    } else {
      setTargetTier(tier);
      setShowDowngradeModal(true);
    }
  };
  // Handle add-on toggle
  const handleAddOnToggle = (addon: string, value: boolean) => {
    setSubscription({
      ...subscription,
      [addon]: value
    });
  };
  // Handle add-on removal confirmation
  const handleRemoveAddon = (addon: string) => {
    setAddonToRemove(addon);
    setShowConfirmAddOnRemovalModal(true);
  };
  // Confirm add-on removal
  const confirmRemoveAddon = () => {
    if (addonToRemove === 'seo_boost_enabled') {
      setSubscription({
        ...subscription,
        seo_boost_enabled: false
      });
    } else if (addonToRemove === 'extra_storage') {
      setSubscription({
        ...subscription,
        extra_storage: 0
      });
    } else if (addonToRemove === 'extra_shows') {
      setSubscription({
        ...subscription,
        extra_shows: 0
      });
    }
    setShowConfirmAddOnRemovalModal(false);
    setAddonToRemove(null);
  };
  // Handle performance bonus action
  const handlePerformanceBonus = (action: 'apply' | 'payout') => {
    setBonusAction(action);
    setShowPerformanceBonusModal(true);
  };
  // Confirm performance bonus action
  const confirmBonusAction = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubscription({
        ...subscription,
        performance_credits: 0
      });
      setShowPerformanceBonusModal(false);
      setBonusAction(null);
      setIsLoading(false);
    }, 1500);
  };
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
  // Filter and sort billing history
  const filteredAndSortedBillingHistory = subscription.billing_history.
  filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery) {
      return item.description.
      toLowerCase().
      includes(searchQuery.toLowerCase());
    }
    return true;
  }).
  sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' ?
      new Date(a.date).getTime() - new Date(b.date).getTime() :
      new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === 'amount') {
      return sortDirection === 'asc' ?
      a.amount - b.amount :
      b.amount - a.amount;
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
          audioRef.current.play();
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
  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setSubscription({
      ...subscription,
      notifications: subscription.notifications.map((notif) =>
      notif.id === id ?
      {
        ...notif,
        read: true
      } :
      notif
      )
    });
  };
  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setSubscription({
      ...subscription,
      notifications: subscription.notifications.map((notif) => ({
        ...notif,
        read: true
      }))
    });
  };
  // Share content
  const shareContent = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `Check out my podcast subscription on Day.News!`;
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
        return;
    }
    window.open(shareLink, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Simulate data loading
  useEffect(() => {
    if (activeTab !== 'overview') {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);
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
  // Count unread notifications
  const unreadNotificationsCount = subscription.notifications.filter(
    (n) => !n.read
  ).length;
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
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
            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/local-voices/dashboard"
                className={`transition-colors ${activeTab === 'overview' ? 'text-news-primary font-semibold' : 'text-gray-600 hover:text-news-primary font-medium'}`}
                onClick={() => handleTabChange('overview')}>

                Overview
              </Link>
              <Link
                to="/local-voices/dashboard/content"
                className={`transition-colors ${activeTab === 'content' ? 'text-news-primary font-semibold' : 'text-gray-600 hover:text-news-primary font-medium'}`}
                onClick={() => handleTabChange('content')}>

                Content
              </Link>
              <Link
                to="/local-voices/dashboard/analytics"
                className={`transition-colors ${activeTab === 'analytics' ? 'text-news-primary font-semibold' : 'text-gray-600 hover:text-news-primary font-medium'}`}
                onClick={() => handleTabChange('analytics')}>

                Analytics
              </Link>
              <Link
                to="/local-voices/dashboard/subscription"
                className={`transition-colors ${activeTab === 'subscription' ? 'text-news-primary font-semibold' : 'text-gray-600 hover:text-news-primary font-medium'}`}
                onClick={() => handleTabChange('subscription')}>

                Subscription
              </Link>
              <Link
                to="/local-voices/dashboard/settings"
                className={`transition-colors ${activeTab === 'settings' ? 'text-news-primary font-semibold' : 'text-gray-600 hover:text-news-primary font-medium'}`}
                onClick={() => handleTabChange('settings')}>

                Settings
              </Link>
            </div>
            {/* User Menu and Notifications */}
            <div className="flex items-center space-x-4">
              {/* Share Button */}
              <div className="relative" ref={shareMenuRef}>
                <button
                  className="text-gray-600 hover:text-news-primary transition-colors p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  aria-label="Share options"
                  aria-expanded={showShareMenu}
                  aria-haspopup="true">

                  <Share2 className="h-5 w-5" />
                </button>
                {showShareMenu &&
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100">
                      Share via
                    </div>
                    <button
                    onClick={() => shareContent('facebook')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    aria-label="Share on Facebook">

                      <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                      Facebook
                    </button>
                    <button
                    onClick={() => shareContent('twitter')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    aria-label="Share on Twitter">

                      <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                      Twitter
                    </button>
                    <button
                    onClick={() => shareContent('linkedin')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    aria-label="Share on LinkedIn">

                      <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
                      LinkedIn
                    </button>
                    <button
                    onClick={() => shareContent('email')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    aria-label="Share via Email">

                      <Mail className="h-4 w-4 mr-3 text-gray-500" />
                      Email
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                    onClick={() => shareContent('copy')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    aria-label="Copy link">

                      <Link className="h-4 w-4 mr-3 text-gray-500" />
                      Copy link
                    </button>
                  </div>
                }
              </div>
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="text-gray-600 hover:text-news-primary transition-colors p-1 rounded-full hover:bg-gray-100 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label={`${unreadNotificationsCount} unread notifications`}
                  aria-expanded={showNotifications}
                  aria-haspopup="true">

                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 &&
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  }
                </button>
                {showNotifications &&
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">
                        Notifications
                      </h3>
                      {unreadNotificationsCount > 0 &&
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                      aria-label="Mark all as read">

                          Mark all as read
                        </button>
                    }
                    </div>
                    {subscription.notifications.length === 0 ?
                  <div className="px-4 py-6 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm">No notifications yet</p>
                      </div> :

                  subscription.notifications.map((notif) =>
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-gray-100 last:border-0 ${notif.read ? 'bg-white' : 'bg-blue-50'}`}>

                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              {notif.type === 'payment_success' &&
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <CreditCard className="h-4 w-4 text-green-600" />
                                </div>
                        }
                              {notif.type === 'performance' &&
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <Gift className="h-4 w-4 text-indigo-600" />
                                </div>
                        }
                              {notif.type === 'system' &&
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Info className="h-4 w-4 text-gray-600" />
                                </div>
                        }
                              {notif.type === 'feature' &&
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Zap className="h-4 w-4 text-purple-600" />
                                </div>
                        }
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">
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
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-news-primary transition-colors" />

                  <ChevronDown
                    className={`h-4 w-4 ml-1 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} />

                </button>
                {showUserMenu &&
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Sarah Johnson
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        sarah.johnson@example.com
                      </p>
                    </div>
                    <Link
                    to="/local-voices/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <BarChart className="h-4 w-4 mr-3 text-gray-500" />
                      Dashboard
                    </Link>
                    <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      Your Profile
                    </Link>
                    <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <Link
                    to="/local-voices/dashboard/help"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Help Center
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                    onClick={() => {
                      alert('You have been signed out.');
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
        </div>
      </header>
      {/* Now Playing Bar - Shows when audio is playing */}
      {currentPlayingEpisode &&
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 z-20 shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                onClick={() => togglePlayback(currentPlayingEpisode, '')}
                className="h-10 w-10 rounded-full bg-news-primary flex items-center justify-center text-white hover:bg-news-primary-dark transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}>

                  {isPlaying ?
                <Pause className="h-5 w-5" /> :

                <Play className="h-5 w-5" />
                }
                </button>
                <div>
                  <p className="font-medium text-gray-900">
                    {subscription.latest_episodes.find(
                    (ep) => ep.id === currentPlayingEpisode
                  )?.title || 'Unknown Episode'}
                  </p>
                  <p className="text-sm text-gray-500">Now Playing</p>
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Mobile Only */}
          <div className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Dashboard Menu</h3>
              <button className="text-gray-500">
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleTabChange('overview')}
                    className={`flex items-center w-full text-left ${activeTab === 'overview' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}>

                    <BarChart className="h-4 w-4 mr-2" />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('content')}
                    className={`flex items-center w-full text-left ${activeTab === 'content' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}>

                    <Mic className="h-4 w-4 mr-2" />
                    <span>Content</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('analytics')}
                    className={`flex items-center w-full text-left ${activeTab === 'analytics' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}>

                    <Layers className="h-4 w-4 mr-2" />
                    <span>Analytics</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('subscription')}
                    className={`flex items-center w-full text-left ${activeTab === 'subscription' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}>

                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Subscription</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('settings')}
                    className={`flex items-center w-full text-left ${activeTab === 'settings' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}>

                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading &&
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-news-primary mx-auto mb-4" />
                  <p className="text-gray-600">Loading data...</p>
                </div>
              </div>
            }
            {/* Error State */}
            {error && !isLoading &&
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
            {/* Overview Tab */}
            {activeTab === 'overview' && !isLoading &&
            <>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Dashboard Overview
                </h1>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Downloads
                      </h3>
                      <Download className="h-6 w-6 text-news-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {subscription.downloads_used.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                    <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                      className={`h-full ${getUsageColor(downloadPercentage)}`}
                      style={{
                        width: `${Math.min(downloadPercentage, 100)}%`
                      }}>
                    </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {downloadPercentage.toFixed(1)}% of{' '}
                      {subscription.downloads_included.toLocaleString()}{' '}
                      included
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Storage
                      </h3>
                      <HardDrive className="h-6 w-6 text-news-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {subscription.storage_used} hours
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Used</p>
                    <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                      className={`h-full ${getUsageColor(storagePercentage)}`}
                      style={{
                        width: `${Math.min(storagePercentage, 100)}%`
                      }}>
                    </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {storagePercentage.toFixed(1)}% of{' '}
                      {subscription.storage_included} hours included
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Current Plan
                      </h3>
                      <CreditCard className="h-6 w-6 text-news-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${subscription.tier_price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {subscription.billing_cycle === 'monthly' ?
                    'per month' :
                    'per year'}
                    </p>
                    <div className="mt-4">
                      <StatusIndicator
                      status={
                      subscription.status === 'active' ?
                      'active' :
                      'inactive'
                      }
                      showText={true}
                      size="sm" />

                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Next billing: {formatDate(subscription.next_billing_date)}
                    </p>
                  </div>
                </div>
                {/* Recent Episodes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Episodes
                    </h2>
                    <Link
                    to="/local-voices/dashboard/content"
                    className="text-news-primary hover:text-news-primary-dark font-medium text-sm flex items-center transition-colors"
                    aria-label="View all episodes">

                      View all
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {subscription.latest_episodes.map((episode) =>
                  <div
                    key={episode.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">

                        <div className="flex items-center">
                          <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 mr-4">
                            <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="h-full w-full object-cover" />

                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-x-4">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(episode.publish_date)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {episode.duration}
                              </span>
                              <span className="flex items-center">
                                <Download className="h-3.5 w-3.5 mr-1" />
                                {episode.downloads.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                          onClick={() =>
                          togglePlayback(episode.id, episode.audio_url)
                          }
                          className={`h-10 w-10 rounded-full ${currentPlayingEpisode === episode.id && isPlaying ? 'bg-gray-200 text-gray-700' : 'bg-news-primary text-white'} flex items-center justify-center hover:bg-news-primary-dark transition-colors`}
                          aria-label={
                          currentPlayingEpisode === episode.id &&
                          isPlaying ?
                          'Pause episode' :
                          'Play episode'
                          }>

                              {currentPlayingEpisode === episode.id &&
                          isPlaying ?
                          <Pause className="h-5 w-5" /> :

                          <Play className="h-5 w-5" />
                          }
                            </button>
                          </div>
                        </div>
                      </div>
                  )}
                  </div>
                  <div className="mt-6 text-center">
                    <Link
                    to="/local-voices/upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-news-primary hover:bg-news-primary-dark transition-colors"
                    aria-label="Upload new episode">

                      <PlusCircle className="h-4 w-4 mr-2" />
                      Upload New Episode
                    </Link>
                  </div>
                </div>
                {/* Performance Bonus Section - Conditionally rendered */}
                {subscription.downloads_used >=
              subscription.performance_bonus_threshold &&
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Gift className="h-6 w-6 text-green-500 mr-2" />
                        <h2 className="text-xl font-bold text-gray-900">
                          Performance Bonus Earned!
                        </h2>
                      </div>
                      <Badge variant="success" className="text-sm px-3 py-1">
                        Congratulations
                      </Badge>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-2">
                        Your podcast has exceeded{' '}
                        {subscription.performance_bonus_threshold.toLocaleString()}{' '}
                        downloads this month, unlocking performance credits!
                      </p>
                      <div className="flex items-center text-green-700 font-bold text-xl">
                        <DollarSign className="h-5 w-5 mr-1" />
                        <span>
                          ${subscription.performance_credits.toFixed(2)} credits
                          available
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                    onClick={() => handlePerformanceBonus('apply')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    aria-label="Apply credits to next bill">

                        Apply to Next Bill
                      </button>
                      <button
                    onClick={() => handlePerformanceBonus('payout')}
                    className={`flex-1 ${subscription.performance_credits >= 100 ? 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} font-medium py-2 px-4 rounded-md transition-colors`}
                    disabled={subscription.performance_credits < 100}
                    aria-label="Request payout"
                    aria-disabled={subscription.performance_credits < 100}>

                        Request Payout
                        {subscription.performance_credits < 100 &&
                    <span className="block text-xs mt-1">
                            (Minimum $100 required)
                          </span>
                    }
                      </button>
                    </div>
                  </div>
              }
              </>
            }
            {/* Subscription Tab */}
            {activeTab === 'subscription' && !isLoading &&
            <>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Manage Your Local Voices Subscription
                </h1>
                {/* Current Plan Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Current Plan
                    </h2>
                    <div className="mt-2 md:mt-0">
                      <StatusIndicator
                      status={
                      subscription.status === 'active' ?
                      'active' :
                      subscription.status === 'past_due' ?
                      'pending' :
                      'inactive'
                      }
                      showText={true}
                      size="md"
                      className="font-medium" />

                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {subscription.tier_name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {subscription.billing_cycle === 'monthly' ?
                        'Monthly billing' :
                        'Annual billing'}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0 text-right">
                        <div className="text-xl font-bold text-news-primary">
                          ${subscription.tier_price.toFixed(2)}
                          <span className="text-gray-500 font-normal text-sm">
                            /
                            {subscription.billing_cycle === 'monthly' ?
                          'month' :
                          'year'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-indigo-200">
                      <div>
                        <p className="text-sm text-gray-500">Current period</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(subscription.current_period_start)} -{' '}
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Next billing date
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(subscription.next_billing_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment method</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          <span className="capitalize">
                            {subscription.payment_method.brand}
                          </span>{' '}
                          ending in {subscription.payment_method.last4}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Usage Metrics Dashboard */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Usage Metrics
                  </h2>
                  {/* Downloads Usage */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Download className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-900">Downloads</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        {subscription.downloads_used.toLocaleString()} /{' '}
                        {subscription.downloads_included.toLocaleString()}
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                      className={`h-full ${getUsageColor(downloadPercentage)}`}
                      style={{
                        width: `${Math.min(downloadPercentage, 100)}%`
                      }}>
                    </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className="text-xs text-gray-500">
                        {downloadPercentage.toFixed(1)}% used
                      </div>
                      {downloadPercentage > 100 &&
                    <div className="text-xs text-red-600 font-medium">
                          Overage:{' '}
                          {(
                      subscription.downloads_used -
                      subscription.downloads_included).
                      toLocaleString()}{' '}
                          downloads
                        </div>
                    }
                    </div>
                  </div>
                  {/* Storage Usage */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <HardDrive className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-900">Storage</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        {subscription.storage_used} /{' '}
                        {subscription.storage_included} hours
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                      className={`h-full ${getUsageColor(storagePercentage)}`}
                      style={{
                        width: `${Math.min(storagePercentage, 100)}%`
                      }}>
                    </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className="text-xs text-gray-500">
                        {storagePercentage.toFixed(1)}% used
                      </div>
                      {storagePercentage > 100 &&
                    <div className="text-xs text-red-600 font-medium">
                          Overage:{' '}
                          {subscription.storage_used -
                      subscription.storage_included}{' '}
                          hours
                        </div>
                    }
                    </div>
                  </div>
                  {/* Shows Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Mic className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-900">Shows</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        {subscription.shows_used} /{' '}
                        {subscription.shows_included} shows
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                      className={`h-full ${getUsageColor(showsPercentage)}`}
                      style={{
                        width: `${Math.min(showsPercentage, 100)}%`
                      }}>
                    </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className="text-xs text-gray-500">
                        {showsPercentage.toFixed(1)}% used
                      </div>
                      {showsPercentage > 100 &&
                    <div className="text-xs text-red-600 font-medium">
                          Overage:{' '}
                          {subscription.shows_used -
                      subscription.shows_included}{' '}
                          shows
                        </div>
                    }
                    </div>
                  </div>
                </div>
                {/* Upgrade/Downgrade Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Change Your Plan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {availableTiers.map((tier) => {
                    const isCurrentTier = tier.name === subscription.tier_name;
                    const priceDifference = calculatePriceDifference(tier);
                    return (
                      <div
                        key={tier.id}
                        className={`border rounded-lg p-4 transition-all duration-200 ${isCurrentTier ? 'border-news-primary bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'}`}>

                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900">
                              {tier.name}
                            </h3>
                            {isCurrentTier &&
                          <Badge variant="primary" className="text-xs">
                                Current Plan
                              </Badge>
                          }
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-3">
                            $
                            {subscription.billing_cycle === 'monthly' ?
                          tier.monthlyPrice.toFixed(2) :
                          tier.annualPrice.toFixed(2)}
                            <span className="text-sm font-normal text-gray-500">
                              /
                              {subscription.billing_cycle === 'monthly' ?
                            'mo' :
                            'yr'}
                            </span>
                          </div>
                          <ul className="space-y-2 mb-4 text-sm">
                            {tier.features.slice(0, 3).map((feature, index) =>
                          <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                          )}
                            {tier.features.length > 3 &&
                          <li className="text-news-primary hover:text-news-primary-dark font-medium text-xs cursor-pointer">
                                + {tier.features.length - 3} more features
                              </li>
                          }
                          </ul>
                          {!isCurrentTier &&
                        <button
                          onClick={() => handlePlanChange(tier)}
                          className={`w-full py-2 px-3 rounded-md font-medium text-sm transition-colors ${priceDifference > 0 ? 'bg-news-primary hover:bg-news-primary-dark text-white' : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'}`}
                          aria-label={`${priceDifference > 0 ? 'Upgrade to' : 'Downgrade to'} ${tier.name} plan`}>

                              {priceDifference > 0 ? 'Upgrade' : 'Downgrade'}
                              {priceDifference !== 0 &&
                          <span className="ml-1">
                                  ({priceDifference > 0 ? '+' : ''}$
                                  {Math.abs(priceDifference).toFixed(2)}/
                                  {subscription.billing_cycle === 'monthly' ?
                            'mo' :
                            'yr'}
                                  )
                                </span>
                          }
                            </button>
                        }
                        </div>);

                  })}
                  </div>
                </div>
                {/* Add-ons Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Add-ons
                  </h2>
                  {/* SEO Boost Add-on */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <input
                        type="checkbox"
                        id="seoBoost"
                        checked={subscription.seo_boost_enabled}
                        onChange={(e) =>
                        handleAddOnToggle(
                          'seo_boost_enabled',
                          e.target.checked
                        )
                        }
                        className="h-5 w-5 text-news-primary rounded border-gray-300 focus:ring-news-primary"
                        aria-label="Enable SEO Boost" />

                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Zap className="h-5 w-5 text-news-primary mr-2" />
                            <h3 className="font-bold text-gray-900">
                              SEO Boost™
                            </h3>
                          </div>
                          <div className="text-news-primary font-medium">
                            $5/month
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          Optimize your podcast for search engines with
                          automatic transcription and keyword indexing.
                        </p>
                        {subscription.seo_boost_enabled &&
                      <button
                        onClick={() =>
                        handleRemoveAddon('seo_boost_enabled')
                        }
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        aria-label="Remove SEO Boost add-on">

                            Remove
                          </button>
                      }
                      </div>
                    </div>
                  </div>
                  {/* Extra Storage Add-on */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <HardDrive className="h-5 w-5 text-news-primary mr-2" />
                            <h3 className="font-bold text-gray-900">
                              Extra Storage
                            </h3>
                          </div>
                          <div className="text-news-primary font-medium">
                            {subscription.extra_storage > 0 ?
                          `+${subscription.extra_storage} hours` :
                          'Not added'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <select
                          value={subscription.extra_storage}
                          onChange={(e) =>
                          setSubscription({
                            ...subscription,
                            extra_storage: parseInt(e.target.value)
                          })
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
                          aria-label="Select extra storage amount">

                            <option value="0">No additional storage</option>
                            <option value="10">+10 hours - $5/month</option>
                            <option value="50">+50 hours - $20/month</option>
                            <option value="100">+100 hours - $35/month</option>
                          </select>
                        </div>
                        {subscription.extra_storage > 0 &&
                      <button
                        onClick={() => handleRemoveAddon('extra_storage')}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        aria-label="Remove extra storage add-on">

                            Remove
                          </button>
                      }
                      </div>
                    </div>
                  </div>
                  {/* Extra Shows Add-on */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Mic className="h-5 w-5 text-news-primary mr-2" />
                            <h3 className="font-bold text-gray-900">
                              Extra Shows
                            </h3>
                          </div>
                          <div className="text-news-primary font-medium">
                            {subscription.extra_shows > 0 ?
                          `+${subscription.extra_shows} shows` :
                          'Not added'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <select
                          value={subscription.extra_shows}
                          onChange={(e) =>
                          setSubscription({
                            ...subscription,
                            extra_shows: parseInt(e.target.value)
                          })
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
                          aria-label="Select extra shows amount">

                            <option value="0">No additional shows</option>
                            <option value="1">+1 show - $5/month</option>
                            <option value="3">+3 shows - $12/month</option>
                            <option value="5">+5 shows - $18/month</option>
                          </select>
                        </div>
                        {subscription.extra_shows > 0 &&
                      <button
                        onClick={() => handleRemoveAddon('extra_shows')}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        aria-label="Remove extra shows add-on">

                            Remove
                          </button>
                      }
                      </div>
                    </div>
                  </div>
                </div>
                {/* Billing History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Billing History
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
                      {/* Search */}
                      <div className="relative">
                        <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                        aria-label="Search invoices" />

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
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                        <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {/* Refresh */}
                      <button
                      onClick={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 800);
                      }}
                      className="flex items-center justify-center py-1.5 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      aria-label="Refresh billing history">

                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th
                          className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSortChange('date')}
                          aria-sort={
                          sortField === 'date' ?
                          sortDirection === 'asc' ?
                          'ascending' :
                          'descending' :
                          'none'
                          }>

                            <div className="flex items-center">
                              Date
                              {sortField === 'date' && (
                            sortDirection === 'asc' ?
                            <ArrowUp className="h-3 w-3 ml-1" /> :

                            <ArrowDown className="h-3 w-3 ml-1" />)
                            }
                            </div>
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th
                          className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSortChange('amount')}
                          aria-sort={
                          sortField === 'amount' ?
                          sortDirection === 'asc' ?
                          'ascending' :
                          'descending' :
                          'none'
                          }>

                            <div className="flex items-center">
                              Amount
                              {sortField === 'amount' && (
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
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedBillingHistory.length === 0 ?
                      <tr>
                            <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500">

                              {searchQuery || filterStatus !== 'all' ?
                          'No invoices match your search criteria.' :
                          'No billing history available.'}
                            </td>
                          </tr> :

                      filteredAndSortedBillingHistory.map((item) =>
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors">

                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(item.date)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {item.description}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                ${item.amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Badge
                            variant={
                            item.status === 'paid' ?
                            'success' :
                            item.status === 'pending' ?
                            'warning' :
                            'danger'
                            }
                            className="text-xs">

                                  {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <a
                            href={item.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-news-primary hover:text-news-primary-dark transition-colors"
                            aria-label={`View invoice for ${item.description}`}>

                                  View
                                </a>
                              </td>
                            </tr>
                      )
                      }
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Payment Method
                  </h2>
                  <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center mr-3">
                          <span className="uppercase font-medium text-gray-700">
                            {subscription.payment_method.brand}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            •••• •••• •••• {subscription.payment_method.last4}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires {subscription.payment_method.exp_month}/
                            {subscription.payment_method.exp_year}
                          </p>
                        </div>
                      </div>
                      <button
                      onClick={() => setShowPaymentModal(true)}
                      className="text-news-primary hover:text-news-primary-dark font-medium transition-colors"
                      aria-label="Update payment method">

                        Update
                      </button>
                    </div>
                  </div>
                  <button
                  className="text-news-primary hover:text-news-primary-dark font-medium flex items-center transition-colors"
                  aria-label="Add backup payment method">

                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add backup payment method
                  </button>
                </div>
                {/* Cancel Subscription */}
                <div className="text-center mb-8">
                  <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                  aria-label="Cancel subscription">

                    Cancel subscription
                  </button>
                </div>
              </>
            }
            {/* Content Tab */}
            {activeTab === 'content' && !isLoading &&
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Content Management
                </h1>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Your Episodes
                    </h2>
                    <Link
                    to="/local-voices/upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-news-primary hover:bg-news-primary-dark transition-colors"
                    aria-label="Upload new episode">

                      <PlusCircle className="h-4 w-4 mr-2" />
                      Upload New Episode
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {subscription.latest_episodes.map((episode) =>
                  <div
                    key={episode.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">

                        <div className="flex items-center">
                          <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 mr-4">
                            <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="h-full w-full object-cover" />

                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900">
                              {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-x-4">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(episode.publish_date)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {episode.duration}
                              </span>
                              <span className="flex items-center">
                                <Download className="h-3.5 w-3.5 mr-1" />
                                {episode.downloads.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex mt-3 space-x-2">
                              <button
                            onClick={() =>
                            togglePlayback(episode.id, episode.audio_url)
                            }
                            className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${currentPlayingEpisode === episode.id && isPlaying ? 'bg-gray-200 text-gray-700' : 'bg-news-primary text-white hover:bg-news-primary-dark'} transition-colors`}
                            aria-label={
                            currentPlayingEpisode === episode.id &&
                            isPlaying ?
                            'Pause episode' :
                            'Play episode'
                            }>

                                {currentPlayingEpisode === episode.id &&
                            isPlaying ?
                            <>
                                    <Pause className="h-3 w-3 mr-1" />
                                    Pause
                                  </> :

                            <>
                                    <Play className="h-3 w-3 mr-1" />
                                    Play
                                  </>
                            }
                              </button>
                              <button
                            className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-label={`Edit ${episode.title}`}>

                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                              <button
                            className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-label={`Share ${episode.title}`}
                            onClick={() => setShowShareMenu(true)}>

                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </button>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                          className="text-gray-400 hover:text-gray-500 transition-colors"
                          aria-label="Show more options">

                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            }
            {/* Analytics Tab */}
            {activeTab === 'analytics' && !isLoading &&
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Analytics Dashboard
                </h1>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="text-center py-12">
                    <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Analytics Dashboard
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Detailed analytics are available in the full application.
                      This is a simplified preview.
                    </p>
                  </div>
                </div>
              </div>
            }
            {/* Settings Tab */}
            {activeTab === 'settings' && !isLoading &&
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Account Settings
                </h1>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Account Settings
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Account settings are available in the full application.
                      This is a simplified preview.
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>
          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:w-64 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleTabChange('overview')}
                      className={`flex items-center w-full text-left ${activeTab === 'overview' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}
                      aria-current={
                      activeTab === 'overview' ? 'page' : undefined
                      }>

                      <BarChart className="h-4 w-4 mr-2" />
                      <span>Dashboard</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('content')}
                      className={`flex items-center w-full text-left ${activeTab === 'content' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}
                      aria-current={
                      activeTab === 'content' ? 'page' : undefined
                      }>

                      <Mic className="h-4 w-4 mr-2" />
                      <span>Manage Content</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('analytics')}
                      className={`flex items-center w-full text-left ${activeTab === 'analytics' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}
                      aria-current={
                      activeTab === 'analytics' ? 'page' : undefined
                      }>

                      <Layers className="h-4 w-4 mr-2" />
                      <span>Analytics</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('subscription')}
                      className={`flex items-center w-full text-left ${activeTab === 'subscription' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}
                      aria-current={
                      activeTab === 'subscription' ? 'page' : undefined
                      }>

                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Subscription</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabChange('settings')}
                      className={`flex items-center w-full text-left ${activeTab === 'settings' ? 'text-news-primary font-semibold' : 'text-gray-700 hover:text-news-primary'} transition-colors`}
                      aria-current={
                      activeTab === 'settings' ? 'page' : undefined
                      }>

                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-news-primary transition-colors"
                    aria-label="Visit support center">

                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span>Support Center</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-news-primary transition-colors"
                    aria-label="View billing FAQ">

                    <FileText className="h-4 w-4 mr-2" />
                    <span>Billing FAQ</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-news-primary transition-colors"
                    aria-label="View creator guide">

                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Creator Guide</span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Follow Us</h3>
              <div className="flex space-x-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  aria-label="Facebook">

                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-400 transition-colors"
                  aria-label="Twitter">

                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-pink-600 transition-colors"
                  aria-label="Instagram">

                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-700 transition-colors"
                  aria-label="LinkedIn">

                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Subscription Modal */}
      {showCancelModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-labelledby="cancel-subscription-title"
          aria-describedby="cancel-subscription-description">

            <div className="flex justify-between items-start mb-4">
              <h3
              id="cancel-subscription-title"
              className="text-xl font-bold text-gray-900">

                Cancel Your Subscription
              </h3>
              <button
              onClick={() => setShowCancelModal(false)}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close dialog">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div
            id="cancel-subscription-description"
            className="bg-yellow-50 rounded-md p-3 mb-4 flex items-start">

              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Your subscription will remain active until the end of your
                current billing period (
                {formatDate(subscription.current_period_end)}). After that,
                you'll lose access to all premium features.
              </p>
            </div>
            <div className="mb-4">
              <label
              htmlFor="cancelReason"
              className="block text-sm font-medium text-gray-700 mb-1">

                Why are you canceling?
              </label>
              <select
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
              aria-required="true">

                <option value="">Select a reason...</option>
                <option value="too_expensive">Too expensive</option>
                <option value="not_using">Not using enough</option>
                <option value="missing_features">
                  Missing features I need
                </option>
                <option value="switching">Switching to another service</option>
                <option value="technical_issues">Technical issues</option>
                <option value="other">Other reason</option>
              </select>
            </div>
            {cancelReason === 'too_expensive' &&
          <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Special Offer: 50% Off Next Month
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  We'd hate to see you go. How about 50% off your next month
                  while you reconsider?
                </p>
                <label className="flex items-center">
                  <input
                type="checkbox"
                checked={acceptRetentionOffer}
                onChange={(e) => setAcceptRetentionOffer(e.target.checked)}
                className="h-4 w-4 text-news-primary rounded border-gray-300 focus:ring-news-primary"
                aria-describedby="retention-offer-description" />

                  <span
                id="retention-offer-description"
                className="ml-2 text-sm text-gray-700">

                    Yes, give me 50% off next month
                  </span>
                </label>
              </div>
          }
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <button
              onClick={() => setShowCancelModal(false)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-md transition-colors"
              aria-label="Keep subscription">

                Keep Subscription
              </button>
              <button
              onClick={() => {
                // In a real app, this would make an API call
                setIsLoading(true);
                setTimeout(() => {
                  setSubscription({
                    ...subscription,
                    status: 'canceled'
                  });
                  setShowCancelModal(false);
                  setIsLoading(false);
                }, 1500);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!cancelReason}
              aria-label="Confirm cancellation">

                {isLoading ?
              <>
                    <Loader className="animate-spin h-4 w-4 mr-2 inline" />
                    Processing...
                  </> :

              'Confirm Cancellation'
              }
              </button>
            </div>
          </div>
        </div>
      }
      {/* Upgrade Plan Modal */}
      {showUpgradeModal && targetTier &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-labelledby="upgrade-plan-title"
          aria-describedby="upgrade-plan-description">

            <div className="flex justify-between items-start mb-4">
              <h3
              id="upgrade-plan-title"
              className="text-xl font-bold text-gray-900">

                Upgrade Your Plan
              </h3>
              <button
              onClick={() => {
                setShowUpgradeModal(false);
                setTargetTier(null);
              }}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close dialog">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div
            id="upgrade-plan-description"
            className="bg-indigo-50 rounded-md p-4 mb-4">

              <h4 className="font-medium text-gray-900 mb-2">
                Upgrading to {targetTier.name}
              </h4>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Current plan:</span>
                <span className="text-gray-900 font-medium">
                  {subscription.tier_name}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">New plan:</span>
                <span className="text-gray-900 font-medium">
                  {targetTier.name}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-indigo-100">
                <span className="text-gray-600">Price difference:</span>
                <span className="text-news-primary font-medium">
                  +${calculatePriceDifference(targetTier).toFixed(2)}/
                  {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Your plan will be upgraded immediately. You'll be charged the
              prorated amount for the remainder of your billing period.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <button
              onClick={() => {
                setShowUpgradeModal(false);
                setTargetTier(null);
              }}
              className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-md transition-colors"
              aria-label="Cancel upgrade">

                Cancel
              </button>
              <button
              onClick={() => {
                // In a real app, this would make an API call
                setIsLoading(true);
                setTimeout(() => {
                  setSubscription({
                    ...subscription,
                    tier_name: targetTier.name,
                    tier_price:
                    subscription.billing_cycle === 'monthly' ?
                    targetTier.monthlyPrice :
                    targetTier.annualPrice
                  });
                  setShowUpgradeModal(false);
                  setTargetTier(null);
                  setIsLoading(false);
                }, 1500);
              }}
              className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              aria-label="Confirm upgrade">

                {isLoading ?
              <>
                    <Loader className="animate-spin h-4 w-4 mr-2 inline" />
                    Processing...
                  </> :

              'Confirm Upgrade'
              }
              </button>
            </div>
          </div>
        </div>
      }
      {/* Other modals remain unchanged */}
    </div>);

};
// Additional required components for Mail icon
function Mail(props) {
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

      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>);

}
// Additional required components for MoreVertical icon
function MoreVertical(props) {
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

      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>);

}
export default SubscriptionPage;