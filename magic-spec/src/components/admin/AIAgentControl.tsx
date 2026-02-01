import React, { useEffect, useState, memo, Component } from 'react';
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
  Activity,
  Zap,
  AlertCircle,
  Clock,
  Check,
  X,
  RefreshCw,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  DollarSign as Dollar,
  Sliders,
  Eye } from
'lucide-react';
// Sample data for AI agents
const aiAgents = [
{
  id: 1,
  name: 'Sarah',
  avatar: '👩‍💼',
  role: 'Local News Reporter',
  performance: 97,
  status: 'Active',
  activity: [65, 72, 68, 74, 82, 79, 85, 88, 92, 95, 89, 97],
  description: 'Specialized in local community news and events coverage',
  metrics: {
    articlesWritten: 842,
    avgQualityScore: 94,
    responseTime: '1.2s',
    errorRate: 0.8,
    accuracy: 97.2,
    resourceUsage: 42
  },
  activityLog: [
  {
    time: '09:42:12',
    action: 'Article published',
    status: 'success'
  },
  {
    time: '09:31:05',
    action: 'Research completed',
    status: 'success'
  },
  {
    time: '09:15:22',
    action: 'Fact checking',
    status: 'success'
  },
  {
    time: '09:02:47',
    action: 'Started article draft',
    status: 'success'
  },
  {
    time: '08:58:03',
    action: 'Analyzing news data',
    status: 'success'
  }],

  errors: [
  {
    time: 'Yesterday',
    message: 'Citation validation failed',
    severity: 'low'
  },
  {
    time: '3 days ago',
    message: 'API rate limit reached',
    severity: 'medium'
  }]

},
{
  id: 2,
  name: 'Alex',
  avatar: '👨‍💻',
  role: 'Technical Writer',
  performance: 93,
  status: 'Working',
  activity: [78, 75, 82, 88, 84, 90, 92, 95, 91, 89, 93, 93],
  description: 'Specialized in technology and science reporting',
  metrics: {
    articlesWritten: 756,
    avgQualityScore: 92,
    responseTime: '1.4s',
    errorRate: 1.2,
    accuracy: 95.8,
    resourceUsage: 48
  },
  activityLog: [
  {
    time: '09:43:18',
    action: 'Writing tech review',
    status: 'in-progress'
  },
  {
    time: '09:22:31',
    action: 'Research on new tech',
    status: 'success'
  },
  {
    time: '09:05:14',
    action: 'Spec validation',
    status: 'success'
  },
  {
    time: '08:47:02',
    action: 'Data analysis',
    status: 'success'
  },
  {
    time: '08:30:55',
    action: 'Morning briefing',
    status: 'success'
  }],

  errors: [
  {
    time: 'Yesterday',
    message: 'Technical data mismatch',
    severity: 'medium'
  },
  {
    time: '1 week ago',
    message: 'Source verification timeout',
    severity: 'low'
  }]

},
{
  id: 3,
  name: 'Emma',
  avatar: '👩‍🏫',
  role: 'Education Reporter',
  performance: 96,
  status: 'Active',
  activity: [70, 75, 82, 85, 88, 92, 90, 95, 93, 96, 94, 96],
  description: 'Focused on education news and student achievements',
  metrics: {
    articlesWritten: 728,
    avgQualityScore: 95,
    responseTime: '1.1s',
    errorRate: 0.5,
    accuracy: 98.3,
    resourceUsage: 38
  },
  activityLog: [
  {
    time: '09:41:22',
    action: 'Article published',
    status: 'success'
  },
  {
    time: '09:22:15',
    action: 'Interview analysis',
    status: 'success'
  },
  {
    time: '09:05:47',
    action: 'Data verification',
    status: 'success'
  },
  {
    time: '08:50:33',
    action: 'Content research',
    status: 'success'
  },
  {
    time: '08:35:12',
    action: 'Morning briefing',
    status: 'success'
  }],

  errors: [
  {
    time: '5 days ago',
    message: 'School data inconsistency',
    severity: 'low'
  }]

},
{
  id: 4,
  name: 'Michael',
  avatar: '🧔',
  role: 'Sports Analyst',
  performance: 89,
  status: 'Working',
  activity: [65, 72, 68, 74, 82, 79, 85, 88, 84, 80, 86, 89],
  description: 'Sports coverage and statistical analysis specialist',
  metrics: {
    articlesWritten: 694,
    avgQualityScore: 88,
    responseTime: '1.6s',
    errorRate: 2.1,
    accuracy: 94.2,
    resourceUsage: 52
  },
  activityLog: [
  {
    time: '09:42:55',
    action: 'Game analysis',
    status: 'in-progress'
  },
  {
    time: '09:30:12',
    action: 'Stats compilation',
    status: 'success'
  },
  {
    time: '09:15:33',
    action: 'Player data review',
    status: 'success'
  },
  {
    time: '08:58:41',
    action: 'Pre-game research',
    status: 'success'
  },
  {
    time: '08:45:07',
    action: 'Morning briefing',
    status: 'success'
  }],

  errors: [
  {
    time: 'Yesterday',
    message: 'Statistical anomaly detected',
    severity: 'low'
  },
  {
    time: '3 days ago',
    message: 'Player data mismatch',
    severity: 'medium'
  },
  {
    time: '1 week ago',
    message: 'API connection failure',
    severity: 'high'
  }]

},
{
  id: 5,
  name: 'Olivia',
  avatar: '👩‍⚕️',
  role: 'Health Reporter',
  performance: 95,
  status: 'Active',
  activity: [80, 82, 85, 88, 86, 90, 92, 94, 91, 93, 95, 95],
  description: 'Medical and health news reporting specialist',
  metrics: {
    articlesWritten: 712,
    avgQualityScore: 93,
    responseTime: '1.3s',
    errorRate: 0.9,
    accuracy: 97.5,
    resourceUsage: 45
  },
  activityLog: [
  {
    time: '09:40:18',
    action: 'Health advisory published',
    status: 'success'
  },
  {
    time: '09:25:32',
    action: 'Medical fact-check',
    status: 'success'
  },
  {
    time: '09:10:45',
    action: 'Research review',
    status: 'success'
  },
  {
    time: '08:55:22',
    action: 'Data analysis',
    status: 'success'
  },
  {
    time: '08:40:10',
    action: 'Morning briefing',
    status: 'success'
  }],

  errors: [
  {
    time: '2 days ago',
    message: 'Medical terminology error',
    severity: 'medium'
  }]

},
{
  id: 6,
  name: 'Daniel',
  avatar: '👨‍💼',
  role: 'Business Analyst',
  performance: 92,
  status: 'Idle',
  activity: [75, 78, 82, 80, 85, 88, 90, 87, 92, 90, 93, 92],
  description: 'Business and financial news reporting specialist',
  metrics: {
    articlesWritten: 680,
    avgQualityScore: 91,
    responseTime: '1.5s',
    errorRate: 1.3,
    accuracy: 95.2,
    resourceUsage: 47
  },
  activityLog: [
  {
    time: '09:30:42',
    action: 'Market analysis completed',
    status: 'success'
  },
  {
    time: '09:15:18',
    action: 'Financial data review',
    status: 'success'
  },
  {
    time: '09:00:25',
    action: 'Company research',
    status: 'success'
  },
  {
    time: '08:45:33',
    action: 'Economic trends analysis',
    status: 'success'
  },
  {
    time: '08:30:10',
    action: 'Morning briefing',
    status: 'success'
  }],

  errors: [
  {
    time: 'Yesterday',
    message: 'Financial data outdated',
    severity: 'medium'
  },
  {
    time: '4 days ago',
    message: 'Market API timeout',
    severity: 'low'
  }]

},
{
  id: 7,
  name: 'Sophia',
  avatar: '👩‍🎨',
  role: 'Culture Writer',
  performance: 94,
  status: 'Active',
  activity: [72, 75, 80, 83, 85, 88, 90, 92, 94, 91, 93, 94],
  description: 'Arts, culture and entertainment specialist',
  metrics: {
    articlesWritten: 734,
    avgQualityScore: 92,
    responseTime: '1.2s',
    errorRate: 1.0,
    accuracy: 96.8,
    resourceUsage: 41
  },
  activityLog: [
  {
    time: '09:38:22',
    action: 'Event review published',
    status: 'success'
  },
  {
    time: '09:20:15',
    action: 'Interview analysis',
    status: 'success'
  },
  {
    time: '09:05:33',
    action: 'Research compilation',
    status: 'success'
  },
  {
    time: '08:50:47',
    action: 'Content planning',
    status: 'success'
  },
  {
    time: '08:35:20',
    action: 'Morning briefing',
    status: 'success'
  }],

  errors: [
  {
    time: '3 days ago',
    message: 'Event date mismatch',
    severity: 'low'
  }]

},
{
  id: 8,
  name: 'James',
  avatar: '👨‍✈️',
  role: 'Breaking News',
  performance: 88,
  status: 'Working',
  activity: [65, 70, 75, 80, 78, 82, 85, 88, 84, 80, 85, 88],
  description: 'Rapid response and breaking news specialist',
  metrics: {
    articlesWritten: 912,
    avgQualityScore: 86,
    responseTime: '0.8s',
    errorRate: 2.8,
    accuracy: 92.5,
    resourceUsage: 58
  },
  activityLog: [
  {
    time: '09:43:05',
    action: 'Breaking news alert',
    status: 'in-progress'
  },
  {
    time: '09:35:18',
    action: 'Source verification',
    status: 'in-progress'
  },
  {
    time: '09:22:33',
    action: 'Rapid fact check',
    status: 'success'
  },
  {
    time: '09:10:45',
    action: 'Initial report draft',
    status: 'success'
  },
  {
    time: '09:00:12',
    action: 'Event detection',
    status: 'success'
  }],

  errors: [
  {
    time: 'Today',
    message: 'Unverified source used',
    severity: 'high'
  },
  {
    time: 'Yesterday',
    message: 'Premature publication',
    severity: 'medium'
  },
  {
    time: '2 days ago',
    message: 'Location data error',
    severity: 'low'
  }]

}];

