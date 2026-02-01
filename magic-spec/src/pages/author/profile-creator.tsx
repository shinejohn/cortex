import React, { useEffect, useState, createElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  ThermometerIcon,
  Home,
  ChevronDown,
  User,
  Mail,
  Phone,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  Save,
  Upload,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  X,
  Camera,
  Link,
  Shield,
  Zap,
  Filter,
  ArrowUpDown,
  ToggleLeft,
  ToggleRight,
  FileText,
  ArrowLeft,
  ThumbsUp,
  Download,
  Lock,
  HelpCircle,
  AlertTriangle,
  ExternalLink } from
'lucide-react';
const AuthorProfileCreatorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [articleToToggle, setArticleToToggle] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(
    'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80'
  );
  const [profileImagePreview, setProfileImagePreview] = useState(
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  );
  // Modal states for account actions
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDownloadDataModal, setShowDownloadDataModal] = useState(false);
  const [showDeactivateAccountModal, setShowDeactivateAccountModal] =
  useState(false);
  // States for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  // State for help & support modals
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  // State for contact support form
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  // Check if user came from creating their first article
  const [fromFirstArticle, setFromFirstArticle] = useState(false);
  const [pendingArticleTitle, setPendingArticleTitle] = useState('');
  useEffect(() => {
    // Check if user was redirected from creating their first article
    if (location.state?.fromFirstArticle) {
      setFromFirstArticle(true);
      setPendingArticleTitle(location.state.articleTitle || 'Your new article');
    }
  }, [location]);
  // Mock author data - this would come from an API in a real app
  const [authorData, setAuthorData] = useState({
    id: '123',
    name: 'Sarah Johnson',
    title: 'Senior Community Journalist',
    location: 'Clearwater, FL',
    memberSince: 'May 2022',
    verified: true,
    bio: 'Award-winning journalist with over 10 years of experience covering local news, government affairs, and community events. Passionate about bringing accurate and meaningful stories to Clearwater residents.',
    credentials: [
    'BA in Journalism, University of Florida',
    'Certificate in Digital Media, Stanford University',
    'Former Editor, Clearwater Chronicle',
    'Winner, Florida Press Association Award (2021)'],

    coverageAreas: [
    'Local Government',
    'Community Events',
    'Education',
    'Business',
    'Environment'],

    contact: {
      email: 'sarah.johnson@daynews.com',
      phone: '(727) 555-0123',
      website: 'sarahjohnson.com',
      twitter: '@sarahjreports',
      facebook: 'sarahjohnsonreports',
      linkedin: 'sarahjohnson'
    },
    metrics: {
      totalArticles: 142,
      totalViews: 287450,
      totalComments: 3218,
      aiAssistedPercentage: 15
    },
    preferences: {
      publicProfile: true,
      emailNotifications: true,
      aiAssistance: true
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showSocial: true
    }
  });
  // Mock articles data
  const [articles, setArticles] = useState([
  {
    id: 1,
    title: 'Clearwater Community Center Reopens After $3.2M Renovation',
    date: 'August 2, 2024',
    aiScore: 92,
    views: 4523,
    approvalRate: 98,
    category: 'Community',
    excerpt:
    'The Clearwater Community Center officially reopened its doors yesterday following an extensive $3.2 million renovation project that began in January...',
    isOnline: true
  },
  {
    id: 2,
    title: 'City Council Approves New Downtown Development Plan',
    date: 'July 28, 2024',
    aiScore: 88,
    views: 3782,
    approvalRate: 92,
    category: 'Local Government',
    excerpt:
    'In a 4-1 vote Tuesday night, the Clearwater City Council approved a controversial new development plan for the downtown area...',
    isOnline: true
  },
  {
    id: 3,
    title: 'Local School District Announces New STEM Program',
    date: 'July 15, 2024',
    aiScore: 95,
    views: 5214,
    approvalRate: 97,
    category: 'Education',
    excerpt:
    'Clearwater School District has secured a $1.5 million grant to implement a comprehensive STEM program across all elementary schools...',
    isOnline: false
  },
  {
    id: 4,
    title: 'Annual Beach Cleanup Event Draws Record Participation',
    date: 'July 8, 2024',
    aiScore: 91,
    views: 3127,
    approvalRate: 99,
    category: 'Environment',
    excerpt:
    'More than 500 volunteers gathered at Clearwater Beach this Saturday for the annual coastal cleanup event, setting a new record for participation...',
    isOnline: true
  },
  {
    id: 5,
    title: 'New Business Incubator Opens to Support Local Entrepreneurs',
    date: 'June 30, 2024',
    aiScore: 89,
    views: 2845,
    approvalRate: 94,
    category: 'Business',
    excerpt:
    'The Clearwater Economic Development Agency has opened a new business incubator aimed at supporting local entrepreneurs and startups...',
    isOnline: true
  }]
  );
  // Add pending article if coming from article creation
  useEffect(() => {
    if (fromFirstArticle && pendingArticleTitle) {
      // Add the pending article to the articles list
      const newArticle = {
        id: Date.now(),
        title: pendingArticleTitle,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        aiScore: 85,
        views: 0,
        approvalRate: 0,
        category: 'Pending',
        excerpt:
        'This article is pending publication after your author profile is complete...',
        isOnline: false
      };
      setArticles((prevArticles) => [newArticle, ...prevArticles]);
    }
  }, [fromFirstArticle, pendingArticleTitle]);
  // Handle form input changes
  const handleInputChange = (e, field) => {
    setAuthorData({
      ...authorData,
      [field]: e.target.value
    });
  };
  // Handle contact info changes
  const handleContactChange = (e, field) => {
    setAuthorData({
      ...authorData,
      contact: {
        ...authorData.contact,
        [field]: e.target.value
      }
    });
  };
  // Handle coverage area changes
  const [newCoverageArea, setNewCoverageArea] = useState('');
  const handleAddCoverageArea = () => {
    if (newCoverageArea.trim() !== '') {
      setAuthorData({
        ...authorData,
        coverageAreas: [...authorData.coverageAreas, newCoverageArea.trim()]
      });
      setNewCoverageArea('');
    }
  };
  const handleRemoveCoverageArea = (index) => {
    const updatedAreas = [...authorData.coverageAreas];
    updatedAreas.splice(index, 1);
    setAuthorData({
      ...authorData,
      coverageAreas: updatedAreas
    });
  };
  // Handle credentials changes
  const [newCredential, setNewCredential] = useState('');
  const handleAddCredential = () => {
    if (newCredential.trim() !== '') {
      setAuthorData({
        ...authorData,
        credentials: [...authorData.credentials, newCredential.trim()]
      });
      setNewCredential('');
    }
  };
  const handleRemoveCredential = (index) => {
    const updatedCredentials = [...authorData.credentials];
    updatedCredentials.splice(index, 1);
    setAuthorData({
      ...authorData,
      credentials: updatedCredentials
    });
  };
  // Handle preference toggles
  const handlePreferenceToggle = (field) => {
    setAuthorData({
      ...authorData,
      preferences: {
        ...authorData.preferences,
        [field]: !authorData.preferences[field]
      }
    });
  };
  // Handle privacy toggles
  const handlePrivacyToggle = (field) => {
    setAuthorData({
      ...authorData,
      privacy: {
        ...authorData.privacy,
        [field]: !authorData.privacy[field]
      }
    });
  };
  // Handle article visibility toggle
  const toggleArticleVisibility = (articleId) => {
    const articleIndex = articles.findIndex(
      (article) => article.id === articleId
    );
    if (articleIndex !== -1) {
      const article = articles[articleIndex];
      setArticleToToggle(article);
      setShowConfirmModal(true);
    }
  };
  const confirmToggleVisibility = () => {
    if (articleToToggle) {
      const updatedArticles = articles.map((article) =>
      article.id === articleToToggle.id ?
      {
        ...article,
        isOnline: !article.isOnline
      } :
      article
      );
      setArticles(updatedArticles);
      setShowConfirmModal(false);
      setArticleToToggle(null);
    }
  };
  // Handle image uploads
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // Handle form submission
  const handleSaveProfile = () => {
    // In a real app, this would make an API call to save the profile
    alert('Profile saved successfully!');
    if (fromFirstArticle) {
      // If coming from first article, redirect to continue article creation
      navigate('/create-article/metadata');
    } else {
      // Otherwise go to author profile
      navigate(`/author/${authorData.id}`);
    }
  };
  // Handle back to article button
  const handleBackToArticle = () => {
    navigate('/create-article');
  };
  // Handle password change
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    // Validate passwords
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    // In a real app, this would make an API call to change the password
    setTimeout(() => {
      alert('Password changed successfully');
      setShowChangePasswordModal(false);
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };
  // Handle data download
  const handleDownloadData = () => {
    // In a real app, this would trigger an API call to prepare the data
    // For demo purposes, we'll create a simple JSON file
    const userData = {
      profile: authorData,
      articles: articles,
      timestamp: new Date().toISOString()
    };
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_${authorData.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadDataModal(false);
  };
  // Handle account deactivation
  const handleDeactivateAccount = () => {
    // In a real app, this would make an API call to deactivate the account
    setTimeout(() => {
      alert('Account deactivated. You will be redirected to the homepage.');
      navigate('/');
    }, 1000);
  };
  // Handle support request submission
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the support request to an API
    setTimeout(() => {
      alert('Support request submitted. Our team will contact you soon.');
      setShowContactModal(false);
      // Reset form
      setSupportSubject('');
      setSupportMessage('');
    }, 1000);
  };
  // Handle article deletion
  const [showDeleteArticleModal, setShowDeleteArticleModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const confirmDeleteArticle = () => {
    if (articleToDelete) {
      const updatedArticles = articles.filter(
        (article) => article.id !== articleToDelete.id
      );
      setArticles(updatedArticles);
      setShowDeleteArticleModal(false);
      setArticleToDelete(null);
    }
  };
  const handleDeleteArticle = (articleId) => {
    const article = articles.find((article) => article.id === articleId);
    if (article) {
      setArticleToDelete(article);
      setShowDeleteArticleModal(true);
    }
  };
  // Handle article editing
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState(null);
  const [editedArticleTitle, setEditedArticleTitle] = useState('');
  const [editedArticleCategory, setEditedArticleCategory] = useState('');
  const [editedArticleExcerpt, setEditedArticleExcerpt] = useState('');
  const handleEditArticle = (articleId) => {
    const article = articles.find((article) => article.id === articleId);
    if (article) {
      setArticleToEdit(article);
      setEditedArticleTitle(article.title);
      setEditedArticleCategory(article.category);
      setEditedArticleExcerpt(article.excerpt);
      setShowEditArticleModal(true);
    }
  };
  const saveArticleEdit = () => {
    if (articleToEdit) {
      const updatedArticles = articles.map((article) =>
      article.id === articleToEdit.id ?
      {
        ...article,
        title: editedArticleTitle,
        category: editedArticleCategory,
        excerpt: editedArticleExcerpt
      } :
      article
      );
      setArticles(updatedArticles);
      setShowEditArticleModal(false);
      setArticleToEdit(null);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Community Bar */}
      <div className="bg-news-primary text-white py-2 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>Clearwater, FL</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <ThermometerIcon className="h-3.5 w-3.5 mr-1" />
                <span>78°F Sunny</span>
              </div>
              <span className="mx-2">•</span>
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Bar */}
      <nav className="bg-gray-100 border-b border-gray-200 py-3 sticky top-10 z-40">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="flex items-center justify-center space-x-6 overflow-x-auto">
            <a
              href="/"
              className="flex items-center text-gray-600 hover:text-news-primary">

              <Home className="h-4 w-4 mr-1.5" />
              <span className="font-medium">Home</span>
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="text-gray-600 hover:text-news-primary font-medium">

              News
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-news-primary font-medium">

              Authors
            </a>
            <a
              href="#"
              className="text-news-primary font-semibold border-b-2 border-news-primary pb-1">

              Author Profile Creator
            </a>
          </div>
        </div>
      </nav>
      {/* Page Title */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Create Your Author Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Set up your professional profile and manage your published content
            </p>
          </div>
          <div className="flex justify-center mt-4">
            {fromFirstArticle &&
            <button
              onClick={handleBackToArticle}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center">

                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Article
              </button>
            }
          </div>
          {fromFirstArticle &&
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start max-w-3xl mx-auto">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-800">
                  Your First Article Is Pending
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  "{pendingArticleTitle}" will be ready to publish after you
                  complete your author profile.
                </p>
              </div>
            </div>
          }
        </div>
      </div>
      {/* Author Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 w-full bg-gradient-to-r from-blue-400 to-blue-600 relative overflow-hidden">
          <img
            src={coverImagePreview}
            alt="Cover"
            className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-blue-900 bg-opacity-30"></div>
          {/* Cover image upload button */}
          <div className="absolute bottom-4 right-4">
            <label className="bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
              <Camera className="h-5 w-5 text-gray-700" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCoverImageUpload} />

            </label>
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Profile Info Section */}
          <div className="bg-white rounded-lg shadow-sm -mt-16 relative z-10 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
              {/* Avatar and Author Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start mb-6 md:mb-0">
                {/* Avatar */}
                <div className="relative -mt-16 mb-4 md:mb-0 md:mr-6">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden">
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover" />

                  </div>
                  {/* Profile image upload button */}
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageUpload} />

                  </label>
                </div>
                {/* Author Info */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start">
                    <input
                      type="text"
                      value={authorData.name}
                      onChange={(e) => handleInputChange(e, 'name')}
                      className="text-3xl font-display font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                      placeholder="Your Name" />

                  </div>
                  <input
                    type="text"
                    value={authorData.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                    className="text-gray-600 mt-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                    placeholder="Your Title (e.g., Senior Journalist)" />

                  <div className="flex items-center justify-center md:justify-start mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <input
                      type="text"
                      value={authorData.location}
                      onChange={(e) => handleInputChange(e, 'location')}
                      className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                      placeholder="Your Location" />

                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center">

                  <Save className="h-4 w-4 mr-1.5" />
                  {fromFirstArticle ?
                  'Save Profile & Continue' :
                  'Save Profile'}
                </button>
                <button
                  onClick={() => navigate(`/author/${authorData.id}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center">

                  <Eye className="h-4 w-4 mr-1.5" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-24 z-30">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="flex justify-center overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>

              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'articles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>

              Manage Articles ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>

              Account Settings
            </button>
          </div>
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Profile Information Tab */}
          {activeTab === 'profile' &&
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Bio and Credentials */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Biography
                  </h2>
                  <textarea
                  value={authorData.bio}
                  onChange={(e) => handleInputChange(e, 'bio')}
                  className="w-full h-32 bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Write a professional biography that highlights your experience and expertise...">
                </textarea>
                  <p className="text-sm text-gray-500 mt-2">
                    A compelling bio helps readers connect with you and
                    establishes your credibility.
                  </p>
                </div>
                {/* Credentials Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Credentials
                  </h2>
                  <div className="space-y-3 mb-4">
                    {authorData.credentials.map((credential, index) =>
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">

                        <span className="text-gray-700">{credential}</span>
                        <button
                      onClick={() => handleRemoveCredential(index)}
                      className="text-red-500 hover:text-red-700">

                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                  )}
                  </div>
                  <div className="flex mt-4">
                    <input
                    type="text"
                    value={newCredential}
                    onChange={(e) => setNewCredential(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Add a credential (degree, award, certification, etc.)" />

                    <button
                    onClick={handleAddCredential}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">

                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {/* Coverage Areas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Coverage Areas
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {authorData.coverageAreas.map((area, index) =>
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">

                        <span>{area}</span>
                        <button
                      onClick={() => handleRemoveCoverageArea(index)}
                      className="ml-2 text-blue-800 hover:text-blue-900">

                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                  )}
                  </div>
                  <div className="flex mt-4">
                    <input
                    type="text"
                    value={newCoverageArea}
                    onChange={(e) => setNewCoverageArea(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Add a coverage area (e.g., Local Politics, Education)" />

                    <button
                    onClick={handleAddCoverageArea}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">

                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Right Column - Contact Information */}
              <div className="lg:col-span-1 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="email"
                        value={authorData.contact.email}
                        onChange={(e) => handleContactChange(e, 'email')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="your.email@example.com" />

                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Phone className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="tel"
                        value={authorData.contact.phone}
                        onChange={(e) => handleContactChange(e, 'phone')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="(123) 456-7890" />

                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Globe className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                        type="url"
                        value={authorData.contact.website}
                        onChange={(e) => handleContactChange(e, 'website')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="yourwebsite.com" />

                      </div>
                    </div>
                  </div>
                </div>
                {/* Social Media */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Social Media
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Twitter className="h-5 w-5 text-blue-400" />
                        </div>
                        <input
                        type="text"
                        value={authorData.contact.twitter}
                        onChange={(e) => handleContactChange(e, 'twitter')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="@username" />

                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Facebook className="h-5 w-5 text-blue-600" />
                        </div>
                        <input
                        type="text"
                        value={authorData.contact.facebook}
                        onChange={(e) => handleContactChange(e, 'facebook')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="username or page name" />

                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2">
                          <Linkedin className="h-5 w-5 text-blue-700" />
                        </div>
                        <input
                        type="text"
                        value={authorData.contact.linkedin}
                        onChange={(e) => handleContactChange(e, 'linkedin')}
                        className="flex-1 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="username" />

                      </div>
                    </div>
                  </div>
                </div>
                {/* Verification Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Verification Status
                    </h2>
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Pending
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    We'll review your profile information to verify your
                    identity and credentials. This helps build trust with
                    readers.
                  </p>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-1.5" />
                    Request Verification
                  </button>
                </div>
              </div>
            </div>
          }
          {/* Manage Articles Tab */}
          {activeTab === 'articles' &&
          <div>
              {/* Articles Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Article Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {articles.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Articles</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {articles.filter((a) => a.isOnline).length}
                    </div>
                    <div className="text-sm text-gray-600">Online Articles</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {articles.filter((a) => !a.isOnline).length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Offline Articles
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {articles.length > 0 ?
                    Math.round(
                      articles.reduce(
                        (sum, article) => sum + article.approvalRate,
                        0
                      ) / articles.length
                    ) :
                    0}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Avg. Approval</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      <strong>About article visibility:</strong> Taking an
                      article offline means it won't be visible to readers and
                      won't count toward your author metrics or review scores.
                      This is useful for outdated content or articles you're
                      revising.
                    </p>
                  </div>
                </div>
              </div>
              {/* Articles List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">
                    Manage Your Articles
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {articles.filter((a) => a.isOnline).length} online /{' '}
                      {articles.length} total
                    </span>
                    <button
                    onClick={() => navigate('/create-article')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">

                      <Plus className="h-3.5 w-3.5 mr-1" />
                      New Article
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {articles.map((article) =>
                <div key={article.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>

                              {article.isOnline ?
                          <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Online
                                </> :

                          <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Offline
                                </>
                          }
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {article.date}
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {article.category}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {article.excerpt}
                          </p>
                          <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-1">
                            <span className="flex items-center">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              {article.views.toLocaleString()} views
                            </span>
                            <span className="flex items-center">
                              <Zap className="h-3.5 w-3.5 mr-1 text-blue-500" />
                              AI Score: {article.aiScore}
                            </span>
                            <span className="flex items-center">
                              <ThumbsUp className="h-3.5 w-3.5 mr-1 text-green-500" />
                              {article.approvalRate}% approval
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center mt-3 md:mt-0 space-x-2">
                          <button
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        onClick={() => handleEditArticle(article.id)}>

                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                        className={`px-3 py-1.5 text-sm border rounded flex items-center ${article.isOnline ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                        onClick={() => toggleArticleVisibility(article.id)}>

                            {article.isOnline ?
                        <>
                                <EyeOff className="h-4 w-4 mr-1.5" />
                                Take Offline
                              </> :

                        <>
                                <Eye className="h-4 w-4 mr-1.5" />
                                Put Online
                              </>
                        }
                          </button>
                          <button
                        className="px-3 py-1.5 text-sm border border-red-300 rounded text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteArticle(article.id)}>

                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              </div>
              {/* No Articles State */}
              {articles.length === 0 &&
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No articles yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't published any articles yet. Start writing to
                    build your portfolio and reputation.
                  </p>
                  <button
                onClick={() => navigate('/create-article')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">

                    Create Your First Article
                  </button>
                </div>
            }
            </div>
          }
          {/* Account Settings Tab */}
          {activeTab === 'settings' &&
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Account Preferences */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Public Profile
                        </h3>
                        <p className="text-sm text-gray-600">
                          Allow others to view your profile and articles
                        </p>
                      </div>
                      <button
                      onClick={() => handlePreferenceToggle('publicProfile')}
                      className="relative inline-flex items-center"
                      aria-pressed={authorData.preferences.publicProfile}>

                        <span className="sr-only">Toggle public profile</span>
                        <div
                        className={`w-14 h-7 rounded-full transition-colors ${authorData.preferences.publicProfile ? 'bg-blue-600' : 'bg-gray-200'}`}>

                          <div
                          className={`absolute w-5 h-5 rounded-full bg-white shadow transform transition-transform ${authorData.preferences.publicProfile ? 'translate-x-8 top-1' : 'translate-x-1 top-1'}`}>
                        </div>
                        </div>
                      </button>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive email notifications for comments and reviews
                        </p>
                      </div>
                      <button
                      onClick={() =>
                      handlePreferenceToggle('emailNotifications')
                      }
                      className="relative inline-flex items-center"
                      aria-pressed={authorData.preferences.emailNotifications}>

                        <span className="sr-only">
                          Toggle email notifications
                        </span>
                        <div
                        className={`w-14 h-7 rounded-full transition-colors ${authorData.preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}>

                          <div
                          className={`absolute w-5 h-5 rounded-full bg-white shadow transform transition-transform ${authorData.preferences.emailNotifications ? 'translate-x-8 top-1' : 'translate-x-1 top-1'}`}>
                        </div>
                        </div>
                      </button>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          AI Content Assistance
                        </h3>
                        <p className="text-sm text-gray-600">
                          Use AI to help improve your articles
                        </p>
                      </div>
                      <button
                      onClick={() => handlePreferenceToggle('aiAssistance')}
                      className="relative inline-flex items-center"
                      aria-pressed={authorData.preferences.aiAssistance}>

                        <span className="sr-only">Toggle AI assistance</span>
                        <div
                        className={`w-14 h-7 rounded-full transition-colors ${authorData.preferences.aiAssistance ? 'bg-blue-600' : 'bg-gray-200'}`}>

                          <div
                          className={`absolute w-5 h-5 rounded-full bg-white shadow transform transition-transform ${authorData.preferences.aiAssistance ? 'translate-x-8 top-1' : 'translate-x-1 top-1'}`}>
                        </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Privacy Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Privacy Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Show Email Address
                        </h3>
                        <p className="text-sm text-gray-600">
                          Display your email on your public profile
                        </p>
                      </div>
                      <button
                      onClick={() => handlePrivacyToggle('showEmail')}
                      className="relative inline-flex items-center"
                      aria-pressed={authorData.privacy.showEmail}>

                        <span className="sr-only">Toggle email visibility</span>
                        <div
                        className={`w-14 h-7 rounded-full transition-colors ${authorData.privacy.showEmail ? 'bg-blue-600' : 'bg-gray-200'}`}>

                          <div
                          className={`absolute w-5 h-5 rounded-full bg-white shadow transform transition-transform ${authorData.privacy.showEmail ? 'translate-x-8 top-1' : 'translate-x-1 top-1'}`}>
                        </div>
                        </div>
                      </button>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Show Phone Number
                        </h3>
                        <p className="text-sm text-gray-600">
                          Display your phone number on your public profile
                        </p>
                      </div>
                      <button
                      onClick={() => handlePrivacyToggle('showPhone')}
                      className="relative inline-flex items-center"
                      aria-pressed={authorData.privacy.showPhone}>

                        <span className="sr-only">Toggle phone visibility</span>
                        <div
                        className={`w-14 h-7 rounded-full transition-colors ${authorData.privacy.showPhone ? 'bg-blue-600' : 'bg-gray-200'}`}>

                          <div
                          className={`absolute w-5 h-5 rounded-full bg-white shadow transform transition-transform ${authorData.privacy.showPhone ? 'translate-x-8 top-1' : 'translate-x-1 top-1'}`}>
                        </div>
                        </div>
                      </button>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Show Social Media
                        </h3>
                        <p className="text-sm text-gray-600">
                          Display your social media profiles on your public
                          profile
                        </p>
                      </div>
                      <button
                      onClick={() => handlePrivacyToggle('showSocial')}
                      className="relative inline-flex items-center"
                      aria-pressed={authorData.privacy.showSocial}>

                        <span className="sr-only">
                          Toggle social media visibility
                        </span>
                        <div
                        className={`w-14 h-7 rounded-full transition-colors ${authorData.privacy.showSocial ? 'bg-blue-600' : 'bg-gray-200'}`}>

                          <div
                          className={`absolute w-5 h-5 rounded-full bg-white shadow transform transition-transform ${authorData.privacy.showSocial ? 'translate-x-8 top-1' : 'translate-x-1 top-1'}`}>
                        </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6">
                {/* Account Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Actions
                  </h2>
                  <div className="space-y-4">
                    <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">

                      <Lock className="h-4 w-4 mr-1.5" />
                      Change Password
                    </button>
                    <button
                    onClick={() => setShowDownloadDataModal(true)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">

                      <Download className="h-4 w-4 mr-1.5" />
                      Download Your Data
                    </button>
                    <button
                    onClick={() => setShowDeactivateAccountModal(true)}
                    className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-md font-medium hover:bg-red-100 transition-colors flex items-center justify-center">

                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                      Deactivate Account
                    </button>
                  </div>
                </div>
                {/* Help & Support */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Help & Support
                  </h2>
                  <div className="space-y-3">
                    <button
                    onClick={() => setShowGuidelinesModal(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 w-full text-left">

                      <Link className="h-4 w-4 mr-2 flex-shrink-0" />
                      Author Guidelines
                    </button>
                    <button
                    onClick={() => setShowStandardsModal(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 w-full text-left">

                      <Link className="h-4 w-4 mr-2 flex-shrink-0" />
                      Community Standards
                    </button>
                    <button
                    onClick={() => setShowFAQModal(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 w-full text-left">

                      <Link className="h-4 w-4 mr-2 flex-shrink-0" />
                      FAQ
                    </button>
                    <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 w-full text-left">

                      <Link className="h-4 w-4 mr-2 flex-shrink-0" />
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      {/* Change Password Modal */}
      {showChangePasswordModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Change Password
              </h3>
              <button
              onClick={() => setShowChangePasswordModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError &&
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {passwordError}
                </div>
            }
              <div>
                <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Current Password
                </label>
                <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your current password"
                required />

              </div>
              <div>
                <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-1">

                  New Password
                </label>
                <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your new password"
                required
                minLength={8} />

                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>
              <div>
                <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Confirm New Password
                </label>
                <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your new password"
                required />

              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                  Cancel
                </button>
                <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">

                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      {/* Download Data Modal */}
      {showDownloadDataModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Download Your Data
              </h3>
              <button
              onClick={() => setShowDownloadDataModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <p>
                Your data download will include your profile information,
                article data, and account settings. This process may take a few
                moments.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Included in your download:
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    Profile information and contact details
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    Articles and content you've created
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    Account preferences and settings
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    Analytics and performance metrics
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
              <button
              onClick={() => setShowDownloadDataModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={handleDownloadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 flex items-center">

                <Download className="h-4 w-4 mr-1.5" />
                Download Data
              </button>
            </div>
          </div>
        </div>
      }
      {/* Deactivate Account Modal */}
      {showDeactivateAccountModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Deactivate Your Account
              </h3>
              <button
              onClick={() => setShowDeactivateAccountModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-red-50 rounded-lg text-sm text-red-800 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p>
                <strong>Warning:</strong> Deactivating your account will remove
                your profile from public view and unpublish all your articles.
                This action cannot be easily undone.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  What happens when you deactivate:
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    Your profile will no longer be visible to readers
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    All your articles will be unpublished
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    You will no longer receive notifications or emails
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    Your data will be retained for 30 days before permanent
                    deletion
                  </li>
                </ul>
              </div>
              <div className="flex items-start">
                <input
                id="confirm-deactivate"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1"
                required />

                <label
                htmlFor="confirm-deactivate"
                className="ml-2 block text-sm text-gray-700">

                  I understand that deactivating my account will remove my
                  profile and unpublish all my content
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
              <button
              onClick={() => setShowDeactivateAccountModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={handleDeactivateAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700">

                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      }
      {/* Author Guidelines Modal */}
      {showGuidelinesModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Author Guidelines
              </h3>
              <button
              onClick={() => setShowGuidelinesModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="prose prose-blue max-w-none">
              <h4>Content Standards</h4>
              <p>
                All content published on Day.News must adhere to our high
                standards of journalism. This includes:
              </p>
              <ul>
                <li>Fact-based reporting with verifiable sources</li>
                <li>Clear distinction between news and opinion content</li>
                <li>Balanced presentation of different perspectives</li>
                <li>Respectful language and tone</li>
                <li>Proper attribution for all quotes and information</li>
              </ul>
              <h4>Writing Style</h4>
              <p>
                Day.News aims to be accessible to all readers while maintaining
                journalistic integrity:
              </p>
              <ul>
                <li>Use clear, concise language</li>
                <li>
                  Structure articles with the most important information first
                </li>
                <li>Include relevant context for complex topics</li>
                <li>Avoid jargon or technical terms without explanation</li>
                <li>Use proper grammar and punctuation</li>
              </ul>
              <h4>Ethics Policy</h4>
              <p>
                Our authors are expected to uphold the highest ethical
                standards:
              </p>
              <ul>
                <li>Disclose any conflicts of interest</li>
                <li>Respect privacy and confidentiality</li>
                <li>
                  Do not accept gifts or payments from subjects of coverage
                </li>
                <li>Correct errors promptly and transparently</li>
                <li>Treat all individuals with dignity and respect</li>
              </ul>
              <h4>AI Assistance Guidelines</h4>
              <p>When using AI tools to assist with content creation:</p>
              <ul>
                <li>Always review and verify all AI-generated content</li>
                <li>
                  Do not rely on AI for fact-checking or source verification
                </li>
                <li>Maintain your unique voice and perspective</li>
                <li>Disclose AI assistance when appropriate</li>
                <li>
                  Remember that you are responsible for all published content
                </li>
              </ul>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
              onClick={() => setShowGuidelinesModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">

                Close
              </button>
            </div>
          </div>
        </div>
      }
      {/* Community Standards Modal */}
      {showStandardsModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Community Standards
              </h3>
              <button
              onClick={() => setShowStandardsModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="prose prose-blue max-w-none">
              <h4>Our Community Principles</h4>
              <p>
                Day.News is committed to fostering a respectful, inclusive
                community where diverse perspectives can be shared. Our platform
                is guided by these core principles:
              </p>
              <h5>1. Accuracy and Truth</h5>
              <p>
                We prioritize factual reporting and truthful content. Deliberate
                misinformation or unverified claims presented as facts violate
                our standards.
              </p>
              <h5>2. Respect and Civility</h5>
              <p>
                All community members, including authors and readers, must treat
                each other with respect. Harassment, hate speech, and personal
                attacks are not tolerated.
              </p>
              <h5>3. Transparency</h5>
              <p>
                Authors must disclose relevant conflicts of interest and be
                transparent about their reporting methods and sources when
                appropriate.
              </p>
              <h5>4. Privacy and Consent</h5>
              <p>
                We respect individuals' privacy rights and require appropriate
                consent when featuring private individuals in reporting.
              </p>
              <h5>5. Inclusivity</h5>
              <p>
                Our community welcomes diverse voices and perspectives.
                Discrimination based on race, gender, religion, sexual
                orientation, disability, or other protected characteristics
                violates our standards.
              </p>
              <h4>Prohibited Content</h4>
              <p>The following types of content are prohibited on Day.News:</p>
              <ul>
                <li>Deliberate misinformation or disinformation</li>
                <li>Hate speech or content that promotes discrimination</li>
                <li>Harassment or bullying of individuals or groups</li>
                <li>Graphic violence or glorification of violent acts</li>
                <li>Sexually explicit or pornographic material</li>
                <li>
                  Content that exploits or endangers vulnerable populations
                </li>
                <li>Spam, scams, or deceptive content</li>
                <li>
                  Content that violates copyright or intellectual property
                  rights
                </li>
              </ul>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
              onClick={() => setShowStandardsModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">

                Close
              </button>
            </div>
          </div>
        </div>
      }
      {/* FAQ Modal */}
      {showFAQModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Frequently Asked Questions
              </h3>
              <button
              onClick={() => setShowFAQModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  How do I get verified as an author?
                </h4>
                <p className="text-gray-600">
                  To get verified, complete your profile with accurate
                  information and credentials. Our team will review your
                  submission and may request additional documentation to confirm
                  your identity and expertise. Verification typically takes 3-5
                  business days.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  What is the AI Score shown on my articles?
                </h4>
                <p className="text-gray-600">
                  The AI Score represents the quality rating of your article
                  based on our AI analysis system. It evaluates factors like
                  readability, structure, factual consistency, and engagement
                  potential. A higher score indicates content that's likely to
                  perform well with readers.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  How are article approval rates calculated?
                </h4>
                <p className="text-gray-600">
                  Approval rates are calculated based on reader feedback,
                  including likes, positive comments, sharing behavior, and time
                  spent reading. This metric helps gauge how well your content
                  resonates with your audience.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Can I publish content from other platforms?
                </h4>
                <p className="text-gray-600">
                  You may republish content you've created for other platforms
                  if you own the rights to that content. Always ensure you're
                  not violating any exclusive publishing agreements. We
                  recommend adding new context or updates when republishing to
                  provide added value for Day.News readers.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  How do I respond to reader comments?
                </h4>
                <p className="text-gray-600">
                  You can respond to comments on your articles through the
                  Comments tab in your Author Dashboard. We encourage engaging
                  with readers to build community, but always maintain
                  professional conduct and follow our Community Standards in all
                  interactions.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  What happens if my content is flagged?
                </h4>
                <p className="text-gray-600">
                  If your content is flagged for potential violations of our
                  standards, you'll receive a notification with details. Minor
                  issues may result in a request to edit the content, while
                  serious violations may lead to content removal. Repeated
                  violations could affect your account status.
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
              onClick={() => setShowFAQModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">

                Close
              </button>
            </div>
          </div>
        </div>
      }
      {/* Contact Support Modal */}
      {showContactModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Contact Support
              </h3>
              <button
              onClick={() => setShowContactModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label
                htmlFor="support-subject"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Subject
                </label>
                <input
                type="text"
                id="support-subject"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="What can we help you with?"
                required />

              </div>
              <div>
                <label
                htmlFor="support-message"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Message
                </label>
                <textarea
                id="support-message"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe your issue in detail..."
                required>
              </textarea>
              </div>
              <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <p>
                  Our support team typically responds within 24 hours on
                  business days. For urgent matters, please include "URGENT" in
                  your subject line.
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                  Cancel
                </button>
                <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">

                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      {/* Confirmation Modal for Article Visibility */}
      {showConfirmModal && articleToToggle &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {articleToToggle.isOnline ?
            'Take Article Offline?' :
            'Put Article Online?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {articleToToggle.isOnline ?
            "This article will no longer be visible to readers and won't count toward your reviews or metrics." :
            'This article will be visible to readers and will count toward your reviews and metrics.'}
            </p>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-1">
                {articleToToggle.title}
              </h4>
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {articleToToggle.date}
                <span className="mx-2">•</span>
                {articleToToggle.category}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={confirmToggleVisibility}
              className={`px-4 py-2 rounded-md font-medium ${articleToToggle.isOnline ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>

                {articleToToggle.isOnline ? 'Take Offline' : 'Put Online'}
              </button>
            </div>
          </div>
        </div>
      }
      {/* Delete Article Confirmation Modal */}
      {showDeleteArticleModal && articleToDelete &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Article?
            </h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete the article and all associated data.
              This action cannot be undone.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-1">
                {articleToDelete.title}
              </h4>
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {articleToDelete.date}
                <span className="mx-2">•</span>
                {articleToDelete.category}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
              onClick={() => setShowDeleteArticleModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={confirmDeleteArticle}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700">

                Delete Article
              </button>
            </div>
          </div>
        </div>
      }
      {/* Edit Article Modal */}
      {showEditArticleModal && articleToEdit &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Article
              </h3>
              <button
              onClick={() => setShowEditArticleModal(false)}
              className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                htmlFor="article-title"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Article Title
                </label>
                <input
                type="text"
                id="article-title"
                value={editedArticleTitle}
                onChange={(e) => setEditedArticleTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter article title"
                required />

              </div>
              <div>
                <label
                htmlFor="article-category"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Category
                </label>
                <select
                id="article-category"
                value={editedArticleCategory}
                onChange={(e) => setEditedArticleCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required>

                  <option value="">Select a category</option>
                  <option value="Community">Community</option>
                  <option value="Local Government">Local Government</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                  <option value="Environment">Environment</option>
                  <option value="Health">Health</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                  <option value="Opinion">Opinion</option>
                </select>
              </div>
              <div>
                <label
                htmlFor="article-excerpt"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Excerpt
                </label>
                <textarea
                id="article-excerpt"
                value={editedArticleExcerpt}
                onChange={(e) => setEditedArticleExcerpt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief summary of the article"
                required>
              </textarea>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Published:</span>{' '}
                  {articleToEdit.date}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                  className={
                  articleToEdit.isOnline ?
                  'text-green-600' :
                  'text-gray-600'
                  }>

                    {articleToEdit.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <p>
                  To edit the full article content, please use the full article
                  editor from the Articles management page.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
              <button
              onClick={() => setShowEditArticleModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={saveArticleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">

                Save Changes
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};
export default AuthorProfileCreatorPage;