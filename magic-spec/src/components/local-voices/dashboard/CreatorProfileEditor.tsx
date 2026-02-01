import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Settings,
  Upload,
  Save,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Edit,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  MapPin,
  Calendar,
  Mic,
  Link as LinkIcon,
  Share2,
  Check,
  Trash2,
  Eye,
  Bell,
  Info,
  AlertCircle,
  CheckCircle,
  Loader,
  Image as ImageIcon,
  FileText,
  Headphones,
  MessageSquare,
  Coffee,
  DollarSign,
  Plus,
  ExternalLink,
  Rss,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  LogOut,
  HelpCircle,
  CreditCard,
} from 'lucide-react'
// Mock data - would come from API in real implementation
const mockUserData = {
  id: 'user123',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  subscription: {
    tier: 'professional_broadcaster',
    status: 'active',
    podcastLimit: 5,
    currentPodcastCount: 2,
  },
  notifications: [
    {
      id: 'notif1',
      type: 'performance',
      title: 'Performance Milestone',
      message:
        'Your podcast "The Clearwater Report" has reached 45,000 total listens!',
      date: '2023-11-10T10:23:00Z',
      read: false,
    },
    {
      id: 'notif2',
      type: 'comment',
      title: 'New Comment',
      message:
        'Sarah Johnson commented on your episode "Interview with Mayor Johnson"',
      date: '2023-11-09T15:48:00Z',
      read: false,
    },
    {
      id: 'notif3',
      type: 'system',
      title: 'System Update',
      message: 'New analytics features are now available in your dashboard',
      date: '2023-11-08T09:30:00Z',
      read: true,
    },
    {
      id: 'notif4',
      type: 'share',
      title: 'Content Shared',
      message:
        'Your episode "Downtown Redevelopment Special" was shared 25 times yesterday',
      date: '2023-11-07T11:15:00Z',
      read: true,
    },
  ],
}
// Mock creator profile data
const mockCreatorData = {
  id: 'creator123',
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
  rss_feed: 'https://feeds.megaphone.fm/clearwaterreport',
  slug: 'clearwater-report',
  donation_options: ['venmo', 'cashapp', 'patreon', 'buymeacoffee'],
}
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
  'Other',
]
// Sample episodes for preview player
const sampleEpisodes = [
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    status: 'published',
    tags: ['City Council', 'Local Government', 'Development'],
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    status: 'published',
    tags: ['Downtown', 'Development', 'Business'],
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    status: 'published',
    tags: ['Mayor', 'Interview', 'Politics'],
  },
]
const CreatorProfileEditor: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({ ...mockCreatorData })
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false)
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(
    mockUserData.notifications.filter((n) => !n.read).length,
  )
  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<
    string | null
  >(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [expandedBio, setExpandedBio] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showSocialLinkInput, setShowSocialLinkInput] = useState<string | null>(
    null,
  )
  const [newSocialLink, setNewSocialLink] = useState('')
  const [showDonationInput, setShowDonationInput] = useState<string | null>(
    null,
  )
  const [newDonationHandle, setNewDonationHandle] = useState('')
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const profileImageRef = useRef<HTMLInputElement>(null)
  const bannerImageRef = useRef<HTMLInputElement>(null)
  // Initialize form data
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call to fetch creator data
    setTimeout(() => {
      setFormData({ ...mockCreatorData })
      setIsLoading(false)
    }, 1000)
  }, [])
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setUnsavedChanges(true)
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }
  // Handle tag changes
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value
    const tagsArray = tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag)
    setFormData((prev) => ({ ...prev, tags: tagsArray }))
    setUnsavedChanges(true)
  }
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
    setUnsavedChanges(true)
  }
  // Handle donation options changes
  const handleDonationOptionChange = (option: string, checked: boolean) => {
    setFormData((prev) => {
      const currentOptions = [...prev.donation_options]
      if (checked && !currentOptions.includes(option)) {
        return { ...prev, donation_options: [...currentOptions, option] }
      } else if (!checked && currentOptions.includes(option)) {
        return {
          ...prev,
          donation_options: currentOptions.filter((opt) => opt !== option),
        }
      }
      return prev
    })
    setUnsavedChanges(true)
  }
  // Handle profile image upload
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setFormData((prev) => ({
            ...prev,
            profile_image_url: event.target!.result as string,
          }))
          setUnsavedChanges(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  // Handle banner image upload
  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setFormData((prev) => ({
            ...prev,
            banner_image_url: event.target!.result as string,
          }))
          setUnsavedChanges(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  // Handle tab change
  const handleTabChange = (tab: string) => {
    if (unsavedChanges) {
      setPendingTabChange(tab)
      setShowUnsavedChangesModal(true)
    } else {
      setActiveTab(tab)
    }
  }
  // Validate form before saving
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.display_name.trim()) {
      errors.display_name = 'Display name is required'
    }
    if (!formData.tagline.trim()) {
      errors.tagline = 'Tagline is required'
    } else if (formData.tagline.length > 100) {
      errors.tagline = 'Tagline must be 100 characters or less'
    }
    if (!formData.bio.trim()) {
      errors.bio = 'Bio is required'
    }
    if (!formData.category) {
      errors.category = 'Category is required'
    }
    if (!formData.location_display.trim()) {
      errors.location_display = 'Location is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    // Validate social media URLs
    const urlFields = [
      'website_url',
      'patreon_url',
      'instagram_url',
      'twitter_url',
      'facebook_url',
      'youtube_url',
      'rss_feed',
    ]
    urlFields.forEach((field) => {
      const value = formData[field as keyof typeof formData] as string
      if (
        value &&
        !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
          value,
        )
      ) {
        errors[field] = 'Please enter a valid URL'
      }
    })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      setError('Please fix the validation errors before saving.')
      return
    }
    setIsSaving(true)
    setError(null)
    // Simulate API call to save data
    setTimeout(() => {
      setIsSaving(false)
      setSuccess('Profile updated successfully!')
      setUnsavedChanges(false)
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    }, 1500)
  }
  // Handle social media link addition
  const handleAddSocialLink = (platform: string) => {
    if (newSocialLink) {
      setFormData((prev) => ({ ...prev, [`${platform}_url`]: newSocialLink }))
      setShowSocialLinkInput(null)
      setNewSocialLink('')
      setUnsavedChanges(true)
    }
  }
  // Handle donation handle addition
  const handleAddDonationHandle = (platform: string) => {
    if (newDonationHandle) {
      setFormData((prev) => ({
        ...prev,
        [`${platform}_handle`]: newDonationHandle,
      }))
      setShowDonationInput(null)
      setNewDonationHandle('')
      setUnsavedChanges(true)
    }
  }
  // Handle social media link removal
  const handleRemoveSocialLink = (platform: string) => {
    setFormData((prev) => ({ ...prev, [`${platform}_url`]: '' }))
    setUnsavedChanges(true)
  }
  // Handle donation handle removal
  const handleRemoveDonationHandle = (platform: string) => {
    setFormData((prev) => ({ ...prev, [`${platform}_handle`]: '' }))
    setUnsavedChanges(true)
  }
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  // Handle share profile
  const handleShareProfile = () => {
    const profileUrl = `https://day.news/local-voices/creator/${formData.slug}`
    navigator.clipboard.writeText(profileUrl)
    alert(`Profile link copied to clipboard: ${profileUrl}`)
    setShowShareMenu(false)
  }
  // Handle audio playback
  const togglePlayback = (episodeId: string, audioUrl: string) => {
    if (currentPlayingEpisode === episodeId) {
      // Toggle play/pause for current episode
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause()
        } else {
          audioRef.current.play().catch((error) => {
            console.error('Audio playback error:', error)
            setError('Failed to play audio. Please try again.')
          })
        }
        setIsPlaying(!isPlaying)
      }
    } else {
      // Start playing a new episode
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch((error) => {
          console.error('Audio playback error:', error)
          setError('Failed to play audio. Please try again.')
        })
        setCurrentPlayingEpisode(episodeId)
        setIsPlaying(true)
      }
    }
  }
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }
  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100
      } else {
        audioRef.current.volume = 0
      }
      setIsMuted(!isMuted)
    }
  }
  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    // In a real app, this would call an API
    const updatedNotifications = mockUserData.notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif,
    )
    // Update unread count
    setUnreadNotifications(updatedNotifications.filter((n) => !n.read).length)
  }
  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    // In a real app, this would call an API
    setUnreadNotifications(0)
  }
  // Format bio with paragraph breaks
  const formatBio = (bio: string) => {
    return bio.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    ))
  }
  // Get bio excerpt
  const getBioExcerpt = (bio: string, maxLength: number = 300) => {
    if (bio.length <= maxLength) return bio
    // Find the last space before maxLength to avoid cutting words
    const lastSpace = bio.substring(0, maxLength).lastIndexOf(' ')
    return bio.substring(0, lastSpace) + '...'
  }
  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentPlayingEpisode(null)
    }
    const handleError = () => {
      setError('There was an error playing this audio file.')
      setIsPlaying(false)
    }
    if (audio) {
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
      }
    }
  }, [])
  // Confirm before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [unsavedChanges])
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-news-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    )
  }
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
                aria-label="Day.News Homepage"
              >
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
                  aria-haspopup="true"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">
                        Notifications
                      </h3>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                          aria-label="Mark all as read"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {mockUserData.notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      mockUserData.notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-gray-100 last:border-0 ${notif.read ? 'bg-white' : 'bg-blue-50'}`}
                        >
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              {notif.type === 'performance' && (
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <ChartBar className="h-4 w-4 text-green-600" />
                                </div>
                              )}
                              {notif.type === 'comment' && (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                                </div>
                              )}
                              {notif.type === 'system' && (
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Info className="h-4 w-4 text-gray-600" />
                                </div>
                              )}
                              {notif.type === 'share' && (
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Share2 className="h-4 w-4 text-purple-600" />
                                </div>
                              )}
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
                                {!notif.read && (
                                  <button
                                    onClick={() =>
                                      markNotificationAsRead(notif.id)
                                    }
                                    className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                                    aria-label="Mark as read"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <Link
                        to="/notifications"
                        className="text-xs text-news-primary hover:text-news-primary-dark transition-colors"
                        aria-label="View all notifications"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              {/* User Menu */}
              <div className="relative user-menu" ref={userMenuRef}>
                <button
                  className="flex items-center group"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <img
                    src={mockUserData.avatar}
                    alt="User profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-news-primary transition-colors"
                  />
                  <ChevronDown
                    className={`h-4 w-4 ml-1 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`}
                  />
                </button>
                {showUserMenu && (
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <ChartBar className="h-4 w-4 mr-3 text-gray-500" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      Your Profile
                    </Link>
                    <Link
                      to="/local-voices/dashboard/subscription"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <CreditCard className="h-4 w-4 mr-3 text-gray-500" />
                      Subscription
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <Link
                      to="/help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Help Center
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        navigate('/')
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex items-center space-x-6 border-t border-gray-200 pt-4">
            <Link
              to="/local-voices/dashboard"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to dashboard overview"
            >
              Overview
            </Link>
            <Link
              to="/local-voices/dashboard/podcast"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to content page"
            >
              Content
            </Link>
            <Link
              to="/local-voices/dashboard/analytics"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to analytics page"
            >
              Analytics
            </Link>
            <Link
              to="/local-voices/dashboard/subscription"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to subscription page"
            >
              Subscription
            </Link>
            <Link
              to="/local-voices/dashboard/edit-profile"
              className="text-news-primary font-semibold"
              aria-current="page"
              aria-label="Currently on profile editor page"
            >
              Profile
            </Link>
            <Link
              to="/local-voices/dashboard/settings"
              className="text-gray-600 hover:text-news-primary font-medium transition-colors"
              aria-label="Go to settings page"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>
      {/* Now Playing Bar - Shows when audio is playing */}
      {currentPlayingEpisode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 z-20 shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {sampleEpisodes.find((ep) => ep.id === currentPlayingEpisode)
                  ?.image && (
                  <img
                    src={
                      sampleEpisodes.find(
                        (ep) => ep.id === currentPlayingEpisode,
                      )?.image
                    }
                    alt="Episode thumbnail"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                )}
                <button
                  onClick={() =>
                    togglePlayback(
                      currentPlayingEpisode,
                      sampleEpisodes.find(
                        (ep) => ep.id === currentPlayingEpisode,
                      )?.audioUrl || '',
                    )
                  }
                  className="h-10 w-10 rounded-full bg-news-primary flex items-center justify-center text-white hover:bg-news-primary-dark transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>
                <div>
                  <p className="font-medium text-gray-900">
                    {sampleEpisodes.find(
                      (ep) => ep.id === currentPlayingEpisode,
                    )?.title || 'Unknown Episode'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formData.display_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Volume control"
                  />
                </div>
                <button
                  onClick={() => {
                    setCurrentPlayingEpisode(null)
                    setIsPlaying(false)
                    if (audioRef.current) {
                      audioRef.current.pause()
                      audioRef.current.src = ''
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close player"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link
            to="/local-voices/dashboard"
            className="text-news-primary hover:text-news-primary-dark flex items-center text-sm font-medium transition-colors"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Creator Profile
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center transition-colors hover:bg-gray-50"
                aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center transition-colors hover:bg-gray-50"
                  aria-label="Share profile"
                  aria-expanded={showShareMenu}
                  aria-haspopup="true"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleShareProfile}
                    >
                      <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                      Copy profile link
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?url=https://day.news/local-voices/creator/${formData.slug}&text=Check out my podcast on Day.News!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Twitter className="h-4 w-4 mr-2 text-gray-500" />
                      Share on Twitter
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=https://day.news/local-voices/creator/${formData.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Facebook className="h-4 w-4 mr-2 text-gray-500" />
                      Share on Facebook
                    </a>
                  </div>
                )}
              </div>
              <Link
                to={`/local-voices/creator/${formData.slug}`}
                target="_blank"
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center transition-colors hover:bg-gray-50"
                aria-label="View public profile"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Profile
              </Link>
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            Customize how your profile appears to listeners and fans
          </p>
        </div>
        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start justify-between"
            role="alert"
          >
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
              aria-label="Dismiss error"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {/* Success Message */}
        {success && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start justify-between"
            role="alert"
          >
            <div className="flex">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Success</h3>
                <p className="text-sm">{success}</p>
              </div>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-700"
              aria-label="Dismiss success message"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <nav className="flex flex-col p-2">
                <button
                  onClick={() => handleTabChange('basic')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'basic'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors`}
                  aria-current={activeTab === 'basic' ? 'page' : undefined}
                >
                  <User className="h-4 w-4 mr-2" />
                  Basic Information
                </button>
                <button
                  onClick={() => handleTabChange('appearance')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'appearance'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors`}
                  aria-current={activeTab === 'appearance' ? 'page' : undefined}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Appearance
                </button>
                <button
                  onClick={() => handleTabChange('social')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'social'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors`}
                  aria-current={activeTab === 'social' ? 'page' : undefined}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Social Media
                </button>
                <button
                  onClick={() => handleTabChange('support')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'support'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors`}
                  aria-current={activeTab === 'support' ? 'page' : undefined}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Support Options
                </button>
                <button
                  onClick={() => handleTabChange('advanced')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'advanced'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors`}
                  aria-current={activeTab === 'advanced' ? 'page' : undefined}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </button>
              </nav>
            </div>
            {/* Preview Section (when enabled) */}
            {showPreview && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-gray-500" />
                  Profile Preview
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Banner */}
                  <div
                    className="h-24 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url(${formData.banner_image_url})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  </div>
                  {/* Profile Info */}
                  <div className="p-4">
                    <div className="flex items-center -mt-12">
                      <div className="h-16 w-16 rounded-full border-4 border-white overflow-hidden">
                        <img
                          src={formData.profile_image_url}
                          alt={formData.display_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4 mt-8">
                        <h4 className="font-bold text-gray-900 flex items-center">
                          {formData.display_name}
                          {formData.verified_badge && (
                            <CheckCircle className="h-4 w-4 ml-1 text-blue-500" />
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formData.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                        {formData.category}
                      </span>
                      {formData.location_display && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {formData.location_display}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {formData.bio}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
                      {formData.instagram_url && (
                        <a
                          href={formData.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                      {formData.twitter_url && (
                        <a
                          href={formData.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          aria-label="Twitter"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {formData.facebook_url && (
                        <a
                          href={formData.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                      {formData.website_url && (
                        <a
                          href={formData.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          aria-label="Website"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {/* Preview Audio Player */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Sample Episode Player
                  </h4>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <img
                        src={sampleEpisodes[0].image}
                        alt={sampleEpisodes[0].title}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {sampleEpisodes[0].title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formData.display_name}
                        </p>
                      </div>
                      <button
                        className="p-2 bg-news-primary text-white rounded-full flex-shrink-0"
                        onClick={() =>
                          togglePlayback(
                            sampleEpisodes[0].id,
                            sampleEpisodes[0].audioUrl,
                          )
                        }
                        aria-label={
                          currentPlayingEpisode === sampleEpisodes[0].id &&
                          isPlaying
                            ? 'Pause'
                            : 'Play'
                        }
                      >
                        {currentPlayingEpisode === sampleEpisodes[0].id &&
                        isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" fill="white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/local-voices/creator/${formData.slug}`}
                    target="_blank"
                    className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center justify-center"
                    aria-label="View full profile"
                  >
                    View full profile
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/* Tab Content */}
          <div className="flex-1">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Basic Information
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="display_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Display Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="display_name"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${validationErrors.display_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                        aria-invalid={!!validationErrors.display_name}
                        aria-describedby={
                          validationErrors.display_name
                            ? 'display_name-error'
                            : undefined
                        }
                      />
                      {validationErrors.display_name && (
                        <p
                          id="display_name-error"
                          className="mt-1 text-sm text-red-500"
                        >
                          {validationErrors.display_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="tagline"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
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
                          validationErrors.tagline
                            ? 'tagline-error'
                            : 'tagline-desc'
                        }
                        maxLength={100}
                      />
                      {validationErrors.tagline ? (
                        <p
                          id="tagline-error"
                          className="mt-1 text-sm text-red-500"
                        >
                          {validationErrors.tagline}
                        </p>
                      ) : (
                        <p
                          id="tagline-desc"
                          className="mt-1 text-xs text-gray-500"
                        >
                          A short description that appears under your name. Max
                          100 characters.
                          <span className="ml-1 text-gray-400">
                            {formData.tagline.length}/100
                          </span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Bio <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={8}
                        className={`w-full px-3 py-2 border ${validationErrors.bio ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                        aria-invalid={!!validationErrors.bio}
                        aria-describedby={
                          validationErrors.bio ? 'bio-error' : 'bio-desc'
                        }
                      ></textarea>
                      {validationErrors.bio ? (
                        <p id="bio-error" className="mt-1 text-sm text-red-500">
                          {validationErrors.bio}
                        </p>
                      ) : (
                        <p id="bio-desc" className="mt-1 text-xs text-gray-500">
                          Tell listeners about yourself, your show, and what
                          they can expect. Use blank lines to create paragraphs.
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
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
                          validationErrors.category
                            ? 'category-error'
                            : undefined
                        }
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {validationErrors.category && (
                        <p
                          id="category-error"
                          className="mt-1 text-sm text-red-500"
                        >
                          {validationErrors.category}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tags
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags.join(', ')}
                        onChange={handleTagsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                        aria-describedby="tags-desc"
                      />
                      <p id="tags-desc" className="mt-1 text-xs text-gray-500">
                        Separate tags with commas. These help listeners find
                        your content.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="location_display"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="location_display"
                        name="location_display"
                        value={formData.location_display}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${validationErrors.location_display ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                        placeholder="City, State"
                        aria-invalid={!!validationErrors.location_display}
                        aria-describedby={
                          validationErrors.location_display
                            ? 'location-error'
                            : undefined
                        }
                      />
                      {validationErrors.location_display && (
                        <p
                          id="location-error"
                          className="mt-1 text-sm text-red-500"
                        >
                          {validationErrors.location_display}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="performing_since"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Creating Since
                      </label>
                      <input
                        type="date"
                        id="performing_since"
                        name="performing_since"
                        value={formData.performing_since}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                      />
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="verified_badge"
                          name="verified_badge"
                          type="checkbox"
                          checked={formData.verified_badge}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary"
                          disabled={true}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="verified_badge"
                          className="font-medium text-gray-700"
                        >
                          Verified Badge
                        </label>
                        <p className="text-gray-500">
                          Verification badges are granted by Day.News to confirm
                          authenticity of public figures and notable creators.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Appearance
                  </h2>
                  <div className="space-y-8">
                    {/* Profile Image */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Profile Image
                      </h3>
                      <div className="flex items-start space-x-6">
                        <div className="h-32 w-32 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                          <img
                            src={formData.profile_image_url}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            id="profile_image"
                            ref={profileImageRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                          />
                          <button
                            type="button"
                            onClick={() => profileImageRef.current?.click()}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                            aria-label="Upload profile image"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload New Image
                          </button>
                          <p className="mt-2 text-sm text-gray-500">
                            Recommended: Square image, at least 400x400px. This
                            appears next to your name across the platform.
                          </p>
                          <div className="mt-4 text-sm text-gray-500">
                            <h4 className="font-medium text-gray-700 mb-1">
                              Requirements:
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Square aspect ratio (1:1)</li>
                              <li>JPG, PNG, or GIF format</li>
                              <li>Maximum file size: 5MB</li>
                              <li>Minimum dimensions: 400x400 pixels</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Banner Image */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Banner Image
                      </h3>
                      <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-300 mb-4">
                        <img
                          src={formData.banner_image_url}
                          alt="Banner"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => bannerImageRef.current?.click()}
                            className="px-4 py-2 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                            aria-label="Change banner image"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Change Banner
                          </button>
                        </div>
                      </div>
                      <input
                        type="file"
                        id="banner_image"
                        ref={bannerImageRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerImageUpload}
                      />
                      <div className="flex items-start">
                        <button
                          type="button"
                          onClick={() => bannerImageRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                          aria-label="Upload banner image"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Banner
                        </button>
                        <div className="ml-6">
                          <p className="text-sm text-gray-500">
                            Recommended: 1920x400px. This appears at the top of
                            your profile page.
                          </p>
                          <div className="mt-2 text-sm text-gray-500">
                            <h4 className="font-medium text-gray-700 mb-1">
                              Requirements:
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Widescreen aspect ratio (approx. 4:1)</li>
                              <li>JPG or PNG format</li>
                              <li>Maximum file size: 10MB</li>
                              <li>Minimum width: 1200 pixels</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Custom URL */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Custom URL
                      </h3>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">
                          day.news/local-voices/creator/
                        </span>
                        <input
                          type="text"
                          id="slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                          aria-label="Custom URL slug"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        This is your unique URL. Use only letters, numbers, and
                        hyphens.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Social Media & Contact
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Public Email <span className="text-red-500">*</span>
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
                          validationErrors.email ? 'email-error' : 'email-desc'
                        }
                      />
                      {validationErrors.email ? (
                        <p
                          id="email-error"
                          className="mt-1 text-sm text-red-500"
                        >
                          {validationErrors.email}
                        </p>
                      ) : (
                        <p
                          id="email-desc"
                          className="mt-1 text-xs text-gray-500"
                        >
                          This email will be visible to the public. Use a
                          business email or dedicated contact address.
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="website_url"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Website
                      </label>
                      <input
                        type="url"
                        id="website_url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                        className={`w-full px-3 py-2 border ${validationErrors.website_url ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                        aria-invalid={!!validationErrors.website_url}
                        aria-describedby={
                          validationErrors.website_url
                            ? 'website-error'
                            : undefined
                        }
                      />
                      {validationErrors.website_url && (
                        <p
                          id="website-error"
                          className="mt-1 text-sm text-red-500"
                        >
                          {validationErrors.website_url}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="rss_feed"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        RSS Feed
                      </label>
                      <input
                        type="url"
                        id="rss_feed"
                        name="rss_feed"
                        value={formData.rss_feed}
                        onChange={handleInputChange}
                        placeholder="https://feeds.example.com/your-podcast"
                        className={`w-full px-3 py-2 border ${validationErrors.rss_feed ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary`}
                        aria-invalid={!!validationErrors.rss_feed}
                        aria-describedby={
                          validationErrors.rss_feed ? 'rss-error' : 'rss-desc'
                        }
                      />
                      {validationErrors.rss_feed ? (
                        <p id="rss-error" className="mt-1 text-sm text-red-500">
                          {validationErrors.rss_feed}
                        </p>
                      ) : (
                        <p id="rss-desc" className="mt-1 text-xs text-gray-500">
                          Your podcast's RSS feed URL. This allows listeners to
                          subscribe using podcast apps.
                        </p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Social Media Platforms
                      </h3>
                      <div className="space-y-4">
                        {/* Instagram */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-yellow-400 flex items-center justify-center mr-3">
                              <Instagram className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Instagram
                              </h4>
                              {formData.instagram_url ? (
                                <a
                                  href={formData.instagram_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-news-primary hover:underline flex items-center"
                                >
                                  {formData.instagram_url.replace(
                                    /^https?:\/\/(www\.)?instagram\.com\//,
                                    '@',
                                  )}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Not connected
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {formData.instagram_url ? (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSocialLinkInput('instagram')
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Edit Instagram link"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSocialLink('instagram')
                                  }
                                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Remove Instagram link"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSocialLinkInput('instagram')
                                }
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                                aria-label="Add Instagram link"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        {showSocialLinkInput === 'instagram' && (
                          <div className="ml-12 flex items-center space-x-2">
                            <input
                              type="url"
                              value={newSocialLink}
                              onChange={(e) => setNewSocialLink(e.target.value)}
                              placeholder="https://instagram.com/yourusername"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                              aria-label="Instagram URL"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSocialLink('instagram')}
                              className="px-3 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark"
                              aria-label="Save Instagram link"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSocialLinkInput(null)
                                setNewSocialLink('')
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              aria-label="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                        {/* Twitter */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-400 flex items-center justify-center mr-3">
                              <Twitter className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Twitter
                              </h4>
                              {formData.twitter_url ? (
                                <a
                                  href={formData.twitter_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-news-primary hover:underline flex items-center"
                                >
                                  {formData.twitter_url.replace(
                                    /^https?:\/\/(www\.)?twitter\.com\//,
                                    '@',
                                  )}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Not connected
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {formData.twitter_url ? (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSocialLinkInput('twitter')
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Edit Twitter link"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSocialLink('twitter')
                                  }
                                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Remove Twitter link"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSocialLinkInput('twitter')
                                }
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                                aria-label="Add Twitter link"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        {showSocialLinkInput === 'twitter' && (
                          <div className="ml-12 flex items-center space-x-2">
                            <input
                              type="url"
                              value={newSocialLink}
                              onChange={(e) => setNewSocialLink(e.target.value)}
                              placeholder="https://twitter.com/yourusername"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                              aria-label="Twitter URL"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSocialLink('twitter')}
                              className="px-3 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark"
                              aria-label="Save Twitter link"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSocialLinkInput(null)
                                setNewSocialLink('')
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              aria-label="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                        {/* Facebook */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                              <Facebook className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Facebook
                              </h4>
                              {formData.facebook_url ? (
                                <a
                                  href={formData.facebook_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-news-primary hover:underline flex items-center"
                                >
                                  {formData.facebook_url.replace(
                                    /^https?:\/\/(www\.)?facebook\.com\//,
                                    '',
                                  )}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Not connected
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {formData.facebook_url ? (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSocialLinkInput('facebook')
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Edit Facebook link"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSocialLink('facebook')
                                  }
                                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Remove Facebook link"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSocialLinkInput('facebook')
                                }
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                                aria-label="Add Facebook link"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        {showSocialLinkInput === 'facebook' && (
                          <div className="ml-12 flex items-center space-x-2">
                            <input
                              type="url"
                              value={newSocialLink}
                              onChange={(e) => setNewSocialLink(e.target.value)}
                              placeholder="https://facebook.com/yourpage"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                              aria-label="Facebook URL"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSocialLink('facebook')}
                              className="px-3 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark"
                              aria-label="Save Facebook link"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSocialLinkInput(null)
                                setNewSocialLink('')
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              aria-label="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                        {/* YouTube */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center mr-3">
                              <Youtube className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                YouTube
                              </h4>
                              {formData.youtube_url ? (
                                <a
                                  href={formData.youtube_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-news-primary hover:underline flex items-center"
                                >
                                  {formData.youtube_url.replace(
                                    /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?/,
                                    '',
                                  )}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Not connected
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {formData.youtube_url ? (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSocialLinkInput('youtube')
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Edit YouTube link"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSocialLink('youtube')
                                  }
                                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Remove YouTube link"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSocialLinkInput('youtube')
                                }
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                                aria-label="Add YouTube link"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        {showSocialLinkInput === 'youtube' && (
                          <div className="ml-12 flex items-center space-x-2">
                            <input
                              type="url"
                              value={newSocialLink}
                              onChange={(e) => setNewSocialLink(e.target.value)}
                              placeholder="https://youtube.com/c/yourchannel"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                              aria-label="YouTube URL"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSocialLink('youtube')}
                              className="px-3 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark"
                              aria-label="Save YouTube link"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSocialLinkInput(null)
                                setNewSocialLink('')
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              aria-label="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Support Options Tab */}
              {activeTab === 'support' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Support Options
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Set up ways for your audience to support your content.
                      These options will appear on your profile page.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Enable Support Options
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            id: 'venmo',
                            label: 'Venmo',
                            icon: 'dollar-sign',
                            color: 'bg-blue-500',
                          },
                          {
                            id: 'cashapp',
                            label: 'Cash App',
                            icon: 'dollar-sign',
                            color: 'bg-green-500',
                          },
                          {
                            id: 'patreon',
                            label: 'Patreon',
                            icon: 'dollar-sign',
                            color: 'bg-red-500',
                          },
                          {
                            id: 'buymeacoffee',
                            label: 'Buy Me a Coffee',
                            icon: 'coffee',
                            color: 'bg-yellow-500',
                          },
                        ].map((option) => (
                          <div key={option.id} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`enable-${option.id}`}
                                type="checkbox"
                                checked={formData.donation_options.includes(
                                  option.id,
                                )}
                                onChange={(e) =>
                                  handleDonationOptionChange(
                                    option.id,
                                    e.target.checked,
                                  )
                                }
                                className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary"
                                aria-labelledby={`enable-${option.id}-label`}
                              />
                            </div>
                            <label
                              htmlFor={`enable-${option.id}`}
                              id={`enable-${option.id}-label`}
                              className="ml-3 flex items-center"
                            >
                              <div
                                className={`h-6 w-6 rounded-full ${option.color} flex items-center justify-center mr-2`}
                              >
                                {option.icon === 'dollar-sign' ? (
                                  <DollarSign className="h-3 w-3 text-white" />
                                ) : (
                                  <Coffee className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {option.label}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Venmo Settings */}
                    {formData.donation_options.includes('venmo') && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Venmo
                              </h4>
                              {formData.venmo_handle ? (
                                <p className="text-sm text-gray-700">
                                  @{formData.venmo_handle}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No handle set
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {formData.venmo_handle ? (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setShowDonationInput('venmo')}
                                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Edit Venmo handle"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDonationHandle('venmo')
                                  }
                                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Remove Venmo handle"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowDonationInput('venmo')}
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                                aria-label="Add Venmo handle"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        {showDonationInput === 'venmo' && (
                          <div className="mt-3 ml-12 flex items-center space-x-2">
                            <div className="flex-1 relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                @
                              </span>
                              <input
                                type="text"
                                value={newDonationHandle}
                                onChange={(e) =>
                                  setNewDonationHandle(e.target.value)
                                }
                                placeholder="yourusername"
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                                aria-label="Venmo username"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddDonationHandle('venmo')}
                              className="px-3 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark"
                              aria-label="Save Venmo handle"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowDonationInput(null)
                                setNewDonationHandle('')
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              aria-label="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Cash App Settings */}
                    {formData.donation_options.includes('cashapp') && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center mr-3">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Cash App
                              </h4>
                              {formData.cashapp_handle ? (
                                <p className="text-sm text-gray-700">
                                  ${formData.cashapp_handle}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No handle set
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {formData.cashapp_handle ? (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowDonationInput('cashapp')
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Edit Cash App handle"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDonationHandle('cashapp')
                                  }
                                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Remove Cash App handle"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowDonationInput('cashapp')}
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                                aria-label="Add Cash App handle"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        {showDonationInput === 'cashapp' && (
                          <div className="mt-3 ml-12 flex items-center space-x-2">
                            <div className="flex-1 relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                $
                              </span>
                              <input
                                type="text"
                                value={newDonationHandle}
                                onChange={(e) =>
                                  setNewDonationHandle(e.target.value)
                                }
                                placeholder="yourusername"
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                                aria-label="Cash App username"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddDonationHandle('cashapp')}
                              className="px-3 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark"
                              aria-label="Save Cash App handle"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowDonationInput(null)
                                setNewDonationHandle('')
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              aria-label="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Patreon Settings */}
                    {formData.donation_options.includes('patreon') && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center mr-3">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Patreon
                              </h4>
                              {formData.patreon_url ? (
                                <a
                                  href={formData.patreon_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-news-primary hover:underline flex items-center"
                                >
                                  {formData.patreon_url.replace(
                                    /^https?:\/\/(www\.)?patreon\.com\//,
                                    '',
                                  )}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No URL set
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            {formData.patreon_url ? (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSocialLinkInput('patreon')
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Edit Patreon URL"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSocialLink('patreon')
                                  }
                                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                                  aria-label="Remove Patreon URL"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSocialLinkInput('patreon')
                                }
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                                aria-label="Add Patreon URL"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        {showSocialLinkInput === 'patreon' && (
                          <div className="mt-3 ml-12 flex items-center space-x-2">
                            <input
                              type="url"
                              value={newSocialLink}
                              onChange={(e) => setNewSocialLink(e.target.value)}
                              placeholder="https://patreon.com/yourcreator"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                              aria-label="Patreon URL"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSocialLink('patreon')}
                              className="px-3 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark"
                              aria-label="Save Patreon URL"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSocialLinkInput(null)
                                setNewSocialLink('')
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                              aria-label="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Buy Me a Coffee Settings */}
                    {formData.donation_options.includes('buymeacoffee') && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center mr-3">
                            <Coffee className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Buy Me a Coffee
                            </h4>
                            <p className="text-sm text-gray-500">
                              A "Buy Me a Coffee" button will be added to your
                              profile. Supporters will be directed to the
                              Day.News tipping system.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Advanced Settings Tab */}
              {activeTab === 'advanced' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Advanced Settings
                  </h2>
                  <div className="space-y-8">
                    {/* SEO Settings */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        SEO Settings
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="seo_title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            SEO Title
                          </label>
                          <input
                            type="text"
                            id="seo_title"
                            name="seo_title"
                            defaultValue={formData.display_name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                            aria-describedby="seo-title-desc"
                          />
                          <p
                            id="seo-title-desc"
                            className="mt-1 text-xs text-gray-500"
                          >
                            Customize how your profile title appears in search
                            engines. Defaults to your display name if left
                            blank.
                          </p>
                        </div>
                        <div>
                          <label
                            htmlFor="seo_description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            SEO Description
                          </label>
                          <textarea
                            id="seo_description"
                            name="seo_description"
                            defaultValue={formData.tagline}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-news-primary focus:border-news-primary"
                            aria-describedby="seo-desc-desc"
                          ></textarea>
                          <p
                            id="seo-desc-desc"
                            className="mt-1 text-xs text-gray-500"
                          >
                            Customize how your profile description appears in
                            search engines. Defaults to your tagline if left
                            blank.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Privacy Settings */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Privacy Settings
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="hide_stats"
                              name="hide_stats"
                              type="checkbox"
                              className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="hide_stats"
                              className="font-medium text-gray-700"
                            >
                              Hide statistics
                            </label>
                            <p className="text-gray-500">
                              Hide play counts, follower counts, and other
                              statistics from your public profile
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="private_profile"
                              name="private_profile"
                              type="checkbox"
                              className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="private_profile"
                              className="font-medium text-gray-700"
                            >
                              Private profile
                            </label>
                            <p className="text-gray-500">
                              Make your profile only visible to registered users
                              of Day.News
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-red-600 mb-4">
                        Danger Zone
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <h4 className="text-base font-medium text-red-800 mb-2">
                          Delete Creator Account
                        </h4>
                        <p className="text-sm text-red-600 mb-4">
                          Permanently delete your creator profile, all episodes,
                          and analytics data. This action cannot be undone.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowDeleteAccountModal(true)}
                          className="px-4 py-2 bg-white border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center"
                          aria-label="Delete creator account"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Creator Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/local-voices/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  aria-label="Cancel and go back to dashboard"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-news-primary hover:bg-news-primary-dark border border-transparent rounded-md text-sm font-medium text-white flex items-center transition-colors"
                  disabled={isSaving}
                  aria-label="Save changes"
                >
                  {isSaving ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Unsaved Changes Modal */}
      {showUnsavedChangesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            role="dialog"
            aria-labelledby="unsaved-changes-title"
            aria-describedby="unsaved-changes-description"
          >
            <h3
              id="unsaved-changes-title"
              className="text-lg font-bold text-gray-900 mb-4"
            >
              Unsaved Changes
            </h3>
            <p id="unsaved-changes-description" className="text-gray-600 mb-6">
              You have unsaved changes. Do you want to save them before leaving
              this tab?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUnsavedChangesModal(false)
                  if (pendingTabChange) {
                    setActiveTab(pendingTabChange)
                    setPendingTabChange(null)
                  }
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                aria-label="Discard changes"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  setShowUnsavedChangesModal(false)
                  handleSubmit(new Event('submit') as React.FormEvent)
                  if (pendingTabChange) {
                    setTimeout(() => {
                      setActiveTab(pendingTabChange)
                      setPendingTabChange(null)
                    }, 500)
                  }
                }}
                className="px-4 py-2 bg-news-primary text-white font-medium rounded-md hover:bg-news-primary-dark transition-colors flex items-center"
                aria-label="Save changes"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            role="dialog"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
          >
            <h3
              id="delete-account-title"
              className="text-lg font-bold text-red-600 mb-4"
            >
              Delete Creator Account
            </h3>
            <p id="delete-account-description" className="text-gray-600 mb-4">
              Are you absolutely sure you want to delete your creator account?
              This will permanently remove all your content, episodes, and
              analytics data. This action{' '}
              <span className="font-bold">cannot</span> be undone.
            </p>
            <div className="bg-red-50 p-4 rounded-md mb-6">
              <p className="text-sm text-red-600">
                To confirm, please type{' '}
                <span className="font-bold">delete my account</span> below:
              </p>
              <input
                type="text"
                className="mt-2 w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                placeholder="Type 'delete my account'"
                aria-label="Confirmation text"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors flex items-center"
                aria-label="Confirm account deletion"
                disabled={true}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// Additional icon components needed
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
      strokeLinejoin="round"
    >
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  )
}
function CreditCard(props: React.SVGProps<SVGSVGElement>) {
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
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  )
}
export default CreatorProfileEditor
