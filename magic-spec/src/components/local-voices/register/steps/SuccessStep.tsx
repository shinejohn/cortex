import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Upload,
  Share2,
  MessageSquare,
  ArrowRight } from
'lucide-react';
interface SuccessStepProps {
  formData: any;
}
export const SuccessStep: React.FC<SuccessStepProps> = ({ formData }) => {
  // Generate a slug from display name
  const generateSlug = (name: string) => {
    return name.
    toLowerCase().
    replace(/[^\w\s]/gi, '').
    replace(/\s+/g, '-');
  };
  const creatorSlug = generateSlug(formData.displayName || 'your-profile');
  const profileUrl = `/local-voices/creator/${creatorSlug}`;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Welcome to Local Voices!
      </h1>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        Your creator account has been successfully created. You're now ready to
        start sharing your content with your community.
      </p>
      {/* Creator Profile URL */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Your Creator Profile URL
        </h3>
        <div className="flex items-center justify-center">
          <div className="bg-gray-50 border border-gray-300 rounded-l-md py-2 px-4 text-gray-700 flex-grow max-w-md overflow-hidden text-ellipsis">
            {window.location.origin}
            {profileUrl}
          </div>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-r-md">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* Next Steps */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h2>
        <div className="space-y-6">
          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 bg-news-primary rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold">1</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">
                Upload Your First Episode
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Start building your audience by uploading your first podcast or
                video episode.
              </p>
              <Link
                to="/local-voices/upload"
                className="inline-flex items-center text-news-primary hover:text-news-primary-dark font-medium text-sm">

                Upload Now
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 bg-news-primary rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold">2</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">
                Share Your Creator Page
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Share your profile with your existing followers on social media
                and other platforms.
              </p>
              <button
                className="inline-flex items-center text-news-primary hover:text-news-primary-dark font-medium text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    window.location.origin + profileUrl
                  );
                  alert('Profile URL copied to clipboard!');
                }}>

                Copy Profile URL
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 bg-news-primary rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold">3</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">
                Join Creator Community
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Connect with other local creators, share tips, and collaborate
                on content.
              </p>
              <a
                href="https://discord.gg/daynews-creators"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-news-primary hover:text-news-primary-dark font-medium text-sm">

                Join Discord
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/local-voices/upload"
          className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center">

          <Upload className="mr-2 h-5 w-5" />
          Upload First Episode
        </Link>
        <Link
          to="/local-voices/dashboard"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg flex items-center justify-center">

          Go to Creator Dashboard
        </Link>
      </div>
    </div>);

};