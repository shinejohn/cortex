import React, { useEffect, useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Newspaper,
  DollarSign,
  Shield,
  Bot,
  BarChart,
  Settings,
  Building,
  Search,
  ChevronDown,
  Bell,
  User,
  Check,
  Clock,
  X,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUp,
  ArrowDown } from
'lucide-react';
// Sample data for the content table
const sampleArticles = [
{
  id: 1,
  status: 'published',
  headline: 'Clearwater Beach Named Top Destination for Summer Travelers',
  community: 'Clearwater, FL',
  author: {
    type: 'ai',
    name: 'Jennifer'
  },
  qualityScore: 98,
  publishedAt: '2 hours ago',
  metrics: {
    views: 1247,
    engagement: 32
  },
  content: `Clearwater Beach has once again been recognized as one of the top beach destinations in the United States for summer travelers, according to a recent survey conducted by Travel & Leisure magazine.
The annual survey, which polled over 5,000 frequent travelers, ranked Clearwater Beach as the #3 beach destination nationwide, citing its pristine white sand, clear waters, and family-friendly atmosphere as key factors in its high rating.
"We're thrilled but not surprised," said Mayor Frank Hibbard. "Our community works hard to maintain the natural beauty of our beaches while providing top-notch amenities for visitors."
Local business owners are preparing for what they expect to be one of the busiest summer seasons in recent years. Hotel bookings are already up 23% compared to this time last year, and restaurants and shops along Beach Walk are staffing up to meet the anticipated demand.
The recognition comes as Clearwater continues to invest in beach infrastructure and environmental protection measures. Last month, the city council approved a $2.1 million project to enhance beach access points and improve waste management systems to keep the shoreline clean.
Tourism officials estimate that the positive ranking could bring an additional $15 million in revenue to the local economy this summer season.`,
  tags: ['tourism', 'local-business', 'beach'],
  readingTime: '3 min read'
},
{
  id: 2,
  status: 'pending',
  headline: 'New Community Center Construction Ahead of Schedule',
  community: 'St. Petersburg, FL',
  author: {
    type: 'ai',
    name: 'Robert'
  },
  qualityScore: 94,
  publishedAt: 'Pending',
  metrics: {
    views: 0,
    engagement: 0
  },
  content: `The construction of St. Petersburg's new community center is progressing ahead of schedule, according to city officials who provided an update at yesterday's town hall meeting.
The $4.2 million facility, located at the corner of 5th Avenue and Pine Street, is now expected to open in late September, nearly six weeks earlier than the original projection.
"We've had favorable weather conditions and our contractors have been extremely efficient," said Sarah Johnson, the city's Director of Public Works. "The community has been waiting for this facility for a long time, so we're excited to deliver it ahead of schedule."
The 15,000-square-foot center will feature a gymnasium, multipurpose rooms, a computer lab, and outdoor recreational spaces. It will replace the aging facility that was damaged beyond repair during a storm three years ago.
Community members at the town hall expressed enthusiasm about the accelerated timeline. Local resident James Wilson, who has lived in the neighborhood for over 20 years, said the new center would "breathe new life into this part of town."
Funding for the project comes from a combination of municipal bonds, a state grant, and community fundraising efforts that generated over $500,000.
City officials plan to announce details for a grand opening celebration in the coming weeks.`,
  tags: ['community', 'construction', 'local-government'],
  readingTime: '3 min read'
},
{
  id: 3,
  status: 'rejected',
  headline: 'Local Restaurant Faces Health Code Violations',
  community: 'Tampa, FL',
  author: {
    type: 'human',
    name: 'Michael Chen'
  },
  qualityScore: 72,
  publishedAt: 'Rejected',
  metrics: {
    views: 0,
    engagement: 0
  },
  content: `A popular Tampa restaurant has been temporarily closed following multiple health code violations discovered during a routine inspection last week.
The county health department cited "Seaside Grill" for several critical violations, including improper food storage temperatures, evidence of pest activity, and inadequate handwashing facilities.
Owner James Peterson expressed surprise at the findings, claiming that the restaurant has always maintained high standards of cleanliness. "We take these matters very seriously and are working diligently to address all concerns," Peterson said in a statement.
This is not the first time the establishment has faced regulatory issues. Records show the restaurant was previously cited for similar violations in 2021, though those were resolved without a closure.
Health officials stated that the restaurant will remain closed until all violations are corrected and a follow-up inspection is conducted. The closure has left dozens of employees temporarily out of work.
Local diners expressed mixed reactions to the news. "I've eaten there for years and never had an issue," said Tampa resident Maria Gonzalez. "But I'm glad they're taking steps to make sure everything is safe."
The restaurant has hired a professional cleaning service and is retraining all staff on proper food handling procedures.`,
  tags: ['local-business', 'health', 'regulations'],
  readingTime: '3 min read'
},
{
  id: 4,
  status: 'published',
  headline: 'School Board Approves New STEM Program for Elementary Schools',
  community: 'Dunedin, FL',
  author: {
    type: 'ai',
    name: 'Jennifer'
  },
  qualityScore: 97,
  publishedAt: '5 hours ago',
  metrics: {
    views: 865,
    engagement: 24
  },
  content: `The Dunedin School Board unanimously approved a new STEM education initiative for all elementary schools in the district during last night's meeting, marking a significant expansion of science and technology education for younger students.
The program, which will be implemented starting this fall, will provide specialized STEM curriculum materials, teacher training, and dedicated classroom equipment to foster early interest in science, technology, engineering, and mathematics.
"This is a forward-thinking investment in our children's future," said School Board President Elaine Martínez. "By introducing these concepts at an earlier age, we're building a foundation for success in an increasingly technology-driven world."
The $1.2 million initiative is funded through a combination of district resources and a substantial grant from the Pinellas Education Foundation. Local technology companies have also pledged to support the program through volunteer mentorship and equipment donations.
Teachers will begin training for the new curriculum over the summer. The program includes hands-on learning modules, coding basics, and age-appropriate engineering challenges designed to develop critical thinking skills.
Parents at the meeting expressed strong support for the initiative. "My daughter is already interested in science, and I'm thrilled she'll have more opportunities to explore that interest," said parent and PTA member Robert Jackson.
District officials expect the program to reach approximately 3,500 students across all six elementary schools in Dunedin.`,
  tags: ['education', 'technology', 'schools'],
  readingTime: '3 min read'
},
{
  id: 5,
  status: 'published',
  headline: "Local Farmer's Market Expands to Year-Round Operation",
  community: 'Palm Harbor, FL',
  author: {
    type: 'ai',
    name: 'Robert'
  },
  qualityScore: 95,
  publishedAt: '1 day ago',
  metrics: {
    views: 1432,
    engagement: 47
  },
  content: `The popular Palm Harbor Farmer's Market will transition from seasonal to year-round operation beginning next month, market organizers announced yesterday.
Previously operating only from October through May, the market will now be open every Saturday throughout the year, responding to growing demand from both vendors and customers.
"We've seen consistent growth in attendance over the past three years," said market manager Sophia Williams. "Both our vendors and community members have been asking for a year-round schedule, and we're excited to make it happen."
The market, located in downtown Palm Harbor, features over 60 vendors selling locally grown produce, artisanal foods, handcrafted goods, and prepared meals. The expansion will allow for rotating seasonal vendors and special events throughout the summer months.
To accommodate the Florida heat during summer, the market will adjust its hours to 8:00 AM to 12:00 PM from June through September, before returning to its regular 9:00 AM to 2:00 PM schedule in October.
Local farmer Carlos Rodriguez, who has been selling organic vegetables at the market for five years, welcomed the change. "This gives us small farmers another reliable outlet for our summer crops, which is really valuable," he said.
The market's expansion is expected to create additional part-time jobs and provide more consistent income for local food producers and artisans.`,
  tags: ['local-business', 'food', 'community-events'],
  readingTime: '3 min read'
},
{
  id: 6,
  status: 'pending',
  headline: 'City Council Debates New Affordable Housing Development',
  community: 'Largo, FL',
  author: {
    type: 'human',
    name: 'Sarah Johnson'
  },
  qualityScore: 88,
  publishedAt: 'Pending',
  metrics: {
    views: 0,
    engagement: 0
  },
  content: `A proposed affordable housing development sparked spirited debate at the Largo City Council meeting on Tuesday evening, with residents and council members voicing both support and concerns about the project.
The development, planned for a vacant 5-acre parcel on Clearwater-Largo Road, would include 120 units of mixed-income housing with rents capped at below-market rates for qualifying residents.
Supporters highlighted the critical need for affordable housing in the area, where average rents have increased by over 30% in the past three years. "Working families are being priced out of our community," said resident Maria Gonzalez, a nurse and single mother. "This project would help people like me stay in the city where we work."
However, some nearby residents expressed concerns about increased traffic, potential impacts on property values, and whether local infrastructure could support the additional population density.
Developer Horizon Housing Partners presented traffic studies and infrastructure assessments suggesting minimal negative impact on the surrounding area. They also highlighted the project's energy-efficient design and planned green spaces.
After three hours of discussion, the council voted to continue the hearing at next month's meeting, requesting additional information about traffic mitigation measures and school capacity.
Mayor Samuel Thompson emphasized that the council needs to balance immediate housing needs with long-term community planning. "We all recognize the affordable housing crisis, but we need to ensure any new development is sustainable and beneficial for the entire community," he said.`,
  tags: ['housing', 'local-government', 'development'],
  readingTime: '3 min read'
},
{
  id: 7,
  status: 'published',
  headline: 'Local Tech Startup Secures $2 Million in Funding',
  community: 'St. Petersburg, FL',
  author: {
    type: 'ai',
    name: 'Jennifer'
  },
  qualityScore: 96,
  publishedAt: '1 day ago',
  metrics: {
    views: 1876,
    engagement: 53
  },
  content: `St. Petersburg-based tech startup WaveAnalytics has secured $2 million in seed funding to expand its artificial intelligence platform for small business marketing, the company announced Wednesday.
The funding round was led by Tampa Bay Ventures with participation from several angel investors and the Florida Opportunity Fund. This represents one of the largest seed investments for a tech startup in Pinellas County this year.
Founded in 2021 by former Google engineer Sophia Martinez and marketing executive James Wilson, WaveAnalytics uses machine learning algorithms to help small businesses optimize their digital marketing strategies and customer engagement.
"This investment will allow us to scale our technology and bring our solution to more small businesses who typically don't have access to enterprise-level marketing analytics," said Martinez, the company's CEO. "We're proud to be building this company right here in St. Petersburg."
The startup currently employs 12 people at its downtown office and plans to double its workforce over the next 18 months, with a focus on hiring local engineering and data science talent.
St. Petersburg Mayor Ken Welch praised the announcement as evidence of the city's growing technology sector. "Companies like WaveAnalytics represent the future of our economy, and we're committed to fostering an environment where tech innovation can thrive," Welch said.
The company's platform is already being used by over 200 businesses across Florida and the Southeast, with plans to expand nationally by early next year.`,
  tags: ['technology', 'business', 'startup'],
  readingTime: '3 min read'
},
{
  id: 8,
  status: 'pending',
  headline: 'County Approves Expansion of Recycling Program',
  community: 'Clearwater, FL',
  author: {
    type: 'ai',
    name: 'Robert'
  },
  qualityScore: 91,
  publishedAt: 'Pending',
  metrics: {
    views: 0,
    engagement: 0
  },
  content: `The Pinellas County Commission unanimously approved an expansion of the county's recycling program yesterday, introducing new collection categories and educational initiatives aimed at reducing landfill waste.
The expanded program, which will roll out over the next six months, will now accept a wider range of plastics, provide special collection events for electronics and hazardous materials, and introduce a composting pilot program in select neighborhoods.
"This comprehensive approach addresses several gaps in our current recycling system," said Environmental Services Director Patricia Reynolds. "Our goal is to divert at least 30% more waste from landfills within the next two years."
The commission allocated $3.7 million for the program expansion, which includes the purchase of new collection vehicles, updated processing equipment, and an extensive public education campaign.
Residents will receive detailed information about the changes in the coming weeks, including new recycling guidelines and collection schedules. The county will also launch a smartphone app to help residents determine which items can be recycled.
Environmental advocates at the meeting praised the decision. "This is a significant step forward for sustainability in our county," said James Wilson, director of the local environmental group Green Pinellas. "Proper recycling and waste reduction are critical climate actions that everyone can participate in."
The program expansion is expected to create approximately 25 new jobs and save the county an estimated $1.2 million annually in landfill operation costs once fully implemented.`,
  tags: ['environment', 'local-government', 'sustainability'],
  readingTime: '3 min read'
},
{
  id: 9,
  status: 'published',
  headline: 'Historic Downtown Building to Become Boutique Hotel',
  community: 'Safety Harbor, FL',
  author: {
    type: 'human',
    name: 'David Williams'
  },
  qualityScore: 93,
  publishedAt: '2 days ago',
  metrics: {
    views: 2134,
    engagement: 67
  },
  content: `The historic Baranoff Building in downtown Safety Harbor will be transformed into a boutique hotel after the city council approved development plans at Monday night's meeting.
The three-story Mediterranean Revival building, constructed in 1924 and listed on the National Register of Historic Places, has been vacant for nearly five years. The approved renovation will create a 15-room luxury hotel while preserving the structure's historic façade and key architectural elements.
"This project strikes the perfect balance between historic preservation and economic revitalization," said Mayor Joe Ayoub. "It will bring new life to a beloved landmark while respecting its historical significance."
Developer Coastal Heritage Properties specializes in adaptive reuse of historic buildings. Company president Elena Rodriguez presented detailed plans showing how original features including the ornate lobby ceiling, staircase, and exterior detailing will be restored.
The $4.8 million project will include a ground-floor restaurant and rooftop lounge open to the public. Construction is expected to begin in September with a targeted opening in late 2024.
Local historians worked closely with the developers to ensure historical accuracy in the renovation. "The Baranoff has been part of Safety Harbor's identity for nearly a century," said Historical Society president Margaret Wilson. "We're pleased to see it being preserved for future generations."
The hotel is expected to create approximately 30 permanent jobs and generate significant tax revenue for the city.`,
  tags: ['development', 'history', 'tourism'],
  readingTime: '3 min read'
},
{
  id: 10,
  status: 'rejected',
  headline: 'Investigation Reveals Improper Use of City Funds',
  community: 'Oldsmar, FL',
  author: {
    type: 'human',
    name: 'Robert Chen'
  },
  qualityScore: 68,
  publishedAt: 'Rejected',
  metrics: {
    views: 0,
    engagement: 0
  },
  content: `An internal investigation has uncovered improper use of city funds by several department heads in Oldsmar, according to documents obtained through a public records request.
The three-month investigation, conducted by an independent auditor, found approximately $47,000 in questionable expenses across multiple city departments between 2021 and 2023. The issues include unauthorized travel expenses, improper vendor contracts, and misclassified purchases.
The report specifically highlights concerns with the Parks and Recreation Department, where the director allegedly approved over $15,000 in contracts to a landscaping company owned by a family member without disclosing the relationship.
City Manager Sarah Johnson declined to comment on specific personnel matters but confirmed that "appropriate administrative actions" are being taken. Sources familiar with the situation indicate that at least one department head has been placed on administrative leave.
City Council member James Wilson expressed concern about the findings during Tuesday's council meeting. "We have a responsibility to ensure taxpayer funds are used appropriately," Wilson said. "This report raises serious questions about our oversight procedures."
The city has implemented immediate changes to its purchasing policies, including additional approval requirements for expenses over $1,000 and mandatory ethics training for all department heads.
The Pinellas County State Attorney's Office has been provided with the audit findings but has not yet determined whether a criminal investigation is warranted.`,
  tags: ['local-government', 'investigation', 'politics'],
  readingTime: '3 min read'
}];

