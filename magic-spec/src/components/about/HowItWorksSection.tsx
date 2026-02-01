import React from 'react';
import {
  Sparkles,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  Search,
  Database } from
'lucide-react';
export const HowItWorksSection = () => {
  const steps = [
  {
    icon: <Search className="h-8 w-8 text-white" />,
    title: 'Information Gathering',
    description:
    'Our AI systems monitor public data sources, social media, and community forums to identify potential stories and trends.',
    aiRole: 'Data collection and pattern recognition',
    humanRole: 'Setting priorities and identifying community needs'
  },
  {
    icon: <Database className="h-8 w-8 text-white" />,
    title: 'Research & Analysis',
    description:
    'Information is verified, contextualized, and enriched with historical data and relevant background.',
    aiRole: 'Processing large datasets and finding connections',
    humanRole: 'Conducting interviews and providing local expertise'
  },
  {
    icon: <Edit className="h-8 w-8 text-white" />,
    title: 'Content Creation',
    description:
    'Stories are drafted with a focus on accuracy, relevance, and engaging presentation.',
    aiRole: 'Generating initial drafts and structuring information',
    humanRole: 'Adding human perspective and editorial judgment'
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-white" />,
    title: 'Editorial Review',
    description:
    'All content undergoes a thorough review process before publication to ensure quality and accuracy.',
    aiRole: 'Fact-checking and consistency verification',
    humanRole: 'Final editorial decisions and ethical considerations'
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    title: 'Community Engagement',
    description:
    'After publication, we actively engage with community feedback and update stories as needed.',
    aiRole: 'Analyzing reader response and identifying questions',
    humanRole: 'Responding to comments and building relationships'
  }];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our unique approach combines human expertise with AI capabilities to
            create better local journalism
          </p>
        </div>
        {/* Process Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-24 left-1/2 w-0.5 h-[calc(100%-8rem)] bg-gray-200 -translate-x-1/2 hidden md:block"></div>
          <div className="space-y-12 relative">
            {steps.map((step, index) =>
            <div
              key={index}
              className={`md:flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                {/* Icon circle */}
                <div className="md:w-1/2 flex justify-center mb-6 md:mb-0">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-news-primary flex items-center justify-center z-10 relative shadow-lg">
                      {step.icon}
                    </div>
                    <div
                    className="absolute top-1/2 w-32 h-0.5 bg-gray-200 hidden md:block"
                    style={{
                      left: index % 2 === 0 ? '100%' : 'auto',
                      right: index % 2 === 1 ? '100%' : 'auto',
                      transform: 'translateY(-50%)'
                    }}>
                  </div>
                  </div>
                </div>
                {/* Content */}
                <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-800">AI Role</h4>
                      </div>
                      <p className="text-sm text-blue-700">{step.aiRole}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-800">
                          Human Role
                        </h4>
                      </div>
                      <p className="text-sm text-green-700">{step.humanRole}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Quality Assurance */}
        <div className="mt-20 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-news-primary text-white p-6">
            <h3 className="text-xl font-bold">Our Quality Assurance Process</h3>
            <p className="mt-2 text-blue-100">
              Every piece of content goes through these verification steps
              before publication
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="text-lg font-medium">Fact Verification</h4>
              </div>
              <p className="text-gray-600">
                All facts are verified against multiple reliable sources. Our AI
                systems cross-reference information and flag inconsistencies for
                human review.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium">Editorial Standards</h4>
              </div>
              <p className="text-gray-600">
                All content must meet our journalistic standards for accuracy,
                fairness, and relevance to the community. Human editors review
                for tone and context.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="text-lg font-medium">Community Feedback</h4>
              </div>
              <p className="text-gray-600">
                We incorporate community perspectives and feedback to ensure our
                reporting reflects local concerns and provides value to our
                readers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>);

};