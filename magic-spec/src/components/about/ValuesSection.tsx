import React from 'react';
import {
  Shield,
  EyeIcon,
  Zap,
  Heart,
  AlertTriangle,
  CheckCircle,
  Sparkles } from
'lucide-react';
export const ValuesSection = () => {
  const values = [
  {
    icon: <EyeIcon className="h-6 w-6 text-blue-600" />,
    title: 'Transparency',
    description:
    'We clearly disclose when AI is used in content creation and explain how our technology works.'
  },
  {
    icon: <Shield className="h-6 w-6 text-blue-600" />,
    title: 'Accuracy',
    description:
    'We verify facts, provide context, and correct errors promptly to maintain trust with our readers.'
  },
  {
    icon: <Heart className="h-6 w-6 text-blue-600" />,
    title: 'Community First',
    description:
    'We prioritize stories that matter to local residents and amplify community voices.'
  },
  {
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    title: 'Innovation',
    description:
    'We continuously improve our technology to better serve communities while upholding journalistic values.'
  }];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Our Values & Ethics
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide our work and ensure we serve our
            communities with integrity
          </p>
        </div>
        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {values.map((value, index) =>
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          )}
        </div>
        {/* AI Ethics Framework */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-16">
          <div className="bg-news-primary text-white p-6">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 mr-3" />
              <h3 className="text-xl font-bold">Our AI Ethics Framework</h3>
            </div>
            <p className="mt-2 text-blue-100">
              The principles that guide our use of artificial intelligence in
              journalism
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg">
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      What Our AI Can Do
                    </h4>
                    <ul className="text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Process and analyze public data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>
                          Generate initial drafts of data-driven stories
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>
                          Monitor social media for emerging local issues
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Assist with research and fact-checking</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>
                          Translate content for multilingual communities
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg">
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      What Our AI Cannot Do
                    </h4>
                    <ul className="text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Make final editorial decisions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Conduct interviews or original reporting</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Generate opinion content or editorials</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Operate without human oversight</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Create or manipulate images/videos</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Editorial Standards */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Editorial Standards & Community Guidelines
            </h3>
            <p className="text-gray-600 mt-1">
              The journalistic principles that guide our content creation
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Editorial Standards
                </h4>
                <ul className="space-y-4">
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-medium">1</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Accuracy & Verification
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We verify all facts with multiple sources and provide
                        context to help readers understand complex issues.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-medium">2</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Independence & Impartiality
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We maintain editorial independence and present diverse
                        perspectives on controversial issues.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-medium">3</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Transparency & Accountability
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We clearly label AI-assisted content and promptly
                        correct errors when they occur.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-medium">4</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Serving the Public Interest
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We prioritize stories that help community members make
                        informed decisions about their lives.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Community Guidelines
                </h4>
                <ul className="space-y-4">
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 font-medium">1</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Respectful Dialogue
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We encourage constructive conversation and require
                        commenters to treat each other with respect.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 font-medium">2</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Fact-Based Contributions
                      </h5>
                      <p className="text-gray-600 text-sm">
                        Community contributions should be factual and avoid
                        spreading misinformation or unverified claims.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 font-medium">3</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Inclusive Environment
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We do not tolerate discrimination, harassment, or
                        content that promotes hatred toward any group.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 font-medium">4</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Privacy & Consent
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We respect privacy and require community members to do
                        the same when sharing information about others.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <a
                href="#"
                className="text-news-primary font-medium hover:underline">

                Read our complete Editorial Policy and Community Guidelines
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>);

};