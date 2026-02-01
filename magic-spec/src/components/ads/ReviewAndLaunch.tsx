import React, { useState } from 'react';
import {
  CreditCard,
  Calendar,
  Edit2,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Zap,
  Info,
  Users,
  BarChart2,
  DollarSign,
  CreditCard as CardIcon,
  Smartphone,
  Monitor,
  Eye,
  ArrowRight,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Briefcase,
  Send,
  Save,
  UserCheck,
  Clock as ClockIcon } from
'lucide-react';
import { Community } from './TargetCommunities';
import { AdPreview } from './AdPreview';
interface ReviewAndLaunchProps {
  adData: {
    title: string;
    image: any;
    bodyText: string;
    callToAction: string;
    destinationUrl: string;
  };
  adFormat: string;
  selectedCommunities: Community[];
  campaignDuration: number;
  startDate: Date;
  endDate: Date;
  dailyBudget: number;
  totalBudget: number;
  onEditAd: () => void;
  onEditCommunities: () => void;
  onEditSchedule: () => void;
}
export const ReviewAndLaunch: React.FC<ReviewAndLaunchProps> = ({
  adData,
  adFormat,
  selectedCommunities,
  campaignDuration,
  startDate,
  endDate,
  dailyBudget,
  totalBudget,
  onEditAd,
  onEditCommunities,
  onEditSchedule
}) => {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [expandedCommunity, setExpandedCommunity] = useState<string | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [additionalCredits, setAdditionalCredits] = useState<number>(
    Math.max(0, totalBudget - 250)
  );
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scheduleTime, setScheduleTime] = useState<string>('12:00');
  const [launchOption, setLaunchOption] = useState<string>('now');
  // Format numbers with commas and abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  // Format currency
  const formatCurrency = (amount: number): string => {
    return (
      '$' +
      amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }));

  };
  // Calculate total reach
  const calculateTotalReach = (): string => {
    const totalMembers = selectedCommunities.reduce(
      (sum, community) => sum + community.members,
      0
    );
    return formatNumber(totalMembers);
  };
  // Calculate estimated impressions
  const calculateEstimatedImpressions = (): string => {
    const minImpressions = Math.round(totalBudget * 250);
    const maxImpressions = Math.round(totalBudget * 300);
    return `${formatNumber(minImpressions)}-${formatNumber(maxImpressions)}`;
  };
  // Calculate estimated clicks
  const calculateEstimatedClicks = (): string => {
    const avgCTR = 0.025; // 2.5% average CTR
    const minImpressions = Math.round(totalBudget * 250);
    const maxImpressions = Math.round(totalBudget * 300);
    const minClicks = Math.round(minImpressions * 0.02); // 2% CTR
    const maxClicks = Math.round(maxImpressions * 0.03); // 3% CTR
    return `${formatNumber(minClicks)}-${formatNumber(maxClicks)}`;
  };
  // Toggle community details
  const toggleCommunityDetails = (communityId: string) => {
    if (expandedCommunity === communityId) {
      setExpandedCommunity(null);
    } else {
      setExpandedCommunity(communityId);
    }
  };
  // Handle launch options
  const handleLaunchOptionChange = (option: string) => {
    setLaunchOption(option);
    if (option === 'schedule') {
      setShowScheduleOptions(true);
    } else {
      setShowScheduleOptions(false);
    }
  };
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Review your community ad campaign
      </h1>
      <p className="text-gray-600 mb-6">
        Review your campaign details and make any final adjustments before
        launch
      </p>
      {/* Ad Preview Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ad Preview</h2>
          <button
            onClick={onEditAd}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">

            <Edit2 className="h-4 w-4 mr-1" />
            Edit Ad
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-2/3">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-end mb-3">
                <div className="flex bg-gray-200 rounded-md p-1">
                  <button
                    className={`px-3 py-1 rounded text-sm ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setPreviewDevice('desktop')}>

                    <Monitor className="h-4 w-4 inline mr-1" />
                    Desktop
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setPreviewDevice('mobile')}>

                    <Smartphone className="h-4 w-4 inline mr-1" />
                    Mobile
                  </button>
                </div>
              </div>
              <AdPreview
                adFormat={adFormat}
                adData={adData}
                device={previewDevice} />

            </div>
          </div>
          <div className="w-full md:w-1/3 bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Ad Details</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Format</div>
                <div className="font-medium">
                  {adFormat === 'standard' ?
                  'Standard Card' :
                  adFormat === 'compact' ?
                  'Compact Text Ad' :
                  adFormat === 'banner' ?
                  'Featured Banner' :
                  'Premium Showcase'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Title</div>
                <div className="font-medium">{adData.title}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Description</div>
                <div className="font-medium">{adData.bodyText}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Call to Action</div>
                <div className="font-medium">{adData.callToAction}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Destination URL
                </div>
                <div className="font-medium text-blue-600 truncate">
                  {adData.destinationUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Community Targeting Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Community Targeting
          </h2>
          <button
            onClick={onEditCommunities}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">

            <Edit2 className="h-4 w-4 mr-1" />
            Edit Communities
          </button>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 flex items-center">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <span className="font-medium text-blue-800">
              Total unique reach: Estimated {calculateTotalReach()} users
            </span>
            <span className="text-sm text-blue-700 ml-2">
              across {selectedCommunities.length} communities
            </span>
          </div>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {selectedCommunities.map((community) =>
          <div
            key={community.id}
            className="border border-gray-200 rounded-lg overflow-hidden">

              <div
              className="flex justify-between items-center p-3 bg-white cursor-pointer hover:bg-gray-50"
              onClick={() => toggleCommunityDetails(community.id)}>

                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-100">
                    {community.avatar ?
                  <img
                    src={community.avatar}
                    alt={community.name}
                    className="h-full w-full object-cover" /> :


                  <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                        {community.name.charAt(1)}
                      </div>
                  }
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {community.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatNumber(community.members)} members
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-gray-900 font-medium mr-3">
                    {formatCurrency(community.price)}/day
                  </div>
                  {expandedCommunity === community.id ?
                <ChevronUp className="h-5 w-5 text-gray-400" /> :

                <ChevronDown className="h-5 w-5 text-gray-400" />
                }
                </div>
              </div>
              {expandedCommunity === community.id &&
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                        Community Intelligence
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              Peak Activity Hours
                            </div>
                            <div className="text-xs text-gray-500">
                              Weekdays: 4pm-9pm, Weekends: 10am-2pm
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <BarChart2 className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              Top Performing Ad Types
                            </div>
                            <div className="text-xs text-gray-500">
                              Standard Card (3.2% CTR)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Users className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              Demographics
                            </div>
                            <div className="text-xs text-gray-500">
                              75% Male, 25-34 age range dominant
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                        Performance Metrics
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <Eye className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              Est. Daily Impressions
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(community.price * 250)}-
                              {formatNumber(community.price * 300)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Target className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              Est. Daily Clicks
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(community.price * 250 * 0.025)}{' '}
                              (avg. 2.5% CTR)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <TrendingUp className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              Growth Trend
                            </div>
                            <div className="text-xs text-gray-500">
                              +15% members in last 30 days
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            }
            </div>
          )}
        </div>
      </section>
      {/* Budget Summary Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Budget Summary
          </h2>
          <button
            onClick={onEditSchedule}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">

            <Edit2 className="h-4 w-4 mr-1" />
            Edit Schedule & Budget
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Daily Spend</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(dailyBudget)}/day
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Campaign Duration
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {campaignDuration} days
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Start Date</div>
                  <div className="font-medium">
                    {startDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">End Date</div>
                  <div className="font-medium">
                    {endDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-base font-medium text-gray-900">
                    Total Investment
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalBudget)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">
                Estimated Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">
                    Estimated Impressions
                  </div>
                  <div className="font-medium">
                    {calculateEstimatedImpressions()}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">Estimated Clicks</div>
                  <div className="font-medium">
                    {calculateEstimatedClicks()}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">Estimated CTR</div>
                  <div className="font-medium">2-3%</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">
                    Est. Cost per Click
                  </div>
                  <div className="font-medium">$0.15-$0.22</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Info className="h-4 w-4 text-blue-500 mr-1" />
                  Estimates based on historical performance of similar campaigns
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Payment Method Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Method
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium text-gray-900">Current Credits</div>
              <div className="text-xl font-semibold text-green-600">$250</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-blue-800">
                  Additional Credits Needed
                </div>
                <div className="font-semibold text-blue-800">
                  {formatCurrency(Math.max(0, totalBudget - 250))}
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 mr-3">
                  <input
                    type="number"
                    min={Math.max(0, totalBudget - 250)}
                    value={additionalCredits}
                    onChange={(e) =>
                    setAdditionalCredits(Number(e.target.value))
                    }
                    className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />

                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
                  Add Credits
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="font-medium text-gray-900 mb-2">
                Payment Options
              </div>
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <CardIcon className="h-5 w-5 text-gray-400 mx-3" />
                <span className="font-medium text-gray-900">
                  Credit/Debit Card
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <div className="mx-3 text-blue-600 font-bold text-lg">
                  Pay<span className="text-blue-800">Pal</span>
                </div>
                <span className="font-medium text-gray-900">PayPal</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="crypto"
                  checked={paymentMethod === 'crypto'}
                  onChange={() => setPaymentMethod('crypto')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <div className="mx-3 h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  ₿
                </div>
                <span className="font-medium text-gray-900">
                  Cryptocurrency
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wire"
                  checked={paymentMethod === 'wire'}
                  onChange={() => setPaymentMethod('wire')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <Briefcase className="h-5 w-5 text-gray-400 mx-3" />
                <div>
                  <span className="font-medium text-gray-900">
                    Wire Transfer
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    (for $1000+)
                  </span>
                </div>
              </label>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="font-medium text-gray-900 mb-3">Launch Options</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="launchOption"
                  value="now"
                  checked={launchOption === 'now'}
                  onChange={() => handleLaunchOptionChange('now')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <Zap className="h-5 w-5 text-yellow-500 mx-3" />
                <div>
                  <div className="font-medium text-gray-900">Launch Now</div>
                  <div className="text-xs text-gray-500">
                    Start your campaign immediately after payment
                  </div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="launchOption"
                  value="schedule"
                  checked={launchOption === 'schedule'}
                  onChange={() => handleLaunchOptionChange('schedule')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <Calendar className="h-5 w-5 text-blue-500 mx-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Schedule Launch
                  </div>
                  <div className="text-xs text-gray-500">
                    Pick a specific date and time to start
                  </div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="launchOption"
                  value="template"
                  checked={launchOption === 'template'}
                  onChange={() => handleLaunchOptionChange('template')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <Save className="h-5 w-5 text-purple-500 mx-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Save as Template
                  </div>
                  <div className="text-xs text-gray-500">
                    Save settings for future campaigns
                  </div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="launchOption"
                  value="approval"
                  checked={launchOption === 'approval'}
                  onChange={() => handleLaunchOptionChange('approval')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

                <UserCheck className="h-5 w-5 text-green-500 mx-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Get Team Approval
                  </div>
                  <div className="text-xs text-gray-500">
                    Send for review before launching
                  </div>
                </div>
              </label>
            </div>
            {showScheduleOptions &&
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Schedule Launch Time
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm text-blue-800 mb-1">
                      Date
                    </label>
                    <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />

                  </div>
                  <div>
                    <label className="block text-sm text-blue-800 mb-1">
                      Time
                    </label>
                    <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />

                  </div>
                </div>
                <div className="text-xs text-blue-700 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Campaign will launch at the specified time in your local
                  timezone
                </div>
              </div>
            }
          </div>
        </div>
      </section>
      {/* Launch Campaign Button */}
      <div className="flex justify-center">
        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700 flex items-center">
          {launchOption === 'now' ?
          <>
              <Zap className="mr-2 h-5 w-5" />
              Launch Campaign Now
            </> :
          launchOption === 'schedule' ?
          <>
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Campaign
            </> :
          launchOption === 'template' ?
          <>
              <Save className="mr-2 h-5 w-5" />
              Save Campaign Template
            </> :

          <>
              <Send className="mr-2 h-5 w-5" />
              Send for Approval
            </>
          }
        </button>
      </div>
      {/* Community Bundles Suggestions */}
      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended Community Bundles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium inline-block mb-2">
              TECH
            </div>
            <h3 className="font-medium text-gray-900 mb-1">
              Tech Starter Pack
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              10 tech communities for one low price
            </p>
            <div className="text-blue-600 font-semibold mb-2">$500/week</div>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 rounded-md text-sm">
              View Bundle
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium inline-block mb-2">
              GAMING
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Gaming Blast</h3>
            <p className="text-sm text-gray-500 mb-2">
              15 gaming communities with high engagement
            </p>
            <div className="text-blue-600 font-semibold mb-2">$750/week</div>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 rounded-md text-sm">
              View Bundle
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium inline-block mb-2">
              LOCAL
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Local Business</h3>
            <p className="text-sm text-gray-500 mb-2">
              50 city-specific communities for local reach
            </p>
            <div className="text-blue-600 font-semibold mb-2">$1000/week</div>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 rounded-md text-sm">
              View Bundle
            </button>
          </div>
        </div>
      </section>
    </div>);

};