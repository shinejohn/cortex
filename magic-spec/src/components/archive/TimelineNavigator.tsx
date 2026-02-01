import React, { useEffect, useState, Fragment } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export const TimelineNavigator = ({
  selectedDate,
  onDateSelect,
  sepiaMode
}) => {
  const [viewMode, setViewMode] = useState('decade'); // 'century', 'decade', 'year', 'month'
  const [activeYear, setActiveYear] = useState(selectedDate.getFullYear());
  const [activeMonth, setActiveMonth] = useState(selectedDate.getMonth());
  const [activityData, setActivityData] = useState([]);
  const [decades, setDecades] = useState([]);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  // Generate decades for the century view
  useEffect(() => {
    const currentCentury = Math.floor(activeYear / 100) * 100;
    const decadeList = [];
    for (let i = 0; i < 10; i++) {
      const decadeStart = currentCentury + i * 10;
      decadeList.push({
        label: `${decadeStart}s`,
        value: decadeStart,
        activityLevel: getRandomActivityLevel()
      });
    }
    setDecades(decadeList);
  }, [activeYear]);
  // Generate years for the decade view
  useEffect(() => {
    const currentDecade = Math.floor(activeYear / 10) * 10;
    const yearList = [];
    for (let i = 0; i < 10; i++) {
      const year = currentDecade + i;
      yearList.push({
        label: year.toString(),
        value: year,
        activityLevel: getRandomActivityLevel()
      });
    }
    setYears(yearList);
  }, [activeYear]);
  // Generate months for the year view
  useEffect(() => {
    const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'];

    const monthList = monthNames.map((name, index) => ({
      label: name,
      value: index,
      activityLevel: getRandomActivityLevel()
    }));
    setMonths(monthList);
  }, [activeYear]);
  // Generate activity data for the timeline
  useEffect(() => {
    // In a real application, this would fetch actual data from an API
    // For this demo, we'll generate random data
    if (viewMode === 'month') {
      // Generate daily activity for the selected month
      const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
      const dailyActivity = [];
      for (let i = 1; i <= daysInMonth; i++) {
        dailyActivity.push({
          day: i,
          activity: Math.floor(Math.random() * 100)
        });
      }
      setActivityData(dailyActivity);
    } else {
      // Generate monthly activity for the selected year
      const monthlyActivity = [];
      for (let i = 0; i < 12; i++) {
        monthlyActivity.push({
          month: i,
          activity: Math.floor(Math.random() * 100)
        });
      }
      setActivityData(monthlyActivity);
    }
  }, [viewMode, activeYear, activeMonth]);
  // Handle navigation between different time periods
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'century':
        // Go to previous century
        setActiveYear(activeYear - 100);
        break;
      case 'decade':
        // Go to previous decade
        setActiveYear(activeYear - 10);
        break;
      case 'year':
        // Go to previous year
        setActiveYear(activeYear - 1);
        break;
      case 'month':
        // Go to previous month
        if (activeMonth === 0) {
          setActiveMonth(11);
          setActiveYear(activeYear - 1);
        } else {
          setActiveMonth(activeMonth - 1);
        }
        break;
    }
  };
  const navigateNext = () => {
    switch (viewMode) {
      case 'century':
        // Go to next century
        setActiveYear(activeYear + 100);
        break;
      case 'decade':
        // Go to next decade
        setActiveYear(activeYear + 10);
        break;
      case 'year':
        // Go to next year
        setActiveYear(activeYear + 1);
        break;
      case 'month':
        // Go to next month
        if (activeMonth === 11) {
          setActiveMonth(0);
          setActiveYear(activeYear + 1);
        } else {
          setActiveMonth(activeMonth + 1);
        }
        break;
    }
  };
  // Handle selection of a specific time period
  const handleDecadeSelect = (decade) => {
    setActiveYear(decade);
    setViewMode('decade');
  };
  const handleYearSelect = (year) => {
    setActiveYear(year);
    setViewMode('year');
  };
  const handleMonthSelect = (month) => {
    setActiveMonth(month);
    setViewMode('month');
  };
  const handleDaySelect = (day) => {
    const newDate = new Date(activeYear, activeMonth, day);
    onDateSelect(newDate);
  };
  // Render the timeline view based on the current viewMode
  const renderTimelineView = () => {
    switch (viewMode) {
      case 'century':
        return (
          <div className="grid grid-cols-2 gap-2">
            {decades.map((decade) =>
            <button
              key={decade.value}
              onClick={() => handleDecadeSelect(decade.value)}
              className={`p-3 rounded-md text-center ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'} transition-colors relative`}>

                <div className="font-medium">{decade.label}</div>
                <div
                className={`h-1 mt-1 rounded-full ${sepiaMode ? 'bg-amber-800' : 'bg-news-primary'} bg-opacity-60`}
                style={{
                  width: `${decade.activityLevel}%`
                }}>
              </div>
              </button>
            )}
          </div>);

      case 'decade':
        return (
          <div className="grid grid-cols-2 gap-2">
            {years.map((year) =>
            <button
              key={year.value}
              onClick={() => handleYearSelect(year.value)}
              className={`p-3 rounded-md text-center ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'} transition-colors ${activeYear === year.value ? sepiaMode ? 'bg-amber-100' : 'bg-blue-50' : ''}`}>

                <div className="font-medium">{year.label}</div>
                <div
                className={`h-1 mt-1 rounded-full ${sepiaMode ? 'bg-amber-800' : 'bg-news-primary'} bg-opacity-60`}
                style={{
                  width: `${year.activityLevel}%`
                }}>
              </div>
              </button>
            )}
          </div>);

      case 'year':
        return (
          <div className="grid grid-cols-3 gap-2">
            {months.map((month) =>
            <button
              key={month.value}
              onClick={() => handleMonthSelect(month.value)}
              className={`p-2 rounded-md text-center ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'} transition-colors ${activeMonth === month.value ? sepiaMode ? 'bg-amber-100' : 'bg-blue-50' : ''}`}>

                <div className="font-medium text-sm">{month.label}</div>
                <div
                className={`h-1 mt-1 rounded-full ${sepiaMode ? 'bg-amber-800' : 'bg-news-primary'} bg-opacity-60`}
                style={{
                  width: `${month.activityLevel}%`
                }}>
              </div>
              </button>
            )}
          </div>);

      case 'month':
        const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(activeYear, activeMonth, 1).getDay();
        // Create array for days of the week headers
        const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        // Create array for calendar days
        const days = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
          days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
          days.push(i);
        }
        return (
          <div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day of week headers */}
              {weekDays.map((day) =>
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 p-1">

                  {day}
                </div>
              )}
              {/* Calendar days */}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="p-1"></div>;
                }
                const isSelected =
                selectedDate.getFullYear() === activeYear &&
                selectedDate.getMonth() === activeMonth &&
                selectedDate.getDate() === day;
                // Find activity level for this day
                const dayActivity = activityData.find((d) => d.day === day);
                const activityLevel = dayActivity ? dayActivity.activity : 0;
                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => handleDaySelect(day)}
                    className={`p-1 rounded-md text-center relative ${isSelected ? sepiaMode ? 'bg-amber-200' : 'bg-blue-100' : sepiaMode ? 'hover:bg-amber-100' : 'hover:bg-gray-100'}`}>

                    <div className="text-sm">{day}</div>
                    {activityLevel > 0 &&
                    <div
                      className={`h-1 mt-0.5 mx-auto rounded-full ${sepiaMode ? 'bg-amber-800' : 'bg-news-primary'} bg-opacity-60`}
                      style={{
                        width: `${Math.min(100, activityLevel)}%`
                      }}>
                    </div>
                    }
                  </button>);

              })}
            </div>
          </div>);

      default:
        return null;
    }
  };
  // Get the current view title
  const getViewTitle = () => {
    switch (viewMode) {
      case 'century':
        const century = Math.floor(activeYear / 100) * 100;
        return `${century}s - ${century + 99}`;
      case 'decade':
        const decade = Math.floor(activeYear / 10) * 10;
        return `${decade}s`;
      case 'year':
        return activeYear.toString();
      case 'month':
        const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'];

        return `${monthNames[activeMonth]} ${activeYear}`;
      default:
        return '';
    }
  };
  // Render the breadcrumb navigation
  const renderBreadcrumbs = () => {
    const items = [];
    // Add century breadcrumb
    const century = Math.floor(activeYear / 100) * 100;
    items.push({
      label: `${century}s`,
      view: 'century'
    });
    // Add decade breadcrumb if we're in decade view or deeper
    if (viewMode !== 'century') {
      const decade = Math.floor(activeYear / 10) * 10;
      items.push({
        label: `${decade}s`,
        view: 'decade'
      });
    }
    // Add year breadcrumb if we're in year view or deeper
    if (viewMode === 'year' || viewMode === 'month') {
      items.push({
        label: activeYear.toString(),
        view: 'year'
      });
    }
    // Add month breadcrumb if we're in month view
    if (viewMode === 'month') {
      const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'];

      items.push({
        label: monthNames[activeMonth],
        view: 'month'
      });
    }
    return (
      <div className="flex items-center text-sm mb-2">
        {items.map((item, index) =>
        <Fragment key={item.view}>
            <button
            onClick={() => setViewMode(item.view)}
            className={`hover:underline ${sepiaMode ? 'text-amber-800' : 'text-news-primary'}`}>

              {item.label}
            </button>
            {index < items.length - 1 &&
          <span className="mx-1 text-gray-500">/</span>
          }
          </Fragment>
        )}
      </div>);

  };
  return (
    <div
      className={`rounded-lg shadow-md p-4 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

      <h3 className="font-bold text-gray-900 mb-2">Timeline Navigator</h3>
      {/* Breadcrumb navigation */}
      {renderBreadcrumbs()}
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={navigatePrevious}
          className={`p-1 rounded-full ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h4 className="text-lg font-medium text-gray-800">{getViewTitle()}</h4>
        <button
          onClick={navigateNext}
          className={`p-1 rounded-full ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      {/* Timeline visualization */}
      <div className="mb-4">
        <div className="h-16 relative">
          {activityData.map((item, index) => {
            const key =
            'day' in item ? `day-${item.day}` : `month-${item.month}`;
            const position = index / (activityData.length - 1) * 100;
            return (
              <div
                key={key}
                className={`absolute bottom-0 w-1 ${sepiaMode ? 'bg-amber-800' : 'bg-news-primary'} rounded-t`}
                style={{
                  height: `${item.activity}%`,
                  left: `${position}%`,
                  transform: 'translateX(-50%)'
                }}>
              </div>);

          })}
        </div>
      </div>
      {/* Time period selection */}
      <div>{renderTimelineView()}</div>
      {/* Jump to date */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Jump to specific date
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className={`flex-1 px-3 py-2 border ${sepiaMode ? 'border-amber-300 bg-amber-50' : 'border-gray-300 bg-white'} rounded-md text-sm`}
            max={new Date().toISOString().split('T')[0]}
            min="1900-01-01"
            onChange={(e) => onDateSelect(new Date(e.target.value))} />

          <button
            onClick={() => onDateSelect(new Date())}
            className={`px-3 py-2 text-sm ${sepiaMode ? 'bg-amber-200 text-amber-800 hover:bg-amber-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-md`}>

            Today
          </button>
        </div>
      </div>
    </div>);

};
// Helper function to generate random activity level
const getRandomActivityLevel = () => {
  return Math.floor(Math.random() * 100);
};