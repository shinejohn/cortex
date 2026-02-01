import React, { useEffect, useState, useRef, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  Facebook,
  FileText,
  Gift,
  Globe,
  HelpCircle,
  Info,
  Instagram,
  Loader,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Music,
  Pause,
  Play,
  Plus,
  Radio,
  Rss,
  Search,
  Settings,
  Share2,
  Shield,
  Star,
  Twitter,
  Upload,
  User,
  Users,
  Volume2,
  X,
  Youtube } from
'lucide-react';
// Mock subscription plans
const subscriptionPlans = [
{
  id: 'hobby',
  name: 'Hobby',
  price: 0,
  features: [
  'Host up to 3 podcast episodes',
  'Basic analytics',
  'Public profile page',
  'Standard audio quality',
  'Community support'],

  limitations: [
  'No monetization tools',
  'Day.News branding on profile',
  'Limited storage (100MB)'],

  recommended: false
},
{
  id: 'creator',
  name: 'Creator',
  price: 9.99,
  features: [
  'Host up to 50 podcast episodes',
  'Advanced analytics',
  'Custom profile page',
  'High audio quality',
  'Monetization tools',
  'Email support',
  'Remove Day.News branding',
  'Increased storage (1GB)'],

  limitations: [],
  recommended: true
},
{
  id: 'professional',
  name: 'Professional',
  price: 24.99,
  features: [
  'Unlimited podcast episodes',
  'Premium analytics with listener demographics',
  'Priority placement in directories',
  'Highest audio quality',
  'Full monetization suite',
  'Priority support',
  'Custom domain support',
  'Unlimited storage',
  'Team accounts (up to 5)'],

  limitations: [],
  recommended: false
}];

// Mock categories
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

// Sample podcast episodes for preview
const sampleEpisodes = [
{
  id: 'ep1',
  title: 'Getting Started with Podcasting',
  description:
  'Learn the basics of podcasting and how to set up your first episode with minimal equipment and maximum impact.',
  duration: '24:15',
  publishDate: '2023-10-15',
  image:
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
},
{
  id: 'ep2',
  title: 'Building Your Audience',
  description:
  'Strategies for growing your podcast audience through social media, collaborations, and content marketing.',
  duration: '32:40',
  publishDate: '2023-10-22',
  image:
  'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
},
{
  id: 'ep3',
  title: 'Monetization Strategies',
  description:
  'Explore different ways to monetize your podcast, from sponsorships to listener support and merchandise.',
  duration: '28:55',
  publishDate: '2023-10-29',
  image:
  'https://images.unsplash.com/photo-1567596388756-f6d710c8fc07?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
}];

// Creator success stories
const successStories = [
{
  id: 'story1',
  name: 'Sarah Johnson',
  podcastName: 'The Clearwater Report',
  image:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
  quote:
  "Day.News gave me the platform to share local stories that weren't being covered elsewhere. Within six months, my audience grew from just friends and family to over 5,000 regular listeners!",
  category: 'News & Politics',
  followers: 5200,
  monthlyListens: 18500
},
{
  id: 'story2',
  name: 'Marcus Chen',
  podcastName: 'Tech for the Rest of Us',
  image:
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
  quote:
  'I started my tech podcast as a hobby, but with the monetization tools from Day.News, I was able to turn it into a part-time income stream. The analytics helped me understand my audience and create better content.',
  category: 'Technology',
  followers: 3800,
  monthlyListens: 12000
},
{
  id: 'story3',
  name: 'Olivia Martinez',
  podcastName: 'History Next Door',
  image:
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
  quote:
  "The support from the Day.News team was incredible. They helped me refine my concept and connect with local historians. Now I'm partnering with the city museum for special episodes!",
  category: 'History',
  followers: 2900,
  monthlyListens: 8700
}];

// Frequently asked questions
const faqs = [
{
  question: 'What equipment do I need to start podcasting?',
  answer:
  "To get started, you'll need a microphone, headphones, and recording/editing software. We recommend the Audio-Technica ATR2100x-USB microphone ($99), any comfortable headphones you already own, and Audacity (free) for editing. As you grow, you can invest in better equipment."
},
{
  question: 'How much does it cost to host my podcast on Day.News?',
  answer:
  'We offer multiple plans starting with a free Hobby tier that allows you to host up to 3 episodes. Our Creator plan ($9.99/month) includes 50 episodes and monetization tools, while our Professional plan ($24.99/month) offers unlimited episodes and advanced features.'
},
{
  question: 'Can I monetize my podcast on Day.News?',
  answer:
  'Yes! Our Creator and Professional plans include monetization tools such as listener donations, subscription content, and sponsor integration. We also provide analytics to help you demonstrate your audience value to potential sponsors.'
},
{
  question: 'How will people find my podcast?',
  answer:
  "Your podcast will be listed in the Day.News directory and we'll help you submit it to major podcast platforms like Apple Podcasts, Spotify, and Google Podcasts. We also provide tools to create shareable clips for social media and SEO guidance to improve discoverability."
},
{
  question: 'Do I need to commit to a regular schedule?',
  answer:
  "While consistency helps build an audience, there's no technical requirement to maintain a specific schedule. However, we recommend establishing a regular publishing cadence that you can sustain over time to keep listeners engaged."
},
{
  question: 'What type of content is not allowed?',
  answer:
  'Day.News prohibits content that promotes hate speech, harassment, illegal activities, or violates copyright law. Please review our full content policy during registration for complete details on prohibited content.'
}];

// Registration steps
const registrationSteps = [
{
  id: 'account',
  title: 'Account Setup',
  icon: User
},
{
  id: 'profile',
  title: 'Creator Profile',
  icon: Edit
},
{
  id: 'plan',
  title: 'Select Plan',
  icon: CreditCard
},
{
  id: 'review',
  title: 'Review & Submit',
  icon: CheckCircle
}];

const CreatorRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<
    string | null>(
    null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    // Account Info
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeTerms: false,
    agreePrivacy: false,
    receiveUpdates: true,
    // Creator Profile
    podcastName: '',
    tagline: '',
    category: '',
    bio: '',
    location: '',
    profileImage: null as File | null,
    bannerImage: null as File | null,
    profileImagePreview: '',
    bannerImagePreview: '',
    // Social Media
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: ''
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>>(
    {});
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);
  // Handle input changes
  const handleInputChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>

  {
    const { name, value, type } = e.target;
    const checked =
    type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = {
          ...prev
        };
        delete updated[name];
        return updated;
      });
    }
  };
  // Handle file uploads
  const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  fileType: 'profileImage' | 'bannerImage') =>
  {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setFormData((prev) => ({
            ...prev,
            [fileType]: file,
            [`${fileType}Preview`]: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  // Validate current step
  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    if (currentStep === 'account') {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
      if (!formData.agreeTerms) {
        errors.agreeTerms = 'You must agree to the Terms of Service';
      }
      if (!formData.agreePrivacy) {
        errors.agreePrivacy = 'You must agree to the Privacy Policy';
      }
    }
    if (currentStep === 'profile') {
      if (!formData.podcastName.trim()) {
        errors.podcastName = 'Podcast name is required';
      }
      if (!formData.tagline.trim()) {
        errors.tagline = 'Tagline is required';
      } else if (formData.tagline.length > 100) {
        errors.tagline = 'Tagline must be 100 characters or less';
      }
      if (!formData.category) {
        errors.category = 'Please select a category';
      }
      if (!formData.bio.trim()) {
        errors.bio = 'Bio is required';
      }
      if (!formData.location.trim()) {
        errors.location = 'Location is required';
      }
    }
    if (currentStep === 'plan' && !selectedPlan) {
      errors.plan = 'Please select a subscription plan';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      const currentIndex = registrationSteps.findIndex(
        (step) => step.id === currentStep
      );
      if (currentIndex < registrationSteps.length - 1) {
        setCurrentStep(registrationSteps[currentIndex + 1].id);
      }
    }
  };
  // Handle previous step
  const handlePrevStep = () => {
    const currentIndex = registrationSteps.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex > 0) {
      setCurrentStep(registrationSteps[currentIndex - 1].id);
    }
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessModal(true);
      }, 1500);
    }
  };
  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setValidationErrors((prev) => {
      const updated = {
        ...prev
      };
      delete updated.plan;
      return updated;
    });
  };
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
  // Handle share
  const handleShare = () => {
    navigator.clipboard.writeText(
      'https://day.news/local-voices/become-creator'
    );
    alert('Link copied to clipboard!');
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
  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentPlayingEpisode(null);
    };
    const handleError = () => {
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="font-display text-2xl font-bold text-news-primary"
                aria-label="Day.News Homepage">

                Day.News
              </Link>
              <span className="ml-2 text-gray-500">|</span>
              <span className="ml-2 font-semibold text-gray-700">
                Local Voices
              </span>
            </div>
            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Home
              </Link>
              <Link
                to="/local-voices"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Explore
              </Link>
              <Link
                to="/local-voices/pricing"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Pricing
              </Link>
              <Link
                to="/local-voices/become-creator"
                className="text-news-primary font-semibold"
                aria-current="page">

                Become a Creator
              </Link>
              <Link
                to="/local-voices/dashboard"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Creator Dashboard
              </Link>
            </nav>
            {/* User and Notifications */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="text-gray-600 hover:text-news-primary transition-colors p-1 rounded-full hover:bg-gray-100 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                  aria-haspopup="true">

                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    2
                  </span>
                </button>
                {showNotifications &&
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">
                        Notifications
                      </h3>
                      <button
                      className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                      aria-label="Mark all as read">

                        Mark all as read
                      </button>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                      <div className="flex">
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Info className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Welcome to Local Voices!
                          </p>
                          <p className="text-sm text-gray-700">
                            Learn how to get started with our creator tools and
                            resources.
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">Just now</p>
                            <button
                            className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                            aria-label="Mark as read">

                              Mark as read
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                      <div className="flex">
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Gift className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Special Offer
                          </p>
                          <p className="text-sm text-gray-700">
                            Get 20% off your first 3 months on any paid plan.
                            Limited time offer!
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">
                              5 minutes ago
                            </p>
                            <button
                            className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                            aria-label="Mark as read">

                              Mark as read
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">
                        No more notifications
                      </p>
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

                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-transparent group-hover:border-news-primary transition-colors">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 ml-1 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} />

                </button>
                {showUserMenu &&
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Guest User
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sign in to access all features
                      </p>
                    </div>
                    <Link
                    to="/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      Sign In
                    </Link>
                    <Link
                    to="/register"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <Plus className="h-4 w-4 mr-3 text-gray-500" />
                      Create Account
                    </Link>
                    <Link
                    to="/help"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center">

                      <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Help Center
                    </Link>
                  </div>
                }
              </div>
              {/* Share Button */}
              <div className="relative" ref={shareMenuRef}>
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  aria-label="Share this page"
                  aria-expanded={showShareMenu}
                  aria-haspopup="true">

                  <Share2 className="h-5 w-5" />
                </button>
                {showShareMenu &&
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleShare}>

                      <svg
                      className="h-4 w-4 mr-2 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">

                        <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2">
                      </rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy link
                    </button>
                    <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent('https://day.news/local-voices/become-creator')}&text=${encodeURIComponent('Become a podcast creator on Day.News Local Voices!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                      <Twitter className="h-4 w-4 mr-2 text-gray-500" />
                      Share on Twitter
                    </a>
                    <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://day.news/local-voices/become-creator')}`}
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
      </header>
      {/* Now Playing Bar - Shows when audio is playing */}
      {currentPlayingEpisode &&
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 z-20 shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {sampleEpisodes.find((ep) => ep.id === currentPlayingEpisode)?.
              image &&
              <img
                src={
                sampleEpisodes.find(
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
                  sampleEpisodes.find(
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
                    {sampleEpisodes.find(
                    (ep) => ep.id === currentPlayingEpisode
                  )?.title || 'Unknown Episode'}
                  </p>
                  <p className="text-sm text-gray-500">Sample Episode</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                  onClick={toggleMute}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}>

                    {isMuted ?
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">

                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                      </svg> :

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
      {/* Page Content */}
      <main className="container mx-auto px-4 max-w-7xl py-8 pb-24">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-current={activeTab === 'overview' ? 'page' : undefined}>

              Overview
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'register' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-current={activeTab === 'register' ? 'page' : undefined}>

              Register
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'features' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-current={activeTab === 'features' ? 'page' : undefined}>

              Features
            </button>
            <button
              onClick={() => setActiveTab('success')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'success' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-current={activeTab === 'success' ? 'page' : undefined}>

              Success Stories
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'faq' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}
              aria-current={activeTab === 'faq' ? 'page' : undefined}>

              FAQ
            </button>
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === 'overview' &&
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 p-8 md:p-12">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Share Your Voice with the World
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Join Day.News Local Voices and turn your passion into a
                    podcast. Reach your community, build an audience, and even
                    monetize your content.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 bg-news-primary rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <p className="ml-3 text-gray-700">
                        <span className="font-medium">Easy setup</span> - No
                        technical experience required
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 bg-news-primary rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <p className="ml-3 text-gray-700">
                        <span className="font-medium">Built-in audience</span> -
                        Connect with your local community
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 bg-news-primary rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <p className="ml-3 text-gray-700">
                        <span className="font-medium">Monetization tools</span>{' '}
                        - Turn your passion into income
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                    onClick={() => setActiveTab('register')}
                    className="px-6 py-3 bg-news-primary text-white font-medium rounded-lg hover:bg-news-primary-dark transition-colors"
                    aria-label="Get started as a creator">

                      Get Started
                    </button>
                    <button
                    onClick={() => setActiveTab('features')}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Learn more about creator features">

                      Learn More
                    </button>
                  </div>
                </div>
                <div className="lg:w-1/2 relative min-h-[300px]">
                  <img
                  src="https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=900&q=80"
                  alt="Podcast recording setup"
                  className="absolute inset-0 w-full h-full object-cover" />

                  <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="bg-white bg-opacity-90 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-gray-600">
                        Join over 5,000 creators already on our platform
                      </p>
                      <div className="mt-2 flex -space-x-2 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map((i) =>
                      <img
                        key={i}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 20}.jpg`}
                        alt="Creator avatar" />

                      )}
                        <span className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-xs font-medium text-gray-700">
                          +4.9k
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* How It Works */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-news-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-news-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    1. Create Your Account
                  </h3>
                  <p className="text-gray-600">
                    Sign up in minutes and set up your creator profile with
                    details about your podcast and yourself.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-news-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="h-8 w-8 text-news-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    2. Upload Your Content
                  </h3>
                  <p className="text-gray-600">
                    Record your podcast episodes and upload them to our platform
                    with just a few clicks.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-news-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-news-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    3. Grow Your Audience
                  </h3>
                  <p className="text-gray-600">
                    Connect with listeners, analyze your performance, and use
                    our tools to expand your reach.
                  </p>
                </div>
              </div>
              <div className="mt-12 text-center">
                <button
                onClick={() => setActiveTab('register')}
                className="px-6 py-3 bg-news-primary text-white font-medium rounded-lg hover:bg-news-primary-dark transition-colors"
                aria-label="Start creating your podcast">

                  Start Creating
                </button>
              </div>
            </section>
            {/* Sample Episodes */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Sample Episodes
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Listen to these sample episodes to get a feel for what you can
                create
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sampleEpisodes.map((episode) =>
              <div
                key={episode.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">

                    <div className="relative aspect-square">
                      <img
                    src={episode.image}
                    alt={episode.title}
                    className="w-full h-full object-cover" />

                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                      className="w-14 h-14 bg-news-primary rounded-full flex items-center justify-center"
                      aria-label={`Play episode: ${episode.title}`}
                      onClick={() =>
                      togglePlayback(episode.id, episode.audioUrl)
                      }>

                          {currentPlayingEpisode === episode.id && isPlaying ?
                      <Pause className="h-7 w-7 text-white" /> :

                      <Play className="h-7 w-7 text-white" fill="white" />
                      }
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {episode.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {episode.duration} • {episode.publishDate}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {episode.description}
                      </p>
                      <button
                    className="w-full py-2 bg-news-primary text-white text-sm font-medium rounded-md hover:bg-news-primary-dark transition-colors"
                    aria-label={`Play episode: ${episode.title}`}
                    onClick={() =>
                    togglePlayback(episode.id, episode.audioUrl)
                    }>

                        {currentPlayingEpisode === episode.id && isPlaying ?
                    'Pause' :
                    'Play'}
                      </button>
                    </div>
                  </div>
              )}
              </div>
            </section>
            {/* Subscription Plans */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 text-center mb-8">
                We offer flexible plans to match your podcasting needs
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subscriptionPlans.map((plan) =>
              <div
                key={plan.id}
                className={`border ${plan.recommended ? 'border-news-primary' : 'border-gray-200'} rounded-xl overflow-hidden hover:shadow-md transition-shadow relative`}>

                    {plan.recommended &&
                <div className="absolute top-0 right-0 bg-news-primary text-white px-4 py-1 text-sm font-medium">
                        Recommended
                      </div>
                }
                    <div
                  className={`p-6 ${plan.recommended ? 'bg-news-primary-light' : 'bg-white'}`}>

                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline mb-4">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 ml-1">/month</span>
                      </div>
                      <button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setActiveTab('register');
                    }}
                    className={`w-full py-2 ${plan.recommended ? 'bg-news-primary text-white hover:bg-news-primary-dark' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm font-medium rounded-md transition-colors`}
                    aria-label={`Select ${plan.name} plan`}>

                        {plan.price === 0 ? 'Start Free' : 'Select Plan'}
                      </button>
                    </div>
                    <div className="p-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Features:
                      </h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) =>
                    <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                            <span className="text-sm text-gray-600">
                              {feature}
                            </span>
                          </li>
                    )}
                      </ul>
                      {plan.limitations.length > 0 &&
                  <>
                          <h4 className="font-medium text-gray-900 mt-6 mb-4">
                            Limitations:
                          </h4>
                          <ul className="space-y-3">
                            {plan.limitations.map((limitation, index) =>
                      <li key={index} className="flex items-start">
                                <X className="h-5 w-5 text-red-500 flex-shrink-0 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {limitation}
                                </span>
                              </li>
                      )}
                          </ul>
                        </>
                  }
                    </div>
                  </div>
              )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-8">
                All plans include a 14-day free trial. No credit card required
                to start.
              </p>
            </section>
            {/* CTA Banner */}
            <section className="bg-news-primary rounded-xl shadow-sm overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Ready to Share Your Voice?
                  </h2>
                  <p className="text-white text-opacity-90 mb-8">
                    Join thousands of creators who are building audiences and
                    sharing their passions on Day.News Local Voices.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                    onClick={() => setActiveTab('register')}
                    className="px-6 py-3 bg-white text-news-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Get started as a creator">

                      Get Started Now
                    </button>
                    <button
                    onClick={() => setActiveTab('success')}
                    className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                    aria-label="View creator success stories">

                      See Success Stories
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        }
        {activeTab === 'register' &&
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Become a Creator
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Fill out the form below to start your creator journey
              </p>
              {/* Progress Steps */}
              <div className="mb-12">
                <div className="flex justify-between items-center relative">
                  <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
                  {registrationSteps.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted =
                  registrationSteps.findIndex((s) => s.id === currentStep) >
                  index;
                  return (
                    <div
                      key={step.id}
                      className="relative z-10 flex flex-col items-center">

                        <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-news-primary text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-500'}`}>

                          {isCompleted ?
                        <Check className="h-5 w-5" /> :

                        <step.icon className="h-5 w-5" />
                        }
                        </div>
                        <span
                        className={`mt-2 text-sm font-medium ${isActive ? 'text-news-primary' : isCompleted ? 'text-green-500' : 'text-gray-500'}`}>

                          {step.title}
                        </span>
                      </div>);

                })}
                </div>
              </div>
              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                {/* Account Setup Step */}
                {currentStep === 'account' &&
              <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Account Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1">

                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                      aria-invalid={!!validationErrors.firstName}
                      aria-describedby={
                      validationErrors.firstName ?
                      'firstName-error' :
                      undefined
                      } />

                        {validationErrors.firstName &&
                    <p
                      id="firstName-error"
                      className="mt-1 text-sm text-red-500">

                            {validationErrors.firstName}
                          </p>
                    }
                      </div>
                      <div>
                        <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1">

                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                      aria-invalid={!!validationErrors.lastName}
                      aria-describedby={
                      validationErrors.lastName ?
                      'lastName-error' :
                      undefined
                      } />

                        {validationErrors.lastName &&
                    <p
                      id="lastName-error"
                      className="mt-1 text-sm text-red-500">

                            {validationErrors.lastName}
                          </p>
                    }
                      </div>
                    </div>
                    <div>
                      <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1">

                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                    aria-invalid={!!validationErrors.email}
                    aria-describedby={
                    validationErrors.email ? 'email-error' : undefined
                    } />

                      {validationErrors.email &&
                  <p
                    id="email-error"
                    className="mt-1 text-sm text-red-500">

                          {validationErrors.email}
                        </p>
                  }
                    </div>
                    <div>
                      <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1">

                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                    aria-invalid={!!validationErrors.password}
                    aria-describedby={
                    validationErrors.password ?
                    'password-error' :
                    'password-desc'
                    } />

                      {validationErrors.password ?
                  <p
                    id="password-error"
                    className="mt-1 text-sm text-red-500">

                          {validationErrors.password}
                        </p> :

                  <p
                    id="password-desc"
                    className="mt-1 text-xs text-gray-500">

                          Password must be at least 8 characters long.
                        </p>
                  }
                    </div>
                    <div>
                      <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1">

                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                    aria-invalid={!!validationErrors.confirmPassword}
                    aria-describedby={
                    validationErrors.confirmPassword ?
                    'confirmPassword-error' :
                    undefined
                    } />

                      {validationErrors.confirmPassword &&
                  <p
                    id="confirmPassword-error"
                    className="mt-1 text-sm text-red-500">

                          {validationErrors.confirmPassword}
                        </p>
                  }
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                          id="agreeTerms"
                          name="agreeTerms"
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={handleInputChange}
                          className={`h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary ${validationErrors.agreeTerms ? 'border-red-500' : ''}`}
                          aria-invalid={!!validationErrors.agreeTerms} />

                          </div>
                          <div className="ml-3 text-sm">
                            <label
                          htmlFor="agreeTerms"
                          className={`font-medium ${validationErrors.agreeTerms ? 'text-red-500' : 'text-gray-700'}`}>

                              I agree to the{' '}
                              <a
                            href="/terms"
                            className="text-news-primary hover:underline">

                                Terms of Service
                              </a>{' '}
                              <span className="text-red-500">*</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                          id="agreePrivacy"
                          name="agreePrivacy"
                          type="checkbox"
                          checked={formData.agreePrivacy}
                          onChange={handleInputChange}
                          className={`h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary ${validationErrors.agreePrivacy ? 'border-red-500' : ''}`}
                          aria-invalid={!!validationErrors.agreePrivacy} />

                          </div>
                          <div className="ml-3 text-sm">
                            <label
                          htmlFor="agreePrivacy"
                          className={`font-medium ${validationErrors.agreePrivacy ? 'text-red-500' : 'text-gray-700'}`}>

                              I agree to the{' '}
                              <a
                            href="/privacy"
                            className="text-news-primary hover:underline">

                                Privacy Policy
                              </a>{' '}
                              <span className="text-red-500">*</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                          id="receiveUpdates"
                          name="receiveUpdates"
                          type="checkbox"
                          checked={formData.receiveUpdates}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                          </div>
                          <div className="ml-3 text-sm">
                            <label
                          htmlFor="receiveUpdates"
                          className="font-medium text-gray-700">

                              I'd like to receive updates about new features and
                              creator tips
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              }
                {/* Creator Profile Step */}
                {currentStep === 'profile' &&
              <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Creator Profile
                    </h2>
                    <div>
                      <label
                    htmlFor="podcastName"
                    className="block text-sm font-medium text-gray-700 mb-1">

                        Podcast/Show Name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                    type="text"
                    id="podcastName"
                    name="podcastName"
                    value={formData.podcastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.podcastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                    aria-invalid={!!validationErrors.podcastName}
                    aria-describedby={
                    validationErrors.podcastName ?
                    'podcastName-error' :
                    undefined
                    } />

                      {validationErrors.podcastName &&
                  <p
                    id="podcastName-error"
                    className="mt-1 text-sm text-red-500">

                          {validationErrors.podcastName}
                        </p>
                  }
                    </div>
                    <div>
                      <label
                    htmlFor="tagline"
                    className="block text-sm font-medium text-gray-700 mb-1">

                        Tagline <span className="text-red-500">*</span>
                      </label>
                      <input
                    type="text"
                    id="tagline"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.tagline ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                    aria-invalid={!!validationErrors.tagline}
                    aria-describedby={
                    validationErrors.tagline ?
                    'tagline-error' :
                    'tagline-desc'
                    }
                    maxLength={100} />

                      {validationErrors.tagline ?
                  <p
                    id="tagline-error"
                    className="mt-1 text-sm text-red-500">

                          {validationErrors.tagline}
                        </p> :

                  <p
                    id="tagline-desc"
                    className="mt-1 text-xs text-gray-500">

                          A short description that appears under your podcast
                          name. Max 100 characters.
                          <span className="ml-1 text-gray-400">
                            {formData.tagline.length}/100
                          </span>
                        </p>
                  }
                    </div>
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
                    className={`w-full px-3 py-2 border ${validationErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary bg-white`}
                    aria-invalid={!!validationErrors.category}
                    aria-describedby={
                    validationErrors.category ?
                    'category-error' :
                    undefined
                    }>

                        <option value="">Select a category</option>
                        {categories.map((category) =>
                    <option key={category} value={category}>
                            {category}
                          </option>
                    )}
                      </select>
                      {validationErrors.category &&
                  <p
                    id="category-error"
                    className="mt-1 text-sm text-red-500">

                          {validationErrors.category}
                        </p>
                  }
                    </div>
                    <div>
                      <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1">

                        Bio <span className="text-red-500">*</span>
                      </label>
                      <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={5}
                    className={`w-full px-3 py-2 border ${validationErrors.bio ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                    aria-invalid={!!validationErrors.bio}
                    aria-describedby={
                    validationErrors.bio ? 'bio-error' : 'bio-desc'
                    }>
                  </textarea>
                      {validationErrors.bio ?
                  <p id="bio-error" className="mt-1 text-sm text-red-500">
                          {validationErrors.bio}
                        </p> :

                  <p id="bio-desc" className="mt-1 text-xs text-gray-500">
                          Tell listeners about your podcast, your background,
                          and what they can expect from your content.
                        </p>
                  }
                    </div>
                    <div>
                      <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1">

                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                    placeholder="City, State"
                    aria-invalid={!!validationErrors.location}
                    aria-describedby={
                    validationErrors.location ?
                    'location-error' :
                    undefined
                    } />

                      {validationErrors.location &&
                  <p
                    id="location-error"
                    className="mt-1 text-sm text-red-500">

                          {validationErrors.location}
                        </p>
                  }
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Profile Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profile Image
                        </label>
                        <div className="flex items-center">
                          <div className="h-24 w-24 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                            {formData.profileImagePreview ?
                        <img
                          src={formData.profileImagePreview}
                          alt="Profile"
                          className="h-full w-full object-cover" /> :


                        <User className="h-12 w-12 text-gray-400" />
                        }
                          </div>
                          <div className="ml-5">
                            <input
                          type="file"
                          id="profileImage"
                          ref={profileImageRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                          handleFileChange(e, 'profileImage')
                          } />

                            <button
                          type="button"
                          onClick={() => profileImageRef.current?.click()}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                          aria-label="Upload profile image">

                              <Upload className="h-4 w-4 mr-1" />
                              Upload Image
                            </button>
                            <p className="mt-1 text-xs text-gray-500">
                              Recommended: Square, at least 400x400px
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Banner Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Banner Image
                        </label>
                        <div className="flex items-center">
                          <div className="h-24 w-36 rounded-md overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                            {formData.bannerImagePreview ?
                        <img
                          src={formData.bannerImagePreview}
                          alt="Banner"
                          className="h-full w-full object-cover" /> :


                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        }
                          </div>
                          <div className="ml-5">
                            <input
                          type="file"
                          id="bannerImage"
                          ref={bannerImageRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                          handleFileChange(e, 'bannerImage')
                          } />

                            <button
                          type="button"
                          onClick={() => bannerImageRef.current?.click()}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                          aria-label="Upload banner image">

                              <Upload className="h-4 w-4 mr-1" />
                              Upload Banner
                            </button>
                            <p className="mt-1 text-xs text-gray-500">
                              Recommended: 1920x400px
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Social Media (Optional)
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label
                        htmlFor="website"
                        className="block text-sm font-medium text-gray-700 mb-1">

                            Website
                          </label>
                          <div className="flex items-center">
                            <div className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 py-2">
                              <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                          type="url"
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                          </div>
                        </div>
                        <div>
                          <label
                        htmlFor="instagram"
                        className="block text-sm font-medium text-gray-700 mb-1">

                            Instagram
                          </label>
                          <div className="flex items-center">
                            <div className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 py-2">
                              <Instagram className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                          type="text"
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          placeholder="yourusername"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                          </div>
                        </div>
                        <div>
                          <label
                        htmlFor="twitter"
                        className="block text-sm font-medium text-gray-700 mb-1">

                            Twitter
                          </label>
                          <div className="flex items-center">
                            <div className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 py-2">
                              <Twitter className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                          type="text"
                          id="twitter"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleInputChange}
                          placeholder="yourusername"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                          htmlFor="facebook"
                          className="block text-sm font-medium text-gray-700 mb-1">

                              Facebook
                            </label>
                            <div className="flex items-center">
                              <div className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 py-2">
                                <Facebook className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                            type="text"
                            id="facebook"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleInputChange}
                            placeholder="yourpage"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                            </div>
                          </div>
                          <div>
                            <label
                          htmlFor="youtube"
                          className="block text-sm font-medium text-gray-700 mb-1">

                              YouTube
                            </label>
                            <div className="flex items-center">
                              <div className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 py-2">
                                <Youtube className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                            type="text"
                            id="youtube"
                            name="youtube"
                            value={formData.youtube}
                            onChange={handleInputChange}
                            placeholder="yourchannel"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary" />

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              }
                {/* Select Plan Step */}
                {currentStep === 'plan' &&
              <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Select Your Plan
                    </h2>
                    {validationErrors.plan &&
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p className="text-sm">{validationErrors.plan}</p>
                      </div>
                }
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {subscriptionPlans.map((plan) =>
                  <div
                    key={plan.id}
                    className={`border ${selectedPlan === plan.id ? 'border-news-primary ring-2 ring-news-primary-light' : 'border-gray-200'} rounded-xl overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer`}
                    onClick={() => handlePlanSelect(plan.id)}>

                          {plan.recommended &&
                    <div className="absolute top-0 right-0 bg-news-primary text-white px-4 py-1 text-sm font-medium">
                              Recommended
                            </div>
                    }
                          <div
                      className={`p-6 ${selectedPlan === plan.id ? 'bg-news-primary-light' : plan.recommended ? 'bg-gray-50' : 'bg-white'}`}>

                            <div className="flex items-center mb-2">
                              <div
                          className={`h-5 w-5 rounded-full border ${selectedPlan === plan.id ? 'border-news-primary bg-news-primary' : 'border-gray-300 bg-white'} mr-2 flex items-center justify-center`}>

                                {selectedPlan === plan.id &&
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                          }
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {plan.name}
                              </h3>
                            </div>
                            <div className="flex items-baseline mb-4">
                              <span className="text-2xl font-bold text-gray-900">
                                ${plan.price}
                              </span>
                              <span className="text-gray-600 ml-1">/month</span>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 mb-4">
                              {plan.features.
                        slice(0, 3).
                        map((feature, index) =>
                        <li key={index} className="flex items-start">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                        )}
                              {plan.features.length > 3 &&
                        <li className="text-news-primary hover:text-news-primary-dark font-medium cursor-pointer">
                                  + {plan.features.length - 3} more features
                                </li>
                        }
                            </ul>
                          </div>
                        </div>
                  )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-8">
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-gray-500" />
                        All plans include:
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          14-day free trial
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Cancel anytime
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Custom profile page
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          Distribution to major platforms
                        </li>
                      </ul>
                    </div>
                  </div>
              }
                {/* Review & Submit Step */}
                {currentStep === 'review' &&
              <div className="space-y-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Review & Submit
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="font-medium text-gray-900">
                            {formData.firstName} {formData.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">
                            {formData.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Creator Profile
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="text-gray-500">Podcast Name</p>
                          <p className="font-medium text-gray-900">
                            {formData.podcastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="font-medium text-gray-900">
                            {formData.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tagline</p>
                          <p className="font-medium text-gray-900">
                            {formData.tagline}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">
                            {formData.location}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-500">Bio</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {formData.bio}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-6 mt-6">
                        {formData.profileImagePreview &&
                    <div>
                            <p className="text-gray-500 mb-2">Profile Image</p>
                            <img
                        src={formData.profileImagePreview}
                        alt="Profile"
                        className="h-16 w-16 rounded-full object-cover border border-gray-200" />

                          </div>
                    }
                        {formData.bannerImagePreview &&
                    <div>
                            <p className="text-gray-500 mb-2">Banner Image</p>
                            <img
                        src={formData.bannerImagePreview}
                        alt="Banner"
                        className="h-16 w-32 rounded object-cover border border-gray-200" />

                          </div>
                    }
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Selected Plan
                      </h3>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-news-primary-light flex items-center justify-center mr-4">
                          <CreditCard className="h-5 w-5 text-news-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {subscriptionPlans.find(
                          (plan) => plan.id === selectedPlan
                        )?.name || 'No plan selected'}{' '}
                            Plan
                          </p>
                          <p className="text-sm text-gray-500">
                            $
                            {subscriptionPlans.find(
                          (plan) => plan.id === selectedPlan
                        )?.price || 0}
                            /month after 14-day free trial
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Info className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-blue-800">
                            What happens next?
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>After submitting your registration:</p>
                            <ol className="list-decimal pl-5 mt-1 space-y-1">
                              <li>
                                You'll receive a confirmation email with your
                                account details
                              </li>
                              <li>
                                Your 14-day free trial will begin immediately
                              </li>
                              <li>
                                You'll be taken to your creator dashboard where
                                you can upload your first episode
                              </li>
                              <li>
                                No credit card will be charged until your trial
                                ends
                              </li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              }
                {/* Form Navigation */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                  {currentStep !== registrationSteps[0].id ?
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  aria-label="Go back to previous step">

                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </button> :

                <div></div>
                }
                  {currentStep !==
                registrationSteps[registrationSteps.length - 1].id ?
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-news-primary hover:bg-news-primary-dark border border-transparent rounded-md text-sm font-medium text-white flex items-center transition-colors"
                  aria-label="Continue to next step">

                      Continue
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button> :

                <button
                  type="submit"
                  className="px-6 py-2 bg-news-primary hover:bg-news-primary-dark border border-transparent rounded-md text-sm font-medium text-white flex items-center transition-colors"
                  disabled={isLoading}
                  aria-label="Complete registration">

                      {isLoading ?
                  <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Processing...
                        </> :

                  <>
                          Complete Registration
                          <CheckCircle className="h-4 w-4 ml-2" />
                        </>
                  }
                    </button>
                }
                </div>
              </form>
            </div>
          </div>
        }
        {activeTab === 'features' &&
        <div className="space-y-12">
            {/* Features Overview */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Creator Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-news-primary-light rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-news-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Easy Publishing
                  </h3>
                  <p className="text-gray-600">
                    Upload audio files, add episode details, and publish with
                    just a few clicks. No technical expertise required.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-news-primary-light rounded-full flex items-center justify-center mb-4">
                    <ChartBar className="h-8 w-8 text-news-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Detailed Analytics
                  </h3>
                  <p className="text-gray-600">
                    Track listener engagement, geographic distribution, and
                    content performance to optimize your podcast.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-news-primary-light rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-news-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Monetization Tools
                  </h3>
                  <p className="text-gray-600">
                    Accept tips, create premium content, and connect with
                    sponsors to generate income from your podcast.
                  </p>
                </div>
              </div>
            </section>
            {/* Feature Showcase */}
            <section className="space-y-12">
              {/* Publishing Tools */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Powerful Publishing Tools
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Our intuitive dashboard makes it easy to upload, schedule,
                      and manage your podcast episodes.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">Bulk uploads</span> -
                          Add multiple episodes at once
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">
                            Auto-transcription
                          </span>{' '}
                          - Generate text versions of your episodes
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">
                            Episode scheduling
                          </span>{' '}
                          - Plan your content calendar in advance
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">Distribution</span> -
                          Automatically publish to major podcast platforms
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:w-1/2 bg-gray-100 p-8 flex items-center justify-center">
                    <img
                    src="https://images.unsplash.com/photo-1593697972679-c4041d132a46?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
                    alt="Podcast publishing dashboard"
                    className="rounded-lg shadow-md max-w-full h-auto" />

                  </div>
                </div>
              </div>
              {/* Analytics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col lg:flex-row-reverse">
                  <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Comprehensive Analytics
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Gain valuable insights into your audience and content
                      performance with our detailed analytics dashboard.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">
                            Listener demographics
                          </span>{' '}
                          - Understand who's tuning in
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">
                            Episode performance
                          </span>{' '}
                          - Track plays, completion rates, and shares
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">Audience growth</span> -
                          Monitor follower trends over time
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">Revenue tracking</span>{' '}
                          - Measure monetization performance
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:w-1/2 bg-gray-100 p-8 flex items-center justify-center">
                    <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
                    alt="Analytics dashboard"
                    className="rounded-lg shadow-md max-w-full h-auto" />

                  </div>
                </div>
              </div>
              {/* Monetization */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Multiple Monetization Options
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Turn your passion into income with our suite of
                      monetization tools designed for podcasters.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">Listener tips</span> -
                          Accept one-time or recurring donations
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">Premium content</span> -
                          Offer exclusive episodes to paying subscribers
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">
                            Sponsor marketplace
                          </span>{' '}
                          - Connect with brands interested in your audience
                        </p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">
                          <span className="font-medium">
                            Merchandise integration
                          </span>{' '}
                          - Sell branded products to your fans
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:w-1/2 bg-gray-100 p-8 flex items-center justify-center">
                    <img
                    src="https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80"
                    alt="Monetization tools"
                    className="rounded-lg shadow-md max-w-full h-auto" />

                  </div>
                </div>
              </div>
            </section>
            {/* Feature Comparison */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Feature Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Feature
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Hobby
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-news-primary uppercase tracking-wider bg-news-primary-light">

                        Creator
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Professional
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Episodes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Up to 3
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium bg-news-primary-light">
                        Up to 50
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Unlimited
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Storage
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        100MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium bg-news-primary-light">
                        1GB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Unlimited
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Analytics
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Basic
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium bg-news-primary-light">
                        Advanced
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Premium
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Monetization
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <X className="h-5 w-5 mx-auto text-red-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium bg-news-primary-light">
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Custom Domain
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <X className="h-5 w-5 mx-auto text-red-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium bg-news-primary-light">
                        <X className="h-5 w-5 mx-auto text-red-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Support
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Community
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium bg-news-primary-light">
                        Email
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Priority
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Team Members
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        1
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium bg-news-primary-light">
                        1
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Up to 5
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-8 text-center">
                <button
                onClick={() => setActiveTab('register')}
                className="px-6 py-3 bg-news-primary text-white font-medium rounded-lg hover:bg-news-primary-dark transition-colors"
                aria-label="Get started as a creator">

                  Get Started Now
                </button>
              </div>
            </section>
          </div>
        }
        {activeTab === 'success' &&
        <div className="space-y-12">
            {/* Success Stories */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Creator Success Stories
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Meet some of the creators who have built successful podcasts on
                our platform. Learn how they grew their audience and turned
                their passion into a thriving podcast.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {successStories.map((story) =>
              <div
                key={story.id}
                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">

                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <img
                      src={story.image}
                      alt={story.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm" />

                        <div className="ml-4">
                          <h3 className="font-bold text-gray-900">
                            {story.name}
                          </h3>
                          <p className="text-sm text-news-primary">
                            {story.podcastName}
                          </p>
                        </div>
                      </div>
                      <blockquote className="text-gray-700 italic mb-6">
                        "{story.quote}"
                      </blockquote>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-500">Category</p>
                            <p className="font-medium text-gray-900">
                              {story.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Followers</p>
                            <p className="font-medium text-gray-900">
                              {story.followers.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monthly Listens</p>
                            <p className="font-medium text-gray-900">
                              {story.monthlyListens.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </section>
            {/* Success Metrics */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Platform Success Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-news-primary mb-2">
                    5,000+
                  </div>
                  <p className="text-gray-700">Active Creators</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-news-primary mb-2">
                    2.5M+
                  </div>
                  <p className="text-gray-700">Monthly Listeners</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-news-primary mb-2">
                    12,000+
                  </div>
                  <p className="text-gray-700">Podcasts Published</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-news-primary mb-2">
                    $850K+
                  </div>
                  <p className="text-gray-700">Creator Earnings</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Average Growth for Active Creators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3" />

                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray="78, 100" />

                        <text
                        x="18"
                        y="20.5"
                        textAnchor="middle"
                        fill="#3B82F6"
                        fontSize="10"
                        fontWeight="bold">

                          78%
                        </text>
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">
                      Audience Growth
                    </h4>
                    <p className="text-sm text-gray-600">
                      Average monthly listener growth in first year
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3" />

                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray="65, 100" />

                        <text
                        x="18"
                        y="20.5"
                        textAnchor="middle"
                        fill="#10B981"
                        fontSize="10"
                        fontWeight="bold">

                          65%
                        </text>
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">
                      Engagement Rate
                    </h4>
                    <p className="text-sm text-gray-600">
                      Average episode completion rate
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3" />

                        <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeDasharray="42, 100" />

                        <text
                        x="18"
                        y="20.5"
                        textAnchor="middle"
                        fill="#F59E0B"
                        fontSize="10"
                        fontWeight="bold">

                          42%
                        </text>
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">Monetization</h4>
                    <p className="text-sm text-gray-600">
                      Creators who earn income within 6 months
                    </p>
                  </div>
                </div>
              </div>
            </section>
            {/* Testimonial Carousel */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                What Creators Are Saying
              </h2>
              <div className="relative overflow-hidden">
                <div className="flex space-x-8 overflow-x-auto pb-6 scrollbar-hide">
                  {[1, 2, 3, 4, 5].map((i) =>
                <div
                  key={i}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">

                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
                        <div className="flex items-center mb-4">
                          <div className="flex">
                            {[...Array(5)].map((_, j) =>
                        <Star
                          key={j}
                          className="h-5 w-5 text-yellow-400 fill-yellow-400" />

                        )}
                          </div>
                        </div>
                        <blockquote className="text-gray-700 italic mb-6">
                          "The platform made it so easy to get started with
                          podcasting. I went from idea to published in just a
                          few days, and the built-in audience helped me grow
                          faster than I could have imagined."
                        </blockquote>
                        <div className="flex items-center mt-auto">
                          <img
                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 10}.jpg`}
                        alt="Creator"
                        className="h-10 w-10 rounded-full object-cover" />

                          <div className="ml-3">
                            <p className="font-medium text-gray-900">
                              Jamie Wilson
                            </p>
                            <p className="text-sm text-gray-500">
                              Tech Talk Weekly
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                )}
                </div>
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                  <button
                  className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100"
                  aria-label="Previous testimonial">

                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <button
                  className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100"
                  aria-label="Next testimonial">

                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </section>
            {/* CTA */}
            <section className="bg-news-primary rounded-xl shadow-sm overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Ready to Join Our Creator Community?
                  </h2>
                  <p className="text-white text-opacity-90 mb-8">
                    Start your podcasting journey today and join thousands of
                    successful creators on our platform.
                  </p>
                  <button
                  onClick={() => setActiveTab('register')}
                  className="px-8 py-3 bg-white text-news-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Start your creator journey">

                    Start Your Creator Journey
                  </button>
                </div>
              </div>
            </section>
          </div>
        }
        {activeTab === 'faq' &&
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Find answers to common questions about becoming a creator on
              Day.News Local Voices.
            </p>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) =>
            <div
              key={index}
              className={`border ${expandedFaq === `faq-${index}` ? 'border-news-primary bg-news-primary-light' : 'border-gray-200'} rounded-lg overflow-hidden`}>

                  <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() =>
                setExpandedFaq(
                  expandedFaq === `faq-${index}` ? null : `faq-${index}`
                )
                }
                aria-expanded={expandedFaq === `faq-${index}`}
                aria-controls={`faq-content-${index}`}>

                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    {expandedFaq === `faq-${index}` ?
                <ChevronUp className="h-5 w-5 text-gray-500" /> :

                <ChevronDown className="h-5 w-5 text-gray-500" />
                }
                  </button>
                  <div
                id={`faq-content-${index}`}
                className={`px-6 pb-4 ${expandedFaq === `faq-${index}` ? 'block' : 'hidden'}`}>

                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
            )}
            </div>
            <div className="mt-12 max-w-3xl mx-auto bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-news-primary" />
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you with any questions you
                might have about becoming a creator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                href="mailto:support@day.news"
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center">

                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </a>
                <Link
                to="/help"
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center">

                  <FileText className="h-4 w-4 mr-2" />
                  Knowledge Base
                </Link>
                <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                onClick={() =>
                alert('Live chat is available Monday-Friday, 9am-5pm EST')
                }>

                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat
                </button>
              </div>
            </div>
          </div>
        }
      </main>
      {/* Success Modal */}
      {showSuccessModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          role="dialog"
          aria-labelledby="success-title"
          aria-describedby="success-description">

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3
              id="success-title"
              className="text-lg font-bold text-gray-900 mb-2">

                Registration Successful!
              </h3>
              <p id="success-description" className="text-gray-600 mb-6">
                Your creator account has been created and your 14-day free trial
                has begun. Check your email for login details and next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                onClick={() => navigate('/local-voices/dashboard')}
                className="px-4 py-2 bg-news-primary text-white font-medium rounded-md hover:bg-news-primary-dark transition-colors"
                aria-label="Go to dashboard">

                  Go to Dashboard
                </button>
                <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                aria-label="Close this dialog">

                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};
// Additional icon component needed
function ChartBar(props: React.SVGProps<SVGSVGElement>) {
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

      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>);

}
function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
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

      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>);

}
export default CreatorRegistrationPage;