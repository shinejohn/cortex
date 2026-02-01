import React, { Children } from 'react';
import { useLocationDetection } from '../location/LocationDetector';
export const PrivacyPolicyPage = () => {
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  return (
    <div className="min-h-screen bg-bg-primary w-full">
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-news-primary mb-8">
          Privacy Policy
        </h1>
        <div className="max-w-4xl bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
          <p className="text-gray-600 mb-6">
            Last Updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 mb-4">
              {city} Day News ("we," "our," or "us") respects your privacy and
              is committed to protecting your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website, use our mobile
              application, or interact with our services.
            </p>
            <p className="text-gray-700 mb-4">
              Please read this Privacy Policy carefully. By accessing or using
              our services, you acknowledge that you have read, understood, and
              agree to be bound by all the terms of this Privacy Policy and our
              Terms of Service.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Personal Information
            </h3>
            <p className="text-gray-700 mb-4">
              We may collect personal information that you voluntarily provide
              to us when you:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>Register for an account</li>
              <li>Subscribe to our newsletter or publications</li>
              <li>Participate in surveys, contests, or promotions</li>
              <li>Post comments or content on our platform</li>
              <li>Contact our customer service team</li>
              <li>Make purchases through our services</li>
            </ul>
            <p className="text-gray-700 mb-4">
              This information may include your name, email address, mailing
              address, phone number, payment information, and other details that
              help us provide our services to you.
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Automatically Collected Information
            </h3>
            <p className="text-gray-700 mb-4">
              When you access our services, we may automatically collect certain
              information about your device and usage patterns, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                Device information (such as your IP address, browser type,
                operating system)
              </li>
              <li>
                Usage data (such as pages visited, time spent on pages, links
                clicked)
              </li>
              <li>Location information (with your consent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              We may use the information we collect for various purposes,
              including to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>
                Send administrative information, such as updates, security
                alerts, and support messages
              </li>
              <li>Respond to your comments, questions, and requests</li>
              <li>
                Personalize your experience and deliver content relevant to your
                interests
              </li>
              <li>
                Monitor and analyze trends, usage, and activities in connection
                with our services
              </li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and
                other illegal activities
              </li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Sharing Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                <strong>With Service Providers:</strong> We may share your
                information with third-party vendors, service providers, and
                contractors who perform services for us.
              </li>
              <li>
                <strong>Business Transfers:</strong> We may share or transfer
                your information in connection with, or during negotiations of,
                any merger, sale of company assets, financing, or acquisition of
                all or a portion of our business.
              </li>
              <li>
                <strong>With Affiliates:</strong> We may share your information
                with our affiliates, in which case we will require those
                affiliates to honor this Privacy Policy.
              </li>
              <li>
                <strong>With Business Partners:</strong> We may share your
                information with our business partners to offer you certain
                products, services, or promotions.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may disclose your
                information for any other purpose with your consent.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your
                information where required to do so by law or in response to
                valid requests by public authorities.
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Your Privacy Rights
            </h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have certain rights regarding
              your personal information, such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                The right to access personal information we hold about you
              </li>
              <li>
                The right to request correction of inaccurate personal
                information
              </li>
              <li>
                The right to request deletion of your personal information
              </li>
              <li>
                The right to object to processing of your personal information
              </li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise these rights, please contact us using the information
              provided in the "Contact Us" section below.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to
              protect the security of your personal information. However, please
              be aware that no method of transmission over the internet or
              electronic storage is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-700 mb-4">
              Our services are not intended for individuals under the age of 13.
              We do not knowingly collect personal information from children
              under 13. If we learn we have collected or received personal
              information from a child under 13 without verification of parental
              consent, we will delete that information.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last Updated" date. You are advised to review
              this Privacy Policy periodically for any changes.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{city} Day News</p>
              <p className="text-gray-700">123 Main Street</p>
              <p className="text-gray-700">{city}, FL 33755</p>
              <p className="text-gray-700">Email: privacy@day.news</p>
              <p className="text-gray-700">Phone: (727) 555-1234</p>
            </div>
          </section>
        </div>
      </main>
    </div>);

};