import React, { useEffect, useState, memo } from 'react';
import { PageHeader } from '../PageHeader';
import { TimelineNavigator } from './TimelineNavigator';
import { ArchiveCalendar } from './ArchiveCalendar';
import { ArchiveResults } from './ArchiveResults';
import { CollectionThemes } from './CollectionThemes';
import { ArchiveSearch } from './ArchiveSearch';
import { HistoricalFeatures } from './HistoricalFeatures';
import { useLocationDetection } from '../location/LocationDetector';
import { ChevronDown, Calendar, Clock, BookOpen, Filter } from 'lucide-react';
export const ArchiveBrowserPage = () => {
  const { locationData } = useLocationDetection();
  const [selectedDate, setSelectedDate] = useState(new Date(2022, 5, 15)); // Default to a specific date in the past
  const [selectedView, setSelectedView] = useState('timeline'); // 'timeline', 'calendar', 'newspaper'
  const [activeCollection, setActiveCollection] = useState(null);
  const [searchParams, setSearchParams] = useState({
    dateRange: {
      start: null,
      end: null
    },
    keywords: '',
    categories: [],
    sources: []
  });
  const [archiveResults, setArchiveResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sepiaMode, setSepiaMode] = useState(false);
  const [showHistoricalContext, setShowHistoricalContext] = useState(true);
  const [archiveStats, setArchiveStats] = useState({
    totalArticles: 0,
    earliestDate: null,
    mostActiveDay: null,
    popularTopics: []
  });
  // Fetch archive statistics
  useEffect(() => {
    // Simulate API call to get archive statistics
    setTimeout(() => {
      setArchiveStats({
        totalArticles: 24879,
        earliestDate: new Date(1925, 0, 15),
        mostActiveDay: {
          date: new Date(2020, 2, 13),
          count: 78
        },
        popularTopics: [
        {
          name: 'Local Government',
          count: 3456
        },
        {
          name: 'Community Events',
          count: 2987
        },
        {
          name: 'Education',
          count: 2654
        },
        {
          name: 'Business',
          count: 2341
        },
        {
          name: 'Crime & Safety',
          count: 1876
        }]

      });
    }, 800);
  }, []);
  // Fetch archive results based on selected date or search params
  useEffect(() => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const mockResults = generateMockArchiveResults(
        selectedDate,
        searchParams,
        activeCollection
      );
      setArchiveResults(mockResults);
      setIsLoading(false);
    }, 1200);
  }, [selectedDate, searchParams, activeCollection]);
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setActiveCollection(null); // Clear any active collection when selecting a specific date
  };
  // Handle search submission
  const handleSearch = (params) => {
    setSearchParams(params);
    setActiveCollection(null); // Clear any active collection when searching
  };
  // Handle collection selection
  const handleCollectionSelect = (collectionId) => {
    setActiveCollection(collectionId);
    // Reset date and search params when viewing a collection
    setSearchParams({
      dateRange: {
        start: null,
        end: null
      },
      keywords: '',
      categories: [],
      sources: []
    });
  };
  // Toggle sepia mode
  const toggleSepiaMode = () => {
    setSepiaMode(!sepiaMode);
  };
  // Toggle historical context
  const toggleHistoricalContext = () => {
    setShowHistoricalContext(!showHistoricalContext);
  };
  return (
    <div
      className={`flex-1 overflow-auto ${sepiaMode ? 'bg-amber-50' : 'bg-gray-50'}`}>

      <PageHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Archive Header */}
        <div
          className={`rounded-lg shadow-md p-6 mb-6 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                {locationData?.city || 'Clearwater'} News Archives
              </h1>
              <p className="text-gray-600">
                Explore {archiveStats.totalArticles.toLocaleString()} articles
                from{' '}
                {archiveStats.earliestDate ?
                archiveStats.earliestDate.getFullYear() :
                '1925'}{' '}
                to present
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={toggleSepiaMode}>

                {sepiaMode ? 'Modern View' : 'Vintage View'}
              </button>
              <div className="relative group">
                <button className="px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  <span>View Options</span>
                  <ChevronDown className="h-4 w-4 ml-1.5" />
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setSelectedView('timeline')}>

                      Timeline View
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setSelectedView('calendar')}>

                      Calendar View
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setSelectedView('newspaper')}>

                      Newspaper View
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={toggleHistoricalContext}>

                      <span className="mr-2">
                        {showHistoricalContext ? '✓' : ''}
                      </span>
                      Show Historical Context
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar with navigation and search */}
          <div className="lg:col-span-1 space-y-6">
            {/* View selector for mobile */}
            <div className="lg:hidden mb-4">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2">

                <option value="timeline">Timeline View</option>
                <option value="calendar">Calendar View</option>
                <option value="newspaper">Newspaper View</option>
              </select>
            </div>
            {/* Timeline Navigator */}
            <div
              className={
              selectedView === 'timeline' || selectedView === 'newspaper' ?
              'block' :
              'hidden lg:block'
              }>

              <TimelineNavigator
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                sepiaMode={sepiaMode} />

            </div>
            {/* Archive Calendar */}
            <div
              className={
              selectedView === 'calendar' ? 'block' : 'hidden lg:block'
              }>

              <ArchiveCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                sepiaMode={sepiaMode} />

            </div>
            {/* Archive Search */}
            <ArchiveSearch onSearch={handleSearch} sepiaMode={sepiaMode} />
            {/* Collection Themes */}
            <CollectionThemes
              activeCollection={activeCollection}
              onCollectionSelect={handleCollectionSelect}
              sepiaMode={sepiaMode} />

            {/* Historical Features */}
            <HistoricalFeatures
              sepiaMode={sepiaMode}
              selectedDate={selectedDate} />

          </div>
          {/* Main content area with archive results */}
          <div className="lg:col-span-2">
            <ArchiveResults
              results={archiveResults}
              isLoading={isLoading}
              selectedDate={selectedDate}
              sepiaMode={sepiaMode}
              showHistoricalContext={showHistoricalContext}
              activeCollection={activeCollection}
              searchParams={searchParams} />

          </div>
        </div>
      </div>
    </div>);

};
// Helper function to generate mock archive results
const generateMockArchiveResults = (
selectedDate,
searchParams,
activeCollection) =>
{
  // Format the selected date for display
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // Generate different results based on whether we're viewing a collection
  if (activeCollection) {
    // Collection-specific results
    switch (activeCollection) {
      case 'thisDay':
        return generateThisDayResults(selectedDate);
      case 'yearReview1950':
        return generate1950YearReviewResults();
      case 'downtown':
        return generateDowntownResults();
      case 'hurricane':
        return generateHurricaneResults();
      default:
        return generateDefaultResults(selectedDate);
    }
  }
  // If there are search params with keywords, generate search results
  if (searchParams.keywords) {
    return generateSearchResults(searchParams);
  }
  // Default: generate results for the selected date
  return generateDefaultResults(selectedDate);
};
// Generate results for "This Day in History"
const generateThisDayResults = (selectedDate) => {
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();
  const years = [1930, 1945, 1960, 1975, 1990, 2005, 2020];
  return years.map((year) => {
    const date = new Date(year, month, day);
    return {
      id: `thisday-${year}`,
      title: getRandomHeadline(date),
      date: date,
      source: 'Clearwater Daily News',
      type: 'article',
      excerpt: getRandomExcerpt(),
      image: `https://picsum.photos/seed/${year}${month}${day}/600/400`,
      significance:
      year % 20 === 0 ? 'high' : year % 10 === 0 ? 'medium' : 'low',
      historicalContext: getRandomHistoricalContext(date)
    };
  });
};
// Generate results for 1950 Year in Review
const generate1950YearReviewResults = () => {
  return [
  {
    id: 'yr1950-1',
    title: 'Korean War Begins as North Invades South',
    date: new Date(1950, 5, 25),
    source: 'Clearwater Daily News',
    type: 'frontPage',
    excerpt:
    'The United Nations Security Council calls for immediate cessation of hostilities and withdrawal of North Korean forces to the 38th parallel.',
    image: 'https://picsum.photos/seed/korean1950/600/400',
    significance: 'high',
    historicalContext:
    'The Korean War began on June 25, 1950, when North Korean forces crossed the 38th parallel, invading South Korea. This marked the first major armed conflict of the Cold War era.'
  },
  {
    id: 'yr1950-2',
    title: 'Clearwater Beach Pavilion Opens to Record Crowds',
    date: new Date(1950, 6, 4),
    source: 'Clearwater Gazette',
    type: 'local',
    excerpt:
    'The new beachfront pavilion welcomed over 5,000 visitors on Independence Day, marking a new era for our growing coastal community.',
    image: 'https://picsum.photos/seed/beach1950/600/400',
    significance: 'medium',
    historicalContext:
    "The post-war economic boom led to significant development of Florida's beaches as tourist destinations in the early 1950s."
  },
  {
    id: 'yr1950-3',
    title: 'Truman Orders Development of Hydrogen Bomb',
    date: new Date(1950, 0, 31),
    source: 'Clearwater Daily News',
    type: 'national',
    excerpt:
    'President Truman announced today that he has directed the Atomic Energy Commission to continue its work on all forms of atomic weapons, including the hydrogen bomb.',
    image: 'https://picsum.photos/seed/truman1950/600/400',
    significance: 'high',
    historicalContext:
    'This decision came just months after the Soviet Union tested its first atomic bomb in August 1949, escalating the nuclear arms race.'
  },
  {
    id: 'yr1950-4',
    title: 'City Council Approves New Water Treatment Facility',
    date: new Date(1950, 3, 12),
    source: 'Clearwater Herald',
    type: 'local',
    excerpt:
    'The $1.2 million project is expected to be completed by spring of next year, addressing the growing needs of our expanding population.',
    image: 'https://picsum.photos/seed/water1950/600/400',
    significance: 'medium',
    historicalContext:
    'Post-war population growth in Florida coastal communities necessitated significant infrastructure investments throughout the 1950s.'
  },
  {
    id: 'yr1950-5',
    title: 'McCarthy Claims State Department Harbors Communists',
    date: new Date(1950, 1, 9),
    source: 'Clearwater Daily News',
    type: 'national',
    excerpt:
    'Senator Joseph McCarthy claimed in a speech that he has a list of known Communists working in the State Department, igniting nationwide controversy.',
    image: 'https://picsum.photos/seed/mccarthy1950/600/400',
    significance: 'high',
    historicalContext:
    "McCarthy's speech in Wheeling, West Virginia marked the beginning of a period of heightened anti-communist sentiment and investigations that would become known as McCarthyism."
  }];

};
// Generate results for Downtown Development collection
const generateDowntownResults = () => {
  return [
  {
    id: 'downtown-1',
    title: 'Downtown Revitalization Plan Unveiled',
    date: new Date(1985, 3, 15),
    source: 'Clearwater Business Journal',
    type: 'local',
    excerpt:
    'City officials presented an ambitious 10-year plan to transform the downtown area into a vibrant commercial and cultural hub.',
    image: 'https://picsum.photos/seed/downtown1985/600/400',
    significance: 'high',
    historicalContext:
    'This plan represented one of the first comprehensive attempts to revitalize downtown areas that had suffered from suburban flight in the 1970s.'
  },
  {
    id: 'downtown-2',
    title: 'Cleveland Street Shopping District Opens',
    date: new Date(1952, 9, 23),
    source: 'Clearwater Herald',
    type: 'local',
    excerpt:
    'The ribbon-cutting ceremony marked the completion of the modern shopping district that promises to make Clearwater a retail destination.',
    image: 'https://picsum.photos/seed/cleveland1952/600/400',
    significance: 'medium',
    historicalContext:
    'The early 1950s saw significant commercial development in downtown areas across America as the post-war economic boom continued.'
  },
  {
    id: 'downtown-3',
    title: 'Historic Capitol Theatre Restoration Complete',
    date: new Date(2013, 11, 18),
    source: 'Clearwater Daily News',
    type: 'local',
    excerpt:
    'After a $10.4 million renovation, the historic 1921 Capitol Theatre has been restored to its former glory and will reopen with a special performance next week.',
    image: 'https://picsum.photos/seed/capitol2013/600/400',
    significance: 'medium',
    historicalContext:
    'The restoration of historic theaters became a common strategy for downtown revitalization efforts in the early 21st century.'
  },
  {
    id: 'downtown-4',
    title: 'Downtown Faces Challenges as Suburban Malls Open',
    date: new Date(1975, 7, 5),
    source: 'Clearwater Business Journal',
    type: 'local',
    excerpt:
    'Downtown merchants report declining foot traffic as the new Countryside Mall draws shoppers away from the city center.',
    image: 'https://picsum.photos/seed/mall1975/600/400',
    significance: 'medium',
    historicalContext:
    'The 1970s saw the acceleration of "suburban flight" as shopping malls and housing developments drew residents and businesses away from traditional downtown areas.'
  },
  {
    id: 'downtown-5',
    title: 'New Downtown Waterfront Park Approved',
    date: new Date(2005, 5, 28),
    source: 'Clearwater Gazette',
    type: 'local',
    excerpt:
    'The City Council unanimously approved plans for a new 24-acre waterfront park that will connect downtown to the harbor.',
    image: 'https://picsum.photos/seed/park2005/600/400',
    significance: 'high',
    historicalContext:
    'Waterfront development became a key strategy for downtown revitalization in coastal communities during the early 2000s.'
  }];

};
// Generate results for Hurricane collection
const generateHurricaneResults = () => {
  return [
  {
    id: 'hurricane-1',
    title: 'Hurricane Elena Threatens Gulf Coast',
    date: new Date(1985, 8, 1),
    source: 'Clearwater Daily News',
    type: 'frontPage',
    excerpt:
    "Residents along Florida's Gulf Coast are preparing for Hurricane Elena, which is expected to make landfall within 48 hours.",
    image: 'https://picsum.photos/seed/elena1985/600/400',
    significance: 'high',
    historicalContext:
    'Hurricane Elena was notable for its erratic path, causing multiple evacuations as it looped in the Gulf of Mexico before eventually making landfall in Mississippi.'
  },
  {
    id: 'hurricane-2',
    title: 'Clearwater Begins Recovery After Hurricane Passes',
    date: new Date(1968, 9, 20),
    source: 'Clearwater Herald',
    type: 'local',
    excerpt:
    'Clean-up efforts are underway as residents return to assess damage from the storm that brought 80 mph winds to the area.',
    image: 'https://picsum.photos/seed/hurricane1968/600/400',
    significance: 'medium',
    historicalContext:
    'The late 1960s saw several significant hurricanes affect the Florida Gulf Coast, leading to improved building codes in subsequent years.'
  },
  {
    id: 'hurricane-3',
    title: 'Hurricane Charley Changes Course, Spares Tampa Bay',
    date: new Date(2004, 7, 14),
    source: 'Clearwater Gazette',
    type: 'frontPage',
    excerpt:
    'The Tampa Bay area breathed a collective sigh of relief as Hurricane Charley made an unexpected turn, making landfall further south near Port Charlotte.',
    image: 'https://picsum.photos/seed/charley2004/600/400',
    significance: 'high',
    historicalContext:
    'Hurricane Charley was part of the extremely active 2004 hurricane season that saw Florida struck by four major hurricanes within six weeks.'
  },
  {
    id: 'hurricane-4',
    title: 'City Implements New Hurricane Evacuation Plan',
    date: new Date(1993, 4, 25),
    source: 'Clearwater Daily News',
    type: 'local',
    excerpt:
    'Following lessons learned from Hurricane Andrew, Clearwater officials have unveiled a new evacuation plan for the upcoming hurricane season.',
    image: 'https://picsum.photos/seed/evac1993/600/400',
    significance: 'medium',
    historicalContext:
    "Hurricane Andrew in 1992 exposed significant weaknesses in Florida's emergency management systems, leading to widespread reforms."
  },
  {
    id: 'hurricane-5',
    title: 'The Great Hurricane of 1928: Remembering the Tragedy',
    date: new Date(1978, 8, 16),
    source: 'Clearwater Historical Quarterly',
    type: 'feature',
    excerpt:
    'Fifty years after one of the deadliest hurricanes in Florida history, survivors share their memories of the storm that claimed over 2,500 lives.',
    image: 'https://picsum.photos/seed/1928hurricane/600/400',
    significance: 'high',
    historicalContext:
    'The 1928 Okeechobee Hurricane remains one of the deadliest natural disasters in U.S. history, with its impact disproportionately affecting poor and Black communities around Lake Okeechobee.'
  }];

};
// Generate search results
const generateSearchResults = (searchParams) => {
  // In a real application, this would perform a search based on the provided parameters
  // For this demo, we'll return some generic results
  return [
  {
    id: 'search-1',
    title: 'Local Election Results: Johnson Wins Mayoral Race',
    date: new Date(2018, 10, 7),
    source: 'Clearwater Daily News',
    type: 'politics',
    excerpt:
    'After a closely contested election, Robert Johnson has been elected as the new mayor of Clearwater with 52% of the vote.',
    image: 'https://picsum.photos/seed/election2018/600/400',
    significance: 'medium',
    historicalContext:
    'The 2018 midterm elections saw increased voter turnout across the country compared to previous midterm elections.'
  },
  {
    id: 'search-2',
    title: 'New Community Center Opens in North Clearwater',
    date: new Date(2015, 3, 12),
    source: 'Clearwater Gazette',
    type: 'local',
    excerpt:
    'The $4.2 million facility includes a gymnasium, meeting rooms, and outdoor recreation areas to serve the growing north side community.',
    image: 'https://picsum.photos/seed/center2015/600/400',
    significance: 'low',
    historicalContext:
    'The mid-2010s saw increased investment in community infrastructure as cities recovered from the 2008 financial crisis.'
  },
  {
    id: 'search-3',
    title: 'Clearwater Beach Named Top Beach in America',
    date: new Date(2019, 2, 25),
    source: 'Clearwater Tourism Magazine',
    type: 'feature',
    excerpt:
    "For the second consecutive year, Clearwater Beach has been named the best beach in America by TripAdvisor's annual Travelers' Choice Awards.",
    image: 'https://picsum.photos/seed/beach2019/600/400',
    significance: 'medium',
    historicalContext:
    'Florida tourism reached record numbers in 2019, continuing a decade-long growth trend that would be disrupted by the COVID-19 pandemic in 2020.'
  }];

};
// Generate default results for a specific date
const generateDefaultResults = (selectedDate) => {
  // Format date for seed value
  const seed = `${selectedDate.getFullYear()}${selectedDate.getMonth()}${selectedDate.getDate()}`;
  return [
  {
    id: `default-1-${seed}`,
    title: getRandomHeadline(selectedDate),
    date: selectedDate,
    source: 'Clearwater Daily News',
    type: 'frontPage',
    excerpt: getRandomExcerpt(),
    image: `https://picsum.photos/seed/front${seed}/600/400`,
    significance: 'high',
    historicalContext: getRandomHistoricalContext(selectedDate)
  },
  {
    id: `default-2-${seed}`,
    title: getRandomLocalHeadline(selectedDate),
    date: selectedDate,
    source: 'Clearwater Herald',
    type: 'local',
    excerpt: getRandomLocalExcerpt(),
    image: `https://picsum.photos/seed/local${seed}/600/400`,
    significance: 'medium',
    historicalContext: null
  },
  {
    id: `default-3-${seed}`,
    title: getRandomSportsHeadline(selectedDate),
    date: selectedDate,
    source: 'Clearwater Sports Chronicle',
    type: 'sports',
    excerpt: getRandomSportsExcerpt(),
    image: `https://picsum.photos/seed/sports${seed}/600/400`,
    significance: 'low',
    historicalContext: null
  },
  {
    id: `default-4-${seed}`,
    title: getRandomBusinessHeadline(selectedDate),
    date: selectedDate,
    source: 'Clearwater Business Journal',
    type: 'business',
    excerpt: getRandomBusinessExcerpt(),
    image: `https://picsum.photos/seed/business${seed}/600/400`,
    significance: 'medium',
    historicalContext: null
  },
  {
    id: `default-5-${seed}`,
    title: getRandomEntertainmentHeadline(selectedDate),
    date: selectedDate,
    source: 'Clearwater Entertainment Weekly',
    type: 'entertainment',
    excerpt: getRandomEntertainmentExcerpt(),
    image: `https://picsum.photos/seed/entertainment${seed}/600/400`,
    significance: 'low',
    historicalContext: null
  }];

};
// Helper functions to generate random content
const getRandomHeadline = (date) => {
  const headlines = [
  `City Council Approves New Development Plan for ${date.getFullYear()}`,
  'Mayor Announces Infrastructure Initiative',
  'County Commission Votes on Tax Proposal',
  'State Officials Visit Clearwater to Discuss Funding',
  'Federal Grant Awarded for Local Transportation Project'];

  return headlines[Math.floor(Math.random() * headlines.length)];
};
const getRandomLocalHeadline = (date) => {
  const headlines = [
  'Local School Wins State Academic Competition',
  'Community Garden Project Expands to New Neighborhood',
  'Clearwater Beach Cleanup Draws Record Volunteers',
  'Historic Building Restoration Project Begins',
  'New Public Art Installation Unveiled Downtown'];

  return headlines[Math.floor(Math.random() * headlines.length)];
};
const getRandomSportsHeadline = (date) => {
  const headlines = [
  'High School Football Team Advances to State Championship',
  'Local Swimmer Breaks County Record',
  'Youth Soccer League Celebrates 25th Anniversary',
  'New Sports Complex Construction Ahead of Schedule',
  'Clearwater Athlete Signs Professional Contract'];

  return headlines[Math.floor(Math.random() * headlines.length)];
};
const getRandomBusinessHeadline = (date) => {
  const headlines = [
  'New Shopping Center Planned for North Clearwater',
  'Local Restaurant Celebrates 20 Years in Business',
  'Tech Company Opens Office, Bringing 100 Jobs',
  'Downtown Business Association Elects New President',
  'Chamber of Commerce Hosts Annual Economic Forecast'];

  return headlines[Math.floor(Math.random() * headlines.length)];
};
const getRandomEntertainmentHeadline = (date) => {
  const headlines = [
  'Summer Concert Series Lineup Announced',
  'Local Theater Premieres Original Production',
  'Art Festival Returns to Waterfront Park',
  'New Museum Exhibit Features Local History',
  'Film Festival Showcases Regional Talent'];

  return headlines[Math.floor(Math.random() * headlines.length)];
};
const getRandomExcerpt = () => {
  const excerpts = [
  'City officials gathered yesterday to discuss the implementation of the new plan, which includes significant changes to zoning regulations and development incentives.',
  'The initiative, which has been in planning for over a year, will address longstanding concerns about aging infrastructure throughout the city.',
  'After heated debate, the commission voted 4-3 to approve the proposal, which will take effect at the beginning of the next fiscal year.',
  'During their visit, state representatives toured several project sites and met with local officials to discuss ongoing and future needs.',
  'The $2.3 million grant will fund improvements to public transportation systems, including new bus shelters and expanded routes.'];

  return excerpts[Math.floor(Math.random() * excerpts.length)];
};
const getRandomLocalExcerpt = () => {
  const excerpts = [
  'Students and faculty celebrated their victory, which marks the third consecutive year the school has brought home the prestigious award.',
  'The expansion will add three new garden plots and a community education center, serving an additional 50 families in the area.',
  'More than 300 volunteers participated in the annual event, removing over two tons of debris from the shoreline.',
  'Preservationists and city officials held a ceremony to mark the beginning of the restoration project for the 110-year-old landmark.',
  "The sculpture, created by renowned artist Maria Rodriguez, represents the city's maritime heritage and connection to the Gulf."];

  return excerpts[Math.floor(Math.random() * excerpts.length)];
};
const getRandomSportsExcerpt = () => {
  const excerpts = [
  "The team's victory in the semifinal game sets up a championship matchup against their longtime rivals next Saturday.",
  'The record-breaking performance came during the county championships, where she also helped her team secure the overall title.',
  "Former players and coaches gathered for a special ceremony recognizing the league's contribution to youth sports in the community.",
  'Officials say the new facility will be ready for use by next spring, featuring state-of-the-art amenities for multiple sports.',
  'The signing represents a milestone for the local athletic program, which has now produced five professional athletes in the past decade.'];

  return excerpts[Math.floor(Math.random() * excerpts.length)];
};
const getRandomBusinessExcerpt = () => {
  const excerpts = [
  'Developers announced that the project will include a mix of retail, dining, and service businesses, with construction beginning this fall.',
  'The family-owned establishment held a celebration attended by longtime customers and city officials to mark the milestone.',
  "The company cited Clearwater's growing tech scene and quality of life as key factors in their decision to establish operations here.",
  'In her acceptance speech, the new president outlined her vision for strengthening the downtown business community over the next two years.',
  'Economists and business leaders gathered to discuss trends and projections for the regional economy in the coming year.'];

  return excerpts[Math.floor(Math.random() * excerpts.length)];
};
const getRandomEntertainmentExcerpt = () => {
  const excerpts = [
  'The series will feature a diverse range of musical acts, from local favorites to nationally recognized performers across multiple genres.',
  'Written by local playwright James Thompson, the production explores themes of community and change in a coastal Florida town.',
  'Now in its 15th year, the festival will feature over 100 artists displaying and selling their work throughout the three-day event.',
  "The exhibit includes photographs, artifacts, and interactive displays chronicling the city's development from small fishing village to modern community.",
  'Selected from hundreds of submissions, the featured films represent diverse perspectives on contemporary issues and artistic expression.'];

  return excerpts[Math.floor(Math.random() * excerpts.length)];
};
const getRandomHistoricalContext = (date) => {
  // Generate historical context based on the decade
  const decade = Math.floor(date.getFullYear() / 10) * 10;
  const contextByDecade = {
    1920: 'The 1920s saw rapid growth in Florida during the land boom, with significant development of coastal communities.',
    1930: "During the Great Depression, Florida's economy struggled, though not as severely as many northern states.",
    1940: 'World War II brought military installations to Florida, contributing to population growth and economic development.',
    1950: 'The post-war economic boom led to rapid suburban development and the growth of tourism in Florida.',
    1960: 'The Civil Rights Movement brought significant social change to Florida communities during this decade.',
    1970: "Environmental awareness grew in the 1970s, leading to increased protection for Florida's natural resources.",
    1980: 'The 1980s saw continued population growth as Florida became a destination for retirees and immigrants.',
    1990: "Technology began transforming Florida's economy in the 1990s, with growing emphasis on research and development.",
    2000: 'The early 2000s saw Florida at the center of national attention during the contested 2000 presidential election.',
    2010: "Recovery from the 2008 financial crisis shaped Florida's economy and development throughout the 2010s.",
    2020: 'The 2020s began with unprecedented challenges and changes due to the global COVID-19 pandemic.'
  };
  return (
    contextByDecade[decade] ||
    `Historical context for ${date.getFullYear()} is not available.`);

};