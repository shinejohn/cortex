import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react';
const AuthorsReportPage = () => {
  const mockData = [
  {
    month: 'Jan',
    articles: 45,
    authors: 12
  },
  {
    month: 'Feb',
    articles: 52,
    authors: 15
  },
  {
    month: 'Mar',
    articles: 38,
    authors: 11
  },
  {
    month: 'Apr',
    articles: 61,
    authors: 18
  },
  {
    month: 'May',
    articles: 55,
    authors: 16
  },
  {
    month: 'Jun',
    articles: 67,
    authors: 20
  }];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Authors Report
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Total Authors
                  </p>
                  <p className="text-2xl font-bold text-blue-900">156</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Active Authors
                  </p>
                  <p className="text-2xl font-bold text-green-900">89</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">
                    Articles This Month
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">67</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Avg Articles/Author
                  </p>
                  <p className="text-2xl font-bold text-purple-900">3.2</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Articles & Authors Over Time
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="articles" fill="#3B82F6" name="Articles" />
                  <Bar dataKey="authors" fill="#10B981" name="Active Authors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export default AuthorsReportPage;