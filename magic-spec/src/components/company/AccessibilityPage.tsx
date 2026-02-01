import React from 'react';
import { useLocationDetection } from '../location/LocationDetector';
export const AccessibilityPage = () => {
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  return (
    <div className="min-h-screen bg-bg-primary w-full">
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-news-primary mb-8">
          Accessibility Statement
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
              Our Commitment
            </h2>
            <p className="text-gray-700 mb-4">
              {city} Day News is committed to ensuring digital accessibility for
              people with disabilities. We are continually improving the user
              experience for everyone and applying the relevant accessibility
              standards.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Conformance Status
            </h2>
            <p className="text-gray-700 mb-4">
              We strive to conform to the Web Content Accessibility Guidelines
              (WCAG) 2.1 Level AA. These guidelines explain how to make web
              content more accessible to people with a wide array of
              disabilities, including visual, auditory, physical, speech,
              cognitive, language, learning, and neurological disabilities.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Accessibility Features
            </h2>
            <p className="text-gray-700 mb-4">
              Our website includes the following accessibility features:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                <strong>Text Alternatives:</strong> We provide text alternatives
                for non-text content so that it can be changed into other forms
                people need, such as large print, braille, speech, symbols, or
                simpler language.
              </li>
              <li>
                <strong>Keyboard Accessibility:</strong> All functionality is
                available from a keyboard.
              </li>
              <li>
                <strong>Readable Content:</strong> We make text content readable
                and understandable by using clear headings, consistent
                navigation, and readable font sizes.
              </li>
              <li>
                <strong>Predictable Navigation:</strong> We make web pages
                appear and operate in predictable ways.
              </li>
              <li>
                <strong>Input Assistance:</strong> We help users avoid and
                correct mistakes.
              </li>
              <li>
                <strong>Compatible Technology:</strong> We maximize
                compatibility with current and future user tools.
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Assistive Technology
            </h2>
            <p className="text-gray-700 mb-4">
              Our website is designed to be compatible with the following
              assistive technologies:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                Screen readers (such as NVDA, JAWS, VoiceOver, and TalkBack)
              </li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Known Limitations
            </h2>
            <p className="text-gray-700 mb-4">
              Despite our best efforts to ensure accessibility of our website,
              there may be some limitations. Below is a description of known
              limitations, and potential solutions. Please contact us if you
              observe an issue not listed below.
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                <strong>Legacy Content:</strong> Some older content may not be
                fully accessible. We are working to update this content as
                quickly as possible.
              </li>
              <li>
                <strong>Third-Party Content:</strong> Some content provided by
                third parties may not be fully accessible. We are working with
                our partners to improve the accessibility of this content.
              </li>
              <li>
                <strong>Live Video Streams:</strong> Some live video streams may
                not have captions available. We strive to provide captions for
                all pre-recorded videos and are working on solutions for live
                content.
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Feedback
            </h2>
            <p className="text-gray-700 mb-4">
              We welcome your feedback on the accessibility of our website.
              Please let us know if you encounter accessibility barriers:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:accessibility@day.news"
                  className="text-news-primary hover:underline">

                  accessibility@day.news
                </a>
              </li>
              <li>
                <strong>Phone:</strong> (727) 555-1234
              </li>
              <li>
                <strong>Postal address:</strong> 123 Main Street, {city}, FL
                33755
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              We try to respond to feedback within 2 business days.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Accessibility Resources
            </h2>
            <p className="text-gray-700 mb-4">
              If you are experiencing difficulties accessing our content, here
              are some resources that might help:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                <a
                  href="https://www.w3.org/WAI/users/browsing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-news-primary hover:underline">

                  W3C's Web Accessibility Initiative (WAI) Better Web Browsing
                  Tips
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/WAI/users/inaccessible"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-news-primary hover:underline">

                  W3C's Contacting Organizations about Inaccessible Websites
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/WAI/fundamentals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-news-primary hover:underline">

                  W3C's Accessibility Fundamentals
                </a>
              </li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Assessment and Enforcement
            </h2>
            <p className="text-gray-700 mb-4">
              {city} Day News assesses the accessibility of our website
              regularly. We:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>Conduct internal audits</li>
              <li>Test with assistive technologies</li>
              <li>Consult with users with disabilities</li>
              <li>Provide accessibility training to our staff</li>
            </ul>
            <p className="text-gray-700 mb-4">
              This statement was created on{' '}
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}{' '}
              using the W3C Accessibility Statement Generator Tool.
            </p>
          </section>
        </div>
      </main>
    </div>);

};