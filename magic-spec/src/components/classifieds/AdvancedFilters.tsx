import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
export const AdvancedFilters = ({ filters, setFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    condition: true,
    distance: true,
    posted: true,
    other: true
  });
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  const handlePriceRangeChange = (min, max) => {
    setFilters({
      ...filters,
      priceRange: [min, max]
    });
  };
  const handleConditionToggle = (condition) => {
    const currentConditions = [...filters.condition];
    if (currentConditions.includes(condition)) {
      setFilters({
        ...filters,
        condition: currentConditions.filter((c) => c !== condition)
      });
    } else {
      setFilters({
        ...filters,
        condition: [...currentConditions, condition]
      });
    }
  };
  const handleDistanceChange = (distance) => {
    setFilters({
      ...filters,
      distance
    });
  };
  const handlePostedWithinChange = (timeframe) => {
    setFilters({
      ...filters,
      postedWithin: timeframe
    });
  };
  const handleToggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };
  const formatPrice = (price) => {
    return `$${price.toLocaleString()}`;
  };
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Filters</h3>
      </div>
      <div className="p-4 space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-700"
            onClick={() => toggleSection('price')}>

            <span>Price Range</span>
            {expandedSections.price ?
            <ChevronUp className="h-4 w-4 text-gray-500" /> :

            <ChevronDown className="h-4 w-4 text-gray-500" />
            }
          </button>
          {expandedSections.price &&
          <div className="pt-2">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
              <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.priceRange[1]}
              onChange={(e) =>
              handlePriceRangeChange(
                filters.priceRange[0],
                parseInt(e.target.value)
              )
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />

              <div className="flex space-x-2 mt-3">
                <input
                type="number"
                min="0"
                max={filters.priceRange[1]}
                value={filters.priceRange[0]}
                onChange={(e) =>
                handlePriceRangeChange(
                  parseInt(e.target.value),
                  filters.priceRange[1]
                )
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                placeholder="Min" />

                <span className="text-gray-500 self-center">to</span>
                <input
                type="number"
                min={filters.priceRange[0]}
                value={filters.priceRange[1]}
                onChange={(e) =>
                handlePriceRangeChange(
                  filters.priceRange[0],
                  parseInt(e.target.value)
                )
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                placeholder="Max" />

              </div>
            </div>
          }
        </div>
        {/* Condition */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-700"
            onClick={() => toggleSection('condition')}>

            <span>Condition</span>
            {expandedSections.condition ?
            <ChevronUp className="h-4 w-4 text-gray-500" /> :

            <ChevronDown className="h-4 w-4 text-gray-500" />
            }
          </button>
          {expandedSections.condition &&
          <div className="pt-2 space-y-2">
              <ConditionCheckbox
              label="New"
              id="new"
              checked={filters.condition.includes('new')}
              onChange={() => handleConditionToggle('new')} />

              <ConditionCheckbox
              label="Like New"
              id="likeNew"
              checked={filters.condition.includes('likeNew')}
              onChange={() => handleConditionToggle('likeNew')} />

              <ConditionCheckbox
              label="Good"
              id="good"
              checked={filters.condition.includes('good')}
              onChange={() => handleConditionToggle('good')} />

              <ConditionCheckbox
              label="Fair"
              id="fair"
              checked={filters.condition.includes('fair')}
              onChange={() => handleConditionToggle('fair')} />

              <ConditionCheckbox
              label="Salvage"
              id="salvage"
              checked={filters.condition.includes('salvage')}
              onChange={() => handleConditionToggle('salvage')} />

            </div>
          }
        </div>
        {/* Distance */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-700"
            onClick={() => toggleSection('distance')}>

            <span>Distance</span>
            {expandedSections.distance ?
            <ChevronUp className="h-4 w-4 text-gray-500" /> :

            <ChevronDown className="h-4 w-4 text-gray-500" />
            }
          </button>
          {expandedSections.distance &&
          <div className="pt-2">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                <span>0 mi</span>
                <span>{filters.distance} mi</span>
              </div>
              <input
              type="range"
              min="1"
              max="50"
              value={filters.distance}
              onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Nearby</span>
                <span>Anywhere</span>
              </div>
            </div>
          }
        </div>
        {/* Posted Within */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-700"
            onClick={() => toggleSection('posted')}>

            <span>Posted Within</span>
            {expandedSections.posted ?
            <ChevronUp className="h-4 w-4 text-gray-500" /> :

            <ChevronDown className="h-4 w-4 text-gray-500" />
            }
          </button>
          {expandedSections.posted &&
          <div className="pt-2 space-y-2">
              <TimeframeRadio
              label="Any time"
              id="any"
              checked={filters.postedWithin === 'any'}
              onChange={() => handlePostedWithinChange('any')} />

              <TimeframeRadio
              label="Past 24 hours"
              id="24h"
              checked={filters.postedWithin === '24h'}
              onChange={() => handlePostedWithinChange('24h')} />

              <TimeframeRadio
              label="Past 3 days"
              id="3d"
              checked={filters.postedWithin === '3d'}
              onChange={() => handlePostedWithinChange('3d')} />

              <TimeframeRadio
              label="Past 7 days"
              id="7d"
              checked={filters.postedWithin === '7d'}
              onChange={() => handlePostedWithinChange('7d')} />

            </div>
          }
        </div>
        {/* Other Filters */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-700"
            onClick={() => toggleSection('other')}>

            <span>Other Filters</span>
            {expandedSections.other ?
            <ChevronUp className="h-4 w-4 text-gray-500" /> :

            <ChevronDown className="h-4 w-4 text-gray-500" />
            }
          </button>
          {expandedSections.other &&
          <div className="pt-2 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                type="checkbox"
                checked={filters.hasPhotos}
                onChange={() => handleToggleFilter('hasPhotos')}
                className="rounded text-news-primary focus:ring-news-primary" />

                <span className="text-sm text-gray-700">Has Photos Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                type="checkbox"
                checked={filters.verifiedSellers}
                onChange={() => handleToggleFilter('verifiedSellers')}
                className="rounded text-news-primary focus:ring-news-primary" />

                <span className="text-sm text-gray-700">
                  Verified Sellers Only
                </span>
              </label>
            </div>
          }
        </div>
        {/* Reset filters */}
        <button
          onClick={() =>
          setFilters({
            priceRange: [0, 5000],
            condition: [],
            distance: 25,
            postedWithin: 'any',
            hasPhotos: true,
            verifiedSellers: false
          })
          }
          className="w-full py-2 text-sm text-news-primary font-medium hover:underline">

          Reset All Filters
        </button>
      </div>
    </div>);

};
// Helper component for condition checkboxes
const ConditionCheckbox = ({ label, id, checked, onChange }) => {
  return (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
      <div
        className={`w-5 h-5 flex items-center justify-center rounded border ${checked ? 'bg-news-primary border-news-primary' : 'border-gray-300'}`}>

        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>);

};
// Helper component for timeframe radio buttons
const TimeframeRadio = ({ label, id, checked, onChange }) => {
  return (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
      <div
        className={`w-5 h-5 flex items-center justify-center rounded-full border ${checked ? 'border-news-primary' : 'border-gray-300'}`}>

        {checked &&
        <div className="w-3 h-3 rounded-full bg-news-primary"></div>
        }
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>);

};