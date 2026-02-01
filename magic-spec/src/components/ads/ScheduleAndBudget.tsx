import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  AlertCircle,
  Info } from
'lucide-react';
import { Community } from './TargetCommunities';
interface ScheduleAndBudgetProps {
  selectedCommunities: Community[];
  onScheduleChange?: (startDate: Date, endDate: Date) => void;
}
export const ScheduleAndBudget: React.FC<ScheduleAndBudgetProps> = ({
  selectedCommunities,
  onScheduleChange
}) => {
  // Date selection state
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 7 days
    return date;
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDuration, setSelectedDuration] = useState<string>('7days');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [timezone, setTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'America/New_York';
    }
  });
  // Budget options state
  const [dailyBudgetCap, setDailyBudgetCap] = useState<string>('');
  const [totalBudgetCap, setTotalBudgetCap] = useState<string>('');
  const [pacing, setPacing] = useState<string>('standard');
  // Advanced scheduling state
  const [showAdvancedScheduling, setShowAdvancedScheduling] =
  useState<boolean>(false);
  const [dayParting, setDayParting] = useState<boolean>(false);
  const [activeHours, setActiveHours] = useState<number[]>(Array(24).fill(1));
  const [weekdayWeekendDiff, setWeekdayWeekendDiff] = useState<boolean>(false);
  const [weekdayBudget, setWeekdayBudget] = useState<number>(100);
  const [weekendBudget, setWeekendBudget] = useState<number>(100);
  const [communitySpecificSchedules, setCommunitySpecificSchedules] =
  useState<boolean>(false);
  const [expandedCommunity, setExpandedCommunity] = useState<string | null>(
    null
  );
  // Calculate campaign duration in days
  const calculateDurationDays = (): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  // Set duration based on quick option selection
  const handleDurationSelect = (duration: string) => {
    setSelectedDuration(duration);
    const newEndDate = new Date(startDate);
    switch (duration) {
      case '7days':
        newEndDate.setDate(startDate.getDate() + 6); // 7 days including start date
        break;
      case '14days':
        newEndDate.setDate(startDate.getDate() + 13); // 14 days including start date
        break;
      case '30days':
        newEndDate.setDate(startDate.getDate() + 29); // 30 days including start date
        break;
      case 'ongoing':
        newEndDate.setDate(startDate.getDate() + 89); // 90 days including start date
        break;
    }
    setEndDate(newEndDate);
    // Notify parent component about the change
    if (onScheduleChange) {
      onScheduleChange(startDate, newEndDate);
    }
  };
  // Handle calendar navigation
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  // Calculate total members across all selected communities
  const calculateTotalMembers = (): string => {
    const total = selectedCommunities.reduce(
      (sum, community) => sum + community.members,
      0
    );
    return formatNumber(total);
  };
  // Calculate daily cost across all selected communities
  const calculateDailyTotal = (): number => {
    return selectedCommunities.reduce(
      (sum, community) => sum + community.price,
      0
    );
  };
  // Calculate campaign total cost
  const calculateCampaignTotal = (): number => {
    const dailyTotal = calculateDailyTotal();
    const days = calculateDurationDays();
    return dailyTotal * days;
  };
  // Format number with commas and abbreviations
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
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    // Total days in month
    const daysInMonth = lastDay.getDate();
    const days = [];
    // Add previous month's days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isSelected: isDateInRange(prevMonthDay, startDate, endDate),
        isStart: isSameDate(prevMonthDay, startDate),
        isEnd: isSameDate(prevMonthDay, endDate)
      });
    }
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isSelected: isDateInRange(date, startDate, endDate),
        isStart: isSameDate(date, startDate),
        isEnd: isSameDate(date, endDate)
      });
    }
    // Calculate how many days from next month to add
    const remainingCells = 42 - days.length; // 6 rows of 7 days
    // Add next month's days
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isSelected: isDateInRange(nextMonthDay, startDate, endDate),
        isStart: isSameDate(nextMonthDay, startDate),
        isEnd: isSameDate(nextMonthDay, endDate)
      });
    }
    return days;
  };
  // Check if a date is within a range
  const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
    return (
      date >= new Date(start.setHours(0, 0, 0, 0)) &&
      date <= new Date(end.setHours(23, 59, 59, 999)));

  };
  // Check if two dates are the same day
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear());

  };
  // Handle day click in calendar
  const handleDayClick = (day: any) => {
    const newDate = day.date;
    // If we haven't selected a start date or we're resetting the range
    if (!startDate || startDate && endDate && newDate < startDate) {
      setStartDate(newDate);
      setEndDate(new Date(newDate));
      setEndDate((prev) => {
        const date = new Date(newDate);
        date.setDate(date.getDate() + 6); // Default to 7 days
        return date;
      });
      setSelectedDuration('custom');
      // Notify parent component about the change
      if (onScheduleChange) {
        const newEndDate = new Date(newDate);
        newEndDate.setDate(newDate.getDate() + 6);
        onScheduleChange(newDate, newEndDate);
      }
    }
    // If we're selecting an end date
    else if (newDate >= startDate) {
      setEndDate(newDate);
      setSelectedDuration('custom');
      // Notify parent component about the change
      if (onScheduleChange) {
        onScheduleChange(startDate, newDate);
      }
    }
  };
  // Toggle hour selection for day parting
  const toggleHour = (hour: number) => {
    setActiveHours((prev) => {
      const newHours = [...prev];
      newHours[hour] = newHours[hour] ? 0 : 1;
      return newHours;
    });
  };
  // Format month year for calendar header
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  const calendarDays = generateCalendarDays();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Set your campaign schedule and budget
      </h1>
      <p className="text-gray-600 mb-6">
        Choose when your ads will run and set your budget limits
      </p>
      {/* Campaign Duration Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Duration
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar and date selection */}
          <div className="w-full md:w-7/12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start and End Dates
                </label>
                <div
                  className="flex items-center border border-gray-300 rounded-md p-2 cursor-pointer"
                  onClick={() => setShowCalendar(!showCalendar)}>

                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {startDate.toLocaleDateString()} -{' '}
                    {endDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <div className="text-lg font-semibold text-blue-600">
                  {calculateDurationDays()} days
                </div>
              </div>
            </div>
            {/* Calendar */}
            {showCalendar &&
            <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
                <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between">
                  <button
                  onClick={goToPreviousMonth}
                  className="p-1 rounded-full hover:bg-gray-100">

                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h3 className="font-medium">
                    {formatMonthYear(currentMonth)}
                  </h3>
                  <button
                  onClick={goToNextMonth}
                  className="p-1 rounded-full hover:bg-gray-100">

                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="bg-white p-3">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(
                    (day, i) =>
                    <div
                      key={i}
                      className="text-center text-sm font-medium text-gray-500">

                          {day}
                        </div>

                  )}
                  </div>
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) =>
                  <div
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`
                          h-9 flex items-center justify-center text-sm rounded-md cursor-pointer
                          ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                          ${day.isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
                          ${day.isStart ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                          ${day.isEnd ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        `}>

                        {day.date.getDate()}
                      </div>
                  )}
                  </div>
                </div>
              </div>
            }
            {/* Time zone selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>
          </div>
          {/* Quick duration options */}
          <div className="w-full md:w-5/12">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Quick Options
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDurationSelect('7days')}
                className={`p-3 rounded-lg border text-center ${selectedDuration === '7days' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>

                <div className="font-medium">7 days</div>
                <div className="text-sm text-gray-500">1 week campaign</div>
              </button>
              <button
                onClick={() => handleDurationSelect('14days')}
                className={`p-3 rounded-lg border text-center ${selectedDuration === '14days' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>

                <div className="font-medium">14 days</div>
                <div className="text-sm text-gray-500">2 week campaign</div>
              </button>
              <button
                onClick={() => handleDurationSelect('30days')}
                className={`p-3 rounded-lg border text-center ${selectedDuration === '30days' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>

                <div className="font-medium">30 days</div>
                <div className="text-sm text-gray-500">1 month campaign</div>
              </button>
              <button
                onClick={() => handleDurationSelect('ongoing')}
                className={`p-3 rounded-lg border text-center ${selectedDuration === 'ongoing' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>

                <div className="font-medium">Ongoing</div>
                <div className="text-sm text-gray-500">90 day auto-renewal</div>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Budget Breakdown Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Budget Breakdown
        </h2>
        {selectedCommunities.length > 0 ?
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">
                    Community
                  </th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">
                    Members
                  </th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">
                    Daily Cost
                  </th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">
                    {calculateDurationDays()}-Day Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedCommunities.map((community) =>
              <tr
                key={community.id}
                className="border-b border-gray-200 hover:bg-gray-50">

                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-gray-100">
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
                        <span className="font-medium">{community.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {formatNumber(community.members)}
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency(community.price)}
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency(
                    community.price * calculateDurationDays()
                  )}
                    </td>
                  </tr>
              )}
                <tr className="bg-blue-50 font-medium">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4">{calculateTotalMembers()} reach</td>
                  <td className="py-3 px-4">
                    {formatCurrency(calculateDailyTotal())}/day
                  </td>
                  <td className="py-3 px-4 text-blue-700">
                    {formatCurrency(calculateCampaignTotal())}
                  </td>
                </tr>
              </tbody>
            </table>
          </div> :

        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">
              No communities selected. Please go back to the previous step.
            </p>
          </div>
        }
      </section>
      {/* Budget Options Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Budget Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Budget Cap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Budget Cap (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={dailyBudgetCap}
                onChange={(e) => setDailyBudgetCap(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

            </div>
            <p className="mt-1 text-sm text-gray-500">
              Pause campaigns if daily spend exceeds this amount
            </p>
          </div>
          {/* Total Budget Cap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Budget Cap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={totalBudgetCap}
                onChange={(e) => setTotalBudgetCap(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

            </div>
            <p className="mt-1 text-sm text-gray-500">
              Stop all campaigns when total reaches this amount
            </p>
          </div>
        </div>
        {/* Pacing Options */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Pacing</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="pacing"
                value="standard"
                checked={pacing === 'standard'}
                onChange={() => setPacing('standard')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

              <span className="ml-2 text-gray-700">
                Standard (even distribution)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="pacing"
                value="accelerated"
                checked={pacing === 'accelerated'}
                onChange={() => setPacing('accelerated')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500" />

              <span className="ml-2 text-gray-700">
                Accelerated (show ads as quickly as possible)
              </span>
            </label>
          </div>
          {pacing === 'accelerated' &&
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Accelerated pacing may use your daily budget more quickly and
                could result in uneven ad distribution throughout the day.
              </p>
            </div>
          }
        </div>
      </section>
      {/* Advanced Scheduling Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Advanced Scheduling
          </h2>
          <button
            onClick={() => setShowAdvancedScheduling(!showAdvancedScheduling)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium">

            {showAdvancedScheduling ? 'Hide options' : 'Show options'}
          </button>
        </div>
        {showAdvancedScheduling &&
        <div className="space-y-6">
            {/* Day Parting */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Day Parting
                </h3>
                <label className="flex items-center">
                  <input
                  type="checkbox"
                  checked={dayParting}
                  onChange={() => setDayParting(!dayParting)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />

                  <span className="ml-2 text-sm text-gray-700">
                    Enable hour targeting
                  </span>
                </label>
              </div>
              {dayParting &&
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Select hours when your ads should run
                    </span>
                  </div>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mt-3">
                    {Array.from({
                  length: 24
                }).map((_, i) =>
                <button
                  key={i}
                  onClick={() => toggleHour(i)}
                  className={`p-2 rounded text-center text-sm ${activeHours[i] ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>

                        {i === 0 ?
                  '12 AM' :
                  i < 12 ?
                  `${i} AM` :
                  i === 12 ?
                  '12 PM' :
                  `${i - 12} PM`}
                      </button>
                )}
                  </div>
                </div>
            }
            </div>
            {/* Weekday/Weekend Different Budgets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Weekday/Weekend Budgets
                </h3>
                <label className="flex items-center">
                  <input
                  type="checkbox"
                  checked={weekdayWeekendDiff}
                  onChange={() => setWeekdayWeekendDiff(!weekdayWeekendDiff)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />

                  <span className="ml-2 text-sm text-gray-700">
                    Set different budgets
                  </span>
                </label>
              </div>
              {weekdayWeekendDiff &&
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weekday Budget (Mon-Fri)
                    </label>
                    <div className="flex items-center">
                      <input
                    type="range"
                    min="10"
                    max="200"
                    value={weekdayBudget}
                    onChange={(e) =>
                    setWeekdayBudget(parseInt(e.target.value))
                    }
                    className="flex-grow mr-3" />

                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {weekdayBudget}% of base
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weekend Budget (Sat-Sun)
                    </label>
                    <div className="flex items-center">
                      <input
                    type="range"
                    min="10"
                    max="200"
                    value={weekendBudget}
                    onChange={(e) =>
                    setWeekendBudget(parseInt(e.target.value))
                    }
                    className="flex-grow mr-3" />

                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {weekendBudget}% of base
                      </span>
                    </div>
                  </div>
                </div>
            }
            </div>
            {/* Community-specific Schedules */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Community-specific Schedules
                </h3>
                <label className="flex items-center">
                  <input
                  type="checkbox"
                  checked={communitySpecificSchedules}
                  onChange={() =>
                  setCommunitySpecificSchedules(!communitySpecificSchedules)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />

                  <span className="ml-2 text-sm text-gray-700">
                    Set per-community schedules
                  </span>
                </label>
              </div>
              {communitySpecificSchedules &&
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Override global schedule settings for specific communities
                  </p>
                  <div className="space-y-2">
                    {selectedCommunities.map((community) =>
                <div
                  key={community.id}
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden">

                        <div
                    className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                    setExpandedCommunity(
                      expandedCommunity === community.id ?
                      null :
                      community.id
                    )
                    }>

                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-gray-100">
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
                            <span className="font-medium">
                              {community.name}
                            </span>
                          </div>
                          <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${expandedCommunity === community.id ? 'transform rotate-90' : ''}`} />

                        </div>
                        {expandedCommunity === community.id &&
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Budget Adjustment
                                </label>
                                <select className="w-full p-2 text-sm border border-gray-300 rounded-md">
                                  <option value="100">
                                    100% of base budget (default)
                                  </option>
                                  <option value="125">
                                    125% of base budget
                                  </option>
                                  <option value="150">
                                    150% of base budget
                                  </option>
                                  <option value="75">75% of base budget</option>
                                  <option value="50">50% of base budget</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Custom Schedule
                                </label>
                                <select className="w-full p-2 text-sm border border-gray-300 rounded-md">
                                  <option value="global">
                                    Use global schedule (default)
                                  </option>
                                  <option value="weekday">
                                    Weekdays only (Mon-Fri)
                                  </option>
                                  <option value="weekend">
                                    Weekends only (Sat-Sun)
                                  </option>
                                  <option value="custom">Custom days...</option>
                                </select>
                              </div>
                            </div>
                          </div>
                  }
                      </div>
                )}
                  </div>
                </div>
            }
            </div>
          </div>
        }
        {!showAdvancedScheduling &&
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Advanced scheduling allows you to target specific hours of the
              day, set different budgets for weekdays vs. weekends, and
              customize schedules for individual communities.
            </p>
          </div>
        }
      </section>
      {/* Campaign Summary */}
      <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Campaign Duration
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {calculateDurationDays()} days
            </p>
            <p className="text-sm text-gray-500">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Daily Budget
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculateDailyTotal())}/day
            </p>
            <p className="text-sm text-gray-500">
              {selectedCommunities.length} communities
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Campaign Cost
            </h3>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(calculateCampaignTotal())}
            </p>
            <p className="text-sm text-gray-500">
              Estimated {calculateTotalMembers()} member reach
            </p>
          </div>
        </div>
      </section>
    </div>);

};