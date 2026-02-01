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
  Check,
  ChevronRight,
  Map,
  Users,
  Database,
  Layers,
  Server,
  Globe,
  Cpu,
  Zap,
  ArrowRight,
  CheckCircle,
  Circle,
  HelpCircle,
  Info,
  PlusCircle,
  Edit3,
  Trash2,
  Loader,
  Eye,
  RefreshCw } from
'lucide-react';
// Sample data for communities
const communitiesData = [
{
  id: 1,
  name: 'Clearwater, FL',
  status: 'active',
  population: 116946,
  subscribers: 4782,
  monthlyRevenue: 28547,
  deployedDate: 'Jan 15, 2023',
  health: 98
},
{
  id: 2,
  name: 'St. Petersburg, FL',
  status: 'active',
  population: 258308,
  subscribers: 3945,
  monthlyRevenue: 24321,
  deployedDate: 'Feb 3, 2023',
  health: 96
},
{
  id: 3,
  name: 'Tampa, FL',
  status: 'active',
  population: 384959,
  subscribers: 5120,
  monthlyRevenue: 32450,
  deployedDate: 'Jan 5, 2023',
  health: 97
},
{
  id: 4,
  name: 'Dunedin, FL',
  status: 'active',
  population: 36068,
  subscribers: 2540,
  monthlyRevenue: 15780,
  deployedDate: 'Mar 22, 2023',
  health: 95
},
{
  id: 5,
  name: 'Largo, FL',
  status: 'maintenance',
  population: 84500,
  subscribers: 2120,
  monthlyRevenue: 12450,
  deployedDate: 'Apr 10, 2023',
  health: 82
},
{
  id: 6,
  name: 'Palm Harbor, FL',
  status: 'active',
  population: 60236,
  subscribers: 3245,
  monthlyRevenue: 18750,
  deployedDate: 'May 8, 2023',
  health: 94
},
{
  id: 7,
  name: 'Safety Harbor, FL',
  status: 'active',
  population: 17800,
  subscribers: 1845,
  monthlyRevenue: 10549,
  deployedDate: 'Jun 15, 2023',
  health: 93
}];

