import React from 'react';
import { Newspaper, DollarSign, Wrench, CreditCard } from 'lucide-react';
export const DepartmentDirectory = () => {
  const departments = [
  {
    name: 'Editorial',
    icon: <Newspaper className="h-5 w-5 text-blue-600" />,
    description: 'For news tips, corrections, and editorial inquiries',
    email: 'editorial@day.news',
    phone: '(800) 555-1235',
    contactPerson: 'David Washington',
    title: 'Head of Journalism'
  },
  {
    name: 'Advertising',
    icon: <DollarSign className="h-5 w-5 text-green-600" />,
    description: 'For advertising opportunities and partnerships',
    email: 'ads@day.news',
    phone: '(800) 555-1236',
    contactPerson: 'Robert Taylor',
    title: 'Business Development'
  },
  {
    name: 'Technical Support',
    icon: <Wrench className="h-5 w-5 text-purple-600" />,
    description: 'For website issues, app problems, and login help',
    email: 'support@day.news',
    phone: '(800) 555-1237',
    contactPerson: 'Michael Chen',
    title: 'Chief Technology Officer'
  },
  {
    name: 'Billing & Subscriptions',
    icon: <CreditCard className="h-5 w-5 text-yellow-600" />,
    description: 'For subscription management and payment questions',
    email: 'billing@day.news',
    phone: '(800) 555-1238',
    contactPerson: 'Jennifer Park',
    title: 'Customer Relations Manager'
  }];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-news-primary text-white px-6 py-4">
        <h2 className="text-xl font-bold">Department Directory</h2>
        <p className="text-sm text-white text-opacity-80">
          Contact specific departments directly
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {departments.map((dept, index) =>
        <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                {dept.icon}
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-900">{dept.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                <div className="text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-1">
                    <span className="font-medium text-gray-700 mr-2">
                      Email:
                    </span>
                    <a
                    href={`mailto:${dept.email}`}
                    className="text-news-primary hover:underline">

                      {dept.email}
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-1">
                    <span className="font-medium text-gray-700 mr-2">
                      Phone:
                    </span>
                    <a
                    href={`tel:${dept.phone}`}
                    className="text-news-primary hover:underline">

                      {dept.phone}
                    </a>
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Contact:</span>{' '}
                    {dept.contactPerson}, {dept.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-6 py-4 text-center">
        <a href="#" className="text-news-primary font-medium hover:underline">
          View Full Staff Directory
        </a>
      </div>
    </section>);

};