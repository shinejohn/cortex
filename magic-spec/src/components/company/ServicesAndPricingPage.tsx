import React from 'react';
import {
  FileText,
  Building,
  ShoppingBag,
  Tag,
  Newspaper,
  Calendar,
  CheckCircle,
  Info } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
export const ServicesAndPricingPage = () => {
  const navigate = useNavigate();
  const services = [
  {
    id: 'free',
    title: 'Free Services',
    description: 'Services available at no cost to our community members',
    items: [
    {
      name: 'Write an Article',
      description: 'Share local news and stories with the community',
      price: 'FREE',
      route: '/create-article',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Make an Announcement',
      description: 'Share important community announcements',
      price: 'FREE',
      route: '/announcementCreator',
      icon: <Newspaper className="h-5 w-5" />
    },
    {
      name: 'Schedule an Event (Non-profit)',
      description: 'List your non-profit or community organization event',
      price: 'FREE',
      route: '/eventCreator',
      icon: <Calendar className="h-5 w-5" />
    }]

  },
  {
    id: 'paid',
    title: 'Paid Services',
    description:
    'Premium services to enhance your visibility in the community',
    items: [
    {
      name: 'Sell a Product or Service',
      description: 'List items for sale in our community classifieds',
      price: '$19',
      duration: '30 days',
      route: '/postListing',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      name: 'List Your Business Profile',
      description: 'Create a detailed business profile in our directory',
      price: '$29/month',
      alternatePrice: '$299/year (save $49)',
      route: '/business/create',
      icon: <Building className="h-5 w-5" />
    },
    {
      name: 'Advertise in the Community',
      description: 'Get your business in front of local customers',
      price: 'From $99/month',
      tiers: [
      {
        name: 'Basic',
        price: '$99/month'
      },
      {
        name: 'Standard',
        price: '$199/month'
      },
      {
        name: 'Premium',
        price: '$499/month'
      }],

      route: '/advertisingDetail',
      icon: <Newspaper className="h-5 w-5" />
    },
    {
      name: 'Offer a Coupon',
      description: 'Promote special offers to the community',
      price: '$49/month',
      description2: 'per coupon',
      route: '/couponCreator',
      icon: <Tag className="h-5 w-5" />
    },
    {
      name: 'Post a Legal Notice',
      description: 'Publish required legal notifications',
      price: '$75-$150',
      description2: 'based on word count',
      route: '/legalNoticeCreator',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Schedule a Commercial Event',
      description: 'List your business event or ticketed function',
      price: '$29',
      duration: 'per event',
      route: '/eventCreator',
      icon: <Calendar className="h-5 w-5" />
    }]

  }];

  const packages = [
  {
    title: 'Local Business Package',
    price: '$149/month',
    description: 'Save over 25% with our bundled services package',
    features: [
    'Business Profile Listing',
    '1 Standard Ad Campaign',
    '2 Monthly Coupons',
    "Featured in 'Shop Local' section"],

    cta: 'Get Started',
    popular: true
  },
  {
    title: 'Community Organization Package',
    price: '$79/month',
    description: 'Designed for non-profits and community groups',
    features: [
    'Business Profile Listing',
    '1 Basic Ad Campaign',
    'Unlimited Free Event Listings',
    "Featured in 'Community Corner'"],

    cta: 'Get Started',
    popular: false
  }];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="bg-news-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Services & Pricing
          </h1>
          <p className="text-lg max-w-2xl">
            Connect with your community through Day.News. We offer a range of
            services to help you share information, promote your business, and
            engage with local customers.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        {/* Free Services */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {services[0].title}
          </h2>
          <p className="text-gray-600 mb-8">{services[0].description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services[0].items.map((item) =>
            <div
              key={item.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">

                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-green-600 font-bold">{item.price}</span>
                  <button
                  onClick={() => navigate(item.route)}
                  className="px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors text-sm">

                    Get Started
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
        {/* Paid Services */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {services[1].title}
          </h2>
          <p className="text-gray-600 mb-8">{services[1].description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services[1].items.map((item) =>
            <div
              key={item.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">

                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-xl font-bold text-gray-900">
                      {item.price}
                    </span>
                    {item.duration &&
                  <span className="text-sm text-gray-500 ml-1">
                        {item.duration}
                      </span>
                  }
                  </div>
                  {item.alternatePrice &&
                <div className="text-sm text-gray-600">
                      {item.alternatePrice}
                    </div>
                }
                  {item.description2 &&
                <div className="text-sm text-gray-600">
                      {item.description2}
                    </div>
                }
                </div>
                {item.tiers &&
              <div className="mb-4 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Available Tiers:
                    </p>
                    <ul className="space-y-1">
                      {item.tiers.map((tier) =>
                  <li
                    key={tier.name}
                    className="flex justify-between text-sm">

                          <span>{tier.name}</span>
                          <span className="font-medium">{tier.price}</span>
                        </li>
                  )}
                    </ul>
                  </div>
              }
                <button
                onClick={() => navigate(item.route)}
                className="w-full px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors text-sm">

                  Get Started
                </button>
              </div>
            )}
          </div>
        </section>
        {/* Packages */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Value Packages
          </h2>
          <p className="text-gray-600 mb-8">
            Save with our bundled service packages designed for businesses and
            organizations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {packages.map((pkg) =>
            <div
              key={pkg.title}
              className={`relative bg-white rounded-lg shadow-md border ${pkg.popular ? 'border-news-primary' : 'border-gray-200'} p-6`}>

                {pkg.popular &&
              <div className="absolute top-0 right-0 bg-news-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    POPULAR
                  </div>
              }
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.title}
                </h3>
                <div className="text-2xl font-bold text-news-primary mb-2">
                  {pkg.price}
                </div>
                <p className="text-gray-600 mb-6">{pkg.description}</p>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) =>
                <li key={feature} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                )}
                </ul>
                <button className="w-full px-4 py-3 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">
                  {pkg.cta}
                </button>
              </div>
            )}
          </div>
        </section>
        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <h3 className="font-bold text-lg mb-2">
              Do you offer discounts for long-term commitments?
            </h3>
            <p className="text-gray-600">
              Yes, we offer annual discounts on Business Profiles and
              advertising packages. You can save up to 15% by choosing annual
              billing.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <h3 className="font-bold text-lg mb-2">
              Can I change my ad or coupon after publishing?
            </h3>
            <p className="text-gray-600">
              Yes, you can edit your advertisements and coupons at any time
              during your subscription period.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <h3 className="font-bold text-lg mb-2">
              How do I know which advertising tier is right for my business?
            </h3>
            <p className="text-gray-600">
              Our Basic tier is ideal for small businesses just getting started
              with local advertising. Standard works well for established
              businesses looking for broader reach, while Premium offers maximum
              visibility and priority placement.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg mb-2">
              Do you offer custom packages?
            </h3>
            <p className="text-gray-600">
              Yes, we can create custom packages tailored to your specific
              needs. Contact our sales team to discuss your requirements.
            </p>
          </div>
        </section>
        {/* Contact CTA */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-12 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Need help choosing the right service?
            </h3>
            <p className="text-gray-600">
              Our team is ready to assist you in finding the perfect solution
              for your needs.
            </p>
          </div>
          <button className="px-6 py-3 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors whitespace-nowrap">
            Contact Sales
          </button>
        </div>
      </div>
    </div>);

};