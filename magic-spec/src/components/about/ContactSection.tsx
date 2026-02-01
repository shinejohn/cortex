import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  ArrowRight } from
'lucide-react';
export const ContactSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, feedback, or a story tip? We'd love to hear from you
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                    <Mail className="h-5 w-5 text-news-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                    <a
                      href="mailto:hello@day.news"
                      className="text-news-primary hover:underline">

                      hello@day.news
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      For general inquiries
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                    <Phone className="h-5 w-5 text-news-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
                    <a
                      href="tel:+18005551234"
                      className="text-news-primary hover:underline">

                      (800) 555-1234
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Mon-Fri, 9am-5pm ET
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-news-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Office</h4>
                    <p className="text-gray-700">
                      123 Main Street
                      <br />
                      Suite 400
                      <br />
                      Clearwater, FL 33755
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                    <MessageSquare className="h-5 w-5 text-news-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      News Tips
                    </h4>
                    <a
                      href="mailto:tips@day.news"
                      className="text-news-primary hover:underline">

                      tips@day.news
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Share story ideas or news tips
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-news-primary hover:text-white transition-colors">

                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">

                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-news-primary hover:text-white transition-colors">

                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">

                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-news-primary hover:text-white transition-colors">

                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">

                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-news-primary hover:text-white transition-colors">

                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">

                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h3>
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1">

                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-news-primary focus:border-news-primary"
                      placeholder="John Doe" />

                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1">

                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-news-primary focus:border-news-primary"
                      placeholder="john@example.com" />

                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1">

                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-news-primary focus:border-news-primary"
                    placeholder="How can we help you?" />

                </div>
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1">

                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-news-primary focus:border-news-primary"
                    placeholder="Your message here...">
                  </textarea>
                </div>
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="h-4 w-4 text-news-primary focus:ring-news-primary border-gray-300 rounded" />

                  <label
                    htmlFor="privacy"
                    className="ml-2 block text-sm text-gray-600">

                    I agree to the{' '}
                    <a href="#" className="text-news-primary hover:underline">
                      Privacy Policy
                    </a>{' '}
                    and consent to being contacted.
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-news-primary text-white py-3 px-4 rounded-md hover:bg-news-primary-dark transition-colors flex items-center justify-center">

                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </form>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="#"
                    className="flex items-center text-news-primary hover:underline">

                    <ArrowRight className="h-4 w-4 mr-2" />
                    Submit a News Tip
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-news-primary hover:underline">

                    <ArrowRight className="h-4 w-4 mr-2" />
                    Advertise with Us
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-news-primary hover:underline">

                    <ArrowRight className="h-4 w-4 mr-2" />
                    Report an Error
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-news-primary hover:underline">

                    <ArrowRight className="h-4 w-4 mr-2" />
                    Careers
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};