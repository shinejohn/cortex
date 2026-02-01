import React from 'react';
import { useLocationDetection } from '../location/LocationDetector';
export const CookiePolicyPage = () => {
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  return (
    <div className="min-h-screen bg-bg-primary w-full">
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-news-primary mb-8">
          Cookie Policy
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
              {city} Day News ("we," "our," or "us") uses cookies and similar
              technologies on our website and mobile applications. This Cookie
              Policy explains how we use cookies, what types of cookies we use,
              and how you can control them.
            </p>
            <p className="text-gray-700 mb-4">
              By using our website and services, you agree to the use of cookies
              as described in this policy.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device when
              you visit a website. They are widely used to make websites work
              more efficiently, provide a better user experience, and give
              website owners information about how users interact with their
              site.
            </p>
            <p className="text-gray-700 mb-4">
              Cookies may be set by the website you are visiting (first-party
              cookies) or by other organizations, such as advertising partners
              or analytics providers (third-party cookies).
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Types of Cookies We Use
            </h2>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Essential Cookies
            </h3>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the website to function properly.
              They enable basic functions like page navigation, secure areas,
              and shopping carts. The website cannot function properly without
              these cookies, and they can only be disabled by changing your
              browser preferences.
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Performance and Analytics Cookies
            </h3>
            <p className="text-gray-700 mb-4">
              These cookies collect information about how visitors use our
              website, such as which pages they visit most often and if they
              receive error messages. They help us improve how our website works
              and measure the effectiveness of our advertising campaigns. All
              information these cookies collect is aggregated and anonymous.
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Functionality Cookies
            </h3>
            <p className="text-gray-700 mb-4">
              These cookies allow the website to remember choices you make (such
              as your username, language, or region) and provide enhanced, more
              personal features. They may also be used to provide services you
              have requested, such as watching a video or commenting on a blog.
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Targeting and Advertising Cookies
            </h3>
            <p className="text-gray-700 mb-4">
              These cookies are used to deliver advertisements that are more
              relevant to you and your interests. They are also used to limit
              the number of times you see an advertisement and help measure the
              effectiveness of advertising campaigns. They remember that you
              have visited a website and this information may be shared with
              other organizations, such as advertisers.
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Social Media Cookies
            </h3>
            <p className="text-gray-700 mb-4">
              These cookies are set by social media services that we have added
              to the site to enable you to share our content with your friends
              and networks. They can track your browser across other sites and
              build a profile of your interests, which may impact the content
              and messages you see on other websites you visit.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              How Long Do Cookies Stay on My Device?
            </h2>
            <p className="text-gray-700 mb-4">
              The length of time a cookie will remain on your device depends on
              whether it is a "persistent" or "session" cookie:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                <strong>Session cookies:</strong> These cookies are temporary
                and expire once you close your browser.
              </li>
              <li>
                <strong>Persistent cookies:</strong> These cookies remain on
                your device until they expire or you delete them. The length of
                time they stay on your device will depend on the cookie's
                specific purpose and can vary from minutes to years.
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              In addition to our own cookies, we may also use various
              third-party cookies to report usage statistics, deliver
              advertisements, and so on. These cookies may include:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>Analytics cookies from services like Google Analytics</li>
              <li>Advertising cookies from ad networks and platforms</li>
              <li>
                Social media cookies from platforms like Facebook, Twitter, and
                LinkedIn
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Your Cookie Choices
            </h2>
            <p className="text-gray-700 mb-4">
              You have several options to manage your cookie preferences:
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Browser Settings
            </h3>
            <p className="text-gray-700 mb-4">
              Most web browsers allow you to manage your cookie preferences. You
              can set your browser to refuse cookies, delete cookies, or alert
              you when cookies are being sent. The methods for doing so vary
              from browser to browser, and from version to version.
            </p>
            <p className="text-gray-700 mb-4">
              Please note that if you choose to block all cookies, you may not
              be able to access all or parts of our site, or certain functions
              may not work properly.
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Our Cookie Consent Tool
            </h3>
            <p className="text-gray-700 mb-4">
              When you first visit our website, you will be presented with a
              cookie banner that allows you to accept or decline non-essential
              cookies. You can change your preferences at any time by clicking
              on the "Cookie Settings" link in the footer of our website.
            </p>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Do Not Track
            </h3>
            <p className="text-gray-700 mb-4">
              Some browsers have a "Do Not Track" feature that lets you tell
              websites that you do not want to have your online activities
              tracked. Currently, there is no standard for how websites should
              respond to "Do Not Track" signals, and we do not currently respond
              to such signals.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Updates to This Cookie Policy
            </h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect
              changes in technology, regulation, or our business practices. Any
              changes will become effective when we post the revised policy on
              our website. We encourage you to periodically review this page for
              the latest information on our cookie practices.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies or this Cookie
              Policy, please contact us at:
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