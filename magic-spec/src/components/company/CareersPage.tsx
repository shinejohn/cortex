import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Users,
  ChevronRight,
  Search,
  Filter,
  Star,
  ArrowRight } from
'lucide-react';
export const CareersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Careers at Day.News
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Join our team and help shape the future of local journalism
        </p>
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Make an Impact in Your Community
              </h2>
              <p className="text-gray-600 mb-6">
                At Day.News, we're reimagining local journalism for the digital
                age. We're looking for talented, passionate individuals who want
                to make a difference in their communities through engaging,
                accurate, and meaningful reporting.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-news-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Mission-Driven Organization
                    </h3>
                    <p className="text-sm text-gray-600">
                      We're committed to serving our communities with honest,
                      impactful journalism.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-news-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Innovative Approach
                    </h3>
                    <p className="text-sm text-gray-600">
                      We blend traditional journalistic values with cutting-edge
                      technology.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-news-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Growth Opportunities
                    </h3>
                    <p className="text-sm text-gray-600">
                      We invest in our team members' professional development
                      and career advancement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Team working together"
                className="w-full h-full object-cover" />

            </div>
          </div>
        </div>
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for jobs..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-news-primary focus:border-news-primary" />

            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <select className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-news-primary focus:border-news-primary pr-8 bg-white">
                  <option>All Departments</option>
                  <option>Editorial</option>
                  <option>Technology</option>
                  <option>Marketing</option>
                  <option>Business</option>
                  <option>Operations</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <Filter className="h-4 w-4" />
                </div>
              </div>
              <div className="relative">
                <select className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-news-primary focus:border-news-primary pr-8 bg-white">
                  <option>All Locations</option>
                  <option>Clearwater, FL</option>
                  <option>Remote</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <Filter className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Open Positions
          </h2>
          <div className="space-y-6">
            {/* Editorial */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-news-primary" />
                Editorial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-900 mb-2">
                    <Link to="#" className="hover:text-news-primary">
                      Local News Reporter
                    </Link>
                  </h4>
                  <div className="flex flex-wrap gap-y-2 mb-3">
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      Clearwater, FL
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Full-time
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Posted 2 days ago
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    We're looking for a dedicated reporter to cover local news
                    in Clearwater and surrounding areas. The ideal candidate has
                    experience in community journalism and a passion for telling
                    local stories.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary font-medium hover:text-news-primary-dark flex items-center text-sm">

                    View Job Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-900 mb-2">
                    <Link to="#" className="hover:text-news-primary">
                      Community Engagement Editor
                    </Link>
                  </h4>
                  <div className="flex flex-wrap gap-y-2 mb-3">
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      Clearwater, FL
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Full-time
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Posted 1 week ago
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Join our team as a Community Engagement Editor to build and
                    nurture relationships with our readers. You'll develop
                    strategies to increase reader participation and community
                    involvement.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary font-medium hover:text-news-primary-dark flex items-center text-sm">

                    View Job Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            {/* Technology */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-news-primary" />
                Technology
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-900 mb-2">
                    <Link to="#" className="hover:text-news-primary">
                      Front-End Developer
                    </Link>
                  </h4>
                  <div className="flex flex-wrap gap-y-2 mb-3">
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      Remote
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Full-time
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Posted 3 days ago
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    We're seeking a talented Front-End Developer with experience
                    in React and modern JavaScript frameworks to help build and
                    maintain our digital platforms.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary font-medium hover:text-news-primary-dark flex items-center text-sm">

                    View Job Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-900 mb-2">
                    <Link to="#" className="hover:text-news-primary">
                      Data Journalist
                    </Link>
                  </h4>
                  <div className="flex flex-wrap gap-y-2 mb-3">
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      Clearwater, FL (Hybrid)
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Full-time
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Posted 5 days ago
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    We're looking for a Data Journalist who can analyze data
                    sets, create visualizations, and tell compelling stories
                    with data to enhance our reporting on local issues.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary font-medium hover:text-news-primary-dark flex items-center text-sm">

                    View Job Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            {/* Marketing */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-news-primary" />
                Marketing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-900 mb-2">
                    <Link to="#" className="hover:text-news-primary">
                      Digital Marketing Specialist
                    </Link>
                  </h4>
                  <div className="flex flex-wrap gap-y-2 mb-3">
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      Clearwater, FL
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mr-4">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Full-time
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Posted 1 week ago
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Join our marketing team to develop and implement digital
                    marketing strategies that grow our audience and increase
                    engagement with our content.
                  </p>
                  <Link
                    to="#"
                    className="text-news-primary font-medium hover:text-news-primary-dark flex items-center text-sm">

                    View Job Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don't see the right position? We're always looking for talented
              individuals.
            </p>
            <Link
              to="#"
              className="inline-block bg-news-primary text-white px-6 py-3 rounded-md font-medium hover:bg-news-primary-dark transition-colors">

              Submit Your Resume
            </Link>
          </div>
        </div>
        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Work With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Collaborative Culture
              </h3>
              <p className="text-gray-600 text-sm">
                Work with passionate professionals in a supportive environment
                that values teamwork and innovation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Comprehensive Benefits
              </h3>
              <p className="text-gray-600 text-sm">
                Enjoy competitive salary, health insurance, retirement plans,
                paid time off, and professional development opportunities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Work-Life Balance
              </h3>
              <p className="text-gray-600 text-sm">
                We value your well-being with flexible work arrangements, mental
                health resources, and a supportive environment.
              </p>
            </div>
          </div>
        </div>
        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/32.jpg"
                  alt="Sarah Johnson"
                  className="w-16 h-16 rounded-full mr-4" />

                <div>
                  <h3 className="font-bold text-gray-900">Sarah Johnson</h3>
                  <p className="text-gray-600 text-sm">
                    Senior Reporter, 3 years at Day.News
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-3">
                "Working at Day.News has given me the opportunity to tell
                important stories that matter to our community. The
                collaborative environment and commitment to journalistic
                integrity make this a special place to work."
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start mb-4">
                <img
                  src="https://randomuser.me/api/portraits/men/42.jpg"
                  alt="Michael Chen"
                  className="w-16 h-16 rounded-full mr-4" />

                <div>
                  <h3 className="font-bold text-gray-900">Michael Chen</h3>
                  <p className="text-gray-600 text-sm">
                    Software Engineer, 2 years at Day.News
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-3">
                "I love building technology that helps deliver important news to
                our community. Day.News combines the best of journalism and tech
                innovation, and I'm proud to be part of a team that's shaping
                the future of local news."
              </p>
            </div>
          </div>
        </div>
        {/* Application Process */}
        <div className="bg-gray-100 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Our Hiring Process
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-news-primary"></div>
              <div className="space-y-8">
                <div className="relative flex items-start">
                  <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-news-primary"></div>
                  <div className="ml-12">
                    <h3 className="font-bold text-gray-900 mb-1">
                      1. Application Review
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Our team reviews your application, resume, and portfolio
                      (if applicable) to assess your qualifications and
                      experience.
                    </p>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-news-primary"></div>
                  <div className="ml-12">
                    <h3 className="font-bold text-gray-900 mb-1">
                      2. Initial Interview
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Selected candidates are invited for an initial interview
                      with the hiring manager to discuss your background,
                      skills, and interest in the role.
                    </p>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-news-primary"></div>
                  <div className="ml-12">
                    <h3 className="font-bold text-gray-900 mb-1">
                      3. Skills Assessment
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Depending on the role, you may be asked to complete a
                      skills assessment, writing test, coding challenge, or
                      other relevant evaluation.
                    </p>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-news-primary"></div>
                  <div className="ml-12">
                    <h3 className="font-bold text-gray-900 mb-1">
                      4. Team Interview
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Meet with potential team members and colleagues to ensure
                      a good fit with our collaborative culture.
                    </p>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-news-primary"></div>
                  <div className="ml-12">
                    <h3 className="font-bold text-gray-900 mb-1">
                      5. Offer & Onboarding
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Successful candidates receive an offer and begin our
                      comprehensive onboarding program to set you up for
                      success.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                Do you offer internships or entry-level positions?
              </h3>
              <p className="text-gray-600">
                Yes, we offer internships and entry-level positions throughout
                the year. We believe in developing new talent and providing
                opportunities for those starting their careers in journalism and
                media.
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                What is your remote work policy?
              </h3>
              <p className="text-gray-600">
                We offer a flexible approach to work location depending on the
                role. Some positions are fully remote, while others are hybrid
                or in-office. Each job posting specifies the work arrangement.
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                How long does the hiring process typically take?
              </h3>
              <p className="text-gray-600">
                Our hiring process typically takes 2-4 weeks from application to
                offer, though this can vary depending on the position and number
                of applicants. We strive to keep candidates informed throughout
                the process.
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                What kind of professional development opportunities do you
                offer?
              </h3>
              <p className="text-gray-600">
                We invest in our team members' growth through training programs,
                conference attendance, mentorship opportunities, and education
                stipends for relevant courses and certifications.
              </p>
            </div>
          </div>
        </div>
        {/* CTA */}
        <div className="bg-news-primary rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Join Our Team?</h2>
          <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
            Be part of a mission-driven organization that's making a difference
            in our community through quality journalism and innovative digital
            experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="#"
              className="bg-white text-news-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">

              View All Openings
            </Link>
            <Link
              to="#"
              className="bg-news-primary border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-news-primary-dark transition-colors">

              Join Our Talent Network
            </Link>
          </div>
        </div>
      </main>
    </div>);

};