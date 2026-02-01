import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
export const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQs, setExpandedFAQs] = useState([]);
  const faqs = [
  {
    id: 1,
    question: 'How do I subscribe to Day.News?',
    answer:
    "You can subscribe to Day.News by clicking on the 'Subscribe' button in the top navigation bar of our website. We offer digital-only subscriptions as well as combined print and digital options. All new subscribers receive a 14-day free trial period."
  },
  {
    id: 2,
    question: 'How can I submit a news tip?',
    answer:
    "News tips can be submitted via email to tips@day.news or through our 'Submit a Tip' form in the Contact Us section. For sensitive information, we also offer secure communication channels. Please include as much detail as possible with your tip."
  },
  {
    id: 3,
    question: 'What is your correction policy?',
    answer:
    'We strive for accuracy in all our reporting. If you spot an error, please email corrections@day.news with the headline, date, and description of the error. All corrections are noted in the original article and logged in our corrections database.'
  },
  {
    id: 4,
    question: 'How do I reset my password?',
    answer:
    "To reset your password, click on the 'Sign In' button, then select 'Forgot Password'. Enter your email address, and we'll send you a password reset link. If you don't receive the email within 10 minutes, please check your spam folder or contact support."
  },
  {
    id: 5,
    question: 'How can I advertise with Day.News?',
    answer:
    'We offer various advertising options for businesses of all sizes, including digital ads, print ads, and sponsored content. Please contact our advertising team at ads@day.news or call (800) 555-1236 to discuss your specific needs and get a custom quote.'
  },
  {
    id: 6,
    question: 'Can I access Day.News on multiple devices?',
    answer:
    'Yes, your subscription allows you to access Day.News on up to 5 devices simultaneously. Simply sign in with your account credentials on each device. We have apps available for iOS and Android, as well as a responsive website that works on all browsers.'
  },
  {
    id: 7,
    question: 'How do I report an issue with the website or app?',
    answer:
    "Technical issues can be reported to our support team at support@day.news. Please include details about the problem, including what device and browser/app version you're using, steps to reproduce the issue, and screenshots if possible."
  },
  {
    id: 8,
    question: 'What is your privacy policy?',
    answer:
    'Our privacy policy outlines how we collect, use, and protect your personal information. We are committed to transparency and protecting your data. You can read our full privacy policy at day.news/privacy. If you have specific questions, please contact our privacy team at privacy@day.news.'
  }];

  const toggleFAQ = (id) => {
    setExpandedFAQs((prev) =>
    prev.includes(id) ? prev.filter((faqId) => faqId !== id) : [...prev, id]
    );
  };
  const filteredFAQs =
  searchQuery.trim() === '' ?
  faqs :
  faqs.filter(
    (faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <section>
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
        Frequently Asked Questions
      </h2>
      {/* Search Box */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:ring-news-primary focus:border-news-primary" />

        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
      {/* FAQ List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
        {filteredFAQs.length > 0 ?
        filteredFAQs.map((faq) =>
        <div key={faq.id} className="overflow-hidden">
              <button
            onClick={() => toggleFAQ(faq.id)}
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none">

                <h3 className="text-lg font-medium text-gray-900">
                  {faq.question}
                </h3>
                {expandedFAQs.includes(faq.id) ?
            <ChevronUp className="h-5 w-5 text-gray-500" /> :

            <ChevronDown className="h-5 w-5 text-gray-500" />
            }
              </button>
              <div
            className={`px-6 pb-4 text-gray-600 transition-all duration-300 ${expandedFAQs.includes(faq.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>

                <p>{faq.answer}</p>
              </div>
            </div>
        ) :

        <div className="p-6 text-center">
            <p className="text-gray-500">
              No FAQs match your search. Please try different keywords or{' '}
              <a
              href="#"
              className="text-news-primary font-medium hover:underline">

                contact us
              </a>{' '}
              for assistance.
            </p>
          </div>
        }
      </div>
      {/* Still Have Questions */}
      <div className="mt-8 bg-news-primary-light bg-opacity-10 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-news-primary mb-2">
          Still Have Questions?
        </h3>
        <p className="text-gray-600 mb-4">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-news-primary text-white px-6 py-3 rounded-md font-medium hover:bg-news-primary-dark transition-colors">
            Contact Support
          </button>
          <button className="border border-news-primary text-news-primary px-6 py-3 rounded-md font-medium hover:bg-news-primary hover:text-white transition-colors">
            Submit a Request
          </button>
        </div>
      </div>
    </section>);

};