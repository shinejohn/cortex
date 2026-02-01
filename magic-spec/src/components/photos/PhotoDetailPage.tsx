import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Heart,
  MessageSquare,
  Share2,
  Download,
  Flag,
  Calendar,
  MapPin,
  User,
  Tag,
  Edit,
  Trash2,
  Send,
  ThumbsUp,
  ThumbsDown } from
'lucide-react';
import { PageHeader } from '../PageHeader';
export const PhotoDetailPage = () => {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [relatedPhotos, setRelatedPhotos] = useState([]);
  // Mock data fetch - in a real app, this would be an API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPhoto({
        id: photoId,
        title: 'Clearwater Beach Sunset',
        description:
        'Beautiful sunset at Clearwater Beach with palm trees silhouette. The colors in the sky were absolutely breathtaking, with vibrant oranges and pinks reflecting off the calm Gulf waters.',
        imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'John Shine',
        authorId: '123',
        authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        community: 'Clearwater',
        category: 'Nature',
        date: '2025-07-28T18:30:00',
        likes: 42,
        isOwner: true,
        exif: {
          camera: 'Canon EOS R5',
          aperture: 'f/8',
          shutterSpeed: '1/200',
          iso: '100',
          focalLength: '24mm'
        }
      });
      setComments([
      {
        id: '1',
        author: 'Sarah Johnson',
        authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        date: '2025-07-29T10:15:00',
        text: 'Absolutely stunning! The colors are incredible.',
        likes: 5
      },
      {
        id: '2',
        author: 'Mike Peterson',
        authorAvatar: 'https://randomuser.me/api/portraits/men/46.jpg',
        date: '2025-07-29T14:22:00',
        text: "I was there that evening too. It was one of the most beautiful sunsets I've seen this year."
      },
      {
        id: '3',
        author: 'Lisa Wong',
        authorAvatar: 'https://randomuser.me/api/portraits/women/63.jpg',
        date: '2025-07-30T09:05:00',
        text: 'Great composition! What camera did you use?',
        likes: 2
      }]
      );
      setRelatedPhotos([
      {
        id: '2',
        title: 'Pier 60 at Dusk',
        imageUrl:
        'https://images.unsplash.com/photo-1621789098261-6a180e561527?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '3',
        title: 'Morning Waves',
        imageUrl:
        'https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '4',
        title: 'Beach Volleyball',
        imageUrl:
        'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      }]
      );
      setLoading(false);
    }, 1000);
  }, [photoId]);
  const handleLike = () => {
    if (liked) {
      setPhoto({
        ...photo,
        likes: photo.likes - 1
      });
    } else {
      setPhoto({
        ...photo,
        likes: photo.likes + 1
      });
    }
    setLiked(!liked);
  };
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const newComment = {
      id: `temp-${Date.now()}`,
      author: 'John Shine',
      authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: new Date().toISOString(),
      text: comment,
      likes: 0
    };
    setComments([newComment, ...comments]);
    setComment('');
  };
  const handleDeletePhoto = () => {
    // In a real app, this would call an API to delete the photo
    if (
    confirm(
      'Are you sure you want to delete this photo? This action cannot be undone.'
    ))
    {
      navigate('/photos');
    }
  };
  const handleEditPhoto = () => {
    navigate(`/photos/edit/${photoId}`);
  };
  const handleGoBack = () => {
    navigate(-1);
  };
  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <PageHeader />
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-news-primary"></div>
          </div>
        </div>
      </div>);

  }
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6">

          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Gallery
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main photo and info - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full object-cover" />

                {/* Action buttons */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100">
                    <Share2 className="h-5 w-5 text-gray-700" />
                  </button>
                  <button className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100">
                    <Download className="h-5 w-5 text-gray-700" />
                  </button>
                  {photo.isOwner &&
                  <>
                      <button
                      onClick={handleEditPhoto}
                      className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100">

                        <Edit className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                      onClick={handleDeletePhoto}
                      className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100">

                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </>
                  }
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {photo.title}
                </h1>
                <p className="text-gray-600 mb-4">{photo.description}</p>
                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6">
                  <div className="flex items-center mr-4 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(photo.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{photo.community}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{photo.category}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center">
                    <img
                      src={photo.authorAvatar}
                      alt={photo.author}
                      className="h-10 w-10 rounded-full mr-3" />

                    <div>
                      <div className="font-medium text-gray-900">
                        {photo.author}
                      </div>
                      <div className="text-xs text-gray-500">Photographer</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={handleLike}
                      className={`flex items-center mr-4 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>

                      <Heart
                        className={`h-5 w-5 mr-1 ${liked ? 'fill-current' : ''}`} />

                      <span>{photo.likes}</span>
                    </button>
                    <button className="flex items-center text-gray-500">
                      <MessageSquare className="h-5 w-5 mr-1" />
                      <span>{comments.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Comments section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Comments
                </h2>
                {/* Comment form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="Your avatar"
                      className="h-10 w-10 rounded-full mr-3" />

                    <div className="flex-1 relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                        rows={2}>
                      </textarea>
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        className="absolute bottom-2 right-2 p-1 rounded-full bg-news-primary text-white disabled:bg-gray-300">

                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </form>
                {/* Comments list */}
                <div className="space-y-4">
                  {comments.map((comment) =>
                  <div key={comment.id} className="flex">
                      <img
                      src={comment.authorAvatar}
                      alt={comment.author}
                      className="h-10 w-10 rounded-full mr-3" />

                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900">
                              {comment.author}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(comment.date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }
                            )}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {comment.text}
                          </p>
                        </div>
                        <div className="flex items-center mt-1 ml-1 text-xs text-gray-500">
                          <button className="flex items-center mr-3 hover:text-gray-700">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="flex items-center mr-3 hover:text-gray-700">
                            <ThumbsDown className="h-3 w-3 mr-1" />
                          </button>
                          <button className="hover:text-gray-700">Reply</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Photo details */}
            {photo.exif &&
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Photo Details
                  </h2>
                  <div className="space-y-3">
                    {photo.exif.camera &&
                  <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Camera</span>
                        <span className="text-sm font-medium text-gray-900">
                          {photo.exif.camera}
                        </span>
                      </div>
                  }
                    {photo.exif.aperture &&
                  <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Aperture</span>
                        <span className="text-sm font-medium text-gray-900">
                          {photo.exif.aperture}
                        </span>
                      </div>
                  }
                    {photo.exif.shutterSpeed &&
                  <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Shutter Speed
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {photo.exif.shutterSpeed}
                        </span>
                      </div>
                  }
                    {photo.exif.iso &&
                  <div className="flex justify-between">
                        <span className="text-sm text-gray-500">ISO</span>
                        <span className="text-sm font-medium text-gray-900">
                          {photo.exif.iso}
                        </span>
                      </div>
                  }
                    {photo.exif.focalLength &&
                  <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Focal Length
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {photo.exif.focalLength}
                        </span>
                      </div>
                  }
                  </div>
                </div>
              </div>
            }
            {/* Related photos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  More from {photo.community}
                </h2>
                <div className="space-y-4">
                  {relatedPhotos.map((relatedPhoto) =>
                  <div
                    key={relatedPhoto.id}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                    onClick={() => navigate(`/photos/${relatedPhoto.id}`)}>

                      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                        <img
                        src={relatedPhoto.imageUrl}
                        alt={relatedPhoto.title}
                        className="h-full w-full object-cover" />

                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {relatedPhoto.title}
                        </h3>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                  <button
                    onClick={() => navigate('/photos')}
                    className="text-sm font-medium text-news-primary hover:text-news-primary-dark">

                    View all photos
                  </button>
                </div>
              </div>
            </div>
            {/* Report */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                  <Flag className="h-4 w-4 mr-2" />
                  Report inappropriate content
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};