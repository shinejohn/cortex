import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Heart,
  MessageCircle,
  Award,
  ThumbsUp,
  Gift,
  ExternalLink,
  Clock } from
'lucide-react';
import { CommentSection, Comment } from '../common/CommentSection';
import { SocialShare, ShareButton } from '../common/SocialShare';
export const AnnouncementDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [relatedAnnouncements, setRelatedAnnouncements] = useState([]);
  const [comments, setComments] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  // Mock authentication state - in a real app, this would come from an auth context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Check if we're returning from login
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const returnFromLogin = params.get('returnFromLogin');
    if (returnFromLogin === 'true') {
      // In a real app, we would check if the user is now authenticated
      setIsLoggedIn(true);
      // Remove the returnFromLogin parameter from the URL
      const newParams = new URLSearchParams(location.search);
      newParams.delete('returnFromLogin');
      // Update the URL without the returnFromLogin parameter
      const newUrl = `${location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
      // Focus the comment field
      setTimeout(() => {
        const commentField = document.getElementById('comment-section');
        if (commentField) {
          commentField.focus();
        }
      }, 500);
    }
  }, [location]);
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) {
      navigate('/announcements');
      return;
    }
    // Simulate loading announcement data
    setLoading(true);
    setTimeout(() => {
      // Mock data for announcement detail
      const announcementData = {
        id: parseInt(id),
        type: 'graduation',
        title: 'Sarah Johnson Graduates Summa Cum Laude',
        content:
        "We are proud to announce that our daughter, Sarah Johnson, has graduated from the University of Florida with a Bachelor of Science in Computer Engineering, Summa Cum Laude. Sarah has accepted a position at Microsoft and will be moving to Seattle next month.\n\nSarah has been an exceptional student throughout her academic career, maintaining a perfect 4.0 GPA while also participating in numerous extracurricular activities. She served as the president of the Women in Engineering Society and completed internships at Google and Amazon.\n\nWe would like to thank all of Sarah's professors, mentors, and friends who have supported her throughout her college journey. We are incredibly proud of her accomplishments and excited for her future at Microsoft.",
        image:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        date: 'August 1, 2023',
        location: 'Clearwater, FL',
        author: 'John and Mary Johnson',
        reactions: {
          likes: 42,
          comments: 8
        },
        extraInfo:
        'Bachelor of Science in Computer Engineering, Summa Cum Laude',
        school: 'University of Florida, Class of 2023',
        ceremony: 'May 5, 2023 at 10:00 AM',
        achievements: [
        'President of Women in Engineering Society',
        'Recipient of the Outstanding Computer Engineering Student Award',
        'Member of Tau Beta Pi Engineering Honor Society',
        'Published research paper in IEEE Computer Architecture Conference'],

        comments: [
        {
          author: 'Jane Smith',
          content:
          'Congratulations, Sarah! So proud of your accomplishments!',
          date: 'August 2, 2023',
          likes: 5,
          id: 1,
          isLiked: false
        },
        {
          author: 'Professor Williams',
          content:
          'It was a pleasure having Sarah in my classes. She has a bright future ahead!',
          date: 'August 1, 2023',
          likes: 8,
          id: 2,
          isLiked: false
        }]

      };
      setAnnouncement(announcementData);
      setLikesCount(announcementData.reactions.likes);
      setComments(announcementData.comments);
      // Set related announcements
      setRelatedAnnouncements([
      {
        id: 2,
        type: 'graduation',
        title: 'Michael Thompson Graduates with Honors',
        image:
        'https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        date: 'July 15, 2023',
        location: 'Dunedin, FL'
      },
      {
        id: 3,
        type: 'graduation',
        title: 'Clearwater High School Class of 2023 Graduation',
        image:
        'https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        date: 'June 10, 2023',
        location: 'Clearwater, FL'
      },
      {
        id: 4,
        type: 'achievement',
        title: "Local Students Named to Dean's List",
        image:
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        date: 'July 20, 2023',
        location: 'Palm Harbor, FL'
      }]
      );
      setLoading(false);
    }, 800);
  }, [location, navigate]);
  const goBack = () => {
    navigate('/announcements');
  };
  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  const handleCommentLike = (commentId) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const newIsLiked = !comment.isLiked;
          return {
            ...comment,
            likes: newIsLiked ? comment.likes + 1 : comment.likes - 1,
            isLiked: newIsLiked
          };
        }
        return comment;
      })
    );
  };
  const handleAnnouncementClick = (announcementId) => {
    navigate(`/announcementDetail?id=${announcementId}`);
    // Scroll to top when navigating to a new announcement
    window.scrollTo(0, 0);
  };
  const navigateToAdvertisingDetail = () => {
    navigate('/advertisingDetail');
  };
  const handleCongratulate = () => {
    alert('Congratulations sent to Sarah Johnson!');
  };
  const handleShare = () => {
    setShowShareModal(true);
  };
  const handleAddComment = (commentText) => {
    const newComment = {
      id: comments.length + 1,
      author: 'You',
      content: commentText,
      date: new Date().toLocaleDateString(),
      likes: 0,
      isLiked: false
    };
    setComments([...comments, newComment]);
    // Update the announcement's comment count
    if (announcement) {
      setAnnouncement({
        ...announcement,
        reactions: {
          ...announcement.reactions,
          comments: announcement.reactions.comments + 1
        }
      });
    }
  };
  const handleCreateAnnouncement = () => {
    navigate('/announcementCreator');
  };
  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-news-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcement...</p>
          </div>
        </div>
      </div>);

  }
  if (!announcement) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Announcement Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The announcement you're looking for doesn't exist or has been
              removed.
            </p>
            <button
              onClick={goBack}
              className="bg-news-primary text-white px-4 py-2 rounded-md hover:bg-news-primary-dark transition-colors">

              Return to Announcements
            </button>
          </div>
        </div>
      </div>);

  }
  const getTypeStyles = (type) => {
    switch (type) {
      case 'graduation':
        return {
          headerBg: 'bg-blue-50 border-l-4 border-blue-400',
          headerText: 'text-blue-700',
          accentText: 'text-blue-600',
          accentBg: 'bg-blue-50',
          accentBorder: 'border-blue-100',
          emoji: '🎓'
        };
      // Add other types as needed
      default:
        return {
          headerBg: 'bg-blue-50 border-l-4 border-blue-400',
          headerText: 'text-blue-700',
          accentText: 'text-blue-600',
          accentBg: 'bg-blue-50',
          accentBorder: 'border-blue-100',
          emoji: '🎓'
        };
    }
  };
  const typeStyles = getTypeStyles(announcement.type);
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={goBack}
          className="flex items-center text-news-primary mb-6 hover:underline">

          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Announcements
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className={`px-4 py-3 flex items-center ${typeStyles.headerBg}`}>

                <span className="mr-2 text-xl">{typeStyles.emoji}</span>
                <span
                  className={`text-sm font-medium ${typeStyles.headerText}`}>

                  Graduation Announcement
                </span>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {announcement.title}
                </h1>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-2/5">
                    <img
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-full h-auto rounded-lg shadow-sm" />

                  </div>
                  <div className="w-full md:w-3/5">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{announcement.location}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{announcement.date}</span>
                    </div>
                    <div
                      className={`${typeStyles.accentBg} rounded-lg p-4 mb-4 border ${typeStyles.accentBorder}`}>

                      <div className="flex items-center">
                        <Award
                          className={`h-5 w-5 ${typeStyles.accentText} mr-2`} />

                        <span className="text-sm font-medium text-blue-800">
                          {announcement.extraInfo}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-blue-700">
                        {announcement.school}
                      </div>
                      <div className="mt-2 text-sm text-blue-700 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Ceremony: {announcement.ceremony}</span>
                      </div>
                    </div>
                    {announcement.content.
                    split('\n\n').
                    map((paragraph, idx) =>
                    <p
                      key={idx}
                      className="text-gray-700 mb-4 leading-relaxed">

                          {paragraph}
                        </p>
                    )}
                    {announcement.achievements &&
                    announcement.achievements.length > 0 &&
                    <div className="mt-4 mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Achievements
                          </h3>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            {announcement.achievements.map(
                          (achievement, idx) =>
                          <li key={idx}>{achievement}</li>

                        )}
                          </ul>
                        </div>
                    }
                    <div className="text-sm text-gray-600 mb-4">
                      Posted by:{' '}
                      <span className="font-medium">{announcement.author}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-4">
                        <button
                          className={`flex items-center ${liked ? typeStyles.accentText : 'text-gray-500'} hover:${typeStyles.accentText}`}
                          onClick={handleLike}>

                          <Heart
                            className={`h-5 w-5 mr-1 ${liked ? 'fill-current' : ''}`} />

                          <span>{likesCount}</span>
                        </button>
                        <button
                          className="flex items-center text-gray-500 hover:text-news-primary"
                          onClick={() =>
                          document.getElementById('comment-section').focus()
                          }>

                          <MessageCircle className="h-5 w-5 mr-1" />
                          <span>{announcement.reactions.comments}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ShareButton onClick={handleShare} />
                        <button
                          className="flex items-center text-green-600 hover:text-green-700 px-3 py-1.5 rounded-md hover:bg-green-50 border border-transparent hover:border-green-200"
                          onClick={handleCongratulate}>

                          <ThumbsUp className="h-5 w-5 mr-1.5" />
                          <span>Congratulate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Comments Section */}
            <CommentSection
              comments={comments}
              totalCount={announcement.reactions.comments}
              itemId={announcement.id}
              itemType="announcement"
              onAddComment={handleAddComment}
              onLikeComment={handleCommentLike}
              isLoggedIn={isLoggedIn} />

          </div>
          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Related Announcements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Related Announcements
              </h3>
              <div className="space-y-4">
                {relatedAnnouncements.map((related) =>
                <div
                  key={related.id}
                  className="flex border-b border-gray-100 pb-3 cursor-pointer hover:bg-gray-50 transition-colors rounded p-2"
                  onClick={() => handleAnnouncementClick(related.id)}>

                    <img
                    src={related.image}
                    alt={related.title}
                    className="h-14 w-14 rounded-md object-cover" />

                    <div className="ml-3">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{related.location}</span>
                        <span className="mx-1">•</span>
                        <span>{related.date}</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {related.title}
                      </h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Advertisement */}
            <div
              className="bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={navigateToAdvertisingDetail}>

              <p className="text-xs text-gray-500 mb-2">Advertisement</p>
              <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400">Ad Space</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 underline">
                Click to learn more about advertising
              </p>
            </div>
            {/* Share Options */}
            <SocialShare
              title={announcement.title}
              description={announcement.content.split('\n\n')[0]}
              className="" />

            {/* More Advertising */}
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleCreateAnnouncement}>

              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Create Your Announcement
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your special moments with the community. Create your own
                announcement today!
              </p>
              <button
                className="w-full bg-news-primary text-white py-2 rounded-md hover:bg-news-primary-dark transition-colors"
                onClick={handleCreateAnnouncement}>

                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Share Modal */}
      {showShareModal &&
      <SocialShare
        title={announcement.title}
        description={announcement.content.split('\n\n')[0]}
        displayAsModal={true}
        onClose={() => setShowShareModal(false)} />

      }
    </div>);

};