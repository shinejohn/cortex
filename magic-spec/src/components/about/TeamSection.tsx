import React, { useState } from 'react';
import {
  Mail,
  Twitter,
  Linkedin,
  Github,
  User,
  Sparkles,
  MessageSquare } from
'lucide-react';
export const TeamSection = () => {
  const [activeTab, setActiveTab] = useState('humans');
  const humanTeam = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & Editor-in-Chief',
    bio: 'Former investigative journalist with 15 years of experience. Founded Day.News to reinvent local journalism for the digital age.',
    image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    social: {
      email: 'sarah@day.news',
      twitter: 'sarahjohnson',
      linkedin: 'sarahjohnson'
    }
  },
  {
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    bio: 'AI researcher and software engineer who leads our technology development and ensures our AI systems are ethical and effective.',
    image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    social: {
      email: 'michael@day.news',
      twitter: 'michaelchen',
      github: 'michaelchen'
    }
  },
  {
    name: 'Elena Rodriguez',
    role: 'Community Engagement Director',
    bio: 'Community organizer who ensures our platform truly serves local needs and helps neighborhoods connect with their news.',
    image:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    social: {
      email: 'elena@day.news',
      twitter: 'elenarodriguez',
      linkedin: 'elenarodriguez'
    }
  },
  {
    name: 'David Washington',
    role: 'Head of Journalism',
    bio: 'Pulitzer-winning reporter who trains and mentors our human journalists and ensures editorial excellence across all content.',
    image:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    social: {
      email: 'david@day.news',
      twitter: 'davidwashington',
      linkedin: 'davidwashington'
    }
  },
  {
    name: 'Jennifer Park',
    role: 'AI Ethics Officer',
    bio: 'Former tech ethicist who ensures our AI systems are transparent, fair, and aligned with our journalistic standards.',
    image:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    social: {
      email: 'jennifer@day.news',
      twitter: 'jenniferpark',
      github: 'jenniferpark'
    }
  },
  {
    name: 'Robert Taylor',
    role: 'Business Development',
    bio: 'Media business veteran who creates sustainable revenue models that keep our journalism independent and accessible.',
    image:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    social: {
      email: 'robert@day.news',
      linkedin: 'roberttaylor'
    }
  }];

  const aiTeam = [
  {
    name: 'Nova',
    role: 'Data Journalist',
    bio: 'Specializes in analyzing public data sets to identify trends and stories that matter to local communities. Helps human journalists find insights in complex information.',
    image:
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    capabilities: [
    'Data Analysis',
    'Statistical Reporting',
    'Visual Data Presentation']

  },
  {
    name: 'Echo',
    role: 'Community Listener',
    bio: "Monitors social media, forums, and comments to identify emerging community concerns and questions. Helps ensure we're covering what matters most to readers.",
    image:
    'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    capabilities: [
    'Sentiment Analysis',
    'Trend Identification',
    'Community Engagement']

  },
  {
    name: 'Pulse',
    role: 'Breaking News Assistant',
    bio: 'Helps process and verify information during breaking news situations, allowing human journalists to focus on on-the-ground reporting and analysis.',
    image:
    'https://images.unsplash.com/photo-1639322537756-62b5f8e15444?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    capabilities: [
    'Real-time Information Processing',
    'Fact Verification',
    'News Alert Generation']

  },
  {
    name: 'Sage',
    role: 'Research Specialist',
    bio: 'Provides historical context and background research to enrich human reporting. Helps connect current events to relevant historical patterns.',
    image:
    'https://images.unsplash.com/photo-1583207681906-51271bfa962d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    capabilities: [
    'Historical Research',
    'Context Analysis',
    'Source Identification']

  }];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A unique collaboration of passionate humans and advanced AI working
            together to serve our communities
          </p>
          {/* Tab navigation */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setActiveTab('humans')}
                className={`px-6 py-2 rounded-md text-sm font-medium ${activeTab === 'humans' ? 'bg-white text-news-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>

                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Human Team
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-6 py-2 rounded-md text-sm font-medium ${activeTab === 'ai' ? 'bg-white text-news-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>

                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Journalists
                </div>
              </button>
            </div>
          </div>
        </div>
        {activeTab === 'humans' ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {humanTeam.map((member) =>
          <div
            key={member.name}
            className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                <div className="aspect-w-3 aspect-h-2">
                  <img
                src={member.image}
                alt={member.name}
                className="w-full h-56 object-cover" />

                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-news-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex space-x-3">
                    {member.social.email &&
                <a
                  href={`mailto:${member.social.email}`}
                  className="text-gray-400 hover:text-gray-700">

                        <Mail className="h-5 w-5" />
                      </a>
                }
                    {member.social.twitter &&
                <a
                  href={`https://twitter.com/${member.social.twitter}`}
                  className="text-gray-400 hover:text-gray-700">

                        <Twitter className="h-5 w-5" />
                      </a>
                }
                    {member.social.linkedin &&
                <a
                  href={`https://linkedin.com/in/${member.social.linkedin}`}
                  className="text-gray-400 hover:text-gray-700">

                        <Linkedin className="h-5 w-5" />
                      </a>
                }
                    {member.social.github &&
                <a
                  href={`https://github.com/${member.social.github}`}
                  className="text-gray-400 hover:text-gray-700">

                        <Github className="h-5 w-5" />
                      </a>
                }
                  </div>
                </div>
              </div>
          )}
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiTeam.map((member) =>
          <div
            key={member.name}
            className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">

                <div className="md:flex">
                  <div className="md:flex-shrink-0 md:w-48">
                    <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-56 md:h-full object-cover" />

                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <Sparkles className="h-5 w-5 text-news-primary mr-2" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {member.name}
                      </h3>
                    </div>
                    <p className="text-news-primary font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Capabilities:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {member.capabilities.map((capability) =>
                    <span
                      key={capability}
                      className="bg-news-primary bg-opacity-10 text-news-primary px-3 py-1 rounded-full text-xs font-medium">

                            {capability}
                          </span>
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
            {/* AI Ethics & Supervision Note */}
            <div className="col-span-1 md:col-span-2 bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-blue-800">
                    How Our AI Journalists Work
                  </h3>
                  <p className="mt-2 text-blue-700">
                    All of our AI systems operate under human supervision and
                    follow strict editorial guidelines. They assist with data
                    processing, research, and first drafts, but final editorial
                    decisions are always made by our human journalists. We're
                    committed to transparency about AI use and clearly label all
                    AI-assisted content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>);

};