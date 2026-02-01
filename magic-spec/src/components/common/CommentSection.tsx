import React, { useState, memo, Component } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageSquare, ThumbsUp, Send, LogIn, User } from 'lucide-react';
export interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}
interface CommentSectionProps {
  comments: Comment[];
  totalCount?: number;
  itemId: string | number;
  itemType:
  'announcement' |
  'article' |
  'event' |
  'photo' |
  'memorial' |
  'profile' |
  'classified' |
  'other';
  onAddComment?: (comment: string) => void;
  onLikeComment?: (commentId: number) => void;
  isLoggedIn?: boolean;
  className?: string;
}
export const CommentSection: React.FC<CommentSectionProps> = ({
  comments = [],
  totalCount,
  itemId,
  itemType,
  onAddComment,
  onLikeComment,
  isLoggedIn = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [commentText, setCommentText] = useState('');
  // Handle comment submission
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user is logged in
    if (!isLoggedIn) {
      // Save the current URL with a return parameter
      const currentUrl = `${window.location.pathname}${window.location.search ? window.location.search + '&returnFromLogin=true' : '?returnFromLogin=true'}`;
      // Redirect to login page with return URL
      navigate(`/register?returnUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }
    if (!commentText.trim()) return;
    // Call the provided onAddComment function
    if (onAddComment) {
      onAddComment(commentText);
      setCommentText('');
    }
  };
  // Handle comment like
  const handleCommentLike = (commentId: number) => {
    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };
  // Handle Enter key in comment textarea
  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Command+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmitComment(e);
    }
  };
  // Redirect to login
  const redirectToLogin = () => {
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    navigate(`/register?returnUrl=${encodeURIComponent(currentUrl)}`);
  };
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Comments ({totalCount || comments.length})
      </h3>
      {comments.length > 0 ?
      <div className="space-y-4">
          {comments.map((comment) =>
        <div
          key={comment.id}
          className="border-b border-gray-100 pb-4 last:border-b-0">

              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-medium">
                      {comment.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {comment.author}
                    </h4>
                    <p className="text-xs text-gray-500">{comment.date}</p>
                  </div>
                </div>
                <button
              className={`${comment.isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
              onClick={() => handleCommentLike(comment.id)}>

                  <Heart
                className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />

                </button>
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <button
              className={`flex items-center ${comment.isLiked ? 'text-blue-600' : 'hover:text-blue-600'}`}
              onClick={() => handleCommentLike(comment.id)}>

                  <ThumbsUp className="h-3 w-3 mr-1" />
                  <span>{comment.likes}</span>
                </button>
                <span className="mx-2">•</span>
                <button
              className="hover:text-blue-600"
              onClick={() => setCommentText(`@${comment.author} `)}>

                  Reply
                </button>
              </div>
            </div>
        )}
        </div> :

      <div className="text-center py-6 text-gray-500">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      }
      {/* Comment form */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Leave a comment
        </h4>
        <form onSubmit={handleSubmitComment} className="relative">
          <textarea
            id="comment-section"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary h-24 text-sm pr-12"
            placeholder={
            isLoggedIn ?
            'Share your thoughts...' :
            'Login to leave a comment...'
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            disabled={!isLoggedIn}>
          </textarea>
          <button
            type="submit"
            className="absolute bottom-3 right-3 bg-news-primary text-white p-2 rounded-full hover:bg-news-primary-dark transition-colors disabled:bg-gray-300"
            disabled={!isLoggedIn || !commentText.trim()}
            title={
            isLoggedIn ?
            'Send comment (or use Ctrl+Enter)' :
            'Login to comment'
            }>

            {isLoggedIn ?
            <Send className="h-4 w-4" /> :

            <LogIn className="h-4 w-4" />
            }
          </button>
          {!isLoggedIn &&
          <div className="mt-2 text-sm text-gray-500 flex items-center">
              <LogIn className="h-4 w-4 mr-1.5" />
              <span>
                Please{' '}
                <button
                type="button"
                onClick={redirectToLogin}
                className="text-news-primary hover:underline">

                  login or register
                </button>{' '}
                to leave a comment
              </span>
            </div>
          }
        </form>
      </div>
    </div>);

};