// System resource data
const systemResources = {
  cpu: [
  25, 28, 32, 45, 40, 35, 38, 42, 48, 50, 47, 52, 55, 58, 62, 60, 65, 68, 72,
  70, 75, 78, 82, 80],

  memory: [
  35, 38, 42, 45, 48, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85,
  88, 86, 90, 92, 90],

  apiCalls: {
    total: 15842,
    perMinute: 42,
    distribution: {
      news: 35,
      weather: 15,
      sports: 20,
      finance: 30
    }
  },
  costs: {
    daily: 142.75,
    monthly: 4321.5,
    breakdown: {
      compute: 65,
      storage: 15,
      api: 20
    }
  }
};
export const AIAgentControl = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(aiAgents[0].id);
  const [cpuData, setCpuData] = useState(systemResources.cpu);
  const [memoryData, setMemoryData] = useState(systemResources.memory);
  const [apiCallCount, setApiCallCount] = useState(
    systemResources.apiCalls.total
  );
  const [costCounter, setCostCounter] = useState(systemResources.costs.daily);
  // Navigate to different admin pages
  const navigateTo = (path) => {
    navigate(path);
  };
  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update CPU data
      setCpuData((prev) => {
        const newValue = Math.max(
          20,
          Math.min(95, prev[prev.length - 1] + (Math.random() * 10 - 5))
        );
        return [...prev.slice(1), newValue];
      });
      // Update memory data
      setMemoryData((prev) => {
        const newValue = Math.max(
          30,
          Math.min(95, prev[prev.length - 1] + (Math.random() * 8 - 4))
        );
        return [...prev.slice(1), newValue];
      });
      // Update API call count
      setApiCallCount((prev) => prev + Math.floor(Math.random() * 5) + 1);
      // Update cost counter
      setCostCounter((prev) => prev + Math.random() * 0.05);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  // Handle agent configuration
  const handleConfigureAgent = (agentId) => {
    setSelectedAgent(agentId);
    // Scroll to agent details if needed
  };
  // Handle agent retraining
  const handleRetrainAgent = (agentId) => {
    // In a real app, this would trigger a retraining process
    // For demo purposes, just show a visual feedback
    const agent = aiAgents.find((a) => a.id === agentId);
    if (agent) {
      // Visual feedback would go here
      console.log(`Retraining agent ${agent.name}`);
    }
  };
  // Handle deploying a new agent
  const handleDeployNewAgent = () => {
    // In a real app, this would open a form to configure a new agent
    // For demo purposes, just show a console message
    console.log('Deploying new agent');
  };
  // Get performance color based on score
  const getPerformanceColor = (score) => {
    if (score >= 95) return '#00FF88';
    if (score >= 90) return '#00E5FF';
    if (score >= 80) return '#FFB000';
    return '#FF3366';
  };
  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return {
          icon: <Zap className="w-4 h-4" />,
          color: '#00FF88'
        };
      case 'Working':
        return {
          icon: <Activity className="w-4 h-4" />,
          color: '#00E5FF'
        };
      case 'Idle':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: '#FFB000'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: '#FF3366'
        };
    }
  };
  // Get activity status icon
  const getActivityIcon = (status) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-[#00FF88]" />;
      case 'in-progress':
        return <RefreshCw className="w-4 h-4 text-[#00E5FF] animate-spin" />;
      case 'error':
        return <X className="w-4 h-4 text-[#FF3366]" />;
      default:
        return <Clock className="w-4 h-4 text-[#FFB000]" />;
    }
  };
  // Get error severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return '#FFB000';
      case 'medium':
        return '#FF9500';
      case 'high':
        return '#FF3366';
      default:
        return '#FFB000';
    }
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
            active
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
          {/* AI Agents header section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold tracking-wider text-white">
              AI AGENT CONTROL PANEL
            </h1>
            <div className="flex space-x-4">
              <button
                className="bg-[#131316] border border-[#00E5FF33] rounded-md py-2 px-4 flex items-center text-white hover:bg-[#1A1A1F] transition-colors"
                onClick={() => {
                  // Refresh agents - in a real app this would reload data
                  // For demo, just show a console message
                  console.log('Refreshing agents');
                }}>

                <RefreshCw className="w-4 h-4 mr-2 text-[#00E5FF]" />
                <span>Refresh Agents</span>
              </button>
              <button
                className="bg-[#131316] border border-[#00FF8833] rounded-md py-2 px-4 flex items-center text-white hover:bg-[#1A1A1F] transition-colors"
                onClick={handleDeployNewAgent}>

                <Bot className="w-4 h-4 mr-2 text-[#00FF88]" />
                <span>Deploy New Agent</span>
              </button>
            </div>
          </div>
          {/* Agent Fleet Overview */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <h2 className="font-['Space_Grotesk'] text-lg font-bold tracking-wider uppercase">
                Agent Fleet Overview
              </h2>
              <div className="h-[1px] bg-[#00E5FF] flex-grow ml-4 opacity-50"></div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {aiAgents.map((agent) => {
                const statusInfo = getStatusIcon(agent.status);
                return (
                  <div
                    key={agent.id}
                    className={`bg-[#131316] rounded-lg p-5 border ${selectedAgent === agent.id ? 'border-[#00E5FF]' : 'border-[#00E5FF33]'} shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter hover:border-[#00E5FF] transition-all duration-200 cursor-pointer`}
                    onClick={() => setSelectedAgent(agent.id)}>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-1">{agent.avatar}</div>
                        <div className="font-medium text-lg">{agent.name}</div>
                        <div className="text-xs text-[#A0A0A8]">
                          {agent.role}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div
                          className="font-['JetBrains_Mono'] text-3xl font-bold"
                          style={{
                            color: getPerformanceColor(agent.performance)
                          }}>

                          {agent.performance}%
                        </div>
                        <div
                          className="flex items-center text-xs mt-1"
                          style={{
                            color: statusInfo.color
                          }}>

                          {statusInfo.icon}
                          <span className="ml-1">{agent.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-12 w-full mb-3">
                      <div className="w-full h-full flex items-end">
                        {agent.activity.map((value, index) => {
                          const height = value / 100 * 100;
                          return (
                            <div
                              key={index}
                              className="flex-1 mx-[1px] rounded-t"
                              style={{
                                height: `${height}%`,
                                backgroundColor: getPerformanceColor(
                                  agent.performance
                                ),
                                opacity:
                                index === agent.activity.length - 1 ?
                                1 :
                                0.3 + index * 0.05
                              }} />);


                        })}
                      </div>
                    </div>
                    <button
                      className="w-full py-2 bg-[#1A1A1F] rounded-md text-[#00E5FF] text-sm font-medium hover:bg-[#00E5FF22] transition-colors flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfigureAgent(agent.id);
                      }}>

                      <Sliders className="w-4 h-4 mr-2" />
                      Configure
                    </button>
                  </div>);

              })}
            </div>
          </div>
          {/* Agent Performance Metrics */}
          <div className="bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter mb-8">
            <div className="border-b border-[#00E5FF33]">
              <div className="flex overflow-x-auto">
                {aiAgents.map((agent) =>
                <button
                  key={agent.id}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${selectedAgent === agent.id ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-[#A0A0A8] hover:text-white'}`}
                  onClick={() => setSelectedAgent(agent.id)}>

                    {agent.avatar} {agent.name}
                  </button>
                )}
              </div>
            </div>
            {aiAgents.map((agent) =>
            <div
              key={agent.id}
              className={`p-6 ${selectedAgent === agent.id ? 'block' : 'hidden'}`}>

                <div className="grid grid-cols-3 gap-6">
                  {/* Left column - Activity log */}
                  <div className="col-span-1">
                    <div className="mb-4">
                      <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                        REAL-TIME ACTIVITY LOG
                      </h3>
                      <div className="bg-[#1A1A1F] rounded-md p-4 max-h-[300px] overflow-y-auto">
                        {agent.activityLog.map((log, index) =>
                      <div
                        key={index}
                        className="flex items-start mb-3 last:mb-0">

                            <div className="mr-3 mt-1">
                              {getActivityIcon(log.status)}
                            </div>
                            <div className="flex-grow">
                              <div className="text-sm">{log.action}</div>
                              <div className="text-xs text-[#A0A0A8]">
                                {log.time}
                              </div>
                            </div>
                          </div>
                      )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                        ERROR LOG
                      </h3>
                      <div className="bg-[#1A1A1F] rounded-md p-4 max-h-[200px] overflow-y-auto">
                        {agent.errors && agent.errors.length > 0 ?
                      agent.errors.map((error, index) =>
                      <div
                        key={index}
                        className="flex items-start mb-3 last:mb-0">

                              <div
                          className="w-2 h-2 rounded-full mt-2 mr-3"
                          style={{
                            backgroundColor: getSeverityColor(
                              error.severity
                            )
                          }}>
                        </div>
                              <div className="flex-grow">
                                <div className="text-sm">{error.message}</div>
                                <div className="flex items-center">
                                  <span className="text-xs text-[#A0A0A8] mr-2">
                                    {error.time}
                                  </span>
                                  <span
                              className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                              style={{
                                backgroundColor: `${getSeverityColor(error.severity)}33`,
                                color: getSeverityColor(error.severity)
                              }}>

                                    {error.severity}
                                  </span>
                                </div>
                              </div>
                            </div>
                      ) :

                      <div className="text-sm text-[#A0A0A8] italic">
                            No errors recorded
                          </div>
                      }
                      </div>
                    </div>
                  </div>
                  {/* Middle column - Performance metrics */}
                  <div className="col-span-1">
                    <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                      PERFORMANCE METRICS
                    </h3>
                    <div className="bg-[#1A1A1F] rounded-md p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <MetricCard
                        label="Articles Written"
                        value={agent.metrics.articlesWritten.toLocaleString()}
                        icon={<Newspaper className="w-4 h-4" />}
                        color="#00E5FF" />

                        <MetricCard
                        label="Quality Score"
                        value={`${agent.metrics.avgQualityScore}%`}
                        icon={<Check className="w-4 h-4" />}
                        color={getPerformanceColor(
                          agent.metrics.avgQualityScore
                        )} />

                        <MetricCard
                        label="Response Time"
                        value={agent.metrics.responseTime}
                        icon={<Clock className="w-4 h-4" />}
                        color="#FFB000" />

                        <MetricCard
                        label="Error Rate"
                        value={`${agent.metrics.errorRate}%`}
                        icon={<AlertCircle className="w-4 h-4" />}
                        color={
                        agent.metrics.errorRate < 1 ?
                        '#00FF88' :
                        agent.metrics.errorRate < 2 ?
                        '#FFB000' :
                        '#FF3366'
                        } />

                        <MetricCard
                        label="Accuracy"
                        value={`${agent.metrics.accuracy}%`}
                        icon={<Check className="w-4 h-4" />}
                        color={getPerformanceColor(agent.metrics.accuracy)} />

                        <MetricCard
                        label="Resource Usage"
                        value={`${agent.metrics.resourceUsage}%`}
                        icon={<Cpu className="w-4 h-4" />}
                        color={
                        agent.metrics.resourceUsage < 40 ?
                        '#00FF88' :
                        agent.metrics.resourceUsage < 60 ?
                        '#FFB000' :
                        '#FF3366'
                        } />

                      </div>
                    </div>
                    <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mt-4 mb-3">
                      TASK COMPLETION RATE
                    </h3>
                    <div className="bg-[#1A1A1F] rounded-md p-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Last 24 hours</span>
                        <span className="font-['JetBrains_Mono'] font-bold text-[#00FF88]">
                          98.2%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#00FF8822] rounded-full mb-4">
                        <div
                        className="h-full bg-[#00FF88] rounded-full"
                        style={{
                          width: '98.2%'
                        }}>
                      </div>
                      </div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Last 7 days</span>
                        <span className="font-['JetBrains_Mono'] font-bold text-[#00E5FF]">
                          96.5%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#00E5FF22] rounded-full mb-4">
                        <div
                        className="h-full bg-[#00E5FF] rounded-full"
                        style={{
                          width: '96.5%'
                        }}>
                      </div>
                      </div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Last 30 days</span>
                        <span className="font-['JetBrains_Mono'] font-bold text-[#FFB000]">
                          94.8%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#FFB00022] rounded-full">
                        <div
                        className="h-full bg-[#FFB000] rounded-full"
                        style={{
                          width: '94.8%'
                        }}>
                      </div>
                      </div>
                    </div>
                  </div>
                  {/* Right column - Resource usage */}
                  <div className="col-span-1">
                    <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                      RESOURCE USAGE METERS
                    </h3>
                    <div className="bg-[#1A1A1F] rounded-md p-4">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm flex items-center">
                            <Terminal className="w-4 h-4 mr-2 text-[#00E5FF]" />
                            <span>Compute Units</span>
                          </div>
                          <div className="font-['JetBrains_Mono'] text-sm font-bold text-[#00E5FF]">
                            {agent.metrics.resourceUsage}%
                          </div>
                        </div>
                        <div className="w-full h-2 bg-[#00E5FF22] rounded-full">
                          <div
                          className="h-full bg-[#00E5FF] rounded-full"
                          style={{
                            width: `${agent.metrics.resourceUsage}%`
                          }}>
                        </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm flex items-center">
                            <HardDrive className="w-4 h-4 mr-2 text-[#00FF88]" />
                            <span>Memory Allocation</span>
                          </div>
                          <div className="font-['JetBrains_Mono'] text-sm font-bold text-[#00FF88]">
                            {Math.round(agent.metrics.resourceUsage * 0.8)}%
                          </div>
                        </div>
                        <div className="w-full h-2 bg-[#00FF8822] rounded-full">
                          <div
                          className="h-full bg-[#00FF88] rounded-full"
                          style={{
                            width: `${Math.round(agent.metrics.resourceUsage * 0.8)}%`
                          }}>
                        </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm flex items-center">
                            <Wifi className="w-4 h-4 mr-2 text-[#FFB000]" />
                            <span>API Calls (per min)</span>
                          </div>
                          <div className="font-['JetBrains_Mono'] text-sm font-bold text-[#FFB000]">
                            {Math.round(agent.metrics.resourceUsage * 0.25)}
                          </div>
                        </div>
                        <div className="w-full h-2 bg-[#FFB00022] rounded-full">
                          <div
                          className="h-full bg-[#FFB000] rounded-full"
                          style={{
                            width: `${Math.round(agent.metrics.resourceUsage * 0.25) * 2}%`
                          }}>
                        </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm flex items-center">
                            <Dollar className="w-4 h-4 mr-2 text-[#FF3366]" />
                            <span>Cost Per Article</span>
                          </div>
                          <div className="font-['JetBrains_Mono'] text-sm font-bold text-[#FF3366]">
                            ${(agent.metrics.resourceUsage / 100).toFixed(2)}
                          </div>
                        </div>
                        <div className="w-full h-2 bg-[#FF336622] rounded-full">
                          <div
                          className="h-full bg-[#FF3366] rounded-full"
                          style={{
                            width: `${agent.metrics.resourceUsage}%`
                          }}>
                        </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-[#1A1A1F] rounded-md p-4">
                      <h3 className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8] mb-3">
                        AGENT DESCRIPTION
                      </h3>
                      <p className="text-sm text-[#E0E0E6]">
                        {agent.description}
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <button
                        className="px-3 py-1.5 bg-[#00E5FF22] text-[#00E5FF] rounded-md text-xs flex items-center hover:bg-[#00E5FF33] transition-colors"
                        onClick={() => navigateTo('/content-management')}>

                          <Eye className="w-3 h-3 mr-1" />
                          View Full Profile
                        </button>
                        <button
                        className="px-3 py-1.5 bg-[#00FF8822] text-[#00FF88] rounded-md text-xs flex items-center hover:bg-[#00FF8833] transition-colors"
                        onClick={() => handleRetrainAgent(agent.id)}>

                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retrain Agent
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* System Resource Monitor */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <h2 className="font-['Space_Grotesk'] text-lg font-bold tracking-wider uppercase">
                System Resource Monitor
              </h2>
              <div className="h-[1px] bg-[#00E5FF] flex-grow ml-4 opacity-50"></div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {/* CPU Usage Graph */}
              <div className="col-span-1 bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                    CPU USAGE
                  </div>
                  <Cpu className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-3xl font-bold text-[#00E5FF] mb-2">
                  {cpuData[cpuData.length - 1].toFixed(1)}%
                </div>
                <div className="h-[120px] bg-black rounded-md p-2 border border-[#00E5FF33] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <div className="w-full h-full flex items-end relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                    </div>
                    {/* Line chart */}
                    <svg
                      className="w-full h-full"
                      viewBox={`0 0 ${cpuData.length} 100`}
                      preserveAspectRatio="none">

                      <defs>
                        <linearGradient
                          id="cpuGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%">

                          <stop
                            offset="0%"
                            stopColor="#00E5FF"
                            stopOpacity="0.8" />

                          <stop
                            offset="100%"
                            stopColor="#00E5FF"
                            stopOpacity="0" />

                        </linearGradient>
                      </defs>
                      {/* Area under the line */}
                      <path
                        d={`
                          M0,${100 - cpuData[0] / 100 * 100}
                          ${cpuData.map((value, i) => `L${i},${100 - value / 100 * 100}`).join(' ')}
                          L${cpuData.length - 1},100 L0,100 Z
                        `}
                        fill="url(#cpuGradient)" />

                      {/* Line */}
                      <path
                        d={`
                          M0,${100 - cpuData[0] / 100 * 100}
                          ${cpuData.map((value, i) => `L${i},${100 - value / 100 * 100}`).join(' ')}
                        `}
                        stroke="#00E5FF"
                        strokeWidth="2"
                        fill="none" />

                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#A0A0A8] flex justify-between">
                  <span>Last 24 hours</span>
                  <span>Updated: Just now</span>
                </div>
              </div>
              {/* Memory Usage Graph */}
              <div className="col-span-1 bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                    MEMORY USAGE
                  </div>
                  <HardDrive className="w-5 h-5 text-[#00FF88]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-3xl font-bold text-[#00FF88] mb-2">
                  {memoryData[memoryData.length - 1].toFixed(1)}%
                </div>
                <div className="h-[120px] bg-black rounded-md p-2 border border-[#00E5FF33] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <div className="w-full h-full flex items-end relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                      <div className="border-b border-[#FFFFFF22] h-1/4"></div>
                    </div>
                    {/* Line chart */}
                    <svg
                      className="w-full h-full"
                      viewBox={`0 0 ${memoryData.length} 100`}
                      preserveAspectRatio="none">

                      <defs>
                        <linearGradient
                          id="memoryGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%">

                          <stop
                            offset="0%"
                            stopColor="#00FF88"
                            stopOpacity="0.8" />

                          <stop
                            offset="100%"
                            stopColor="#00FF88"
                            stopOpacity="0" />

                        </linearGradient>
                      </defs>
                      {/* Area under the line */}
                      <path
                        d={`
                          M0,${100 - memoryData[0] / 100 * 100}
                          ${memoryData.map((value, i) => `L${i},${100 - value / 100 * 100}`).join(' ')}
                          L${memoryData.length - 1},100 L0,100 Z
                        `}
                        fill="url(#memoryGradient)" />

                      {/* Line */}
                      <path
                        d={`
                          M0,${100 - memoryData[0] / 100 * 100}
                          ${memoryData.map((value, i) => `L${i},${100 - value / 100 * 100}`).join(' ')}
                        `}
                        stroke="#00FF88"
                        strokeWidth="2"
                        fill="none" />

                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#A0A0A8] flex justify-between">
                  <span>Last 24 hours</span>
                  <span>Updated: Just now</span>
                </div>
              </div>
              {/* API Calls Counter */}
              <div className="col-span-1 bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                    API CALLS
                  </div>
                  <Wifi className="w-5 h-5 text-[#FFB000]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-3xl font-bold text-[#FFB000] mb-2">
                  {apiCallCount.toLocaleString()}
                </div>
                <div className="text-sm mb-4">
                  <span className="text-[#A0A0A8]">Rate:</span>
                  <span className="ml-2 text-white">
                    {systemResources.apiCalls.perMinute}/min
                  </span>
                </div>
                <div className="h-[120px] bg-black rounded-md p-4 border border-[#00E5FF33] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <h4 className="text-xs text-[#A0A0A8] mb-3">
                    API DISTRIBUTION
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>News APIs</span>
                        <span>
                          {systemResources.apiCalls.distribution.news}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#FFFFFF11] rounded-full">
                        <div
                          className="h-full bg-[#00E5FF] rounded-full"
                          style={{
                            width: `${systemResources.apiCalls.distribution.news}%`
                          }}>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Weather APIs</span>
                        <span>
                          {systemResources.apiCalls.distribution.weather}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#FFFFFF11] rounded-full">
                        <div
                          className="h-full bg-[#FFB000] rounded-full"
                          style={{
                            width: `${systemResources.apiCalls.distribution.weather}%`
                          }}>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Sports APIs</span>
                        <span>
                          {systemResources.apiCalls.distribution.sports}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#FFFFFF11] rounded-full">
                        <div
                          className="h-full bg-[#00FF88] rounded-full"
                          style={{
                            width: `${systemResources.apiCalls.distribution.sports}%`
                          }}>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Finance APIs</span>
                        <span>
                          {systemResources.apiCalls.distribution.finance}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#FFFFFF11] rounded-full">
                        <div
                          className="h-full bg-[#FF3366] rounded-full"
                          style={{
                            width: `${systemResources.apiCalls.distribution.finance}%`
                          }}>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Cost Tracking */}
              <div className="col-span-1 bg-[#131316] rounded-lg border border-[#00E5FF33] shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-sm backdrop-filter p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-['Space_Grotesk'] tracking-wider text-[#A0A0A8]">
                    COST TRACKING
                  </div>
                  <Dollar className="w-5 h-5 text-[#FF3366]" />
                </div>
                <div className="font-['JetBrains_Mono'] text-3xl font-bold text-[#FF3366] mb-2">
                  ${costCounter.toFixed(2)}
                </div>
                <div className="text-sm mb-4">
                  <span className="text-[#A0A0A8]">Monthly:</span>
                  <span className="ml-2 text-white">
                    ${systemResources.costs.monthly.toLocaleString()}
                  </span>
                </div>
                <div className="h-[120px] bg-black rounded-md p-4 border border-[#00E5FF33] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <h4 className="text-xs text-[#A0A0A8] mb-3">
                    COST BREAKDOWN
                  </h4>
                  <div className="relative h-[72px]">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#FFFFFF11"
                        strokeWidth="12" />

                      {/* Compute segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#00E5FF"
                        strokeWidth="12"
                        strokeDasharray={`${2.51 * systemResources.costs.breakdown.compute} 251`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)" />

                      {/* Storage segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#00FF88"
                        strokeWidth="12"
                        strokeDasharray={`${2.51 * systemResources.costs.breakdown.storage} 251`}
                        strokeDashoffset={`${-2.51 * systemResources.costs.breakdown.compute}`}
                        transform="rotate(-90 50 50)" />

                      {/* API segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#FFB000"
                        strokeWidth="12"
                        strokeDasharray={`${2.51 * systemResources.costs.breakdown.api} 251`}
                        strokeDashoffset={`${-2.51 * (systemResources.costs.breakdown.compute + systemResources.costs.breakdown.storage)}`}
                        transform="rotate(-90 50 50)" />

                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-xs text-[#A0A0A8]">Today</div>
                      <div className="font-['JetBrains_Mono'] text-lg font-bold">
                        ${costCounter.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#00E5FF] rounded-full mr-1"></div>
                      <span>Compute</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#00FF88] rounded-full mr-1"></div>
                      <span>Storage</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#FFB000] rounded-full mr-1"></div>
                      <span>API</span>
                    </div>
                  </div>
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
// Component for metric cards
const MetricCard = ({ label, value, icon, color = 'white' }) => {
  return (
    <div className="bg-[#131316] rounded-md p-3">
      <div className="flex justify-between items-start mb-1">
        <div className="text-xs text-[#A0A0A8]">{label}</div>
        <div
          style={{
            color
          }}>

          {icon}
        </div>
      </div>
      <div
        className="font-['JetBrains_Mono'] text-xl font-bold"
        style={{
          color
        }}>

        {value}
      </div>
    </div>);

};
export default AIAgentControl;