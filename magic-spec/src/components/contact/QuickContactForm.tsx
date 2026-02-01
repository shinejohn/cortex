import React, { useState } from 'react';
import { Send, Paperclip, AlertCircle, CheckCircle } from 'lucide-react';
export const QuickContactForm = ({ onSubmit, submitted }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    attachment: null
  });
  const [attachmentName, setAttachmentName] = useState('');
  const [errors, setErrors] = useState({});
  const subjects = [
  {
    value: '',
    label: 'Select a subject'
  },
  {
    value: 'general',
    label: 'General Inquiry'
  },
  {
    value: 'subscription',
    label: 'Subscription Support'
  },
  {
    value: 'feedback',
    label: 'Feedback & Suggestions'
  },
  {
    value: 'technical',
    label: 'Technical Support'
  },
  {
    value: 'advertising',
    label: 'Advertising & Partnerships'
  },
  {
    value: 'correction',
    label: 'Correction Request'
  },
  {
    value: 'news-tip',
    label: 'News Tip'
  },
  {
    value: 'other',
    label: 'Other'
  }];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachment: file
      }));
      setAttachmentName(file.name);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';else
    if (!/\S+@\S+\.\S+/.test(formData.email))
    newErrors.email = 'Email is invalid';
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        attachment: null
      });
      setAttachmentName('');
    }
  };
  return (
    <section>
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
        Quick Contact Form
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Form Header */}
        <div className="bg-news-primary-light bg-opacity-10 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-news-primary">
            Send Us a Message
          </h3>
          <p className="text-sm text-gray-600">
            Fill out the form below and we'll get back to you as soon as
            possible
          </p>
        </div>
        {/* Success Message */}
        {submitted &&
        <div className="m-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800">
                Message Sent Successfully!
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Thank you for contacting us. We've received your message and
                will respond shortly.
              </p>
            </div>
          </div>
        }
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1">

                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-md focus:ring-news-primary focus:border-news-primary`}
                placeholder="John Doe" />

              {errors.name &&
              <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              }
            </div>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1">

                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-md focus:ring-news-primary focus:border-news-primary`}
                placeholder="john@example.com" />

              {errors.email &&
              <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              }
            </div>
          </div>
          {/* Subject Field */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1">

              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.subject ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-md focus:ring-news-primary focus:border-news-primary`}>

              {subjects.map((subject) =>
              <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              )}
            </select>
            {errors.subject &&
            <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.subject}
              </p>
            }
          </div>
          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1">

              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-2 border ${errors.message ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-md focus:ring-news-primary focus:border-news-primary`}
              placeholder="Your message here...">
            </textarea>
            {errors.message &&
            <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.message}
              </p>
            }
          </div>
          {/* File Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment (optional)
            </label>
            <div className="flex items-center">
              <label className="cursor-pointer bg-gray-50 px-4 py-2 border border-gray-300 rounded-l-md hover:bg-gray-100 transition-colors">
                <Paperclip className="h-5 w-5 text-gray-500" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" />

              </label>
              <div className="flex-1 border-t border-r border-b border-gray-300 rounded-r-md px-4 py-2 bg-white truncate">
                {attachmentName || 'No file selected (Max: 10MB)'}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: JPG, PNG, PDF, DOC, DOCX
            </p>
          </div>
          {/* Privacy Consent */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="privacy"
                name="privacy"
                type="checkbox"
                className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300 rounded"
                required />

            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="privacy" className="font-medium text-gray-700">
                Privacy Consent <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500">
                I agree to the{' '}
                <a href="#" className="text-news-primary hover:underline">
                  Privacy Policy
                </a>{' '}
                and consent to being contacted regarding my inquiry.
              </p>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-news-primary text-white px-6 py-3 rounded-md font-medium hover:bg-news-primary-dark transition-colors flex items-center">

              <Send className="h-5 w-5 mr-2" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>);

};