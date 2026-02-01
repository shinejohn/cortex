import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Check,
  AlertCircle,
  HelpCircle,
  Mail } from
'lucide-react';
export const EthicsPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Ethics Policy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Our commitment to journalistic integrity and transparency
          </p>
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-news-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Our Core Principles
              </h2>
            </div>
            <p className="text-gray-700 mb-6">
              At Day.News, we are committed to the highest standards of
              journalism ethics. Our mission is to serve the public interest by
              providing accurate, fair, and comprehensive news coverage that
              empowers our community with the information they need to make
              informed decisions.
            </p>
            <p className="text-gray-700 mb-6">
              This ethics policy outlines the principles that guide our
              journalistic decisions and practices. It represents our commitment
              to our readers and to the communities we serve.
            </p>
            <div className="space-y-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Truth and Accuracy
                  </h3>
                  <p className="text-gray-700">
                    We are committed to reporting the truth. We verify
                    information before publishing, distinguish between fact and
                    opinion, and promptly correct errors when they occur.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Independence</h3>
                  <p className="text-gray-700">
                    We maintain editorial independence from advertisers, donors,
                    and other external influences. Our news judgments are made
                    without regard to the interests of those entities.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Fairness and Impartiality
                  </h3>
                  <p className="text-gray-700">
                    We strive to present all sides of a story. We avoid
                    favoritism and provide context that helps readers understand
                    the full picture. We give subjects of criticism the
                    opportunity to respond.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Accountability
                  </h3>
                  <p className="text-gray-700">
                    We take responsibility for our work. We acknowledge and
                    correct mistakes promptly. We welcome feedback from our
                    readers and the communities we serve.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Transparency</h3>
                  <p className="text-gray-700">
                    We are open about how we gather news. We identify sources
                    clearly, disclose potential conflicts of interest, and
                    explain our editorial decisions when necessary.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-news-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Detailed Guidelines
              </h2>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Conflicts of Interest
                </h3>
                <p className="text-gray-700 mb-3">
                  Our journalists must avoid real or perceived conflicts of
                  interest that could compromise their impartiality or the
                  credibility of their reporting. This includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    Avoiding financial investments in companies or industries
                    they cover
                  </li>
                  <li>
                    Refraining from active participation in political campaigns
                    or partisan activities
                  </li>
                  <li>
                    Disclosing personal connections to subjects of coverage
                  </li>
                  <li>
                    Declining gifts, free travel, or special treatment from news
                    sources
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  When potential conflicts cannot be avoided, we disclose them
                  to our readers and, when appropriate, recuse journalists from
                  covering specific stories.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Sources and Attribution
                </h3>
                <p className="text-gray-700 mb-3">
                  We prioritize on-the-record sources and attribute information
                  clearly. We use anonymous sources only when:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    The information is essential and cannot be obtained any
                    other way
                  </li>
                  <li>The source has direct knowledge of the information</li>
                  <li>
                    The source's identity is known to editors who have assessed
                    their reliability
                  </li>
                  <li>We can explain to readers why anonymity was granted</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  We strive to provide readers with as much information as
                  possible about anonymous sources without compromising their
                  identity.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Digital Media Ethics
                </h3>
                <p className="text-gray-700 mb-3">
                  Our ethical standards apply across all platforms.
                  Additionally, in digital media we:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    Clearly label opinion content, sponsored content, and
                    advertisements
                  </li>
                  <li>
                    Maintain editorial independence from data analytics and
                    audience metrics
                  </li>
                  <li>
                    Use social media responsibly, understanding that
                    journalists' personal accounts may reflect on our
                    organization
                  </li>
                  <li>
                    Avoid digital manipulation of images beyond standard
                    adjustments for clarity
                  </li>
                  <li>
                    Consider the implications of linking to external content
                  </li>
                  <li>
                    Respect copyright and attribute content from other sources
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Corrections and Updates
                </h3>
                <p className="text-gray-700 mb-3">
                  We are committed to accuracy and promptly correct errors in
                  our reporting. Our policy includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Correcting factual errors quickly and transparently</li>
                  <li>Noting significant corrections prominently</li>
                  <li>
                    Updating digital content with correction notices that
                    explain what was changed
                  </li>
                  <li>Maintaining an archive of published corrections</li>
                  <li>
                    Reviewing serious errors to prevent similar mistakes in the
                    future
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Community Engagement
                </h3>
                <p className="text-gray-700 mb-3">
                  We value our relationship with readers and the communities we
                  serve:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>We encourage feedback and respond to reader concerns</li>
                  <li>We moderate comments to promote respectful dialogue</li>
                  <li>
                    We engage with diverse communities to ensure comprehensive
                    coverage
                  </li>
                  <li>
                    We explain our editorial decisions when they generate
                    significant public interest
                  </li>
                  <li>
                    We distinguish between news coverage and community outreach
                    initiatives
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  AI and Technology
                </h3>
                <p className="text-gray-700 mb-3">
                  As technology evolves, we maintain our commitment to ethical
                  journalism:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    We disclose when AI tools are used in content creation
                  </li>
                  <li>We ensure human oversight of AI-assisted journalism</li>
                  <li>
                    We verify information from AI systems with traditional
                    journalistic methods
                  </li>
                  <li>
                    We consider algorithmic bias in both our tools and our
                    coverage
                  </li>
                  <li>
                    We prioritize privacy and security in our data practices
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <AlertCircle className="h-8 w-8 text-news-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Enforcement and Oversight
              </h2>
            </div>
            <p className="text-gray-700 mb-6">
              This ethics policy is not merely aspirational—it is a working
              document that guides our daily decisions and practices. We enforce
              these standards through:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4 mb-6">
              <li>Regular ethics training for all journalists</li>
              <li>
                Editorial oversight and pre-publication review of sensitive
                stories
              </li>
              <li>
                An ethics committee that addresses complex ethical questions
              </li>
              <li>Clear procedures for handling ethics violations</li>
              <li>
                Periodic review and updates to this policy to address emerging
                issues
              </li>
            </ul>
            <p className="text-gray-700">
              Our Editorial Board serves as the final authority on the
              interpretation and application of this ethics policy. The Board
              reviews significant ethical issues and provides guidance to our
              journalists.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8">
            <div className="flex items-start">
              <HelpCircle className="h-6 w-6 text-news-primary mr-3 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Questions or Concerns?
                </h2>
                <p className="text-gray-700 mb-4">
                  We welcome feedback about our ethical practices and coverage.
                  If you have questions, concerns, or would like to report a
                  potential ethics violation, please contact our Ethics Editor.
                </p>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-600 mr-2" />
                  <a
                    href="mailto:ethics@day.news"
                    className="text-news-primary hover:underline">

                    ethics@day.news
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">Last updated: July 15, 2024</p>
          </div>
        </div>
      </main>
    </div>);

};