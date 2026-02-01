import React from 'react';
import { MapPin, Clock, Bookmark, ExternalLink } from 'lucide-react';
export const MoreNewsSection = ({
  category = null,
  onArticleClick,
  isNational = false
}) => {
  const allLocalNewsArticles = [
  {
    id: 1,
    title: 'Clearwater Beach Restoration Project Completes Ahead of Schedule',
    category: 'ENVIRONMENT',
    categoryType: 'Weather & Environment',
    image:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Clearwater Beach',
    readTime: '4 min',
    excerpt:
    'The $4.2 million beach restoration project has been completed three weeks ahead of schedule, officials announced Tuesday.'
  },
  {
    id: 2,
    title: 'New Downtown Art Installation Celebrates Local Heritage',
    category: 'CULTURE',
    categoryType: 'Life',
    image:
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Downtown',
    readTime: '3 min',
    excerpt:
    "A new public art installation celebrating the city's rich cultural heritage was unveiled yesterday at Coachman Park."
  },
  {
    id: 3,
    title: 'City Council Approves Funding for New Public Transit Routes',
    category: 'GOVERNMENT',
    categoryType: 'Government',
    image:
    'https://images.unsplash.com/photo-1556122071-e404cb6f31c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'City Hall',
    readTime: '5 min',
    excerpt:
    'The Clearwater City Council has approved $1.8 million in funding for three new public transit routes to improve connectivity.'
  },
  {
    id: 4,
    title: 'Local Startup Secures $5 Million in Venture Capital Funding',
    category: 'BUSINESS',
    categoryType: 'Economy & Business News',
    image:
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Tech District',
    readTime: '3 min',
    excerpt:
    'Clearwater-based tech startup WaveConnect has secured $5 million in Series A funding to expand its operations.'
  },
  {
    id: 5,
    title: 'School Board Votes to Implement New STEM Curriculum',
    category: 'EDUCATION',
    categoryType: 'Education',
    image:
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'School District HQ',
    readTime: '4 min',
    excerpt:
    'The Pinellas County School Board has unanimously approved a new STEM curriculum for all middle schools starting next fall.'
  },
  {
    id: 6,
    title:
    'Annual Seafood Festival Returns This Weekend with New Attractions',
    category: 'EVENTS',
    categoryType: 'Events',
    image:
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Pier 60',
    readTime: '2 min',
    excerpt:
    'The 35th Annual Clearwater Seafood Festival returns this weekend with new attractions, including a chef competition.'
  }];

  const allNationalNewsArticles = [
  {
    id: 1,
    title:
    'Senate Passes Bipartisan Infrastructure Bill After Months of Negotiations',
    category: 'POLITICS',
    categoryType: 'Politics',
    image:
    'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Washington, D.C.',
    readTime: '5 min',
    excerpt:
    'After months of intense negotiations, the Senate has passed a $1.2 trillion infrastructure bill with bipartisan support, marking a significant legislative victory.'
  },
  {
    id: 2,
    title:
    'Consumer Prices Rise at Fastest Rate in Decade, Fueling Inflation Concerns',
    category: 'ECONOMY',
    categoryType: 'Economy',
    image:
    'https://images.unsplash.com/photo-1574607383476-f517f260d30b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'New York',
    readTime: '4 min',
    excerpt:
    'The Consumer Price Index rose 5.4% in June from a year earlier, the largest increase since 2008, raising concerns about persistent inflation.'
  },
  {
    id: 3,
    title:
    'CDC Issues New Guidelines for Vaccinated Americans as Delta Variant Spreads',
    category: 'HEALTH',
    categoryType: 'Health',
    image:
    'https://images.unsplash.com/photo-1584118624012-df056829fbd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Atlanta',
    readTime: '6 min',
    excerpt:
    'The Centers for Disease Control and Prevention has issued new mask guidance for vaccinated individuals in response to the rapid spread of the Delta variant.'
  },
  {
    id: 4,
    title: 'Tech Industry Leaders Commit to Quantum Computing Initiative',
    category: 'TECHNOLOGY',
    categoryType: 'Technology',
    image:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'San Francisco',
    readTime: '4 min',
    excerpt:
    'Major technology companies have announced a collaborative initiative to accelerate quantum computing research and development over the next decade.'
  },
  {
    id: 5,
    title: 'UN Report Warns of "Code Red for Humanity" on Climate Change',
    category: 'ENVIRONMENT',
    categoryType: 'Environment',
    image:
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Geneva',
    readTime: '7 min',
    excerpt:
    'A landmark United Nations report has described climate change as a "code red for humanity," warning of increasingly extreme weather events unless greenhouse gas emissions are rapidly reduced.'
  },
  {
    id: 6,
    title: 'NASA Successfully Launches James Webb Space Telescope',
    category: 'SCIENCE',
    categoryType: 'Science',
    image:
    'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Cape Canaveral',
    readTime: '5 min',
    excerpt:
    'NASA has successfully launched the James Webb Space Telescope, the most powerful and complex space telescope ever built, which will succeed the Hubble Space Telescope.'
  }];

  // Select the appropriate news articles based on isNational flag
  const allNewsArticles = isNational ?
  allNationalNewsArticles :
  allLocalNewsArticles;
  // Filter articles based on selected category
  const newsArticles = category ?
  allNewsArticles.filter((article) => article.categoryType === category) :
  allNewsArticles;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {newsArticles.length > 0 ?
      newsArticles.map((article) =>
      <div
        key={article.id}
        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
        onClick={onArticleClick}>

            <div className="relative h-48">
              <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover" />

              <div className="absolute top-3 left-3">
                <span className="inline-block bg-white text-xs font-medium text-news-primary px-2 py-1 rounded-sm border border-gray-200">
                  {article.category}
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-display font-bold text-lg mb-2 text-news-primary line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center text-xs text-text-tertiary mb-3 mt-auto">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{article.location}</span>
                <span className="mx-2">•</span>
                <Clock className="h-3 w-3 mr-1" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <button className="text-news-primary text-sm font-medium flex items-center">
                  Read More
                  <ExternalLink className="h-3 w-3 ml-1" />
                </button>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <Bookmark className="h-4 w-4 text-news-primary" />
                </button>
              </div>
            </div>
          </div>
      ) :

      <div className="col-span-full text-center py-8 bg-white rounded-md border border-gray-200">
          <p className="text-gray-500">No articles found in this category.</p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for updates.
          </p>
        </div>
      }
    </div>);

};