import React from 'react';
import { useLocationDetection } from '../location/LocationDetector';
export const TermsOfServicePage = () => {
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  return (
    <div className="min-h-screen bg-bg-primary w-full">
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-news-primary mb-8">
          Terms of Service
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
              Agreement to Terms
            </h2>
            <p className="text-gray-700 mb-4">
              These Terms of Service ("Terms") constitute a legally binding
              agreement between you and {city} Day News ("we," "our," or "us")
              governing your access to and use of our website, mobile
              application, and other online services (collectively, the
              "Services").
            </p>
            <p className="text-gray-700 mb-4">
              By accessing or using our Services, you agree to be bound by these
              Terms. If you do not agree to these Terms, you may not access or
              use the Services.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-700 mb-4">
              We may revise these Terms at any time by posting an updated
              version on our Services. The revised Terms will be effective
              immediately upon posting. Your continued use of the Services after
              the posting of revised Terms constitutes your acceptance of such
              changes. We encourage you to review the Terms whenever you access
              or use our Services.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Eligibility
            </h2>
            <p className="text-gray-700 mb-4">
              You must be at least 13 years old to access or use our Services.
              By accessing or using our Services, you represent and warrant that
              you are at least 13 years old and have the legal capacity to enter
              into these Terms. If you are accessing or using our Services on
              behalf of a company, organization, or other entity, you represent
              and warrant that you have the authority to bind that entity to
              these Terms.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              User Accounts
            </h2>
            <p className="text-gray-700 mb-4">
              Some features of our Services may require you to create an
              account. When you create an account, you must provide accurate and
              complete information. You are solely responsible for the activity
              that occurs on your account, and you must keep your account
              password secure. You must notify us immediately of any breach of
              security or unauthorized use of your account.
            </p>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account if any
              information provided during the registration process or thereafter
              proves to be inaccurate, false, or misleading, or if you violate
              any provision of these Terms.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Subscriptions and Payments
            </h2>
            <p className="text-gray-700 mb-4">
              Some of our Services may require a subscription or payment. By
              subscribing to our Services or making a payment, you agree to pay
              all fees in accordance with the applicable payment terms. All
              payments are non-refundable unless otherwise specified.
            </p>
            <p className="text-gray-700 mb-4">
              We reserve the right to change our subscription plans and prices
              at any time. Any changes to subscription plans or prices will be
              effective upon posting on our Services or upon notification to
              you.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Content and Intellectual Property Rights
            </h2>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              Our Content
            </h3>
            <p className="text-gray-700 mb-4">
              All content, features, and functionality available through our
              Services, including but not limited to text, graphics, logos,
              icons, images, audio clips, digital downloads, data compilations,
              and software, are owned by us, our licensors, or other providers
              of such material and are protected by copyright, trademark,
              patent, trade secret, and other intellectual property or
              proprietary rights laws.
            </p>
            <p className="text-gray-700 mb-4">
              You may not reproduce, distribute, modify, create derivative works
              of, publicly display, publicly perform, republish, download,
              store, or transmit any of the material on our Services, except as
              follows:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                Your computer may temporarily store copies of such materials in
                RAM incidental to your accessing and viewing those materials.
              </li>
              <li>
                You may store files that are automatically cached by your Web
                browser for display enhancement purposes.
              </li>
              <li>
                You may print or download one copy of a reasonable number of
                pages of the Services for your own personal, non-commercial use
                and not for further reproduction, publication, or distribution.
              </li>
              <li>
                If we provide social media features with certain content, you
                may take such actions as are enabled by such features.
              </li>
            </ul>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-3">
              User Content
            </h3>
            <p className="text-gray-700 mb-4">
              Our Services may allow you to post, submit, publish, display, or
              transmit content, including but not limited to comments, reviews,
              and other materials (collectively, "User Content"). You retain all
              rights in, and are solely responsible for, the User Content you
              post to our Services.
            </p>
            <p className="text-gray-700 mb-4">
              By posting User Content, you grant us a non-exclusive, perpetual,
              irrevocable, royalty-free, worldwide, transferable, sublicensable
              license to use, reproduce, modify, adapt, publish, translate,
              create derivative works from, distribute, and display such User
              Content in connection with our Services.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Prohibited Uses
            </h2>
            <p className="text-gray-700 mb-4">
              You may use our Services only for lawful purposes and in
              accordance with these Terms. You agree not to use our Services:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-2">
              <li>
                In any way that violates any applicable federal, state, local,
                or international law or regulation.
              </li>
              <li>
                To transmit, or procure the sending of, any advertising or
                promotional material, including any "junk mail," "chain letter,"
                "spam," or any other similar solicitation.
              </li>
              <li>
                To impersonate or attempt to impersonate us, our employees,
                another user, or any other person or entity.
              </li>
              <li>
                To engage in any other conduct that restricts or inhibits
                anyone's use or enjoyment of the Services, or which may harm us
                or users of the Services or expose them to liability.
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Termination
            </h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your access to all or part of our
              Services, including terminating or suspending your account, at any
              time, with or without notice, for any reason, including, without
              limitation, breach of these Terms.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 mb-4">
              YOUR USE OF OUR SERVICES IS AT YOUR SOLE RISK. OUR SERVICES AND
              ALL CONTENT INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH
              OUR SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS,
              WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p className="text-gray-700 mb-4">
              TO THE FULLEST EXTENT PROVIDED BY LAW, WE HEREBY DISCLAIM ALL
              WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY, OR
              OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
              MERCHANTABILITY, NON-INFRINGEMENT, AND FITNESS FOR PARTICULAR
              PURPOSE.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 mb-4">
              TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL WE, OUR
              AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES,
              AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND,
              UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR
              USE, OR INABILITY TO USE, OUR SERVICES, ANY CONTENT ON OUR
              SERVICES OR ANY SERVICES OR ITEMS OBTAINED THROUGH OUR SERVICES,
              INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Indemnification
            </h2>
            <p className="text-gray-700 mb-4">
              You agree to defend, indemnify, and hold harmless us, our
              affiliates, licensors, and service providers, and our and their
              respective officers, directors, employees, contractors, agents,
              licensors, suppliers, successors, and assigns from and against any
              claims, liabilities, damages, judgments, awards, losses, costs,
              expenses, or fees (including reasonable attorneys' fees) arising
              out of or relating to your violation of these Terms or your use of
              the Services.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Governing Law and Jurisdiction
            </h2>
            <p className="text-gray-700 mb-4">
              These Terms and your use of the Services shall be governed by and
              construed in accordance with the laws of the State of Florida,
              without giving effect to any choice or conflict of law provision
              or rule. Any legal suit, action, or proceeding arising out of, or
              related to, these Terms or the Services shall be instituted
              exclusively in the federal courts of the United States or the
              courts of the State of Florida, in each case located in Pinellas
              County.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{city} Day News</p>
              <p className="text-gray-700">123 Main Street</p>
              <p className="text-gray-700">{city}, FL 33755</p>
              <p className="text-gray-700">Email: terms@day.news</p>
              <p className="text-gray-700">Phone: (727) 555-1234</p>
            </div>
          </section>
        </div>
      </main>
    </div>);

};