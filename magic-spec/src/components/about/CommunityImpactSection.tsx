import React from 'react';
import { MapPin, Users, Newspaper, Building, Star, Quote } from 'lucide-react';
export const CommunityImpactSection = ({ stats }) => {
  const testimonials = [
  {
    quote:
    "Day.News has transformed how I stay connected to what's happening in our town. The coverage is relevant and I love that I can actually contribute to the conversation.",
    author: 'Maria Rodriguez',
    role: 'Small Business Owner',
    location: 'Clearwater',
    image:
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    quote:
    "As a city council member, I appreciate how Day.News has increased civic engagement. More residents are attending meetings and getting involved because they're better informed.",
    author: 'James Wilson',
    role: 'City Council Member',
    location: 'Dunedin',
    image:
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    quote:
    'The local coverage helped our fundraiser reach three times more people than last year. This platform is bringing our community together in meaningful ways.',
    author: 'Sarah Thompson',
    role: 'Community Organizer',
    location: 'Palm Harbor',
    image:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  }];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Our Community Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Building stronger, more informed communities through local
            journalism
          </p>
        </div>
        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-news-primary rounded-full mb-4">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <div className="text-4xl font-bold text-news-primary mb-2">
              {stats.storiesPublished.toLocaleString()}
            </div>
            <div className="text-gray-600">Stories Published</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-news-primary rounded-full mb-4">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="text-4xl font-bold text-news-primary mb-2">
              {stats.communitiesServed}
            </div>
            <div className="text-gray-600">Communities Served</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-news-primary rounded-full mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-4xl font-bold text-news-primary mb-2">
              {(stats.readersReached / 1000000).toFixed(1)}M+
            </div>
            <div className="text-gray-600">Readers Reached</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-news-primary rounded-full mb-4">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div className="text-4xl font-bold text-news-primary mb-2">
              {stats.localBusinessesSupported.toLocaleString()}
            </div>
            <div className="text-gray-600">Local Businesses Supported</div>
          </div>
        </div>
        {/* Communities Served Map */}
        <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm mb-16">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Communities We Serve
            </h3>
            <p className="text-gray-600">
              Our network of local news platforms across the state
            </p>
          </div>
          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
            <img
              src="https://images.unsplash.com/photo-1618035881605-dfe8d7eb387b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Map of communities served"
              className="w-full h-full object-cover" />

            {/* This would be replaced with an actual interactive map in a real implementation */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 px-6 py-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  Interactive Map Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Community Testimonials */}
        <div>
          <h3 className="text-2xl font-display font-bold text-gray-900 text-center mb-8">
            Voices from Our Communities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) =>
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mr-4">
                    <Quote className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
                  <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover mr-4" />

                  <div>
                    <div className="font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-news-primary flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Impact Story */}
          <div className="mt-12 bg-news-primary rounded-xl overflow-hidden shadow-md">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Community meeting"
                  className="w-full h-64 md:h-full object-cover" />

              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <div className="flex items-center mb-4">
                  <Star className="h-6 w-6 text-yellow-400 mr-2" />
                  <h3 className="text-xl font-bold text-white">
                    Success Story: Revitalizing Main Street
                  </h3>
                </div>
                <p className="text-blue-100 mb-4">
                  When local businesses on Main Street were struggling, our
                  reporting highlighted their challenges and connected them with
                  community resources. A year later, vacancy rates dropped from
                  40% to just 5%.
                </p>
                <p className="text-blue-100 mb-6">
                  Our AI systems identified the trend, our human journalists
                  told the stories, and our platform brought the community
                  together to create real change.
                </p>
                <button className="bg-white text-news-primary px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors self-start">
                  Read Full Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};