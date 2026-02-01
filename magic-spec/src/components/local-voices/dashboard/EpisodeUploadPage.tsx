import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Upload,
  FileAudio,
  Image as ImageIcon,
  Info,
  Calendar,
  Tag,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  ChevronRight,
  Mic,
  Play,
  Pause,
  Clock,
  Save,
  Eye,
  ArrowLeft,
  ArrowRight,
  HelpCircle } from
'lucide-react';
export default function EpisodeUploadPage() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropzoneRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episodeNumber: '',
    season: '1',
    publishDate: formatDate(new Date()),
    isExplicit: false,
    visibility: 'public',
    tags: [] as string[],
    currentTag: '',
    audioFile: null as File | null,
    audioDuration: '0:00',
    audioSize: 0,
    coverImage: null as File | null,
    coverImagePreview: '',
    transcript: null as File | null,
    showNotes: '',
    seoTitle: '',
    seoDescription: ''
  });
  // Format date to YYYY-MM-DD
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Tabs configuration
  const tabs = [
  {
    id: 'details',
    label: 'Episode Details',
    icon: Info
  },
  {
    id: 'media',
    label: 'Media Upload',
    icon: FileAudio
  },
  {
    id: 'content',
    label: 'Show Notes',
    icon: Tag
  },
  {
    id: 'preview',
    label: 'Preview & Publish',
    icon: Eye
  }];

  // Validate form data
  const validateForm = (tab: string): boolean => {
    const newErrors: Record<string, string> = {};
    if (tab === 'details' || tab === 'preview') {
      if (!formData.title.trim()) {
        newErrors.title = 'Episode title is required';
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be less than 100 characters';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Episode description is required';
      }
      if (formData.episodeNumber && !/^\d+$/.test(formData.episodeNumber)) {
        newErrors.episodeNumber = 'Episode number must be a valid number';
      }
    }
    if (tab === 'media' || tab === 'preview') {
      if (!formData.audioFile) {
        newErrors.audioFile = 'Audio file is required';
      }
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle tab change
  const handleTabChange = (tab: string) => {
    if (validateForm(currentTab)) {
      setCurrentTab(tab);
      window.scrollTo(0, 0);
    }
  };
  // Handle form input changes
  const handleInputChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>

  {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setSaveStatus('unsaved');
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = formData.currentTag.trim();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tag],
          currentTag: ''
        });
        setSaveStatus('unsaved');
      }
    }
  };
  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove)
    });
    setSaveStatus('unsaved');
  };
  // Handle audio file upload
  const handleAudioUpload = (file: File) => {
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      setFormErrors({
        ...formErrors,
        audioFile: 'Invalid file type. Please upload MP3, WAV, or OGG files.'
      });
      return;
    }
    // Validate file size (max 200MB)
    if (file.size > 200 * 1024 * 1024) {
      setFormErrors({
        ...formErrors,
        audioFile: 'File size exceeds 200MB limit.'
      });
      return;
    }
    // Create URL for audio preview
    const audioURL = URL.createObjectURL(file);
    const audio = new Audio(audioURL);
    // Get audio duration when metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
      const duration = formatDuration(audio.duration);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFormData({
        ...formData,
        audioFile: file,
        audioDuration: duration,
        audioSize: parseFloat(sizeMB)
      });
      if (audioRef.current) {
        audioRef.current.src = audioURL;
      }
      // Clear error
      if (formErrors.audioFile) {
        setFormErrors({
          ...formErrors,
          audioFile: ''
        });
      }
    });
    setSaveStatus('unsaved');
  };
  // Handle image upload
  const handleImageUpload = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFormErrors({
        ...formErrors,
        coverImage: 'Invalid file type. Please upload JPG or PNG files.'
      });
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({
        ...formErrors,
        coverImage: 'File size exceeds 5MB limit.'
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData({
        ...formData,
        coverImage: file,
        coverImagePreview: e.target?.result as string
      });
      // Clear error
      if (formErrors.coverImage) {
        setFormErrors({
          ...formErrors,
          coverImage: ''
        });
      }
    };
    reader.readAsDataURL(file);
    setSaveStatus('unsaved');
  };
  // Handle transcript upload
  const handleTranscriptUpload = (file: File) => {
    // Validate file type
    const validTypes = [
    'text/plain',
    'application/pdf',
    'text/vtt',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!validTypes.includes(file.type)) {
      setFormErrors({
        ...formErrors,
        transcript:
        'Invalid file type. Please upload TXT, PDF, VTT, or DOCX files.'
      });
      return;
    }
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFormErrors({
        ...formErrors,
        transcript: 'File size exceeds 10MB limit.'
      });
      return;
    }
    setFormData({
      ...formData,
      transcript: file
    });
    // Clear error
    if (formErrors.transcript) {
      setFormErrors({
        ...formErrors,
        transcript: ''
      });
    }
    setSaveStatus('unsaved');
  };
  // Format duration from seconds to mm:ss or hh:mm:ss
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  // Handle file drop
  const handleFileDrop = (
  e: React.DragEvent<HTMLDivElement>,
  type: 'audio' | 'image' | 'transcript') =>
  {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      switch (type) {
        case 'audio':
          handleAudioUpload(file);
          break;
        case 'image':
          handleImageUpload(file);
          break;
        case 'transcript':
          handleTranscriptUpload(file);
          break;
      }
    }
  };
  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  // Handle file input change
  const handleFileInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  type: 'audio' | 'image' | 'transcript') =>
  {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      switch (type) {
        case 'audio':
          handleAudioUpload(file);
          break;
        case 'image':
          handleImageUpload(file);
          break;
        case 'transcript':
          handleTranscriptUpload(file);
          break;
      }
    }
  };
  // Toggle audio playback
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  // Auto-save form data periodically
  useEffect(() => {
    let saveTimer: NodeJS.Timeout;
    if (saveStatus === 'unsaved') {
      setSaveStatus('saving');
      saveTimer = setTimeout(() => {
        // Simulate saving to server
        console.log('Auto-saving form data...', formData);
        setSaveStatus('saved');
      }, 2000);
    }
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [saveStatus, formData]);
  // Update audio play state
  useEffect(() => {
    const audioElement = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    if (audioElement) {
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handleEnded);
    }
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, []);
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('preview')) {
      setError('Please fix the errors before publishing.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Simulate successful submission
      setSuccess(true);
      setSaveStatus('saved');
      // Redirect after success message
      setTimeout(() => {
        navigate('/local-voices/dashboard/podcast');
      }, 3000);
    } catch (err) {
      setError('Failed to publish episode. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle save draft
  const handleSaveDraft = () => {
    setSaveStatus('saving');
    // Simulate saving to server
    setTimeout(() => {
      setSaveStatus('saved');
      setSuccess(true);
      setError(null);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };
  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-gray-500 text-sm">
            <Loader className="w-3 h-3 mr-1 animate-spin" />
            <span>Saving...</span>
          </div>);

      case 'saved':
        return (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            <span>Saved</span>
          </div>);

      case 'unsaved':
        return (
          <div className="flex items-center text-amber-500 text-sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span>Unsaved changes</span>
          </div>);

    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                to="/local-voices/dashboard"
                className="text-gray-500 hover:text-gray-700 flex items-center"
                aria-label="Back to dashboard">

                <ChevronLeft className="w-5 h-5 mr-1" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Upload New Episode
            </h1>
            <div className="flex items-center space-x-4">
              {renderSaveStatus()}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting || saveStatus === 'saved'}
                className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg text-sm px-4 py-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save draft">

                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main content */}
      <main className="container mx-auto px-4 max-w-5xl py-8">
        {/* Success message */}
        {success &&
        <div
          className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start justify-between"
          role="alert">

            <div className="flex">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Success!</h3>
                <p className="text-sm">
                  {isSubmitting ?
                'Your episode is being published.' :
                'Your draft has been saved.'}
                </p>
              </div>
            </div>
            <button
            onClick={() => setSuccess(false)}
            className="text-green-700"
            aria-label="Dismiss message">

              <X className="w-5 h-5" />
            </button>
          </div>
        }
        {/* Error message */}
        {error &&
        <div
          className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start justify-between"
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
        {/* Tabs */}
        <div className="mb-8">
          <div className="hidden sm:flex border-b border-gray-200">
            {tabs.map((tab, index) =>
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm ${currentTab === tab.id ? 'border-news-primary text-news-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              aria-current={currentTab === tab.id ? 'page' : undefined}>

                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            )}
          </div>
          {/* Mobile tabs */}
          <div className="sm:hidden">
            <select
              value={currentTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-news-primary focus:outline-none focus:ring-news-primary"
              aria-label="Select tab">

              {tabs.map((tab) =>
              <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              )}
            </select>
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Details Tab */}
          {currentTab === 'details' &&
          <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Episode Title <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md shadow-sm ${formErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-news-primary focus:ring-news-primary'}`}
                    placeholder="Enter episode title"
                    aria-describedby={
                    formErrors.title ? 'title-error' : undefined
                    }
                    aria-invalid={formErrors.title ? 'true' : 'false'} />

                    {formErrors.title &&
                  <p className="mt-2 text-sm text-red-600" id="title-error">
                        {formErrors.title}
                      </p>
                  }
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.title.length}/100 characters
                    </p>
                  </div>
                  {/* Description */}
                  <div>
                    <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Episode Description{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md shadow-sm ${formErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-news-primary focus:ring-news-primary'}`}
                    placeholder="Describe what this episode is about"
                    aria-describedby={
                    formErrors.description ? 'description-error' : undefined
                    }
                    aria-invalid={formErrors.description ? 'true' : 'false'} />

                    {formErrors.description &&
                  <p
                    className="mt-2 text-sm text-red-600"
                    id="description-error">

                        {formErrors.description}
                      </p>
                  }
                    <p className="mt-1 text-xs text-gray-500">
                      Provide a compelling description to attract listeners.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Episode Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Episode Number */}
                  <div>
                    <label
                    htmlFor="episodeNumber"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Episode Number
                    </label>
                    <input
                    type="text"
                    id="episodeNumber"
                    name="episodeNumber"
                    value={formData.episodeNumber}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md shadow-sm ${formErrors.episodeNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-news-primary focus:ring-news-primary'}`}
                    placeholder="e.g. 42"
                    aria-describedby={
                    formErrors.episodeNumber ?
                    'episodeNumber-error' :
                    undefined
                    }
                    aria-invalid={formErrors.episodeNumber ? 'true' : 'false'} />

                    {formErrors.episodeNumber &&
                  <p
                    className="mt-2 text-sm text-red-600"
                    id="episodeNumber-error">

                        {formErrors.episodeNumber}
                      </p>
                  }
                  </div>
                  {/* Season */}
                  <div>
                    <label
                    htmlFor="season"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Season
                    </label>
                    <input
                    type="text"
                    id="season"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
                    placeholder="e.g. 1" />

                  </div>
                  {/* Publish Date */}
                  <div>
                    <label
                    htmlFor="publishDate"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Publish Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                      type="date"
                      id="publishDate"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary" />

                    </div>
                  </div>
                  {/* Explicit Content */}
                  <div className="flex items-center h-full pt-6">
                    <input
                    id="isExplicit"
                    name="isExplicit"
                    type="checkbox"
                    checked={formData.isExplicit}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-news-primary focus:ring-news-primary" />

                    <label
                    htmlFor="isExplicit"
                    className="ml-2 block text-sm text-gray-700">

                      This episode contains explicit content
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Visibility
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                    id="visibility-public"
                    name="visibility"
                    type="radio"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-gray-300 text-news-primary focus:ring-news-primary" />

                    <label htmlFor="visibility-public" className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Public
                      </div>
                      <div className="text-sm text-gray-500">
                        Visible to everyone, including in search results and on
                        your profile.
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                    id="visibility-unlisted"
                    name="visibility"
                    type="radio"
                    value="unlisted"
                    checked={formData.visibility === 'unlisted'}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-gray-300 text-news-primary focus:ring-news-primary" />

                    <label htmlFor="visibility-unlisted" className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Unlisted
                      </div>
                      <div className="text-sm text-gray-500">
                        Only accessible via direct link, not shown in search
                        results or on your profile.
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                    id="visibility-private"
                    name="visibility"
                    type="radio"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-gray-300 text-news-primary focus:ring-news-primary" />

                    <label htmlFor="visibility-private" className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Private
                      </div>
                      <div className="text-sm text-gray-500">
                        Only visible to you. Use this for drafts or content
                        you're not ready to share.
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                type="button"
                onClick={() => handleTabChange('media')}
                className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-6 rounded-lg flex items-center">

                  Next: Media Upload
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          }
          {/* Media Upload Tab */}
          {currentTab === 'media' &&
          <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Audio File
                </h2>
                {!formData.audioFile ?
              <div
                ref={dropzoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleFileDrop(e, 'audio')}
                className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-news-primary bg-blue-50' : formErrors.audioFile ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-news-primary hover:bg-gray-50'}`}>

                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <FileAudio className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Drag and drop your audio file here
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          MP3, WAV, or OGG files up to 200MB
                        </p>
                      </div>
                      <div>
                        <label
                      htmlFor="audio-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary cursor-pointer">

                          <Upload className="h-4 w-4 mr-2" />
                          Select Audio File
                        </label>
                        <input
                      id="audio-upload"
                      name="audio"
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                      onChange={(e) => handleFileInputChange(e, 'audio')}
                      className="sr-only"
                      aria-describedby={
                      formErrors.audioFile ? 'audio-error' : undefined
                      }
                      aria-invalid={formErrors.audioFile ? 'true' : 'false'} />

                      </div>
                    </div>
                  </div> :

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileAudio className="h-8 w-8 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {formData.audioFile.name}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formData.audioDuration}
                            </span>
                            <span>{formData.audioSize} MB</span>
                          </div>
                        </div>
                      </div>
                      <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        audioFile: null,
                        audioDuration: '0:00',
                        audioSize: 0
                      });
                      if (audioRef.current) {
                        audioRef.current.src = '';
                      }
                    }}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Remove audio file">

                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <audio
                    ref={audioRef}
                    className="w-full"
                    controls
                    preload="metadata" />

                      <div className="flex items-center justify-between mt-3">
                        <button
                      type="button"
                      onClick={togglePlayback}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary"
                      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>

                          {isPlaying ?
                      <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </> :

                      <>
                              <Play className="h-4 w-4 mr-1" />
                              Play
                            </>
                      }
                        </button>
                        <div className="text-xs text-gray-500">
                          {formData.visibility === 'public' ?
                      <span className="flex items-center text-green-600">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </span> :
                      formData.visibility === 'unlisted' ?
                      <span className="flex items-center text-amber-600">
                              <Link className="h-3 w-3 mr-1" />
                              Unlisted
                            </span> :

                      <span className="flex items-center text-gray-600">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </span>
                      }
                        </div>
                      </div>
                    </div>
                  </div>
              }
                {formErrors.audioFile &&
              <p className="mt-2 text-sm text-red-600" id="audio-error">
                    {formErrors.audioFile}
                  </p>
              }
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Cover Image
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {!formData.coverImage ?
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleFileDrop(e, 'image')}
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-news-primary bg-blue-50' : formErrors.coverImage ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-news-primary hover:bg-gray-50'}`}>

                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <ImageIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Drag and drop your cover image
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG or PNG up to 5MB (1400x1400px recommended)
                            </p>
                          </div>
                          <div>
                            <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary cursor-pointer">

                              <Upload className="h-4 w-4 mr-1" />
                              Select Image
                            </label>
                            <input
                          id="image-upload"
                          name="image"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) =>
                          handleFileInputChange(e, 'image')
                          }
                          className="sr-only"
                          aria-describedby={
                          formErrors.coverImage ?
                          'image-error' :
                          undefined
                          }
                          aria-invalid={
                          formErrors.coverImage ? 'true' : 'false'
                          } />

                          </div>
                        </div>
                      </div> :

                  <div className="relative rounded-lg border border-gray-200 overflow-hidden">
                        <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          coverImage: null,
                          coverImagePreview: ''
                        });
                      }}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 rounded-full p-1 text-white hover:bg-opacity-80"
                      aria-label="Remove cover image">

                          <X className="h-4 w-4" />
                        </button>
                        <img
                      src={formData.coverImagePreview}
                      alt="Episode cover"
                      className="w-full h-auto object-cover" />

                      </div>
                  }
                    {formErrors.coverImage &&
                  <p className="mt-2 text-sm text-red-600" id="image-error">
                        {formErrors.coverImage}
                      </p>
                  }
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Image Guidelines
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        Square format (1:1 ratio) with minimum dimensions of
                        1400x1400 pixels
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        High resolution (72 dpi minimum)
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        JPG or PNG format under 5MB
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        Clear, high-quality image that represents your episode
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                        Avoid text-heavy images as they may be difficult to read
                        on small screens
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Transcript (Optional)
                </h2>
                {!formData.transcript ?
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleFileDrop(e, 'transcript')}
                className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-news-primary bg-blue-50' : formErrors.transcript ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-news-primary hover:bg-gray-50'}`}>

                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <FileText className="h-10 w-10 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Add a transcript to improve accessibility
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          TXT, PDF, VTT, or DOCX files up to 10MB
                        </p>
                      </div>
                      <div>
                        <label
                      htmlFor="transcript-upload"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary cursor-pointer">

                          <Upload className="h-4 w-4 mr-1" />
                          Select Transcript
                        </label>
                        <input
                      id="transcript-upload"
                      name="transcript"
                      type="file"
                      accept="text/plain,application/pdf,text/vtt,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) =>
                      handleFileInputChange(e, 'transcript')
                      }
                      className="sr-only"
                      aria-describedby={
                      formErrors.transcript ?
                      'transcript-error' :
                      undefined
                      }
                      aria-invalid={
                      formErrors.transcript ? 'true' : 'false'
                      } />

                      </div>
                    </div>
                  </div> :

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {formData.transcript.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(formData.transcript.size / 1024 / 1024).toFixed(
                          2
                        )}{' '}
                            MB
                          </p>
                        </div>
                      </div>
                      <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        transcript: null
                      });
                    }}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Remove transcript file">

                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
              }
                {formErrors.transcript &&
              <p
                className="mt-2 text-sm text-red-600"
                id="transcript-error">

                    {formErrors.transcript}
                  </p>
              }
                <div className="mt-4 flex items-start">
                  <HelpCircle className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Adding a transcript makes your content more accessible to
                    all listeners and can improve discoverability in search
                    results.
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                type="button"
                onClick={() => handleTabChange('details')}
                className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg flex items-center">

                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </button>
                <button
                type="button"
                onClick={() => handleTabChange('content')}
                className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-6 rounded-lg flex items-center">

                  Next: Show Notes
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          }
          {/* Content Tab */}
          {currentTab === 'content' &&
          <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Show Notes
                </h2>
                <div>
                  <label
                  htmlFor="showNotes"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Episode Notes
                  </label>
                  <textarea
                  id="showNotes"
                  name="showNotes"
                  rows={8}
                  value={formData.showNotes}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
                  placeholder="Add links, references, timestamps, or additional information about your episode..." />

                  <p className="mt-2 text-sm text-gray-500">
                    Add timestamps, links to resources mentioned, guest
                    information, and any other details that would be helpful for
                    your listeners.
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
                <div>
                  <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Episode Tags (up to 5)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag) =>
                  <div
                    key={tag}
                    className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm flex items-center">

                        <span>{tag}</span>
                        <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                      aria-label={`Remove tag ${tag}`}>

                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                  )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="text"
                    id="currentTag"
                    name="currentTag"
                    value={formData.currentTag}
                    onChange={handleInputChange}
                    onKeyDown={handleTagInput}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
                    placeholder="Add a tag and press Enter"
                    disabled={formData.tags.length >= 5} />

                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.tags.length}/5 tags. Press Enter or comma after
                    each tag.
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  SEO Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                    htmlFor="seoTitle"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      SEO Title
                    </label>
                    <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
                    placeholder="Optimize your title for search engines" />

                    <p className="mt-1 text-xs text-gray-500">
                      If left blank, your episode title will be used.
                    </p>
                  </div>
                  <div>
                    <label
                    htmlFor="seoDescription"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      SEO Description
                    </label>
                    <textarea
                    id="seoDescription"
                    name="seoDescription"
                    rows={3}
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary"
                    placeholder="A brief description optimized for search engines" />

                    <p className="mt-1 text-xs text-gray-500">
                      If left blank, the first 160 characters of your episode
                      description will be used.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                type="button"
                onClick={() => handleTabChange('media')}
                className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg flex items-center">

                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </button>
                <button
                type="button"
                onClick={() => handleTabChange('preview')}
                className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-6 rounded-lg flex items-center">

                  Next: Preview & Publish
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          }
          {/* Preview Tab */}
          {currentTab === 'preview' &&
          <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Episode Preview
                </h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header with cover image */}
                  <div className="relative bg-gray-100 h-48 flex items-center justify-center">
                    {formData.coverImagePreview ?
                  <img
                    src={formData.coverImagePreview}
                    alt="Episode cover"
                    className="h-full w-full object-contain" /> :


                  <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="h-16 w-16" />
                        <p className="text-sm mt-2">No cover image</p>
                      </div>
                  }
                  </div>
                  {/* Episode details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {formData.title || 'Untitled Episode'}
                    </h3>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2 mb-4">
                      {formData.episodeNumber &&
                    <span>Episode {formData.episodeNumber}</span>
                    }
                      {formData.season && <span>Season {formData.season}</span>}
                      <span>
                        {new Date(formData.publishDate).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }
                      )}
                      </span>
                      {formData.isExplicit &&
                    <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                          Explicit
                        </span>
                    }
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formData.audioDuration}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-gray-700 whitespace-pre-line">
                        {formData.description || 'No description provided.'}
                      </p>
                    </div>
                    {formData.audioFile &&
                  <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Audio Preview
                        </h4>
                        <audio
                      controls
                      className="w-full"
                      src={audioRef.current?.src}
                      preload="metadata" />

                      </div>
                  }
                    {formData.tags.length > 0 &&
                  <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) =>
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">

                              {tag}
                            </span>
                      )}
                        </div>
                      </div>
                  }
                    {formData.showNotes &&
                  <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Show Notes
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 text-sm whitespace-pre-line">
                            {formData.showNotes}
                          </p>
                        </div>
                      </div>
                  }
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Publish Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <div
                      className={`px-3 py-1.5 rounded-full ${formData.visibility === 'public' ? 'bg-green-100 text-green-800' : formData.visibility === 'unlisted' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>

                        {formData.visibility === 'public' ?
                      'Public' :
                      formData.visibility === 'unlisted' ?
                      'Unlisted' :
                      'Private'}
                      </div>
                      <button
                      type="button"
                      onClick={() => handleTabChange('details')}
                      className="text-news-primary hover:text-news-primary-dark text-sm">

                        Change
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Publish Date
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="text-gray-900">
                        {new Date(formData.publishDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }
                      )}
                      </div>
                      <button
                      type="button"
                      onClick={() => handleTabChange('details')}
                      className="text-news-primary hover:text-news-primary-dark text-sm">

                        Change
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">
                        Before you publish
                      </h3>
                      <ul className="mt-2 text-sm text-amber-700 space-y-1 list-disc list-inside">
                        <li>Ensure all required fields are complete</li>
                        <li>Check that your audio file plays correctly</li>
                        <li>Verify your show notes for accuracy</li>
                        <li>
                          Once published, your episode will be available
                          according to your visibility settings
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                type="button"
                onClick={() => handleTabChange('content')}
                className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg flex items-center">

                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </button>
                <div className="flex space-x-3">
                  <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg"
                  disabled={isSubmitting}>

                    Save as Draft
                  </button>
                  <button
                  type="submit"
                  className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-6 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}>

                    {isSubmitting ?
                  <>
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Publishing...
                      </> :

                  <>
                        <Mic className="h-5 w-5 mr-2" />
                        Publish Episode
                      </>
                  }
                  </button>
                </div>
              </div>
            </div>
          }
        </form>
      </main>
    </div>);

}
// Needed for the FileText icon used in the component
function FileText(props) {
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

      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>);

}
// Needed for the Lock icon used in the component
function Lock(props) {
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

      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>);

}