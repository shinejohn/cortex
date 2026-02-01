import React, { Component } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventsCalendarPage } from '../../../components/events/EventsCalendarPage';
import { LocationDetector } from '../../../components/location/LocationDetector';
// Mock the StickyNav component
jest.mock('../../../components/navigation/StickyNav', () => ({
  StickyNav: () => <div data-testid="sticky-nav">Sticky Nav</div>
}));
// Mock the HeroSection component
jest.mock('../../../components/hero/HeroSection', () => ({
  HeroSection: ({ greeting, location, activeReaders }) =>
  <div data-testid="hero-section">
      {greeting} {location} - {activeReaders} readers
    </div>

}));
// Mock the useLocationDetection hook
jest.mock('../../../components/location/LocationDetector', () => ({
  useLocationDetection: jest.fn(() => ({
    locationData: {
      city: 'Clearwater',
      state: 'FL',
      country: 'US'
    }
  }))
}));
describe('EventsCalendarPage Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  test('renders the page title correctly', async () => {
    render(<EventsCalendarPage />);
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
  });
  test('shows loading state initially', () => {
    render(<EventsCalendarPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  test('displays events after loading', async () => {
    render(<EventsCalendarPage />);
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Clearwater Jazz Holiday')).toBeInTheDocument();
      expect(screen.getByText('Farmers Market')).toBeInTheDocument();
    });
  });
  test('filters events when searching', async () => {
    render(<EventsCalendarPage />);
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    // Type in search input
    const searchInput = screen.getByPlaceholderText(
      'Search events by title, location, category...'
    );
    fireEvent.change(searchInput, {
      target: {
        value: 'jazz'
      }
    });
    await waitFor(() => {
      // Should show Jazz Holiday but not Farmers Market
      expect(screen.getByText('Clearwater Jazz Holiday')).toBeInTheDocument();
      expect(screen.queryByText('Farmers Market')).not.toBeInTheDocument();
    });
  });
  test('sorts events when changing sort option', async () => {
    render(<EventsCalendarPage />);
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    // Open sort dropdown
    fireEvent.click(screen.getByText('Date (Earliest First)'));
    // Select "Date (Latest First)"
    fireEvent.click(screen.getByText('Date (Latest First)'));
    await waitFor(() => {
      // Check if sort option has changed
      expect(screen.getByText('Date (Latest First)')).toBeInTheDocument();
      // First event should now be the latest one
      const eventTitles = screen.getAllByText(
        /^(Clearwater Jazz Holiday|Farmers Market|Beach Cleanup Day|Art Walk|Summer Concert Series)$/
      );
      expect(eventTitles[0].textContent).toBe('Clearwater Jazz Holiday');
    });
  });
});