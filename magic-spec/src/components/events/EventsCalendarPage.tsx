import React from 'react';
// Mock data for events
export const mockEvents = [
{
  id: 1,
  title: 'Clearwater Farmers Market',
  description:
  'Weekly farmers market featuring local produce, crafts, and food vendors.',
  image:
  'https://images.unsplash.com/photo-1488330890490-c291ecf62571?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  date: '2025-08-05T09:00:00',
  time: '2025-08-05T09:00:00',
  endTime: '2025-08-05T14:00:00',
  location: 'Downtown Clearwater',
  address: '123 Main Street, Clearwater, FL 33755',
  organizer: 'Clearwater Community Association',
  category: 'Market',
  featured: true,
  price: 0,
  tags: ['food', 'shopping', 'family-friendly']
},
{
  id: 2,
  title: 'Beach Cleanup Day',
  description:
  'Join us for our monthly beach cleanup to keep Clearwater Beach beautiful.',
  image:
  'https://images.unsplash.com/photo-1531256379416-9f000e90aacc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  date: '2025-08-12T08:00:00',
  time: '2025-08-12T08:00:00',
  endTime: '2025-08-12T11:00:00',
  location: 'Clearwater Beach',
  address: 'Pier 60, Clearwater Beach, FL 33767',
  organizer: 'Clearwater Environmental Protection',
  category: 'Volunteer',
  featured: false,
  price: 0,
  tags: ['environment', 'community', 'outdoor']
}];

export const EventsCalendarPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Events Calendar</h1>
      <p>This is a placeholder for the Events Calendar Page.</p>
    </div>);

};