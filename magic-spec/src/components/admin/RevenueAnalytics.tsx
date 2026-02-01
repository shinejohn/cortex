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
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Layers,
  Users,
  Briefcase,
  Tag,
  CreditCard,
  Percent,
  Filter } from
'lucide-react';
// Sample data for revenue analytics
const revenueData = {
  overview: {
    totalRevenue: 142847,
    growth: 23.5,
    subscriptions: 8932,
    advertising: 89427,
    classifieds: 32547,
    events: 11941
  },
  communities: [
  {
    name: 'Clearwater, FL',
    revenue: 28547,
    growth: 32.4,
    subscribers: 4782,
    arpu: 18.75
  },
  {
    name: 'St. Petersburg, FL',
    revenue: 24321,
    growth: 18.7,
    subscribers: 3945,
    arpu: 16.25
  },
  {
    name: 'Tampa, FL',
    revenue: 32450,
    growth: 27.8,
    subscribers: 5120,
    arpu: 19.5
  },
  {
    name: 'Dunedin, FL',
    revenue: 15780,
    growth: 12.5,
    subscribers: 2540,
    arpu: 14.8
  },
  {
    name: 'Largo, FL',
    revenue: 12450,
    growth: -5.2,
    subscribers: 2120,
    arpu: 13.25
  },
  {
    name: 'Palm Harbor, FL',
    revenue: 18750,
    growth: 21.8,
    subscribers: 3245,
    arpu: 15.75
  },
  {
    name: 'Safety Harbor, FL',
    revenue: 10549,
    growth: 15.3,
    subscribers: 1845,
    arpu: 14.2
  }],

  monthlyRevenue: [
  {
    month: 'Jan',
    revenue: 98750
  },
  {
    month: 'Feb',
    revenue: 102450
  },
  {
    month: 'Mar',
    revenue: 107800
  },
  {
    month: 'Apr',
    revenue: 112350
  },
  {
    month: 'May',
    revenue: 118900
  },
  {
    month: 'Jun',
    revenue: 124500
  },
  {
    month: 'Jul',
    revenue: 131200
  },
  {
    month: 'Aug',
    revenue: 136800
  },
  {
    month: 'Sep',
    revenue: 142847
  },
  {
    month: 'Oct',
    revenue: 0
  },
  {
    month: 'Nov',
    revenue: 0
  },
  {
    month: 'Dec',
    revenue: 0
  }],

  revenueStreams: [
  {
    name: 'Subscriptions',
    value: 8932,
    percentage: 6.3,
    growth: 18.7
  },
  {
    name: 'Local Advertising',
    value: 57321,
    percentage: 40.1,
    growth: 25.4
  },
  {
    name: 'Programmatic Ads',
    value: 32106,
    percentage: 22.5,
    growth: 15.8
  },
  {
    name: 'Classifieds',
    value: 32547,
    percentage: 22.8,
    growth: 28.2
  },
  {
    name: 'Events',
    value: 11941,
    percentage: 8.3,
    growth: 42.5
  }]

};
export const RevenueAnalytics = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('overview');
  // Navigate to different admin pages
  const navigateTo = (path) => {
    navigate(path);
  };
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  // Get growth indicator
  const getGrowthIndicator = (value, size = 5) => {
    if (value > 0) {
      return <ArrowUp className={`text-[#00FF88] w-${size} h-${size}`} />;
    } else if (value < 0) {
      return <ArrowDown className={`text-[#FF3366] w-${size} h-${size}`} />;
    }
    return null;
  };
  // Get growth color
  const getGrowthColor = (value) => {
    if (value > 0) return '#00FF88';
    if (value < 0) return '#FF3366';
    return 'white';
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
            active
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
          {/* Page header with date selector */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-wider text-white">
              REVENUE ANALYTICS
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="bg-[#131316] border border-[#00E5FF33] rounded-md py-2 px-4 flex items-center text-white hover:bg-[#1A1A1F] transition-colors">
                  <Calendar className="w-4 h-4 mr-2 text-[#00E5FF]" />
                  <span>{dateRange}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {/* Date range dropdown would go here */}
              </div>
              <button className="bg-[#131316] border border-[#00E5FF33] rounded-md py-2 px-4 flex items-center text-white hover:bg-[#1A1A1F] transition-colors">
                <Download className="w-4 h-4 mr-2 text-[#00E5FF]" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
          {/* Revenue overview cards */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            <RevenueCard
              title="TOTAL REVENUE"
              value={formatCurrency(revenueData.overview.totalRevenue)}
              growth={revenueData.overview.growth}
              icon={<DollarSign className="w-6 h-6 text-[#00E5FF]" />}
              onClick={() => setActiveTab('overview')}
              active={activeTab === 'overview'} />

            <RevenueCard
              title="SUBSCRIPTIONS"
              value={formatCurrency(revenueData.overview.subscriptions)}
              growth={18.7}
              icon={<Users className="w-6 h-6 text-[#00FF88]" />}
              onClick={() => setActiveTab('subscriptions')}
              active={activeTab === 'subscriptions'} />

            <RevenueCard
              title="ADVERTISING"
              value={formatCurrency(revenueData.overview.advertising)}
              growth={25.4}
              icon={<Briefcase className="w-6 h-6 text-[#FFB000]" />}
              onClick={() => setActiveTab('advertising')}
              active={activeTab === 'advertising'} />

            <RevenueCard
              title="CLASSIFIEDS"
              value={formatCurrency(revenueData.overview.classifieds)}
              growth={28.2}
              icon={<Tag className="w-6 h-6 text-[#FF3366]" />}
              onClick={() => setActiveTab('classifieds')}
              active={activeTab === 'classifieds'} />

            <RevenueCard
              title="EVENTS"
              value={formatCurrency(revenueData.overview.events)}
              growth={42.5}
              icon={<Calendar className="w-6 h-6 text-[#00E5FF]" />}
              onClick={() => setActiveTab('events')}
              active={activeTab === 'events'} />

            <RevenueCard
              title="COMMUNITIES"
              value="7 Active"
              growth={12.5}
              icon={<Building className="w-6 h-6 text-[#00FF88]" />}
              onClick={() => setActiveTab('communities')}
              active={activeTab === 'communities'} />

          </div>
          {/* Monthly revenue chart */}
          <div className="bg-[#131316] rounded-lg p-6 border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Space_Grotesk'] text-lg font-bold tracking-wider">
                MONTHLY REVENUE
              </h2>
              <div className="flex items-center space-x-4">
                <button className="text-sm text-[#00E5FF] flex items-center">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </button>
                <div className="h-4 w-[1px] bg-[#FFFFFF33]"></div>
                <button className="text-sm text-[#A0A0A8] hover:text-white">
                  All
                </button>
                <button className="text-sm text-[#00E5FF]">2023</button>
                <button className="text-sm text-[#A0A0A8] hover:text-white">
                  2022
                </button>
              </div>
            </div>
            <div className="h-[300px] relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-[#A0A0A8] font-['JetBrains_Mono']">
                <div>$150K</div>
                <div>$125K</div>
                <div>$100K</div>
                <div>$75K</div>
                <div>$50K</div>
                <div>$25K</div>
                <div>$0</div>
              </div>
              {/* Chart grid */}
              <div className="absolute left-16 right-0 top-0 bottom-0">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-[#FFFFFF11] h-1/6"></div>
                  <div className="border-b border-[#FFFFFF11] h-1/6"></div>
                  <div className="border-b border-[#FFFFFF11] h-1/6"></div>
                  <div className="border-b border-[#FFFFFF11] h-1/6"></div>
                  <div className="border-b border-[#FFFFFF11] h-1/6"></div>
                  <div className="border-b border-[#FFFFFF11] h-1/6"></div>
                </div>
                {/* Bar chart */}
                <div className="absolute inset-0 flex items-end justify-between px-4">
                  {revenueData.monthlyRevenue.map((month, index) => {
                    const height = month.revenue / 150000 * 100;
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-12 rounded-t-md bg-[#00E5FF]"
                          style={{
                            height: `${height}%`,
                            backgroundImage:
                            'linear-gradient(to top, #00E5FF, #00E5FF99)'
                          }}>
                        </div>
                        <div className="mt-2 text-xs text-[#A0A0A8]">
                          {month.month}
                        </div>
                      </div>);

                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Revenue streams and community performance */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Revenue streams */}
            <div className="bg-[#131316] rounded-lg p-6 border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter">
              <h2 className="font-['Space_Grotesk'] text-lg font-bold tracking-wider mb-6">
                REVENUE STREAMS
              </h2>
              <div className="space-y-6">
                {revenueData.revenueStreams.map((stream, index) =>
                <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">{stream.name}</div>
                      <div className="flex items-center">
                        <div className="text-sm font-['JetBrains_Mono'] font-bold mr-2">
                          {formatCurrency(stream.value)}
                        </div>
                        <div className="text-xs text-[#A0A0A8]">
                          {stream.percentage}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#FFFFFF11] rounded-full">
                      <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stream.percentage}%`,
                        backgroundColor:
                        index % 2 === 0 ? '#00E5FF' : '#00FF88'
                      }}>
                    </div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <div
                      className="text-xs flex items-center"
                      style={{
                        color: getGrowthColor(stream.growth)
                      }}>

                        {getGrowthIndicator(stream.growth, 3)}
                        <span className="ml-1">
                          {Math.abs(stream.growth)}% from last month
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-[#FFFFFF22]">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Key Metrics</div>
                  <button className="text-xs text-[#00E5FF]">View All</button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-[#1A1A1F] rounded-md p-3">
                    <div className="text-xs text-[#A0A0A8] mb-1">ARPU</div>
                    <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#00E5FF]">
                      $16.42
                    </div>
                    <div className="text-xs text-[#00FF88] flex items-center mt-1">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      <span>8.2%</span>
                    </div>
                  </div>
                  <div className="bg-[#1A1A1F] rounded-md p-3">
                    <div className="text-xs text-[#A0A0A8] mb-1">
                      Conversion
                    </div>
                    <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#00FF88]">
                      4.8%
                    </div>
                    <div className="text-xs text-[#00FF88] flex items-center mt-1">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      <span>1.2%</span>
                    </div>
                  </div>
                  <div className="bg-[#1A1A1F] rounded-md p-3">
                    <div className="text-xs text-[#A0A0A8] mb-1">
                      Churn Rate
                    </div>
                    <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#FFB000]">
                      2.3%
                    </div>
                    <div className="text-xs text-[#00FF88] flex items-center mt-1">
                      <ArrowDown className="w-3 h-3 mr-1" />
                      <span>0.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Community performance */}
            <div className="bg-[#131316] rounded-lg p-6 border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold tracking-wider">
                  COMMUNITY PERFORMANCE
                </h2>
                <button
                  className="text-sm text-[#00E5FF] flex items-center"
                  onClick={() => navigateTo('/community-deployment')}>

                  View All Communities
                </button>
              </div>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#FFFFFF22]">
                      <th className="text-left py-3 text-xs text-[#A0A0A8] font-['Space_Grotesk'] tracking-wider">
                        COMMUNITY
                      </th>
                      <th className="text-right py-3 text-xs text-[#A0A0A8] font-['Space_Grotesk'] tracking-wider">
                        REVENUE
                      </th>
                      <th className="text-right py-3 text-xs text-[#A0A0A8] font-['Space_Grotesk'] tracking-wider">
                        GROWTH
                      </th>
                      <th className="text-right py-3 text-xs text-[#A0A0A8] font-['Space_Grotesk'] tracking-wider">
                        SUBSCRIBERS
                      </th>
                      <th className="text-right py-3 text-xs text-[#A0A0A8] font-['Space_Grotesk'] tracking-wider">
                        ARPU
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.communities.map((community, index) =>
                    <tr
                      key={index}
                      className="border-b border-[#FFFFFF11] hover:bg-[#FFFFFF11] cursor-pointer"
                      onClick={() => navigateTo('/community-deployment')}>

                        <td className="py-3 text-sm">{community.name}</td>
                        <td className="py-3 text-sm text-right font-['JetBrains_Mono']">
                          {formatCurrency(community.revenue)}
                        </td>
                        <td className="py-3 text-sm text-right">
                          <div
                          className="flex items-center justify-end"
                          style={{
                            color: getGrowthColor(community.growth)
                          }}>

                            {getGrowthIndicator(community.growth, 4)}
                            <span className="ml-1 font-['JetBrains_Mono']">
                              {Math.abs(community.growth)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-right font-['JetBrains_Mono']">
                          {community.subscribers.toLocaleString()}
                        </td>
                        <td className="py-3 text-sm text-right font-['JetBrains_Mono']">
                          ${community.arpu.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Subscription metrics */}
          <div className="bg-[#131316] rounded-lg p-6 border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Space_Grotesk'] text-lg font-bold tracking-wider">
                SUBSCRIPTION METRICS
              </h2>
              <div className="flex space-x-4">
                <button className="text-sm text-[#00E5FF]">Monthly</button>
                <button className="text-sm text-[#A0A0A8] hover:text-white">
                  Annual
                </button>
                <button className="text-sm text-[#A0A0A8] hover:text-white">
                  Lifetime
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-[#A0A0A8]">
                    TOTAL SUBSCRIBERS
                  </div>
                  <Users className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-2xl font-bold text-white mb-1">
                  23,547
                </div>
                <div className="text-xs text-[#00FF88] flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>12.8% from last month</span>
                </div>
              </div>
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-[#A0A0A8]">MRR</div>
                  <CreditCard className="w-5 h-5 text-[#00FF88]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-2xl font-bold text-white mb-1">
                  $42,385
                </div>
                <div className="text-xs text-[#00FF88] flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>8.7% from last month</span>
                </div>
              </div>
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-[#A0A0A8]">CHURN RATE</div>
                  <Percent className="w-5 h-5 text-[#FFB000]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-2xl font-bold text-white mb-1">
                  2.3%
                </div>
                <div className="text-xs text-[#00FF88] flex items-center">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  <span>0.5% from last month</span>
                </div>
              </div>
              <div className="bg-[#1A1A1F] rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs text-[#A0A0A8]">LTV</div>
                  <Layers className="w-5 h-5 text-[#FF3366]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-2xl font-bold text-white mb-1">
                  $284.50
                </div>
                <div className="text-xs text-[#00FF88] flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>5.2% from last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
// Component for revenue cards
const RevenueCard = ({
  title,
  value,
  growth,
  icon,
  onClick,
  active = false
}) => {
  return (
    <div
      className={`bg-[#131316] rounded-lg p-5 border ${active ? 'border-[#00E5FF]' : 'border-[#00E5FF33]'} shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter cursor-pointer hover:border-[#00E5FF] transition-all duration-200`}
      onClick={onClick}>

      <div className="flex justify-between items-start mb-3">
        <div className="text-xs font-['Space_Grotesk'] text-[#A0A0A8] tracking-wider">
          {title}
        </div>
        {icon}
      </div>
      <div className="font-['JetBrains_Mono'] text-2xl font-bold text-white mb-1">
        {value}
      </div>
      {growth !== undefined &&
      <div
        className="text-xs flex items-center"
        style={{
          color: getGrowthColor(growth)
        }}>

          {growth > 0 ?
        <ArrowUp className="w-3 h-3 mr-1" /> :

        <ArrowDown className="w-3 h-3 mr-1" />
        }
          <span>{Math.abs(growth)}% from last month</span>
        </div>
      }
    </div>);

};
export default RevenueAnalytics;