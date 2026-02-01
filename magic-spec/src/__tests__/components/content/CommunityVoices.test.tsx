import React, { Component } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommunityVoices } from '../../../components/content/CommunityVoices';
describe('CommunityVoices Component', () => {
  test('renders all articles when no category is provided', () => {
    const mockOnArticleClick = jest.fn();
    render(<CommunityVoices onArticleClick={mockOnArticleClick} />);
    expect(
      screen.getByText("Why Our City's Parks Need More Investment")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Local Business Owner: "Shop Local" Movement Changed My Life'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'How Our School System Can Better Prepare Students for the Future'
      )
    ).toBeInTheDocument();
  });
  test('filters articles based on category', () => {
    const mockOnArticleClick = jest.fn();
    render(
      <CommunityVoices
        category="Education"
        onArticleClick={mockOnArticleClick} />

    );
    // Should show only Education articles
    expect(
      screen.getByText(
        'How Our School System Can Better Prepare Students for the Future'
      )
    ).toBeInTheDocument();
    // Should not show other articles
    expect(
      screen.queryByText("Why Our City's Parks Need More Investment")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Local Business Owner: "Shop Local" Movement Changed My Life'
      )
    ).not.toBeInTheDocument();
  });
  test('shows empty state when no articles match category', () => {
    const mockOnArticleClick = jest.fn();
    render(
      <CommunityVoices category="Sports" onArticleClick={mockOnArticleClick} />
    );
    expect(
      screen.getByText('No community voices in this category.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Check back later for updates.')
    ).toBeInTheDocument();
  });
  test('calls onArticleClick when an article is clicked', () => {
    const mockOnArticleClick = jest.fn();
    render(<CommunityVoices onArticleClick={mockOnArticleClick} />);
    fireEvent.click(
      screen.getByText("Why Our City's Parks Need More Investment")
    );
    expect(mockOnArticleClick).toHaveBeenCalledTimes(1);
  });
});