import React, { useEffect, useState, useRef, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Heart,
  MessageCircle,
  Flower,
  ThumbsUp,
  Gift,
  Send,
  ChevronRight,
  Home,
  ExternalLink,
  Copy,
  X,
  Mail,
  BookOpen } from
'lucide-react';
import { NewspaperMasthead } from '../navigation/NewspaperMasthead';
export const MemorialDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Memorials');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showNextMemorial, setShowNextMemorial] = useState(false);
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showCondolenceForm, setShowCondolenceForm] = useState(false);
  const [condolenceMessage, setCondolenceMessage] = useState('');
  const [memories, setMemories] = useState([]);
  const memorialRef = useRef(null);
  // Handle scroll for header behavior and reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      // Calculate reading progress
      if (memorialRef.current) {
        const totalHeight = memorialRef.current.clientHeight;
        const windowHeight = window.innerHeight;
        const scrolled = window.scrollY;
        const scrollableHeight = totalHeight - windowHeight;
        const progress = Math.min(scrolled / scrollableHeight, 1);
        setReadingProgress(progress);
        // Show next memorial preview when near bottom
        if (progress > 0.85) {
          setShowNextMemorial(true);
        } else {
          setShowNextMemorial(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) {
      navigate('/memorials');
      return;
    }
    // Simulate loading memorial data
    setLoading(true);
    setTimeout(() => {
      // Mock data for memorial detail
      const memorialData = {
        id: parseInt(id),
        name: 'Margaret Lee Wilson',
        years: '1932 - 2023',
        location: 'Clearwater, FL',
        date: 'July 25, 2023',
        image:
        'https://images.unsplash.com/photo-1551837818-f52fc6991b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        obituary:
        'Margaret Lee Wilson, 91, of Clearwater, passed away peacefully on July 25, 2023, surrounded by her loving family. Margaret was born on March 12, 1932, in Boston, Massachusetts, to John and Elizabeth Lee.\n\nMargaret moved to Clearwater in 1965 with her husband, Robert Wilson, where they raised their three children. She worked as an elementary school teacher for over 30 years, touching the lives of countless students at Clearwater Elementary School. Margaret was known for her kindness, patience, and dedication to education.\n\nAfter retiring in 1992, Margaret devoted her time to volunteering at the Clearwater Public Library and the local animal shelter. She was an avid gardener, a talented painter, and loved spending time with her grandchildren. Margaret was a member of First Baptist Church of Clearwater for over 50 years, where she sang in the choir and taught Sunday school.\n\nMargaret is survived by her children, Susan Williams (James), Michael Wilson (Katherine), and Jennifer Davis (Thomas); seven grandchildren; and three great-grandchildren. She was preceded in death by her husband, Robert Wilson, and her brother, Thomas Lee.',
        serviceDate: 'August 5, 2023',
        serviceTime: '10:00 AM',
        serviceLocation: 'First Baptist Church',
        serviceAddress: '123 Main Street, Clearwater, FL',
        interment: 'Clearwater Memorial Gardens',
        flowers:
        'Memorial donations may be made to the Clearwater Public Library or the Humane Society of Clearwater in lieu of flowers.',
        guestbook: true,
        reactions: {
          likes: 58,
          comments: 42
        }
      };
      setMemorial(memorialData);
      setLikesCount(memorialData.reactions.likes);
      // Set memories/condolences
      setMemories([
      {
        author: 'Mary Johnson',
        relationship: 'Former Student',
        date: 'July 28, 2023',
        content:
        'Mrs. Wilson was my 3rd grade teacher in 1985. She was the kindest teacher I ever had and inspired me to become a teacher myself. Her patience and love for her students was evident every day. My thoughts are with her family during this difficult time.',
        likes: 12
      },
      {
        author: 'David Thompson',
        relationship: 'Neighbor',
        date: 'July 27, 2023',
        content:
        "Margaret was a wonderful neighbor for over 20 years. She always had a smile and a kind word for everyone. I'll miss seeing her tending to her beautiful garden and our conversations over the fence. My deepest condolences to the entire family.",
        likes: 8
      },
      {
        author: 'Pastor Robert Jenkins',
        relationship: 'Church Friend',
        date: 'July 26, 2023',
        content:
        'Margaret was a pillar of our church community. Her faith was unwavering, and her service to the church was exemplary. Her beautiful voice in the choir will be deeply missed. May God comfort her family during this time of loss.',
        likes: 15
      }]
      );
      setLoading(false);
    }, 800);
  }, [location, navigate]);
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  const handleMainSectionChange = (section) => {
    navigate(`/${section}`);
  };
  const goBack = () => {
    navigate('/memorials');
  };
  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  const handleSubmitCondolence = (e) => {
    e.preventDefault();
    if (condolenceMessage.trim() === '') return;
    const newMemory = {
      author: 'You',
      relationship: 'Website Visitor',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      content: condolenceMessage,
      likes: 0
    };
    setMemories([newMemory, ...memories]);
    setCondolenceMessage('');
    setShowCondolenceForm(false);
  };
  const handleShareMemorial = () => {
    // Share functionality would go here
    alert('Share functionality would be implemented here');
  };
  const navigateToAdvertisingDetail = () => {
    navigate('/advertisingDetail');
  };
  const dismissNextMemorial = () => {
    setShowNextMemorial(false);
  };
  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <StickyNav
          scrolled={scrolled}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onMainSectionChange={handleMainSectionChange} />

        <div className="container mx-auto px-4 py-8 mt-28 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-news-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading memorial...</p>
          </div>
        </div>
      </div>);

  }
  if (!memorial) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <StickyNav
          scrolled={scrolled}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onMainSectionChange={handleMainSectionChange} />

        <div className="container mx-auto px-4 py-8 mt-28">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Memorial Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The memorial you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={goBack}
              className="bg-news-primary text-white px-4 py-2 rounded-md hover:bg-news-primary-dark transition-colors">

              Return to Memorials
            </button>
          </div>
        </div>
      </div>);

  }
  return (
    <div className="min-h-screen bg-gray-50">
      <NewspaperMasthead
        scrolled={scrolled}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onMainSectionChange={handleMainSectionChange} />

      {/* Reading progress indicator */}
      <div className="fixed top-16 left-0 right-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full bg-gray-500 transition-all duration-300"
          style={{
            width: `${readingProgress * 100}%`
          }}>
        </div>
      </div>
      <main className="pt-4 pb-16" ref={memorialRef}>
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <a href="#" className="hover:underline flex items-center">
              <Home className="h-3 w-3 mr-1" />
              <span>Home</span>
            </a>
            <ChevronRight className="h-3 w-3 mx-1" />
            <a
              href="#"
              className="hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate('/memorials');
              }}>

              Memorials
            </a>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-gray-700">{memorial.name}</span>
          </div>
          <button
            onClick={goBack}
            className="flex items-center text-news-primary mb-6 hover:underline">

            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Memorials
          </button>
          {/* Memorial header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gray-800 text-white border-b border-gray-700 flex items-center">
              <Flower className="h-5 w-5 mr-2" />
              <h1 className="text-xl font-bold">In Loving Memory</h1>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={memorial.image}
                      alt={memorial.name}
                      className="w-full h-auto object-cover grayscale" />

                  </div>
                  {/* First Ad - Below photo */}
                  <div
                    className="mt-6 bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={navigateToAdvertisingDetail}>

                    <p className="text-xs text-gray-500 mb-2">ADVERTISEMENT</p>
                    <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400">Memorial Services</span>
                    </div>
                  </div>
                  {/* Memorial Service Information */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Service Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">
                            Date & Time
                          </div>
                          <div className="text-sm text-gray-600">
                            {memorial.serviceDate} at {memorial.serviceTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">
                            Location
                          </div>
                          <div className="text-sm text-gray-600">
                            {memorial.serviceLocation}
                          </div>
                          <div className="text-sm text-gray-600">
                            {memorial.serviceAddress}
                          </div>
                        </div>
                      </div>
                      {memorial.interment &&
                      <div className="flex">
                          <BookOpen className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900">
                              Interment
                            </div>
                            <div className="text-sm text-gray-600">
                              {memorial.interment}
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                  {/* Flowers and Gifts */}
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Send Flowers & Gifts
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Flower className="h-6 w-6 text-pink-500 mb-2" />
                        <span className="text-sm text-gray-900">Flowers</span>
                      </button>
                      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="h-6 w-6 text-amber-500 mb-2" />
                        <span className="text-sm text-gray-900">Candle</span>
                      </button>
                      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Gift className="h-6 w-6 text-blue-500 mb-2" />
                        <span className="text-sm text-gray-900">Gift</span>
                      </button>
                      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Heart className="h-6 w-6 text-red-500 mb-2" />
                        <span className="text-sm text-gray-900">Tribute</span>
                      </button>
                    </div>
                    {memorial.flowers &&
                    <div className="mt-3 text-sm text-gray-600 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                        <strong>Note:</strong> {memorial.flowers}
                      </div>
                    }
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {memorial.name}
                  </h2>
                  <p className="text-xl text-gray-600 mb-4">{memorial.years}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{memorial.location}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Passed on {memorial.date}</span>
                  </div>
                  {/* Obituary */}
                  <div className="prose max-w-none mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Obituary
                    </h3>
                    {memorial.obituary.split('\n\n').map((paragraph, idx) =>
                    <p
                      key={idx}
                      className="mb-4 text-gray-700 leading-relaxed">

                        {paragraph}
                      </p>
                    )}
                  </div>
                  {/* Second Ad - Within content */}
                  <div
                    className="my-8 bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={navigateToAdvertisingDetail}>

                    <p className="text-xs text-gray-500 mb-2">ADVERTISEMENT</p>
                    <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400">
                        Memorial Foundations & Charities
                      </span>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${liked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'} hover:bg-red-50 hover:text-red-600 transition-colors`}
                      onClick={handleLike}>

                      <Heart
                        className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />

                      <span>Remember</span>
                      <span className="text-gray-500">{likesCount}</span>
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700"
                      onClick={() => setShowCondolenceForm(!showCondolenceForm)}>

                      <MessageCircle className="h-4 w-4" />
                      <span>Share a Memory</span>
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700"
                      onClick={handleShareMemorial}>

                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 ml-auto">
                      <Flower className="h-4 w-4" />
                      <span>Send Flowers</span>
                    </button>
                  </div>
                  {/* Condolence form */}
                  {showCondolenceForm &&
                  <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Share a Memory or Condolence
                      </h3>
                      <form onSubmit={handleSubmitCondolence}>
                        <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary h-32 text-sm"
                        placeholder="Share your memories or offer your condolences to the family..."
                        value={condolenceMessage}
                        onChange={(e) => setCondolenceMessage(e.target.value)}
                        required>
                      </textarea>
                        <div className="flex justify-end mt-3 space-x-3">
                          <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowCondolenceForm(false)}>

                            Cancel
                          </button>
                          <button
                          type="submit"
                          className="px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">

                            Submit
                          </button>
                        </div>
                      </form>
                    </div>
                  }
                  {/* Memories and Condolences */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Memories & Condolences
                    </h3>
                    {memories.length > 0 ?
                    <div className="space-y-6">
                        {memories.map((memory, idx) =>
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border border-gray-200">

                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {memory.author}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {memory.relationship} • {memory.date}
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-red-500">
                                <Heart className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="mt-3 text-gray-700">
                              {memory.content}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <button className="flex items-center hover:text-blue-600">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                <span>{memory.likes}</span>
                              </button>
                              <span className="mx-2">•</span>
                              <button className="hover:text-blue-600">
                                Reply
                              </button>
                            </div>
                          </div>
                      )}
                      </div> :

                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          No memories have been shared yet.
                        </p>
                        <button
                        className="mt-2 text-news-primary hover:underline"
                        onClick={() => setShowCondolenceForm(true)}>

                          Be the first to share a memory or condolence
                        </button>
                      </div>
                    }
                    {memories.length > 0 &&
                    <div className="mt-4 text-center">
                        <button
                        className="text-news-primary hover:underline"
                        onClick={() => setShowCondolenceForm(true)}>

                          Share your memory or condolence
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Third Ad - Full width */}
          <div
            className="mb-8 bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={navigateToAdvertisingDetail}>

            <p className="text-xs text-gray-500 mb-2">ADVERTISEMENT</p>
            <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400">
                Local Funeral Homes & Memorial Services
              </span>
            </div>
          </div>
          {/* Similar Memorials */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Other Recent Memorials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/memorialDetail?id=2')}>

                <div className="p-4">
                  <div className="h-40 rounded-md overflow-hidden mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Robert James Thompson"
                      className="w-full h-full object-cover grayscale" />

                  </div>
                  <h4 className="font-bold text-gray-900">
                    Robert James Thompson
                  </h4>
                  <p className="text-sm text-gray-600">1945 - 2023</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Dunedin, FL</span>
                    <span className="mx-1">•</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>July 18, 2023</span>
                  </div>
                </div>
              </div>
              <div
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/memorialDetail?id=3')}>

                <div className="p-4">
                  <div className="h-40 rounded-md overflow-hidden mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Elizabeth Anne Parker"
                      className="w-full h-full object-cover grayscale" />

                  </div>
                  <h4 className="font-bold text-gray-900">
                    Elizabeth Anne Parker
                  </h4>
                  <p className="text-sm text-gray-600">1958 - 2023</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Palm Harbor, FL</span>
                    <span className="mx-1">•</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>July 10, 2023</span>
                  </div>
                </div>
              </div>
              <div
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/memorialDetail?id=4')}>

                <div className="p-4">
                  <div className="h-40 rounded-md overflow-hidden mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Thomas William Brown"
                      className="w-full h-full object-cover grayscale" />

                  </div>
                  <h4 className="font-bold text-gray-900">
                    Thomas William Brown
                  </h4>
                  <p className="text-sm text-gray-600">1940 - 2023</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Clearwater, FL</span>
                    <span className="mx-1">•</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>July 5, 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Next memorial preview - shows at 85% scroll */}
      {showNextMemorial &&
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 transition-all duration-300 transform translate-y-0 z-20">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-3">
                <img
                src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                alt="Next memorial thumbnail"
                className="w-full h-full object-cover grayscale" />

              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">NEXT MEMORIAL</div>
                <h3 className="font-display font-bold text-gray-900">
                  Robert James Thompson (1945 - 2023)
                </h3>
              </div>
            </div>
            <div className="flex items-center">
              <button
              className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-news-primary-dark mr-2"
              onClick={() => navigate('/memorialDetail?id=2')}>

                View Memorial
              </button>
              <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={dismissNextMemorial}>

                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};