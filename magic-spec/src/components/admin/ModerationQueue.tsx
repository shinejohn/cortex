import React, { useState, Component } from 'react';
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
  ChevronDown,
  Bell,
  User,
  Search,
  CheckCircle,
  XCircle,
  Flag,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Eye,
  MessageSquare,
  Image,
  FileText,
  Tag,
  MoreHorizontal,
  Slash } from
'lucide-react';
// Sample data for moderation queue
const moderationItems = [
{
  id: 1,
  type: 'comment',
  content:
  "This article is completely biased and the author clearly doesn't know what they're talking about. Such garbage journalism!",
  reportReason: 'Harassment',
  reportedBy: 'user123',
  timestamp: '10 minutes ago',
  community: 'Clearwater, FL',
  flags: 3,
  status: 'pending',
  confidenceScore: 82,
  context: {
    articleTitle: 'City Council Approves New Development Project',
    articleId: 'art-12345',
    threadId: 'thread-6789'
  }
},
{
  id: 2,
  type: 'comment',
  content:
  "I've reported this user multiple times for spreading misinformation. They should be banned from the platform.",
  reportReason: 'Personal Attack',
  reportedBy: 'user456',
  timestamp: '25 minutes ago',
  community: 'Tampa, FL',
  flags: 2,
  status: 'pending',
  confidenceScore: 76,
  context: {
    articleTitle: 'Local Business Owner Wins Award',
    articleId: 'art-23456',
    threadId: 'thread-7890'
  }
},
{
  id: 3,
  type: 'classified',
  content:
  'Selling medication without prescription - 50% off retail prices! Contact me directly for details.',
  reportReason: 'Illegal Activity',
  reportedBy: 'user789',
  timestamp: '45 minutes ago',
  community: 'St. Petersburg, FL',
  flags: 5,
  status: 'pending',
  confidenceScore: 95,
  context: {
    listingId: 'listing-34567',
    category: 'Health & Beauty'
  }
},
{
  id: 4,
  type: 'image',
  content: 'https://example.com/inappropriate-image.jpg',
  reportReason: 'Inappropriate Content',
  reportedBy: 'user234',
  timestamp: '1 hour ago',
  community: 'Dunedin, FL',
  flags: 4,
  status: 'pending',
  confidenceScore: 88,
  context: {
    articleTitle: 'Weekend Festival Draws Record Attendance',
    articleId: 'art-34567',
    imageCaption: 'Festival attendees enjoying the event'
  }
},
{
  id: 5,
  type: 'article',
  content:
  'This article contains multiple factual errors and appears to be deliberately misleading readers about the environmental impact of the proposed development.',
  reportReason: 'Misinformation',
  reportedBy: 'user567',
  timestamp: '2 hours ago',
  community: 'Largo, FL',
  flags: 3,
  status: 'pending',
  confidenceScore: 72,
  context: {
    articleTitle: 'Environmental Impact of New Highway Project',
    articleId: 'art-45678',
    authorId: 'author-12345'
  }
},
{
  id: 6,
  type: 'comment',
  content:
  "You liberals are all the same, always complaining about everything. Why don't you just leave the country if you hate it so much?",
  reportReason: 'Political Flame War',
  reportedBy: 'user890',
  timestamp: '3 hours ago',
  community: 'Palm Harbor, FL',
  flags: 2,
  status: 'pending',
  confidenceScore: 68,
  context: {
    articleTitle: 'Local Election Results Announced',
    articleId: 'art-56789',
    threadId: 'thread-8901'
  }
},
{
  id: 7,
  type: 'announcement',
  content:
  'URGENT: All residents must evacuate immediately due to toxic chemical spill. This is not a drill.',
  reportReason: 'False Information',
  reportedBy: 'user345',
  timestamp: '4 hours ago',
  community: 'Safety Harbor, FL',
  flags: 8,
  status: 'pending',
  confidenceScore: 92,
  context: {
    announcementId: 'ann-67890',
    category: 'Emergency'
  }
},
{
  id: 8,
  type: 'comment',
  content:
  'This comment contains a link to malware that will steal your personal information.',
  reportReason: 'Spam/Scam',
  reportedBy: 'user678',
  timestamp: '5 hours ago',
  community: 'Oldsmar, FL',
  flags: 6,
  status: 'pending',
  confidenceScore: 91,
  context: {
    articleTitle: 'How to Protect Your Online Privacy',
    articleId: 'art-67890',
    threadId: 'thread-9012'
  }
},
{
  id: 9,
  type: 'classified',
  content:
  "Looking to hire someone to help me hack into my ex's social media accounts. Will pay well.",
  reportReason: 'Illegal Activity',
  reportedBy: 'user901',
  timestamp: '6 hours ago',
  community: 'Tarpon Springs, FL',
  flags: 4,
  status: 'pending',
  confidenceScore: 89,
  context: {
    listingId: 'listing-78901',
    category: 'Services'
  }
},
{
  id: 10,
  type: 'comment',
  content:
  "I can't believe they published this garbage. The author should be fired immediately.",
  reportReason: 'Harassment',
  reportedBy: 'user012',
  timestamp: '7 hours ago',
  community: 'Holiday, FL',
  flags: 1,
  status: 'pending',
  confidenceScore: 62,
  context: {
    articleTitle: 'Opinion: The Case for Higher Property Taxes',
    articleId: 'art-78901',
    threadId: 'thread-0123'
  }
}];

