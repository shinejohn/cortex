import React, { Component } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommunitySelector } from '../../../components/location/CommunitySelector';
import { LocationDetector } from '../../../components/location/LocationDetector';
// Mock the useLocationDetection hook
jest.mock('../../../components/location/LocationDetector', () => ({
  useLocationDetection: jest.fn(() => ({
    locationData: {
      city: 'Clearwater',
      state: 'FL',
      country: 'US',
      communityId: 'clearwater-fl-us',
      coordinates: {
        latitude: 27.9659,
        longitude: -82.8001
      }
    },
    updateLocation: jest.fn()
  }))
}));
describe('CommunitySelector Component', () => {
  test('renders current location correctly', () => {
    render(<CommunitySelector />);
    expect(screen.getByText('Clearwater, FL')).toBeInTheDocument();
  });
  test('opens dropdown when clicked', () => {
    render(<CommunitySelector />);
    // Click the selector button
    fireEvent.click(screen.getByText('Clearwater, FL'));
    // Check if dropdown content is visible
    expect(screen.getByText('Your Community')).toBeInTheDocument();
    expect(screen.getByText('POPULAR COMMUNITIES')).toBeInTheDocument();
  });
  test('shows search results when searching', async () => {
    render(<CommunitySelector />);
    // Open the dropdown
    fireEvent.click(screen.getByText('Clearwater, FL'));
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search communities...');
    fireEvent.change(searchInput, {
      target: {
        value: 'tampa'
      }
    });
    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('SEARCH RESULTS')).toBeInTheDocument();
      expect(screen.getByText('Tampa, FL')).toBeInTheDocument();
    });
  });
  test('closes dropdown when selecting a community', async () => {
    const mockUpdateLocation = jest.fn();
    jest.
    spyOn(
      require('../../../components/location/LocationDetector'),
      'useLocationDetection'
    ).
    mockReturnValue({
      locationData: {
        city: 'Clearwater',
        state: 'FL',
        country: 'US'
      },
      updateLocation: mockUpdateLocation
    });
    render(<CommunitySelector />);
    // Open the dropdown
    fireEvent.click(screen.getByText('Clearwater, FL'));
    // Click on a community
    fireEvent.click(screen.getByText('Tampa, FL'));
    // Check if updateLocation was called
    expect(mockUpdateLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Tampa',
        state: 'FL',
        country: 'US'
      })
    );
    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText('Your Community')).not.toBeInTheDocument();
    });
  });
});