export const ContentManagement = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(sampleArticles);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [sortColumn, setSortColumn] = useState('publishedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Navigate to different admin pages
  const navigateTo = (path) => {
    navigate(path);
  };
  // Filter articles based on active filter and search query
  const filteredArticles = articles.filter((article) => {
    // Filter by status
    if (activeFilter === 'pending' && article.status !== 'pending') return false;
    if (activeFilter === 'published' && article.status !== 'published')
    return false;
    if (activeFilter === 'rejected' && article.status !== 'rejected')
    return false;
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.headline.toLowerCase().includes(query) ||
        article.community.toLowerCase().includes(query) ||
        article.author.name.toLowerCase().includes(query));

    }
    return true;
  });
  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    let aValue, bValue;
    // Determine values to compare based on sort column
    switch (sortColumn) {
      case 'headline':
        aValue = a.headline;
        bValue = b.headline;
        break;
      case 'community':
        aValue = a.community;
        bValue = b.community;
        break;
      case 'author':
        aValue = a.author.name;
        bValue = b.author.name;
        break;
      case 'qualityScore':
        aValue = a.qualityScore;
        bValue = b.qualityScore;
        break;
      case 'publishedAt':
        // Special handling for publishedAt since it can be "Pending" or "Rejected"
        aValue =
        a.status === 'published' ? Date.now() - Math.random() * 1000000 : 0;
        bValue =
        b.status === 'published' ? Date.now() - Math.random() * 1000000 : 0;
        break;
      case 'metrics':
        aValue = a.metrics.views;
        bValue = b.metrics.views;
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }
    // Compare values based on sort direction
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  // Paginate articles
  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  // Handle sort change
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle sort direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to descending
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  // Handle article selection
  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
  };
  // Handle article approval
  const handleApproveArticle = (id) => {
    setArticles(
      articles.map((article) =>
      article.id === id ?
      {
        ...article,
        status: 'published',
        publishedAt: 'Just now'
      } :
      article
      )
    );
    setSelectedArticle(null);
  };
  // Handle article rejection
  const handleRejectArticle = (id) => {
    setArticles(
      articles.map((article) =>
      article.id === id ?
      {
        ...article,
        status: 'rejected',
        publishedAt: 'Rejected'
      } :
      article
      )
    );
    setSelectedArticle(null);
  };
  // Handle article deletion
  const handleDeleteArticle = (id) => {
    setArticles(articles.filter((article) => article.id !== id));
    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(null);
    }
  };
  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <Check className="w-5 h-5 text-[#00FF88]" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-[#FFB000]" />;
      case 'rejected':
        return <X className="w-5 h-5 text-[#FF3366]" />;
      default:
        return null;
    }
  };
  // Get quality score color based on score
  const getQualityScoreColor = (score) => {
    if (score >= 90) return '#00FF88';
    if (score >= 80) return '#00E5FF';
    if (score >= 70) return '#FFB000';
    return '#FF3366';
  };
  // Update statistics
  const stats = {
    todayArticles: articles.length,
    pendingReview: articles.filter((a) => a.status === 'pending').length,
    qualityScore:
    articles.reduce((acc, curr) => acc + curr.qualityScore, 0) /
    articles.length,
    aiGenerated:
    articles.filter((a) => a.author.type === 'ai').length /
    articles.length *
    100
  };
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white relative">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
          'linear-gradient(to right, #1A1A1F 1px, transparent 1px), linear-gradient(to bottom, #1A1A1F 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#0F0F11] z-50 border-b border-[#00E5FF33] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
        <div className="flex items-center justify-between h-full px-6">
          <div
            className="font-['Space_Grotesk'] text-lg font-bold tracking-wider text-white uppercase cursor-pointer"
            style={{
              textShadow: '0 0 10px rgba(0,229,255,0.5)'
            }}
            onClick={() => navigateTo('/admin-dashboard')}>

            Day.News Command Center
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <div className="w-2 h-2 bg-[#00FF88] rounded-full mr-2 animate-pulse"></div>
              <span className="text-[#00FF88] font-['JetBrains_Mono'] text-sm">
                NETWORK STATUS: OPERATIONAL
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-4 text-[#A0A0A8] hover:text-white cursor-pointer" />
            <div className="flex items-center cursor-pointer">
              <div className="w-8 h-8 bg-[#1A1A1F] rounded-full flex items-center justify-center mr-2">
                <User className="w-5 h-5" />
              </div>
              <span className="mr-2">Admin User</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Settings className="w-5 h-5 ml-4 text-[#A0A0A8] hover:text-white cursor-pointer" />
          </div>
        </div>
      </header>
      {/* Sidebar navigation */}
      <aside className="fixed top-[60px] left-0 bottom-0 w-[80px] bg-[#0F0F11] z-40 flex flex-col items-center pt-6">
        <div className="flex flex-col items-center space-y-10">
          <NavItem
            icon={<Grid />}
            label="Dashboard"
            onClick={() => navigateTo('/admin-dashboard')} />

          <NavItem
            icon={<Newspaper />}
            label="Content"
            active
            onClick={() => navigateTo('/content-management')} />

          <NavItem
            icon={<DollarSign />}
            label="Revenue"
            onClick={() => navigateTo('/revenue-analytics')} />

          <NavItem
            icon={<Shield />}
            label="Moderation"
            onClick={() => navigateTo('/moderation-queue')} />

          <NavItem
            icon={<Bot />}
            label="AI Agents"
            onClick={() => navigateTo('/ai-agent-control')} />

          <NavItem
            icon={<BarChart />}
            label="Analytics"
            onClick={() => navigateTo('/admin-dashboard')} />

        </div>
        <div className="mt-auto mb-6">
          <NavItem
            icon={<Settings />}
            label="Settings"
            onClick={() => navigateTo('/admin-dashboard')} />

        </div>
      </aside>
      {/* Main content area */}
      <main className="pt-[60px] pl-[80px]">
        <div className="p-6">
          {/* Content header section */}
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-wider text-white">
                CONTENT OPERATIONS
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A8] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="bg-[#131316] border border-[#00E5FF33] rounded-md py-2 pl-10 pr-4 w-[300px] text-white placeholder-[#606068] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />

              </div>
            </div>
            {/* Filter buttons */}
            <div className="flex space-x-4 mb-6">
              <FilterButton
                label="All Content"
                active={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')} />

              <FilterButton
                label="Pending Review"
                active={activeFilter === 'pending'}
                onClick={() => setActiveFilter('pending')}
                count={articles.filter((a) => a.status === 'pending').length} />

              <FilterButton
                label="Published"
                active={activeFilter === 'published'}
                onClick={() => setActiveFilter('published')} />

              <FilterButton
                label="Rejected"
                active={activeFilter === 'rejected'}
                onClick={() => setActiveFilter('rejected')} />

            </div>
            {/* Stats bar */}
            <div className="bg-[#131316] border border-[#00E5FF33] rounded-md py-3 px-6 flex items-center mb-6">
              <div className="flex items-center divide-x divide-[#00E5FF33]">
                <div className="pr-6 font-['JetBrains_Mono'] text-sm">
                  Today's Articles:{' '}
                  <span className="text-white font-bold">
                    {stats.todayArticles.toLocaleString()}
                  </span>
                </div>
                <div className="px-6 font-['JetBrains_Mono'] text-sm">
                  Pending Review:{' '}
                  <span className="text-[#FFB000] font-bold">
                    {stats.pendingReview}
                  </span>
                </div>
                <div className="px-6 font-['JetBrains_Mono'] text-sm">
                  Quality Score:{' '}
                  <span className="text-[#00FF88] font-bold">
                    {stats.qualityScore.toFixed(1)}%
                  </span>
                </div>
                <div className="pl-6 font-['JetBrains_Mono'] text-sm">
                  AI Generated:{' '}
                  <span className="text-[#00E5FF] font-bold">
                    {stats.aiGenerated.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            {/* Content table */}
            <div className="bg-[#131316] border border-[#00E5FF33] rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#00E5FF33]">
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      STATUS
                    </th>
                    <th
                      className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] cursor-pointer"
                      onClick={() => handleSort('headline')}>

                      <div className="flex items-center">
                        HEADLINE
                        {sortColumn === 'headline' && (
                        sortDirection === 'asc' ?
                        <ArrowUp className="ml-1 w-3 h-3" /> :

                        <ArrowDown className="ml-1 w-3 h-3" />)
                        }
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] cursor-pointer"
                      onClick={() => handleSort('community')}>

                      <div className="flex items-center">
                        COMMUNITY
                        {sortColumn === 'community' && (
                        sortDirection === 'asc' ?
                        <ArrowUp className="ml-1 w-3 h-3" /> :

                        <ArrowDown className="ml-1 w-3 h-3" />)
                        }
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] cursor-pointer"
                      onClick={() => handleSort('author')}>

                      <div className="flex items-center">
                        AUTHOR
                        {sortColumn === 'author' && (
                        sortDirection === 'asc' ?
                        <ArrowUp className="ml-1 w-3 h-3" /> :

                        <ArrowDown className="ml-1 w-3 h-3" />)
                        }
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] cursor-pointer"
                      onClick={() => handleSort('qualityScore')}>

                      <div className="flex items-center">
                        QUALITY
                        {sortColumn === 'qualityScore' && (
                        sortDirection === 'asc' ?
                        <ArrowUp className="ml-1 w-3 h-3" /> :

                        <ArrowDown className="ml-1 w-3 h-3" />)
                        }
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] cursor-pointer"
                      onClick={() => handleSort('publishedAt')}>

                      <div className="flex items-center">
                        PUBLISHED
                        {sortColumn === 'publishedAt' && (
                        sortDirection === 'asc' ?
                        <ArrowUp className="ml-1 w-3 h-3" /> :

                        <ArrowDown className="ml-1 w-3 h-3" />)
                        }
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] cursor-pointer"
                      onClick={() => handleSort('metrics')}>

                      <div className="flex items-center">
                        METRICS
                        {sortColumn === 'metrics' && (
                        sortDirection === 'asc' ?
                        <ArrowUp className="ml-1 w-3 h-3" /> :

                        <ArrowDown className="ml-1 w-3 h-3" />)
                        }
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00E5FF22]">
                  {paginatedArticles.map((article) =>
                  <tr
                    key={article.id}
                    className="hover:bg-[#00E5FF11] cursor-pointer transition-colors duration-150"
                    onClick={() => handleArticleSelect(article)}>

                      <td className="py-4 px-6">
                        {getStatusIcon(article.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-[300px] truncate font-medium text-white">
                          {article.headline}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#A0A0A8]">
                        {article.community}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {article.author.type === 'ai' ?
                        <span className="text-[#00E5FF]">
                              AI - {article.author.name}
                            </span> :

                        <span>{article.author.name}</span>
                        }
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div
                        className="font-['JetBrains_Mono'] font-bold"
                        style={{
                          color: getQualityScoreColor(article.qualityScore)
                        }}>

                          {article.qualityScore}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#A0A0A8]">
                        {article.publishedAt}
                      </td>
                      <td className="py-4 px-6">
                        {article.status === 'published' ?
                      <div className="font-['JetBrains_Mono'] text-sm">
                            <span className="text-[#00E5FF]">
                              {article.metrics.views}
                            </span>
                            <span className="text-[#606068] mx-1">/</span>
                            <span className="text-[#00FF88]">
                              {article.metrics.engagement}
                            </span>
                          </div> :

                      <span className="text-[#606068]">—</span>
                      }
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-3">
                          <button
                          className="text-[#A0A0A8] hover:text-[#00E5FF] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArticleSelect(article);
                          }}>

                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                          className="text-[#A0A0A8] hover:text-[#00E5FF] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open edit view
                            handleArticleSelect(article);
                          }}>

                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                          className="text-[#A0A0A8] hover:text-[#FF3366] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArticle(article.id);
                          }}>

                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="py-4 px-6 flex items-center justify-between border-t border-[#00E5FF33]">
                <div className="text-sm text-[#A0A0A8]">
                  Showing{' '}
                  <span className="font-medium text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium text-white">
                    {Math.min(
                      currentPage * itemsPerPage,
                      sortedArticles.length
                    )}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-white">
                    {sortedArticles.length}
                  </span>{' '}
                  articles
                </div>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-[#606068] cursor-not-allowed' : 'text-white hover:bg-[#00E5FF22]'}`}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}>

                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({
                    length: Math.min(5, totalPages)
                  }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-[#00E5FF] text-black font-medium' : 'text-white hover:bg-[#00E5FF22]'}`}
                        onClick={() => setCurrentPage(pageNum)}>

                        {pageNum}
                      </button>);

                  })}
                  <button
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-[#606068] cursor-not-allowed' : 'text-white hover:bg-[#00E5FF22]'}`}
                    onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}>

                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Article preview panel */}
      <div
        className={`fixed top-[60px] right-0 bottom-0 w-2/5 bg-[#131316] border-l border-[#00E5FF33] shadow-[-10px_0_20px_rgba(0,0,0,0.3)] z-30 transform transition-transform duration-300 ${selectedArticle ? 'translate-x-0' : 'translate-x-full'}`}>

        {selectedArticle &&
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-[#00E5FF33] flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <div className="mr-2">
                    {getStatusIcon(selectedArticle.status)}
                  </div>
                  <div className="text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                    {selectedArticle.status.toUpperCase()}
                  </div>
                </div>
                <h2 className="text-xl font-bold">
                  {selectedArticle.headline}
                </h2>
              </div>
              <button
              className="text-[#A0A0A8] hover:text-white"
              onClick={() => setSelectedArticle(null)}>

                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-auto p-6">
              <div className="prose prose-invert max-w-none">
                {selectedArticle.content.split('\n\n').map((paragraph, idx) =>
              <p key={idx} className="mb-4 text-[#E0E0E6]">
                    {paragraph}
                  </p>
              )}
              </div>
              <div className="mt-8 bg-[#1A1A1F] rounded-md p-4">
                <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                  METADATA
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[#A0A0A8]">Community</div>
                    <div className="font-medium">
                      {selectedArticle.community}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Author</div>
                    <div className="font-medium">
                      {selectedArticle.author.type === 'ai' ?
                    <span className="text-[#00E5FF]">
                          AI - {selectedArticle.author.name}
                        </span> :

                    <span>{selectedArticle.author.name}</span>
                    }
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Quality Score</div>
                    <div
                    className="font-['JetBrains_Mono'] font-bold"
                    style={{
                      color: getQualityScoreColor(
                        selectedArticle.qualityScore
                      )
                    }}>

                      {selectedArticle.qualityScore}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Reading Time</div>
                    <div className="font-medium">
                      {selectedArticle.readingTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Status</div>
                    <div className="font-medium capitalize">
                      {selectedArticle.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Published</div>
                    <div className="font-medium">
                      {selectedArticle.publishedAt}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[#A0A0A8] mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, idx) =>
                  <span
                    key={idx}
                    className="px-2 py-1 bg-[#00E5FF22] text-[#00E5FF] rounded text-xs">

                        {tag}
                      </span>
                  )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#00E5FF33] flex justify-end space-x-4">
              {selectedArticle.status === 'pending' &&
            <>
                  <button
                className="px-4 py-2 bg-[#FF3366] text-white rounded-md hover:bg-[#FF3366DD] transition-colors"
                onClick={() => handleRejectArticle(selectedArticle.id)}>

                    Reject
                  </button>
                  <button
                className="px-4 py-2 bg-[#00E5FF] text-black font-medium rounded-md hover:bg-[#00E5FFDD] transition-colors"
                onClick={() => handleApproveArticle(selectedArticle.id)}>

                    Approve
                  </button>
                </>
            }
              <button
              className="px-4 py-2 border border-[#00E5FF] text-[#00E5FF] rounded-md hover:bg-[#00E5FF22] transition-colors"
              onClick={() => {
                // This would open an edit form in a real app
                // For now, just close the panel
                setSelectedArticle(null);
              }}>

                Edit
              </button>
            </div>
          </div>
        }
      </div>
    </div>);

};
// Component for sidebar navigation items
const NavItem = ({ icon, label, active = false, onClick }) => {
  return (
    <div
      className={`relative flex flex-col items-center group ${active ? 'text-[#00E5FF]' : 'text-[#606068]'} cursor-pointer`}
      onClick={onClick}>

      {active &&
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00E5FF] rounded-r-md shadow-[0_0_10px_rgba(0,229,255,0.5)]"></div>
      }
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-md ${active ? 'text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'text-[#606068] hover:text-white'} transition-all duration-200 hover:shadow-[0_0_10px_rgba(0,229,255,0.2)]`}>

        {icon}
      </div>
      <span className="text-[10px] mt-1">{label}</span>
    </div>);

};
// Component for filter buttons
const FilterButton = ({ label, active = false, onClick, count }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${active ? 'bg-[#00E5FF22] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 'text-[#A0A0A8] hover:bg-[#1A1A1F] hover:text-white'}`}
      onClick={onClick}>

      {label}
      {count !== undefined &&
      <span
        className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-[#00E5FF] text-black' : 'bg-[#1A1A1F] text-[#A0A0A8]'}`}>

          {count}
        </span>
      }
    </button>);

};
export default ContentManagement;