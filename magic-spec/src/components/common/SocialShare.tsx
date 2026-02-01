import React, { useState, Component } from 'react';
import {
  Share2,
  ExternalLink,
  Copy,
  X,
  Check,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon } from
'lucide-react';
interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  image?: string;
  displayAsModal?: boolean;
  onClose?: () => void;
  className?: string;
}
export const SocialShare: React.FC<SocialShareProps> = ({
  title,
  url = window.location.href,
  description = '',
  image = '',
  displayAsModal = false,
  onClose,
  className = ''
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };
  const handleSocialShare = (platform: string) => {
    let shareUrl = '';
    switch (platform) {
      case 'Twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'Facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'LinkedIn':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'WhatsApp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      default:
        break;
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    if (displayAsModal && onClose) {
      onClose();
    } else {
      setShowShareOptions(false);
    }
  };
  const handleCopyLink = () => {
    navigator.clipboard.
    writeText(url).
    then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).
    catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };
  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description || title}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    if (displayAsModal && onClose) {
      onClose();
    }
  };
  // If displaying as a modal
  if (displayAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Share {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Copy Link */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Share with link
                </p>
                <div className="flex">
                  <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-md px-3 py-2 text-gray-700 text-sm truncate">
                    {url}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-r-md font-medium text-sm flex items-center ${linkCopied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>

                    {linkCopied ?
                    <>
                        <Check className="h-4 w-4 mr-1.5" />
                        Copied
                      </> :

                    <>
                        <Copy className="h-4 w-4 mr-1.5" />
                        Copy
                      </>
                    }
                  </button>
                </div>
              </div>
              {/* Share via Social Media */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Share via social media
                </p>
                <div className="flex space-x-2">
                  <button
                    className="flex-1 py-2 bg-[#1DA1F2] text-white rounded-md font-medium hover:bg-[#1a94df] transition-colors flex items-center justify-center"
                    onClick={() => handleSocialShare('Twitter')}>

                    <Twitter className="h-4 w-4 mr-1.5" />
                    Twitter
                  </button>
                  <button
                    className="flex-1 py-2 bg-[#1877F2] text-white rounded-md font-medium hover:bg-[#166fe5] transition-colors flex items-center justify-center"
                    onClick={() => handleSocialShare('Facebook')}>

                    <Facebook className="h-4 w-4 mr-1.5" />
                    Facebook
                  </button>
                  <button
                    className="flex-1 py-2 bg-[#0A66C2] text-white rounded-md font-medium hover:bg-[#095fb8] transition-colors flex items-center justify-center"
                    onClick={() => handleSocialShare('LinkedIn')}>

                    <Linkedin className="h-4 w-4 mr-1.5" />
                    LinkedIn
                  </button>
                </div>
              </div>
              {/* Share via Email */}
              <div>
                <button
                  onClick={handleShareViaEmail}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">

                  <Mail className="h-4 w-4 mr-1.5" />
                  Share via Email
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">

                Close
              </button>
            </div>
          </div>
        </div>
      </div>);

  }
  // If displaying inline
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>

      <h3 className="text-lg font-bold text-gray-900 mb-3">Share This</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          className="flex items-center justify-center bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => handleSocialShare('Facebook')}>

          <span className="mr-2">Facebook</span>
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          className="flex items-center justify-center bg-blue-400 text-white py-2 px-3 rounded-md hover:bg-blue-500 transition-colors"
          onClick={() => handleSocialShare('Twitter')}>

          <span className="mr-2">Twitter</span>
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          className="flex items-center justify-center bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
          onClick={() => handleSocialShare('WhatsApp')}>

          <span className="mr-2">WhatsApp</span>
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          className="flex items-center justify-center bg-blue-700 text-white py-2 px-3 rounded-md hover:bg-blue-800 transition-colors"
          onClick={() => handleSocialShare('LinkedIn')}>

          <span className="mr-2">LinkedIn</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
      <button
        className="w-full mt-3 flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
        onClick={handleCopyLink}>

        <span className="mr-2">
          {linkCopied ? 'Link Copied!' : 'Copy Link'}
        </span>
        {linkCopied ?
        <Check className="h-4 w-4" /> :

        <LinkIcon className="h-4 w-4" />
        }
      </button>
    </div>);

};
// Button to trigger share modal
export const ShareButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className = '' }) => {
  return (
    <button
      className={`flex items-center text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 ${className}`}
      onClick={onClick}>

      <Share2 className="h-5 w-5 mr-1.5" />
      <span>Share</span>
    </button>);

};