import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  Info,
  ChevronRight,
  DollarSign } from
'lucide-react';
export const LegalNoticeCreatorPage = () => {
  const navigate = useNavigate();
  const [noticeData, setNoticeData] = useState({
    title: '',
    content: '',
    noticeType: 'public',
    publicationDates: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    affidavitRequired: true
  });
  const [wordCount, setWordCount] = useState(0);
  const [price, setPrice] = useState(75); // Default price for under 250 words
  // Update word count and price when content changes
  useEffect(() => {
    const words = noticeData.content.trim().split(/\s+/).length;
    setWordCount(words > 0 ? words : 0);
    // Update price based on word count
    if (words <= 250) {
      setPrice(75);
    } else if (words <= 500) {
      setPrice(100);
    } else {
      setPrice(150);
    }
  }, [noticeData.content]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNoticeData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNoticeData((prev) => ({
      ...prev,
      [name]: checked
    }));
  };
  const handleDateAdd = (date) => {
    if (date && !noticeData.publicationDates.includes(date)) {
      setNoticeData((prev) => ({
        ...prev,
        publicationDates: [...prev.publicationDates, date]
      }));
    }
  };
  const handleDateRemove = (dateToRemove) => {
    setNoticeData((prev) => ({
      ...prev,
      publicationDates: prev.publicationDates.filter(
        (date) => date !== dateToRemove
      )
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic
    navigate('/legalNoticeDetail');
  };
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Create Legal Notice
      </h1>
      <p className="text-gray-600 mb-6">
        Publish legal notices and announcements
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notice Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Notice Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Title
              </label>
              <input
                type="text"
                name="title"
                value={noticeData.title}
                onChange={handleInputChange}
                placeholder="e.g., Public Hearing Notice, Fictitious Name Registration"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                required />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Type
              </label>
              <select
                name="noticeType"
                value={noticeData.noticeType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                required>

                <option value="public">Public Hearing Notice</option>
                <option value="fictitious">Fictitious Name Registration</option>
                <option value="probate">Probate Notice</option>
                <option value="foreclosure">Foreclosure Notice</option>
                <option value="bid">Bid Notice</option>
                <option value="other">Other Legal Notice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Content
              </label>
              <textarea
                name="content"
                value={noticeData.content}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                required>
              </textarea>
              <div className="mt-1 text-sm text-gray-500 flex justify-between">
                <span>Word count: {wordCount}</span>
                <span>
                  {wordCount <= 250 ?
                  'Basic rate ($75)' :
                  wordCount <= 500 ?
                  'Standard rate ($100)' :
                  'Extended rate ($150)'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publication Dates
              </label>
              <div className="flex">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                  id="publicationDate" />

                <button
                  type="button"
                  onClick={() =>
                  handleDateAdd(
                    document.getElementById('publicationDate').value
                  )
                  }
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300">

                  Add
                </button>
              </div>
              {noticeData.publicationDates.length > 0 &&
              <div className="flex flex-wrap gap-2 mt-2">
                  {noticeData.publicationDates.map((date) =>
                <span
                  key={date}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">

                      {new Date(date).toLocaleDateString()}
                      <button
                    type="button"
                    onClick={() => handleDateRemove(date)}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300">

                        &times;
                      </button>
                    </span>
                )}
                </div>
              }
              <p className="mt-1 text-sm text-gray-500">
                Select the dates you want your notice to be published
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="affidavitRequired"
                  name="affidavitRequired"
                  type="checkbox"
                  checked={noticeData.affidavitRequired}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300 rounded" />

              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="affidavitRequired"
                  className="font-medium text-gray-700">

                  Affidavit of Publication Required
                </label>
                <p className="text-gray-500">
                  Receive an official affidavit confirming publication (required
                  for most legal notices)
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Contact Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="contactName"
                  value={noticeData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  required />

                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="contactEmail"
                  value={noticeData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  required />

                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="contactPhone"
                  value={noticeData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-transparent"
                  required />

                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        {/* Pricing Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Under 250 words:</span>
              <span className="font-medium">$75</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">250-500 words:</span>
              <span className="font-medium">$100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Over 500 words:</span>
              <span className="font-medium">$150</span>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Includes affidavit of publication to meet legal requirements
            </div>
          </div>
          <div className="mt-6 border-t border-b border-gray-200 py-4">
            <div className="flex justify-between">
              <span>Legal Notice ({wordCount} words)</span>
              <span>${price.toFixed(2)}</span>
            </div>
            {noticeData.publicationDates.length > 0 &&
            <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Publication Dates</span>
                <span>{noticeData.publicationDates.length} days</span>
              </div>
            }
            {noticeData.affidavitRequired &&
            <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Affidavit of Publication</span>
                <span>Included</span>
              </div>
            }
          </div>
          <div className="mt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>${price.toFixed(2)}</span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">

            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark flex items-center">

            Continue to Payment
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </form>
    </div>);

};