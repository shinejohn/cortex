import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
export const ArchiveCalendar = ({ selectedDate, onDateSelect, sepiaMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [calendarDays, setCalendarDays] = useState([]);
  const [historicalEvents, setHistoricalEvents] = useState([]);
  // Generate calendar days when the month changes
  useEffect(() => {
    const days = generateCalendarDays(currentMonth);
    setCalendarDays(days);
    // Generate historical events for this month
    const events = generateHistoricalEvents(currentMonth);
    setHistoricalEvents(events);
  }, [currentMonth]);
  // Navigate to previous month
  const previousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  // Navigate to next month
  const nextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  // Format the month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  // Check if a day has a historical event
  const hasHistoricalEvent = (day) => {
    return historicalEvents.some(
      (event) =>
      event.date.getDate() === day &&
      event.date.getMonth() === currentMonth.getMonth() &&
      event.date.getFullYear() === currentMonth.getFullYear()
    );
  };
  // Get historical events for a specific day
  const getEventsForDay = (day) => {
    return historicalEvents.filter(
      (event) =>
      event.date.getDate() === day &&
      event.date.getMonth() === currentMonth.getMonth() &&
      event.date.getFullYear() === currentMonth.getFullYear()
    );
  };
  // Handle day click
  const handleDayClick = (day) => {
    if (!day.isCurrentMonth) {
      // If clicking on a day from previous/next month, navigate to that month
      const newDate = new Date(currentMonth);
      newDate.setMonth(
        day.isPreviousMonth ?
        currentMonth.getMonth() - 1 :
        currentMonth.getMonth() + 1
      );
      newDate.setDate(day.day);
      setCurrentMonth(newDate);
      onDateSelect(newDate);
    } else {
      // Select the clicked day in the current month
      const newDate = new Date(currentMonth);
      newDate.setDate(day.day);
      onDateSelect(newDate);
    }
  };
  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

      {/* Calendar header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <button
          onClick={previousMonth}
          className={`p-1 rounded-full ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {formatMonthYear(currentMonth)}
        </h3>
        <button
          onClick={nextMonth}
          className={`p-1 rounded-full ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      {/* Calendar grid */}
      <div className="p-4">
        {/* Day of week headers */}
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
            // Check if this day is selected
            const isSelected =
            selectedDate.getDate() === day.day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear() &&
            day.isCurrentMonth;
            // Check if this day has a historical event
            const hasEvent = day.isCurrentMonth && hasHistoricalEvent(day.day);
            // Check if this is today
            const isToday = day.isToday;
            // Get the story count for this day (random for demo)
            const storyCount = day.isCurrentMonth ?
            Math.floor(Math.random() * 10) :
            0;
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  h-16 p-1 relative cursor-pointer rounded-md border
                  ${day.isCurrentMonth ? isSelected ? sepiaMode ? 'bg-amber-200 border-amber-300' : 'bg-blue-100 border-blue-200' : sepiaMode ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' : 'bg-white border-gray-200 hover:bg-gray-50' : sepiaMode ? 'bg-amber-50/50 text-amber-800/50 border-amber-100/50' : 'bg-gray-50 text-gray-400 border-gray-200'}
                  ${isToday ? 'ring-2 ring-red-400' : ''}
                `}>

                <div className="text-right text-sm">{day.day}</div>
                {storyCount > 0 && day.isCurrentMonth &&
                <div
                  className={`absolute bottom-1 left-1 text-xs ${sepiaMode ? 'text-amber-800' : 'text-gray-600'}`}>

                    {storyCount} {storyCount === 1 ? 'story' : 'stories'}
                  </div>
                }
                {hasEvent &&
                <div
                  className={`absolute top-1 right-1 h-2 w-2 rounded-full ${sepiaMode ? 'bg-red-800' : 'bg-red-500'}`}>
                </div>
                }
              </div>);

          })}
        </div>
      </div>
      {/* Historical events for the selected date */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <Info className="h-4 w-4 mr-1 text-gray-500" />
          Historical Events on This Day
        </h4>
        {getEventsForDay(selectedDate.getDate()).length > 0 ?
        <div className="space-y-2">
            {getEventsForDay(selectedDate.getDate()).map((event, index) =>
          <div
            key={index}
            className={`text-sm p-2 rounded-md ${sepiaMode ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>

                <div className="font-medium">
                  {event.year}: {event.title}
                </div>
                {event.description &&
            <div className="text-gray-600 text-xs mt-1">
                    {event.description}
                  </div>
            }
              </div>
          )}
          </div> :

        <div className="text-sm text-gray-500 italic">
            No significant historical events recorded for this day.
          </div>
        }
      </div>
    </div>);

};
// Helper function to generate calendar days
const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  // Day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();
  // Total days in the month
  const daysInMonth = lastDay.getDate();
  // Days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek;
  // Days from next month to show
  const daysFromNextMonth = 42 - (daysFromPrevMonth + daysInMonth); // 42 = 6 rows of 7 days
  // Get days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = [];
  for (
  let i = prevMonthLastDay - daysFromPrevMonth + 1;
  i <= prevMonthLastDay;
  i++)
  {
    prevMonthDays.push({
      day: i,
      isCurrentMonth: false,
      isPreviousMonth: true,
      isNextMonth: false,
      isToday: false
    });
  }
  // Get days from current month
  const currentMonthDays = [];
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
    i === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();
    currentMonthDays.push({
      day: i,
      isCurrentMonth: true,
      isPreviousMonth: false,
      isNextMonth: false,
      isToday
    });
  }
  // Get days from next month
  const nextMonthDays = [];
  for (let i = 1; i <= daysFromNextMonth; i++) {
    nextMonthDays.push({
      day: i,
      isCurrentMonth: false,
      isPreviousMonth: false,
      isNextMonth: true,
      isToday: false
    });
  }
  // Combine all days
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
};
// Helper function to generate historical events
const generateHistoricalEvents = (date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  // Historical events by month
  const eventsByMonth = {
    0: [
    {
      day: 1,
      year: 1925,
      title: 'First issue of Clearwater News published'
    },
    {
      day: 15,
      year: 1967,
      title: 'First Super Bowl played in Los Angeles',
      description: 'The Green Bay Packers defeated the Kansas City Chiefs'
    }],

    1: [
    {
      day: 14,
      year: 1929,
      title: "St. Valentine's Day Massacre in Chicago"
    },
    {
      day: 20,
      year: 1962,
      title: 'John Glenn becomes first American to orbit Earth'
    }],

    2: [
    {
      day: 10,
      year: 1933,
      title: 'Long Beach earthquake damages Clearwater buildings'
    },
    {
      day: 30,
      year: 1981,
      title: 'President Reagan shot in assassination attempt'
    }],

    3: [
    {
      day: 12,
      year: 1945,
      title: 'President Roosevelt dies; Truman becomes president'
    },
    {
      day: 18,
      year: 1906,
      title: 'San Francisco earthquake and fire'
    }],

    4: [
    {
      day: 6,
      year: 1937,
      title: 'Hindenburg disaster in New Jersey'
    },
    {
      day: 27,
      year: 1937,
      title: 'Golden Gate Bridge opens in San Francisco'
    }],

    5: [
    {
      day: 6,
      year: 1944,
      title: 'D-Day invasion of Normandy'
    },
    {
      day: 25,
      year: 1950,
      title: 'Korean War begins'
    }],

    6: [
    {
      day: 4,
      year: 1776,
      title: 'Declaration of Independence adopted'
    },
    {
      day: 20,
      year: 1969,
      title: 'Apollo 11 astronauts land on the moon'
    }],

    7: [
    {
      day: 6,
      year: 1945,
      title: 'Atomic bomb dropped on Hiroshima'
    },
    {
      day: 16,
      year: 1977,
      title: 'Elvis Presley dies at Graceland'
    }],

    8: [
    {
      day: 11,
      year: 2001,
      title: 'Terrorist attacks on World Trade Center and Pentagon'
    },
    {
      day: 25,
      year: 1957,
      title: 'Central High School in Little Rock integrated'
    }],

    9: [
    {
      day: 29,
      year: 1929,
      title: 'Stock market crashes, beginning Great Depression'
    },
    {
      day: 12,
      year: 1492,
      title: 'Columbus reaches the Americas'
    }],

    10: [
    {
      day: 22,
      year: 1963,
      title: 'President Kennedy assassinated in Dallas'
    },
    {
      day: 9,
      year: 1989,
      title: 'Berlin Wall falls'
    }],

    11: [
    {
      day: 7,
      year: 1941,
      title: 'Japanese attack Pearl Harbor'
    },
    {
      day: 17,
      year: 1903,
      title: 'Wright brothers make first powered flight'
    }]

  };
  // Get events for the current month
  const monthEvents = eventsByMonth[month] || [];
  // Add local events specific to Clearwater
  const localEvents = [
  {
    month: 1,
    day: 15,
    year: 1925,
    title: 'Clearwater incorporated as a city'
  },
  {
    month: 3,
    day: 20,
    year: 1948,
    title: 'Clearwater Beach causeway opens'
  },
  {
    month: 6,
    day: 4,
    year: 1950,
    title: 'Clearwater Beach Pavilion opens to record crowds'
  },
  {
    month: 9,
    day: 23,
    year: 1921,
    title: 'Devastating hurricane hits Clearwater'
  },
  {
    month: 11,
    day: 5,
    year: 1963,
    title: 'Clearwater Public Library opens new building'
  }];

  // Add relevant local events to the month events
  localEvents.forEach((event) => {
    if (event.month === month) {
      monthEvents.push({
        day: event.day,
        year: event.year,
        title: event.title
      });
    }
  });
  // Convert to date objects
  return monthEvents.map((event) => ({
    ...event,
    date: new Date(year, month, event.day)
  }));
};