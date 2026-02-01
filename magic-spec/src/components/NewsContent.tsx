import React from 'react';
import { MapPin, ThermometerIcon, Share2Icon } from 'lucide-react';
import { CategoryTabs } from './CategoryTabs';
import { NewsArticle } from './NewsArticle';
import { MarketplaceSection } from './MarketplaceSection';
import { AnnouncementsSection } from './AnnouncementsSection';
export const NewsContent = () => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-4 flex items-center text-sm text-gray-500">
          <MapPin className="mr-1 h-4 w-4" />
          <span className="mr-2">Dunedin</span>
          <ThermometerIcon className="mr-1 h-4 w-4" />
          <span>90.6°F</span>
          <div className="ml-auto">
            <div className="text-xs text-gray-500">Sat 2 August, 2025</div>
          </div>
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900">Dunedin Day News</h1>
        </div>
        <CategoryTabs />
        <div className="mt-8 grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <NewsArticle
              location="Dunedin, FL, US"
              title="Dunedin Maintains Steady Course with $89.2M Budget, Holds Millage Rate at 4.1345"
              category="Politics"
              date="Tue, Jul 20, 2025"
              description="The City of Dunedin has finalized its fiscal year 2026 budget, establishing a comprehensive $89.2 million spending plan that maintains the current millage rate."
              author="Alex Morgan"
              image="/image.png" />

            <NewsArticle
              location="Dunedin, FL, US"
              title="Dunedin Downtown Market: A Seasonal Community Hub Supporting Local Agriculture and Arts"
              category="Events"
              date="Mon, Jul 28, 2025"
              description="The Dunedin Downtown Market has become a cornerstone of community life in this historic Pinellas County city, operating on a seasonal schedule that allows residents and visitors to enjoy local produce and artisan goods."
              author="Jordan Lee"
              image="/image.png" />

            <NewsArticle
              location="Dunedin, FL, US"
              title="Dunedin Highlanders Football Team Secures Spot in United Football League for 2026 Season"
              category="Sports"
              date="Mon, Jul 28, 2025"
              description="The Dunedin Highlanders have officially secured their position in the United Football League for the upcoming 2026 season, marking a significant milestone for local sports."
              author="Jordan Lee"
              image="/image.png" />

          </div>
          <div className="col-span-1">
            <MarketplaceSection />
            <div className="mt-8">
              <AnnouncementsSection />
            </div>
          </div>
        </div>
      </div>
    </div>);

};