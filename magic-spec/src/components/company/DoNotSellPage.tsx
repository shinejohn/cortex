import React, { useState } from 'react';
import { useLocationDetection } from '../location/LocationDetector';
export const DoNotSellPage = () => {
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    requestType: 'doNotSell',
    details: '',
    verifyIdentity: false
  });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would submit the form to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };
  return (
    <div className="min-h-screen bg-bg-primary w-full">
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-news-primary mb-8">
          Do Not Sell My Information
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
              Your Privacy Rights
            </h2>
            <p className="text-gray-700 mb-4">
              Under certain state privacy laws, including the California
              Consumer Privacy Act (CCPA) and the California Privacy Rights Act
              (CPRA), you have the right to opt out of the sale or sharing of
              your personal information.
            </p>
            <p className="text-gray-700 mb-4">
              {city} Day News respects your privacy rights and provides this
              page to help you exercise your right to opt out of the sale or
              sharing of your personal information.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              What This Means
            </h2>
            <p className="text-gray-700 mb-4">
              When we talk about "selling" or "sharing" personal information,
              we're referring to disclosing or making available personal
              information to third parties for monetary or other valuable
              consideration, or for targeted advertising purposes.
            </p>
            <p className="text-gray-700 mb-4">This may include:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                Sharing information with advertising partners who may use it to
                display personalized ads
              </li>
              <li>Providing information to data analytics providers</li>
              <li>
                Sharing information with marketing partners for promotional
                purposes
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              How to Submit Your Request
            </h2>
            <p className="text-gray-700 mb-4">
              You can submit your "Do Not Sell My Information" request using the
              form below. Alternatively, you can contact us directly using the
              information provided at the bottom of this page.
            </p>
            {submitted ?
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mt-6">
                <h3 className="font-bold text-lg mb-2">Request Submitted</h3>
                <p>
                  Thank you for submitting your request. We will process it
                  within 45 days and contact you if we need additional
                  information.
                </p>
                <p className="mt-2">
                  Reference Number: DNP-{Math.floor(Math.random() * 1000000)}
                </p>
              </div> :

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      First Name*
                    </label>
                    <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary" />

                  </div>
                  <div>
                    <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1">

                      Last Name*
                    </label>
                    <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary" />

                  </div>
                </div>
                <div>
                  <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Email Address*
                  </label>
                  <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary" />

                  <p className="text-xs text-gray-500 mt-1">
                    We'll use this to verify your identity and communicate about
                    your request.
                  </p>
                </div>
                <div>
                  <label
                  htmlFor="requestType"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Request Type*
                  </label>
                  <select
                  id="requestType"
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary">

                    <option value="doNotSell">
                      Do Not Sell My Personal Information
                    </option>
                    <option value="doNotShare">
                      Do Not Share My Personal Information for Targeted
                      Advertising
                    </option>
                    <option value="both">
                      Both: Do Not Sell or Share My Information
                    </option>
                  </select>
                </div>
                <div>
                  <label
                  htmlFor="details"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Additional Details (Optional)
                  </label>
                  <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                  placeholder="Please provide any additional information that may help us process your request.">
                </textarea>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                    id="verifyIdentity"
                    name="verifyIdentity"
                    type="checkbox"
                    checked={formData.verifyIdentity}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                  </div>
                  <div className="ml-3 text-sm">
                    <label
                    htmlFor="verifyIdentity"
                    className="font-medium text-gray-700">

                      I verify that I am the person whose information is being
                      requested, or I am authorized to make this request on
                      their behalf.*
                    </label>
                  </div>
                </div>
                <div>
                  <button
                  type="submit"
                  className="bg-news-primary text-white py-2 px-6 rounded-md font-medium hover:bg-news-primary-dark transition-colors">

                    Submit Request
                  </button>
                </div>
                <p className="text-xs text-gray-500">* Required fields</p>
              </form>
            }
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              What Happens Next
            </h2>
            <p className="text-gray-700 mb-4">After you submit your request:</p>
            <ol className="list-decimal list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>We will verify your identity to protect your information.</li>
              <li>
                We will process your request within 45 days (with a possible
                extension of an additional 45 days if necessary).
              </li>
              <li>We will notify you when your request has been completed.</li>
              <li>
                We will maintain a record of your request as required by law.
              </li>
            </ol>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Additional Privacy Rights
            </h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have additional privacy
              rights, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                The right to know what personal information we collect about you
              </li>
              <li>The right to access your personal information</li>
              <li>
                The right to request deletion of your personal information
              </li>
              <li>The right to correct inaccurate personal information</li>
              <li>
                The right to limit the use of sensitive personal information
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              To learn more about these rights or to submit a different type of
              request, please visit our{' '}
              <a
                href="/privacy-policy"
                className="text-news-primary hover:underline">

                Privacy Policy
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about your privacy rights or this page,
              please contact us at:
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