// Moderation stats
const moderationStats = {
  pending: 42,
  approved: 128,
  rejected: 37,
  escalated: 8,
  aiAccuracy: 94.2,
  avgResolutionTime: '18 min'
};
export const ModerationQueue = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(moderationItems);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Navigate to different admin pages
  const navigateTo = (path) => {
    navigate(path);
  };
  // Filter items based on active filter and search query
  const filteredItems = items.filter((item) => {
    // Filter by type
    if (activeFilter !== 'all' && item.type !== activeFilter) return false;
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(query) ||
        item.reportReason.toLowerCase().includes(query) ||
        item.community.toLowerCase().includes(query));

    }
    return true;
  });
  // Paginate items
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  // Handle item selection
  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };
  // Handle item approval
  const handleApproveItem = (id) => {
    setItems(
      items.map((item) =>
      item.id === id ?
      {
        ...item,
        status: 'approved'
      } :
      item
      )
    );
    setSelectedItem(null);
  };
  // Handle item rejection
  const handleRejectItem = (id) => {
    setItems(
      items.map((item) =>
      item.id === id ?
      {
        ...item,
        status: 'rejected'
      } :
      item
      )
    );
    setSelectedItem(null);
  };
  // Get type icon
  const getTypeIcon = (type, className = 'w-5 h-5') => {
    switch (type) {
      case 'comment':
        return <MessageSquare className={className} />;
      case 'image':
        return <Image className={className} />;
      case 'article':
        return <FileText className={className} />;
      case 'classified':
        return <Tag className={className} />;
      case 'announcement':
        return <AlertTriangle className={className} />;
      default:
        return <MessageSquare className={className} />;
    }
  };
  // Get confidence score color
  const getConfidenceColor = (score) => {
    if (score >= 90) return '#00FF88';
    if (score >= 75) return '#00E5FF';
    if (score >= 60) return '#FFB000';
    return '#FF3366';
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
            onClick={() => navigateTo('/content-management')} />

          <NavItem
            icon={<DollarSign />}
            label="Revenue"
            onClick={() => navigateTo('/revenue-analytics')} />

          <NavItem
            icon={<Shield />}
            label="Moderation"
            active
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
          {/* Page header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-wider text-white">
              MODERATION QUEUE
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A8] w-5 h-5" />
              <input
                type="text"
                placeholder="Search content..."
                className="bg-[#131316] border border-[#00E5FF33] rounded-md py-2 pl-10 pr-4 w-[300px] text-white placeholder-[#606068] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />

            </div>
          </div>
          {/* Stats bar */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <StatCard
              label="Pending Review"
              value={moderationStats.pending}
              icon={<Clock className="w-5 h-5 text-[#FFB000]" />}
              color="#FFB000" />

            <StatCard
              label="Approved"
              value={moderationStats.approved}
              icon={<Check className="w-5 h-5 text-[#00FF88]" />}
              color="#00FF88" />

            <StatCard
              label="Rejected"
              value={moderationStats.rejected}
              icon={<X className="w-5 h-5 text-[#FF3366]" />}
              color="#FF3366" />

            <StatCard
              label="Escalated"
              value={moderationStats.escalated}
              icon={<AlertTriangle className="w-5 h-5 text-[#FFB000]" />}
              color="#FFB000" />

            <StatCard
              label="AI Accuracy"
              value={`${moderationStats.aiAccuracy}%`}
              icon={<Bot className="w-5 h-5 text-[#00E5FF]" />}
              color="#00E5FF" />

            <StatCard
              label="Avg. Resolution Time"
              value={moderationStats.avgResolutionTime}
              icon={<Clock className="w-5 h-5 text-[#00E5FF]" />}
              color="#00E5FF" />

          </div>
          {/* Filter tabs */}
          <div className="flex space-x-4 mb-6">
            <FilterButton
              label="All Content"
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')} />

            <FilterButton
              label="Comments"
              active={activeFilter === 'comment'}
              onClick={() => setActiveFilter('comment')}
              icon={<MessageSquare className="w-4 h-4 mr-1" />} />

            <FilterButton
              label="Images"
              active={activeFilter === 'image'}
              onClick={() => setActiveFilter('image')}
              icon={<Image className="w-4 h-4 mr-1" />} />

            <FilterButton
              label="Articles"
              active={activeFilter === 'article'}
              onClick={() => setActiveFilter('article')}
              icon={<FileText className="w-4 h-4 mr-1" />} />

            <FilterButton
              label="Classifieds"
              active={activeFilter === 'classified'}
              onClick={() => setActiveFilter('classified')}
              icon={<Tag className="w-4 h-4 mr-1" />} />

            <FilterButton
              label="Announcements"
              active={activeFilter === 'announcement'}
              onClick={() => setActiveFilter('announcement')}
              icon={<AlertTriangle className="w-4 h-4 mr-1" />} />

          </div>
          {/* Moderation queue */}
          <div className="bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter mb-6">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#00E5FF33]">
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      TYPE
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      CONTENT
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      REASON
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      COMMUNITY
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      FLAGS
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      REPORTED
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      CONFIDENCE
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00E5FF22]">
                  {paginatedItems.map((item) =>
                  <tr
                    key={item.id}
                    className="hover:bg-[#00E5FF11] cursor-pointer transition-colors"
                    onClick={() => handleItemSelect(item)}>

                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="bg-[#1A1A1F] p-2 rounded-md mr-2">
                            {getTypeIcon(item.type)}
                          </div>
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-[200px] truncate">
                          {item.content}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Flag className="w-4 h-4 mr-2 text-[#FF3366]" />
                          <span>{item.reportReason}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">{item.community}</td>
                      <td className="py-4 px-6">
                        <div className="bg-[#FF336622] text-[#FF3366] px-2 py-1 rounded-full text-xs font-medium w-fit">
                          {item.flags}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#A0A0A8]">
                        {item.timestamp}
                      </td>
                      <td className="py-4 px-6">
                        <div
                        className="font-['JetBrains_Mono'] font-bold"
                        style={{
                          color: getConfidenceColor(item.confidenceScore)
                        }}>

                          {item.confidenceScore}%
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                          className="p-1 rounded-md hover:bg-[#00FF8822] text-[#00FF88]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveItem(item.id);
                          }}>

                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                          className="p-1 rounded-md hover:bg-[#FF336622] text-[#FF3366]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectItem(item.id);
                          }}>

                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                          className="p-1 rounded-md hover:bg-[#00E5FF22] text-[#00E5FF]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemSelect(item);
                          }}>

                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="py-4 px-6 flex items-center justify-between border-t border-[#00E5FF33]">
              <div className="text-sm text-[#A0A0A8]">
                Showing{' '}
                <span className="font-medium text-white">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-white">
                  {Math.min(currentPage * itemsPerPage, filteredItems.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-white">
                  {filteredItems.length}
                </span>{' '}
                items
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
          {/* Auto-moderation settings */}
          <div className="bg-[#131316] rounded-lg p-6 border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter">
            <h2 className="font-['Space_Grotesk'] text-lg font-bold tracking-wider mb-6">
              AUTO-MODERATION SETTINGS
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium mb-1">Toxicity Filter</h3>
                    <p className="text-sm text-[#A0A0A8]">
                      Automatically flag content with toxic language
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-[#00FF8844]">
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[#00FF88]"></div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sensitivity</span>
                    <span>Medium</span>
                  </div>
                  <div className="w-full h-2 bg-[#FFFFFF22] rounded-full">
                    <div className="h-full w-1/2 bg-[#00FF88] rounded-full"></div>
                  </div>
                </div>
                <button className="text-xs text-[#00E5FF] hover:underline">
                  Configure
                </button>
              </div>
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium mb-1">Spam Detection</h3>
                    <p className="text-sm text-[#A0A0A8]">
                      Filter out spam and promotional content
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-[#00FF8844]">
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[#00FF88]"></div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sensitivity</span>
                    <span>High</span>
                  </div>
                  <div className="w-full h-2 bg-[#FFFFFF22] rounded-full">
                    <div className="h-full w-3/4 bg-[#00FF88] rounded-full"></div>
                  </div>
                </div>
                <button className="text-xs text-[#00E5FF] hover:underline">
                  Configure
                </button>
              </div>
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium mb-1">NSFW Content</h3>
                    <p className="text-sm text-[#A0A0A8]">
                      Detect and flag inappropriate images
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-[#00FF8844]">
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[#00FF88]"></div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sensitivity</span>
                    <span>Very High</span>
                  </div>
                  <div className="w-full h-2 bg-[#FFFFFF22] rounded-full">
                    <div className="h-full w-[90%] bg-[#00FF88] rounded-full"></div>
                  </div>
                </div>
                <button className="text-xs text-[#00E5FF] hover:underline">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Item detail panel */}
      <div
        className={`fixed top-[60px] right-0 bottom-0 w-2/5 bg-[#131316] border-l border-[#00E5FF33] shadow-[-10px_0_20px_rgba(0,0,0,0.3)] z-30 transform transition-transform duration-300 ${selectedItem ? 'translate-x-0' : 'translate-x-full'}`}>

        {selectedItem &&
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-[#00E5FF33] flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-[#1A1A1F] p-1.5 rounded-md mr-2">
                    {getTypeIcon(selectedItem.type, 'w-4 h-4')}
                  </div>
                  <div className="text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                    {selectedItem.type.toUpperCase()}
                  </div>
                </div>
                <h2 className="text-xl font-bold">Reported Content</h2>
              </div>
              <button
              className="text-[#A0A0A8] hover:text-white"
              onClick={() => setSelectedItem(null)}>

                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-auto p-6">
              <div className="bg-[#1A1A1F] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                  CONTENT
                </h3>
                <div className="text-white">
                  {selectedItem.type === 'image' ?
                <div className="bg-[#0F0F11] rounded-md p-4 flex items-center justify-center">
                      <div className="text-center">
                        <Image className="w-16 h-16 text-[#606068] mx-auto mb-2" />
                        <div className="text-sm text-[#A0A0A8]">
                          Image Preview
                        </div>
                      </div>
                    </div> :

                <p className="text-[#E0E0E6]">{selectedItem.content}</p>
                }
                </div>
              </div>
              <div className="bg-[#1A1A1F] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                  REPORT DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[#A0A0A8]">Report Reason</div>
                    <div className="font-medium flex items-center mt-1">
                      <Flag className="w-4 h-4 mr-2 text-[#FF3366]" />
                      {selectedItem.reportReason}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Reported By</div>
                    <div className="font-medium mt-1">
                      {selectedItem.reportedBy}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Community</div>
                    <div className="font-medium mt-1">
                      {selectedItem.community}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Timestamp</div>
                    <div className="font-medium mt-1">
                      {selectedItem.timestamp}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">Total Flags</div>
                    <div className="font-medium mt-1">
                      <span className="bg-[#FF336622] text-[#FF3366] px-2 py-1 rounded-full text-xs font-medium">
                        {selectedItem.flags}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0A0A8]">AI Confidence</div>
                    <div
                    className="font-['JetBrains_Mono'] font-bold mt-1"
                    style={{
                      color: getConfidenceColor(selectedItem.confidenceScore)
                    }}>

                      {selectedItem.confidenceScore}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                  CONTEXT
                </h3>
                <div className="space-y-3 text-sm">
                  {Object.entries(selectedItem.context).map(([key, value]) =>
                <div key={key} className="flex justify-between">
                      <div className="text-[#A0A0A8] capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="font-medium">{value}</div>
                    </div>
                )}
                </div>
                {selectedItem.type === 'comment' &&
              <button
                className="mt-4 text-[#00E5FF] text-xs flex items-center"
                onClick={() => navigateTo('/content-management')}>

                    <Eye className="w-3 h-3 mr-1" />
                    View in Context
                  </button>
              }
              </div>
            </div>
            <div className="p-6 border-t border-[#00E5FF33] flex justify-between">
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 border border-[#FFB000] text-[#FFB000] rounded-md hover:bg-[#FFB00022] transition-colors flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Escalate
                </button>
                <button className="px-3 py-1.5 border border-[#A0A0A8] text-[#A0A0A8] rounded-md hover:bg-[#FFFFFF11] transition-colors flex items-center">
                  <Slash className="w-4 h-4 mr-1" />
                  Ban User
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                className="px-4 py-2 bg-[#FF3366] text-white rounded-md hover:bg-[#FF3366DD] transition-colors flex items-center"
                onClick={() => handleRejectItem(selectedItem.id)}>

                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                className="px-4 py-2 bg-[#00FF88] text-black font-medium rounded-md hover:bg-[#00FF88DD] transition-colors flex items-center"
                onClick={() => handleApproveItem(selectedItem.id)}>

                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
              </div>
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
const FilterButton = ({ label, active = false, onClick, icon }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${active ? 'bg-[#00E5FF22] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 'text-[#A0A0A8] hover:bg-[#1A1A1F] hover:text-white'}`}
      onClick={onClick}>

      {icon}
      {label}
    </button>);

};
// Component for stat cards
const StatCard = ({ label, value, icon, color = 'white' }) => {
  return (
    <div className="bg-[#131316] rounded-lg p-4 border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter">
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs font-['Space_Grotesk'] text-[#A0A0A8] tracking-wider">
          {label}
        </div>
        <div
          style={{
            color
          }}>

          {icon}
        </div>
      </div>
      <div
        className="font-['JetBrains_Mono'] text-3xl font-bold"
        style={{
          color
        }}>

        {value}
      </div>
    </div>);

};
export default ModerationQueue;