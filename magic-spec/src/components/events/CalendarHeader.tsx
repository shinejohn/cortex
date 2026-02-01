import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
export const CalendarHeader = ({ selectedDate, setSelectedDate, events }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Get month and year for display
  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  // Go to previous month
  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  // Go to next month
  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };
  // Go to this weekend (next Saturday)
  const goToWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    // Calculate days until next Saturday
    const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    setCurrentMonth(nextSaturday);
    setSelectedDate(nextSaturday);
  };
  // Generate days for the calendar
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
    // Calendar rows need to accommodate first day offset and all days in month
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    const days = [];
    // Add previous month's days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date: prevMonthDay,
        dayOfMonth: prevMonthDay.getDate(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasEvents: hasEventsOnDate(prevMonthDay)
      });
    }
    // Add current month's days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
      const isSelected =
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
      days.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday,
        isSelected,
        hasEvents: hasEventsOnDate(date)
      });
    }
    // Add next month's days to fill remaining cells
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        dayOfMonth: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasEvents: hasEventsOnDate(nextMonthDay)
      });
    }
    return days;
  };
  // Check if a date has events
  const hasEventsOnDate = (date) => {
    return events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear());

    });
  };
  // Get event count for a date
  const getEventCountForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear());

    }).length;
  };
  // Handle day click
  const handleDayClick = (day) => {
    setSelectedDate(day.date);
  };
  const calendarDays = generateCalendarDays();
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Calendar header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-gray-800">{monthYear}</h2>
          <div className="ml-4 flex space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">

              Today
            </button>
            <button
              onClick={goToWeekend}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">

              This Weekend
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100">

            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100">

            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      {/* Calendar grid */}
      <div className="p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) =>
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500">

              {day}
            </div>
          )}
        </div>
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const eventCount = getEventCountForDate(day.date);
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  h-20 p-1 rounded-md border relative cursor-pointer transition-colors
                  ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                  ${day.isSelected ? 'border-news-primary' : 'border-gray-200'}
                  ${day.isToday ? 'font-bold' : ''}
                  hover:border-news-primary
                `}>

                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm ${day.isToday ? 'bg-news-primary text-white w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>

                    {day.dayOfMonth}
                  </span>
                  {day.hasEvents &&
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                      {eventCount}
                    </span>
                  }
                </div>
                {/* Event dots */}
                {day.hasEvents &&
                <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                    <div className="flex space-x-1">
                      {Array.from({
                      length: Math.min(eventCount, 3)
                    }).map((_, i) =>
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-news-primary" />

                    )}
                      {eventCount > 3 &&
                    <div className="text-xs text-news-primary">
                          +{eventCount - 3}
                        </div>
                    }
                    </div>
                  </div>
                }
              </div>);

          })}
        </div>
      </div>
    </div>);

};