export const CommunityDeploymentWizard = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState(communitiesData);
  const [activeTab, setActiveTab] = useState('existing');
  const [deploymentStep, setDeploymentStep] = useState(1);
  const [deploymentForm, setDeploymentForm] = useState({
    communityName: '',
    state: 'Florida',
    population: '',
    targetSubscribers: '',
    dataSource: 'census',
    aiJournalists: 5
  });
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
  // Get status indicator
  const getStatusIndicator = (status) => {
    switch (status) {
      case 'active':
        return {
          color: '#00FF88',
          text: 'Active'
        };
      case 'maintenance':
        return {
          color: '#FFB000',
          text: 'Maintenance'
        };
      case 'deploying':
        return {
          color: '#00E5FF',
          text: 'Deploying'
        };
      case 'offline':
        return {
          color: '#FF3366',
          text: 'Offline'
        };
      default:
        return {
          color: '#A0A0A8',
          text: status
        };
    }
  };
  // Get health color
  const getHealthColor = (health) => {
    if (health >= 95) return '#00FF88';
    if (health >= 90) return '#00E5FF';
    if (health >= 80) return '#FFB000';
    return '#FF3366';
  };
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDeploymentForm({
      ...deploymentForm,
      [name]: value
    });
  };
  // Handle deployment steps
  const nextStep = () => {
    setDeploymentStep(deploymentStep + 1);
  };
  const prevStep = () => {
    setDeploymentStep(deploymentStep - 1);
  };
  // Handle deployment submission
  const handleDeployment = () => {
    // In a real app, this would trigger the deployment process
    // For demo purposes, just add a new community with "deploying" status
    const newCommunity = {
      id: communities.length + 1,
      name: `${deploymentForm.communityName}, ${deploymentForm.state}`,
      status: 'deploying',
      population: parseInt(deploymentForm.population),
      subscribers: 0,
      monthlyRevenue: 0,
      deployedDate: 'Just now',
      health: 100
    };
    setCommunities([newCommunity, ...communities]);
    setActiveTab('existing');
    setDeploymentStep(1);
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
              COMMUNITY DEPLOYMENT
            </h1>
            <div className="flex space-x-4">
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium ${activeTab === 'existing' ? 'bg-[#00E5FF22] text-[#00E5FF]' : 'text-[#A0A0A8] hover:bg-[#1A1A1F] hover:text-white'}`}
                onClick={() => setActiveTab('existing')}>

                Existing Communities
              </button>
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium ${activeTab === 'deploy' ? 'bg-[#00E5FF22] text-[#00E5FF]' : 'text-[#A0A0A8] hover:bg-[#1A1A1F] hover:text-white'}`}
                onClick={() => setActiveTab('deploy')}>

                Deploy New Community
              </button>
            </div>
          </div>
          {/* Existing Communities Tab */}
          {activeTab === 'existing' &&
          <div>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <StatCard
                label="ACTIVE COMMUNITIES"
                value={
                communities.filter((c) => c.status === 'active').length
                }
                icon={<Building className="w-5 h-5 text-[#00E5FF]" />}
                color="#00E5FF" />

                <StatCard
                label="TOTAL SUBSCRIBERS"
                value={communities.
                reduce((sum, c) => sum + c.subscribers, 0).
                toLocaleString()}
                icon={<Users className="w-5 h-5 text-[#00FF88]" />}
                color="#00FF88" />

                <StatCard
                label="MONTHLY REVENUE"
                value={formatCurrency(
                  communities.reduce((sum, c) => sum + c.monthlyRevenue, 0)
                )}
                icon={<DollarSign className="w-5 h-5 text-[#FFB000]" />}
                color="#FFB000" />

                <StatCard
                label="NETWORK HEALTH"
                value={`${Math.round(communities.reduce((sum, c) => sum + c.health, 0) / communities.length)}%`}
                icon={<Zap className="w-5 h-5 text-[#00FF88]" />}
                color="#00FF88" />

              </div>
              {/* Communities table */}
              <div className="bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#00E5FF33]">
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          COMMUNITY
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          STATUS
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          POPULATION
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          SUBSCRIBERS
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          MONTHLY REVENUE
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          DEPLOYED
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          HEALTH
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00E5FF22]">
                      {communities.map((community) => {
                      const statusInfo = getStatusIndicator(community.status);
                      return (
                        <tr
                          key={community.id}
                          className="hover:bg-[#00E5FF11] cursor-pointer transition-colors">

                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="bg-[#1A1A1F] p-2 rounded-md mr-3">
                                  <Building className="w-5 h-5 text-[#00E5FF]" />
                                </div>
                                <span className="font-medium">
                                  {community.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{
                                  backgroundColor: statusInfo.color
                                }}>
                              </div>
                                <span>{statusInfo.text}</span>
                                {community.status === 'deploying' &&
                              <RefreshCw className="w-4 h-4 ml-2 text-[#00E5FF] animate-spin" />
                              }
                              </div>
                            </td>
                            <td className="py-4 px-6 font-['JetBrains_Mono']">
                              {community.population.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 font-['JetBrains_Mono']">
                              {community.subscribers.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 font-['JetBrains_Mono']">
                              {formatCurrency(community.monthlyRevenue)}
                            </td>
                            <td className="py-4 px-6 text-[#A0A0A8]">
                              {community.deployedDate}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-full h-2 bg-[#FFFFFF22] rounded-full mr-2 flex-grow max-w-[100px]">
                                  <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${community.health}%`,
                                    backgroundColor: getHealthColor(
                                      community.health
                                    )
                                  }}>
                                </div>
                                </div>
                                <span
                                className="font-['JetBrains_Mono'] font-bold"
                                style={{
                                  color: getHealthColor(community.health)
                                }}>

                                  {community.health}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <button
                                className="p-1 rounded-md hover:bg-[#00E5FF22] text-[#00E5FF]"
                                onClick={() =>
                                navigateTo('/content-management')
                                }>

                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                className="p-1 rounded-md hover:bg-[#00E5FF22] text-[#00E5FF]"
                                onClick={() => {

                                  // Would open settings in a real app
                                }}>
                                  <Settings className="w-5 h-5" />
                                </button>
                                {community.status === 'deploying' &&
                              <button
                                className="p-1 rounded-md hover:bg-[#FF336622] text-[#FF3366]"
                                onClick={() => {
                                  // Would cancel deployment in a real app
                                  setCommunities(
                                    communities.filter(
                                      (c) => c.id !== community.id
                                    )
                                  );
                                }}>

                                    <X className="w-5 h-5" />
                                  </button>
                              }
                              </div>
                            </td>
                          </tr>);

                    })}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Deploy new community button */}
              <div className="mt-8 flex justify-center">
                <button
                className="px-6 py-3 bg-[#00E5FF] text-black font-medium rounded-md hover:bg-[#00E5FFDD] transition-colors flex items-center"
                onClick={() => setActiveTab('deploy')}>

                  <PlusCircle className="w-5 h-5 mr-2" />
                  Deploy New Community
                </button>
              </div>
            </div>
          }
          {/* Deploy New Community Tab */}
          {activeTab === 'deploy' &&
          <div className="bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter p-8">
              {/* Deployment steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  <DeploymentStep
                  number={1}
                  title="Community Info"
                  active={deploymentStep === 1}
                  completed={deploymentStep > 1} />

                  <div className="w-16 h-[2px] bg-[#00E5FF33]"></div>
                  <DeploymentStep
                  number={2}
                  title="Data Sources"
                  active={deploymentStep === 2}
                  completed={deploymentStep > 2} />

                  <div className="w-16 h-[2px] bg-[#00E5FF33]"></div>
                  <DeploymentStep
                  number={3}
                  title="AI Configuration"
                  active={deploymentStep === 3}
                  completed={deploymentStep > 3} />

                  <div className="w-16 h-[2px] bg-[#00E5FF33]"></div>
                  <DeploymentStep
                  number={4}
                  title="Review & Deploy"
                  active={deploymentStep === 4}
                  completed={deploymentStep > 4} />

                </div>
              </div>
              {/* Step 1: Community Info */}
              {deploymentStep === 1 &&
            <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">
                    Community Information
                  </h2>
                  <p className="text-[#A0A0A8] mb-8">
                    Enter the basic information about the community you want to
                    deploy.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Community Name
                      </label>
                      <input
                    type="text"
                    name="communityName"
                    value={deploymentForm.communityName}
                    onChange={handleFormChange}
                    placeholder="e.g. Orlando"
                    className="w-full bg-[#1A1A1F] border border-[#00E5FF33] rounded-md py-3 px-4 text-white placeholder-[#606068] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]" />

                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        State
                      </label>
                      <select
                    name="state"
                    value={deploymentForm.state}
                    onChange={handleFormChange}
                    className="w-full bg-[#1A1A1F] border border-[#00E5FF33] rounded-md py-3 px-4 text-white focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]">

                        <option value="Florida">Florida</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Alabama">Alabama</option>
                        <option value="South Carolina">South Carolina</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Population
                      </label>
                      <input
                    type="number"
                    name="population"
                    value={deploymentForm.population}
                    onChange={handleFormChange}
                    placeholder="e.g. 250000"
                    className="w-full bg-[#1A1A1F] border border-[#00E5FF33] rounded-md py-3 px-4 text-white placeholder-[#606068] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]" />

                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Target Subscribers (Year 1)
                      </label>
                      <input
                    type="number"
                    name="targetSubscribers"
                    value={deploymentForm.targetSubscribers}
                    onChange={handleFormChange}
                    placeholder="e.g. 5000"
                    className="w-full bg-[#1A1A1F] border border-[#00E5FF33] rounded-md py-3 px-4 text-white placeholder-[#606068] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]" />

                    </div>
                  </div>
                </div>
            }
              {/* Step 2: Data Sources */}
              {deploymentStep === 2 &&
            <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Data Sources</h2>
                  <p className="text-[#A0A0A8] mb-8">
                    Select the data sources to use for community information and
                    news generation.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Primary Data Source
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <DataSourceCard
                      name="census"
                      title="Census Data"
                      description="US Census Bureau demographic and economic data"
                      icon={<Database className="w-5 h-5" />}
                      selected={deploymentForm.dataSource === 'census'}
                      onClick={() =>
                      setDeploymentForm({
                        ...deploymentForm,
                        dataSource: 'census'
                      })
                      } />

                        <DataSourceCard
                      name="opendata"
                      title="Open Data Portal"
                      description="City/county open data portals and public records"
                      icon={<Globe className="w-5 h-5" />}
                      selected={deploymentForm.dataSource === 'opendata'}
                      onClick={() =>
                      setDeploymentForm({
                        ...deploymentForm,
                        dataSource: 'opendata'
                      })
                      } />

                      </div>
                    </div>
                    <div className="bg-[#1A1A1F] rounded-lg p-4 border border-[#00E5FF33]">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-[#00E5FF] mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium mb-1">
                            Automatic Data Integration
                          </h3>
                          <p className="text-sm text-[#A0A0A8]">
                            Our system will automatically connect to additional
                            data sources including:
                          </p>
                          <ul className="text-sm text-[#A0A0A8] mt-2 space-y-1">
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-[#00FF88] mr-2" />
                              Local government websites and meeting minutes
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-[#00FF88] mr-2" />
                              Social media feeds for local organizations
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-[#00FF88] mr-2" />
                              Event calendars and community boards
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-[#00FF88] mr-2" />
                              Local business directories and chamber of commerce
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            }
              {/* Step 3: AI Configuration */}
              {deploymentStep === 3 &&
            <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">AI Configuration</h2>
                  <p className="text-[#A0A0A8] mb-8">
                    Configure the AI journalists and content generation
                    settings.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Number of AI Journalists
                      </label>
                      <div className="flex items-center">
                        <input
                      type="range"
                      name="aiJournalists"
                      min="3"
                      max="10"
                      value={deploymentForm.aiJournalists}
                      onChange={handleFormChange}
                      className="w-full h-2 bg-[#FFFFFF22] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00E5FF]" />

                        <span className="ml-4 font-['JetBrains_Mono'] text-xl font-bold text-[#00E5FF] min-w-[30px]">
                          {deploymentForm.aiJournalists}
                        </span>
                      </div>
                      <p className="text-xs text-[#A0A0A8] mt-2">
                        Recommended: 5 AI journalists for communities under
                        100,000 population
                      </p>
                    </div>
                    <div className="bg-[#1A1A1F] rounded-lg p-4">
                      <h3 className="font-medium mb-3">
                        AI Journalist Specializations
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <AIRoleCard
                      title="Local Reporter"
                      description="Covers community news and events"
                      icon="👩‍💼"
                      selected={true} />

                        <AIRoleCard
                      title="Business Analyst"
                      description="Covers local business and economy"
                      icon="👨‍💼"
                      selected={true} />

                        <AIRoleCard
                      title="Sports Writer"
                      description="Covers local sports and athletics"
                      icon="🧔"
                      selected={true} />

                        <AIRoleCard
                      title="Culture Writer"
                      description="Covers arts, culture and entertainment"
                      icon="👩‍🎨"
                      selected={true} />

                        <AIRoleCard
                      title="Education Reporter"
                      description="Covers schools and education news"
                      icon="👩‍🏫"
                      selected={true} />

                        <AIRoleCard
                      title="Breaking News"
                      description="Handles urgent and breaking news"
                      icon="👨‍✈️"
                      selected={false} />

                      </div>
                    </div>
                    <div className="bg-[#1A1A1F] rounded-lg p-4 border border-[#00E5FF33]">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-[#00E5FF] mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium mb-1">
                            AI Configuration Note
                          </h3>
                          <p className="text-sm text-[#A0A0A8]">
                            AI journalists will be automatically trained on
                            local data sources and community information. You
                            can customize their training and parameters after
                            deployment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            }
              {/* Step 4: Review & Deploy */}
              {deploymentStep === 4 &&
            <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Review & Deploy</h2>
                  <p className="text-[#A0A0A8] mb-8">
                    Review your configuration and deploy your new community.
                  </p>
                  <div className="bg-[#1A1A1F] rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-medium mb-4">
                      Deployment Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between pb-3 border-b border-[#FFFFFF22]">
                        <span className="text-[#A0A0A8]">Community</span>
                        <span className="font-medium">
                          {deploymentForm.communityName}, {deploymentForm.state}
                        </span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-[#FFFFFF22]">
                        <span className="text-[#A0A0A8]">Population</span>
                        <span className="font-medium">
                          {parseInt(deploymentForm.population).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-[#FFFFFF22]">
                        <span className="text-[#A0A0A8]">
                          Target Subscribers
                        </span>
                        <span className="font-medium">
                          {parseInt(
                        deploymentForm.targetSubscribers
                      ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-[#FFFFFF22]">
                        <span className="text-[#A0A0A8]">
                          Primary Data Source
                        </span>
                        <span className="font-medium capitalize">
                          {deploymentForm.dataSource}
                        </span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-[#FFFFFF22]">
                        <span className="text-[#A0A0A8]">AI Journalists</span>
                        <span className="font-medium">
                          {deploymentForm.aiJournalists}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A0A0A8]">
                          Estimated Setup Time
                        </span>
                        <span className="font-medium">2-4 hours</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0F0F11] rounded-lg p-6 mb-8 border border-[#00E5FF33]">
                    <h3 className="text-lg font-medium mb-4">
                      Resource Requirements
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Compute Resources</span>
                          <span className="font-['JetBrains_Mono']">
                            3 vCPUs
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#FFFFFF22] rounded-full">
                          <div className="h-full w-[30%] bg-[#00E5FF] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Allocation</span>
                          <span className="font-['JetBrains_Mono']">
                            8 GB RAM
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#FFFFFF22] rounded-full">
                          <div className="h-full w-[40%] bg-[#00FF88] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Storage</span>
                          <span className="font-['JetBrains_Mono']">
                            25 GB SSD
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#FFFFFF22] rounded-full">
                          <div className="h-full w-[25%] bg-[#FFB000] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Network Bandwidth</span>
                          <span className="font-['JetBrains_Mono']">
                            5 Mbps
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#FFFFFF22] rounded-full">
                          <div className="h-full w-[20%] bg-[#FF3366] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1A1A1F] rounded-lg p-4 border border-[#00E5FF33] mb-8">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-[#00E5FF] mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium mb-1">Deployment Process</h3>
                        <p className="text-sm text-[#A0A0A8]">
                          After deployment, the system will:
                        </p>
                        <ol className="text-sm text-[#A0A0A8] mt-2 space-y-1 list-decimal pl-5">
                          <li>Set up the community infrastructure</li>
                          <li>Import and process data from selected sources</li>
                          <li>Train AI journalists on community information</li>
                          <li>
                            Generate initial content and populate community
                            pages
                          </li>
                          <li>
                            Activate community website and notification systems
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
            }
              {/* Navigation buttons */}
              <div className="flex justify-between mt-12">
                <button
                className={`px-6 py-2 border border-[#00E5FF] text-[#00E5FF] rounded-md hover:bg-[#00E5FF22] transition-colors ${deploymentStep === 1 ? 'invisible' : ''}`}
                onClick={prevStep}>

                  Back
                </button>
                {deploymentStep < 4 ?
              <button
                className="px-6 py-2 bg-[#00E5FF] text-black font-medium rounded-md hover:bg-[#00E5FFDD] transition-colors flex items-center"
                onClick={nextStep}>

                    Next Step
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button> :

              <button
                className="px-6 py-2 bg-[#00FF88] text-black font-medium rounded-md hover:bg-[#00FF88DD] transition-colors flex items-center"
                onClick={handleDeployment}>

                    Deploy Community
                    <Zap className="w-4 h-4 ml-2" />
                  </button>
              }
              </div>
            </div>
          }
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
// Component for deployment steps
const DeploymentStep = ({ number, title, active, completed }) => {
  let bgColor = '#1A1A1F';
  let textColor = '#A0A0A8';
  let borderColor = 'transparent';
  if (active) {
    bgColor = '#00E5FF22';
    textColor = '#00E5FF';
    borderColor = '#00E5FF';
  } else if (completed) {
    bgColor = '#00FF8822';
    textColor = '#00FF88';
    borderColor = '#00FF88';
  }
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 transition-colors"
        style={{
          backgroundColor: bgColor,
          borderColor
        }}>

        {completed ?
        <Check className="w-5 h-5 text-[#00FF88]" /> :

        <span
          className="font-['JetBrains_Mono'] font-bold"
          style={{
            color: textColor
          }}>

            {number}
          </span>
        }
      </div>
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{
          color: textColor
        }}>

        {title}
      </span>
    </div>);

};
// Component for data source cards
const DataSourceCard = ({
  name,
  title,
  description,
  icon,
  selected,
  onClick
}) => {
  return (
    <div
      className={`bg-[#1A1A1F] rounded-lg p-4 border-2 transition-colors cursor-pointer ${selected ? 'border-[#00E5FF]' : 'border-transparent hover:border-[#FFFFFF33]'}`}
      onClick={onClick}>

      <div className="flex justify-between items-start mb-3">
        <div className="bg-[#0F0F11] p-2 rounded-md">
          <div className={selected ? 'text-[#00E5FF]' : 'text-[#A0A0A8]'}>
            {icon}
          </div>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[#00E5FF]' : 'border-[#606068]'}`}>

          {selected &&
          <div className="w-2 h-2 rounded-full bg-[#00E5FF]"></div>
          }
        </div>
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-xs text-[#A0A0A8]">{description}</p>
    </div>);

};
// Component for AI role cards
const AIRoleCard = ({ title, description, icon, selected }) => {
  return (
    <div
      className={`bg-[#0F0F11] rounded-lg p-3 border transition-colors ${selected ? 'border-[#00E5FF33]' : 'border-transparent'}`}>

      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-[#A0A0A8]">{description}</p>
        </div>
        <div className="ml-auto">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[#00E5FF]' : 'border-[#606068]'}`}>

            {selected &&
            <div className="w-2 h-2 rounded-full bg-[#00E5FF]"></div>
            }
          </div>
        </div>
      </div>
    </div>);

};
export default CommunityDeploymentWizard;