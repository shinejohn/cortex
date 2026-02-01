import React, { useState } from 'react';
import { PlayIcon, PlusIcon, Edit2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { EditJournalistModal } from './EditJournalistModal';
export const JournalistsAdminPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentJournalist, setCurrentJournalist] = useState(null);
  const journalists = [
  {
    id: 1,
    avatar: "/image.png",

    name: 'Jordan Lee',
    mainGenre: 'The News Report',
    categories: 'Community, Economy / Business News, Culture & Entertainment',
    created: 'May 20, 2025'
  },
  {
    id: 2,
    avatar: "/image.png",

    name: 'Alex Morgan',
    mainGenre: 'The News Report',
    categories: 'Community, Politics, Arts, Culture & Entertainment',
    created: 'May 20, 2025'
  },
  {
    id: 3,
    avatar: "/image.png",

    name: 'Morgan Ellis',
    mainGenre: 'The Column and the Article',
    categories: 'Politics, Community, Economy / Business News',
    created: 'May 20, 2025'
  },
  {
    id: 4,
    avatar: "/image.png",

    name: 'Jordan Lee',
    mainGenre: 'The Column and the Article',
    categories: 'Community, Arts, Culture & Entertainment, Events',
    created: 'Jul 10, 2025'
  },
  {
    id: 5,
    avatar: "/image.png",

    name: 'Jordan Lee',
    mainGenre: 'The Column and the Article',
    categories: 'Sports, Community, Crime & Public Safety',
    created: 'Jul 10, 2025'
  },
  {
    id: 6,
    avatar: "/image.png",

    name: 'Jordan Kim',
    mainGenre: 'The Column and the Article',
    categories: 'Arts, Culture & Entertainment, Community, Education',
    created: 'Jul 10, 2025'
  },
  {
    id: 7,
    avatar: "/image.png",

    name: 'Jordan Liu',
    mainGenre: 'The Column and the Article',
    categories: 'Politics, Economy / Business News, Community',
    created: 'Jul 10, 2025'
  },
  {
    id: 8,
    avatar: "/image.png",

    name: 'Samuel Liu',
    mainGenre: 'The News Chronicle',
    categories: 'Politics, Economy / Business News, Community',
    created: 'Jul 10, 2025'
  },
  {
    id: 9,
    avatar: "/image.png",

    name: 'Jordan Park',
    mainGenre: 'The Column and the Article',
    categories: 'Economy / Business News, Community, Education',
    created: 'Jul 10, 2025'
  },
  {
    id: 10,
    avatar: "/image.png",

    name: 'Jordan Lee',
    mainGenre: 'The News Report',
    categories: 'Politics, Economy / Business News, Community',
    created: 'Jul 10, 2025'
  }];

  const cities = [
  {
    id: 1,
    name: 'Dunedin',
    state: 'Florida',
    status: 'Stopped',
    lastPost: 'Jun 17, 2025 at 12:33 pm',
    aiGeneratedNews: 1
  }];

  const handleEditJournalist = (journalist) => {
    setCurrentJournalist(journalist);
    setIsEditModalOpen(true);
  };
  const handleSaveJournalist = (updatedJournalist) => {
    // Here you would typically update the journalist in your data source
    console.log('Saving journalist:', updatedJournalist);
    // For now we'll just close the modal
    setIsEditModalOpen(false);
  };
  return (
    <div className="flex-1 overflow-auto bg-white">
      <PageHeader />
      <div className="mx-auto w-full px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Virtual Journalists Administration
        </h1>
        {/* Search and Filters */}
        <div className="mb-6 flex space-x-4">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search Journalists..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm focus:outline-none" />

          </div>
          <div className="w-1/3">
            <select className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm focus:outline-none">
              <option>Category</option>
            </select>
          </div>
          <div className="w-1/3">
            <select className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm focus:outline-none">
              <option>Perspective</option>
            </select>
          </div>
        </div>
        {/* Current Journalists Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Current Journalists
            </h2>
            <button
              onClick={() => {
                setCurrentJournalist(null);
                setIsEditModalOpen(true);
              }}
              className="flex items-center justify-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">

              <PlusIcon className="h-4 w-4" />
              Add New
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Avatar
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Main Genre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Categories
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {journalists.map((journalist) =>
                <tr key={journalist.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                        src={journalist.avatar}
                        alt={journalist.name}
                        className="h-full w-full object-cover" />

                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {journalist.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {journalist.mainGenre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {journalist.categories}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {journalist.created}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                        onClick={() => handleEditJournalist(journalist)}
                        className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">

                          Edit
                        </button>
                        <button className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* City News Automation Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              City News Automation
            </h2>
            <button className="flex items-center justify-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
              <PlusIcon className="h-4 w-4" />
              Add City to Automation
            </button>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Manage which cities receive daily AI-generated news and automatic
            Facebook posting.
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    City Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    State
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Last Post
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    AI-generated news
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cities.map((city) =>
                <tr key={city.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {city.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {city.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm text-gray-900">
                          {city.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {city.lastPost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                      type="text"
                      value={city.aiGeneratedNews}
                      className="w-16 rounded-md border border-gray-300 py-1 px-2 text-sm text-center"
                      readOnly />

                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="flex items-center justify-center rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Start
                        </button>
                        <button className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Promotion Banner */}
        <div className="rounded-lg bg-yellow-100 p-6 text-center">
          <div className="mb-2 text-lg font-medium text-gray-900">
            Free publication for 90 days for new users
          </div>
          <p className="mb-4 text-sm text-gray-700">
            Activate a special promotion to encourage new users they will be
            able to publish ads for free during their first 90 days on the
            platform.
            <br />
            This promotion will be automatically applied to all new accounts
            once enabled.
          </p>
          <button className="inline-flex items-center justify-center gap-1 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            <PlayIcon className="h-4 w-4" />
            Start promotion
          </button>
        </div>
      </div>
      {/* Edit Journalist Modal */}
      <EditJournalistModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        journalist={currentJournalist}
        onSave={handleSaveJournalist} />

    </div>);

};