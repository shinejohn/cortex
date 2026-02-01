import React from 'react';
export const DatabaseDictionary = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Database Dictionary
      </h1>
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Overview</h2>
        <p className="text-gray-700 mb-4">
          This document outlines the database structure for the Community News
          Application. The application uses a relational database model to store
          and manage data related to users, communities, news articles, events,
          businesses, classifieds, and more.
        </p>
      </div>
      {/* Users Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            1
          </span>
          Users
        </h2>
        <p className="text-gray-700 mb-4">
          Stores information about registered users of the application.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the user
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  email
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  User's email address
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Unique, Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  password
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (Hashed)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  User's password (stored securely)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  User's full name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  avatar
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (URL)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URL to user's profile picture
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  bio
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  User's biography or description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  communityId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to user's primary community
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Communities)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  role
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (Enum)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  User role (user, journalist, admin, etc.)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the user account was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  updatedAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the user profile was last updated
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Communities Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            2
          </span>
          Communities
        </h2>
        <p className="text-gray-700 mb-4">
          Stores information about different communities (cities, towns) covered
          by the application.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the community
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Name of the community (city/town)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  state
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  State or province
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  country
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Country code (e.g., US)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  coordinates
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Geographic coordinates (latitude, longitude)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  population
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Integer
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Population count
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  status
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (Enum)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Status of community coverage (active, stopped)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  image
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (URL)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Featured image for the community
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the community was added to the system
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Articles Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            3
          </span>
          Articles
        </h2>
        <p className="text-gray-700 mb-4">
          Stores news articles and content published on the platform.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the article
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  title
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Article headline
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  subtitle
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Article subheadline or summary
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  content
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Full article content
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  authorId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the author (user or journalist)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Users)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  communityId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the community the article belongs to
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Communities)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  categoryId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the article category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Categories)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  featuredImage
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (URL)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URL to the main article image
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Specific location related to the article
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  coordinates
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Geographic coordinates for the article location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  sourceReference
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Citation or reference for article sources
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  status
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (Enum)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Publication status (draft, published, archived)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  isAIGenerated
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Boolean
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Whether the article was generated by AI
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  viewCount
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Integer
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Number of times the article has been viewed
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: 0
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  publishedAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the article was published
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the article was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  updatedAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the article was last updated
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Journalists Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            4
          </span>
          Journalists
        </h2>
        <p className="text-gray-700 mb-4">
          Stores information about journalists (both real and AI-generated) who
          create content.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the journalist
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Journalist's name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  avatar
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (URL)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URL to journalist's profile picture
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  mainGenre
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Primary genre or publication style
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  categories
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Comma-separated list of covered categories
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  bio
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Journalist's biography
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  isAI
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Boolean
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Whether the journalist is AI-generated
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  userId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to user account (for real journalists)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Users), Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the journalist was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Events Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            5
          </span>
          Events
        </h2>
        <p className="text-gray-700 mb-4">
          Stores information about community events and activities.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the event
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  title
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Event title</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Detailed description of the event
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  date
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Date
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Event date</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  startTime
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Event start time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  endTime
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Event end time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Event venue or location name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  address
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Full address of the event location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  coordinates
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Geographic coordinates for the event location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  image
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (URL)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URL to the event image
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  organizer
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Name of the event organizer
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  price
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Decimal
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Event ticket or entry price
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: 0
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Event category (Music, Sports, etc.)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  featured
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Boolean
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Whether the event is featured
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: false
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  attendees
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Integer
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Number of people interested in attending
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: 0
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  communityId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the community the event belongs to
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Communities)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  userId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the user who created the event
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Users)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the event was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  updatedAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the event was last updated
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Businesses Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            6
          </span>
          Businesses
        </h2>
        <p className="text-gray-700 mb-4">
          Stores information about local businesses listed in the directory.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the business
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Primary business category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  subcategory
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business subcategory
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  address
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business address
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  coordinates
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Geographic coordinates for the business location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  phone
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business phone number
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  website
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business website URL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  hours
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business operating hours
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  images
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON (Array)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URLs to business images
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  rating
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Decimal
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Average rating (0-5)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: 0
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  reviewCount
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Integer
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Number of reviews
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: 0
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  priceRange
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Price range indicator ($, $$, $$$, etc.)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  isOpen
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Boolean
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Whether the business is currently open
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  hasSpecialOffer
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Boolean
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Whether the business has a special offer
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: false
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  specialOffer
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Description of special offer
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  communityId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the community the business belongs to
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Communities)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ownerId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the user who owns the business listing
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Users), Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the business listing was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  updatedAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the business listing was last updated
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Classifieds Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            7
          </span>
          Classifieds
        </h2>
        <p className="text-gray-700 mb-4">
          Stores classified listings for items, services, housing, and jobs.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the classified listing
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  title
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Listing title
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Detailed description of the listing
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Primary category (forSale, housing, jobs, services, community)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  price
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Decimal
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Price of item or service
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  priceDisplay
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Formatted price display (e.g., "$50/hr")
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  condition
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Item condition (new, likeNew, good, fair, salvage)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  photos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON (Array)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URLs to listing photos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Specific location within the community
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  distance
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Decimal
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Distance from city center (miles)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  sellerId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the user who created the listing
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Users)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  communityId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the community the listing belongs to
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Communities)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  featured
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Boolean
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Whether the listing is featured
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Default: false
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  status
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (Enum)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Listing status (active, pending, sold, expired)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the listing was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  expiresAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the listing expires
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Coupons Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            8
          </span>
          Coupons
        </h2>
        <p className="text-gray-700 mb-4">
          Stores promotional coupons and discounts from local businesses.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the coupon
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  code
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Coupon code</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  title
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Coupon title
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Detailed description of the coupon
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  discount
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Discount amount or percentage
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  businessId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the business offering the coupon
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Businesses)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  business
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Coupon category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  startDate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Date
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the coupon becomes valid
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  expiryDate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Date
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the coupon expires
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  location
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Location where the coupon is valid
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  address
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Business address
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  logo
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (URL)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URL to business logo
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  image
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String (URL)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URL to coupon image
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  terms
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  JSON (Array)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Terms and conditions for using the coupon
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  communityId
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Reference to the community the coupon belongs to
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Foreign Key (Communities)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the coupon was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  updatedAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the coupon was last updated
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Tags Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center mr-2 text-sm leading-8">
            9
          </span>
          Tags
        </h2>
        <p className="text-gray-700 mb-4">
          Stores tags used to categorize content across the application.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  id
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  UUID
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Unique identifier for the tag
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Primary Key
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Tag name</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required, Unique
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  slug
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  String
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  URL-friendly version of the tag name
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required, Unique
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Text
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Tag description
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Optional
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  createdAt
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  DateTime
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  When the tag was created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Required
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Relationship Tables */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Relationship Tables
        </h2>
        <p className="text-gray-700 mb-4">
          The following tables manage many-to-many relationships between
          entities.
        </p>
        {/* ArticleTags Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-gray-900">ArticleTags</h3>
          <p className="text-gray-700 mb-2">
            Links articles to tags (many-to-many relationship).
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Constraints
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    articleId
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Reference to an article
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Primary Key, Foreign Key (Articles)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    tagId
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Reference to a tag
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Primary Key, Foreign Key (Tags)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* EventTags Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-gray-900">EventTags</h3>
          <p className="text-gray-700 mb-2">
            Links events to tags (many-to-many relationship).
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Constraints
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    eventId
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Reference to an event
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Primary Key, Foreign Key (Events)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    tagId
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Reference to a tag
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Primary Key, Foreign Key (Tags)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* UserSavedItems Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-gray-900">
            UserSavedItems
          </h3>
          <p className="text-gray-700 mb-2">
            Tracks items (articles, events, businesses, etc.) saved by users.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Constraints
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    id
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Unique identifier for the saved item
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Primary Key
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    userId
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Reference to the user
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Foreign Key (Users)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    itemType
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    String (Enum)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Type of saved item (article, event, business, coupon, etc.)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Required
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    itemId
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    ID of the saved item
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Required
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    collectionId
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UUID
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Reference to a user's collection
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Optional, Foreign Key (Collections)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    createdAt
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    DateTime
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    When the item was saved
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Required
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Entity Relationship Diagram */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Entity Relationship Diagram
        </h2>
        <p className="text-gray-700 mb-4">
          The following diagram illustrates the relationships between the main
          entities in the database:
        </p>
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <p className="text-center text-gray-500 py-8">
            [Entity Relationship Diagram would be displayed here]
          </p>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p className="mb-2">Key relationships:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Users belong to Communities (many-to-one)</li>
            <li>
              Articles are written by Users/Journalists and belong to
              Communities (many-to-one)
            </li>
            <li>
              Events are created by Users and belong to Communities
              (many-to-one)
            </li>
            <li>Businesses belong to Communities (many-to-one)</li>
            <li>Articles have many Tags (many-to-many through ArticleTags)</li>
            <li>Events have many Tags (many-to-many through EventTags)</li>
            <li>
              Users can save various items (many-to-many through UserSavedItems)
            </li>
            <li>Coupons are offered by Businesses (many-to-one)</li>
          </ul>
        </div>
      </div>
    </div>);

};
export default DatabaseDictionary;