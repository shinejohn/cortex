import React, { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { ContactOptionsGrid } from './ContactOptionsGrid';
import { QuickContactForm } from './QuickContactForm';
import { DepartmentDirectory } from './DepartmentDirectory';
import { FAQSection } from './FAQSection';
import { OfficeInformation } from './OfficeInformation';
import { SocialMediaLinks } from './SocialMediaLinks';
import { LiveChatWidget } from './LiveChatWidget';
import { useLocationDetection } from '../location/LocationDetector';
export const ContactUsPage = () => {
  const { locationData } = useLocationDetection();
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const toggleLiveChat = () => {
    setShowLiveChat(!showLiveChat);
  };
  const handleFormSubmit = (formData) => {
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
    // Reset form submission status after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <main>
        {/* Hero Section */}
        <section className="bg-news-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl max-w-3xl mx-auto font-light text-gray-100">
              We're here to help - reach out your way to the{' '}
              {locationData?.city || 'Clearwater'} Day News team
            </p>
          </div>
        </section>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Contact Options Grid */}
              <ContactOptionsGrid onStartChat={toggleLiveChat} />
              {/* Quick Contact Form */}
              <QuickContactForm
                onSubmit={handleFormSubmit}
                submitted={formSubmitted} />

              {/* FAQ Section */}
              <FAQSection />
            </div>
            {/* Right Column */}
            <div className="space-y-8">
              {/* Department Directory */}
              <DepartmentDirectory />
              {/* Office Information */}
              <OfficeInformation
                location={locationData?.city || 'Clearwater'} />

              {/* Social Media Links */}
              <SocialMediaLinks />
            </div>
          </div>
        </div>
      </main>
      {/* Live Chat Widget */}
      {showLiveChat && <LiveChatWidget onClose={toggleLiveChat} />}
    </div>);

};