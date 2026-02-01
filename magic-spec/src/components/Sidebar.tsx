import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Tag,
  Users,
  FileText,
  LogOut,
  Home,
  Calendar,
  Building2,
  Gavel,
  Heart,
  Archive,
  Image,
  Globe } from
'lucide-react';
export const Sidebar = ({ currentPage = 'createNews' }) => {
  const navigate = useNavigate();
  const handleSearch = (e) => {
    e.preventDefault();
    const searchQuery = e.target.elements.search.value;
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };
  const handleLogout = () => {
    // In a real app, this would handle the logout logic
    navigate('/');
  };
  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-light bg-bg-primary">
      <div
        className="flex items-center p-4 cursor-pointer"
        onClick={() => navigate('/')}>

        <img
          src="/image.png"
          alt="Logo"
          className="h-8 w-8 rounded-full" />

        <h1 className="ml-2 font-display text-xl font-bold text-news-primary">
          Day.news
        </h1>
      </div>
      <div className="p-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            name="search"
            placeholder="Search News"
            className="w-full rounded-md border border-border-light bg-bg-secondary py-2 pl-8 pr-3 text-sm font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light" />

          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        </form>
      </div>
      <nav className="px-2">
        <NavItem
          icon={<Home className="h-5 w-5" />}
          label="Home"
          active={currentPage === 'home'}
          onClick={() => navigate('/')} />

        <NavItem
          icon={<Globe className="h-5 w-5" />}
          label="National News"
          active={currentPage === 'national'}
          onClick={() => navigate('/national')} />

        <NavItem
          icon={<FileText className="h-5 w-5" />}
          label="My stuff"
          active={currentPage === 'profile'}
          onClick={() => navigate('/profile')} />

        <NavItem
          icon={<Bell className="h-5 w-5" />}
          label="Announcements"
          active={currentPage === 'announcements'}
          onClick={() => navigate('/announcements')} />

        <NavItem
          icon={<Tag className="h-5 w-5" />}
          label="Coupons"
          active={currentPage === 'coupons'}
          onClick={() => navigate('/coupons')} />

        <NavItem
          icon={<Calendar className="h-5 w-5" />}
          label="Events"
          active={currentPage === 'eventsCalendar'}
          onClick={() => navigate('/eventsCalendar')} />

        <NavItem
          icon={<Building2 className="h-5 w-5" />}
          label="Business Directory"
          active={currentPage === 'businessDirectory'}
          onClick={() => navigate('/businessDirectory')} />

        <NavItem
          icon={<Gavel className="h-5 w-5" />}
          label="Legal Notices"
          active={currentPage === 'legalNoticesList'}
          onClick={() => navigate('/legalNoticesList')} />

        <NavItem
          icon={<Heart className="h-5 w-5" />}
          label="Memorials"
          active={currentPage === 'memorials'}
          onClick={() => navigate('/memorials')} />

        <NavItem
          icon={<Image className="h-5 w-5" />}
          label="Photo Gallery"
          active={currentPage === 'photos' || currentPage.startsWith('photos/')}
          onClick={() => navigate('/photos')} />

        <NavItem
          icon={<Archive className="h-5 w-5" />}
          label="Archive"
          active={currentPage === 'archive'}
          onClick={() => navigate('/archive')} />

        <NavItem
          icon={<Users className="h-5 w-5" />}
          label="AI Journalists"
          active={currentPage === 'journalists'}
          onClick={() => navigate('/journalists')} />

      </nav>
      <div className="mt-8 p-4">
        <div
          className="rounded-lg bg-bg-tertiary p-4 text-center cursor-pointer hover:bg-bg-secondary transition-colors"
          onClick={() => navigate('/publish')}>

          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-community-green-light bg-opacity-20">
            <FileText className="h-6 w-6 text-community-green" />
          </div>
          <h3 className="mb-1 font-ui font-medium text-text-primary">
            Publish & Promote
          </h3>
          <p className="text-xs font-ui text-text-secondary">
            Write a news item, post a service, announce an event or share a
            discount.
          </p>
        </div>
      </div>
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border-medium bg-bg-primary px-4 py-2 text-sm font-ui font-medium text-text-secondary shadow-sm hover:bg-bg-secondary">

          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>);

};
const NavItem = ({ icon, label, active = false, onClick }) => {
  return (
    <div
      className={`mb-1 flex cursor-pointer items-center rounded-md px-3 py-2 ${active ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'hover:bg-bg-secondary'}`}
      onClick={onClick}>

      <div className={active ? 'text-news-primary' : 'text-text-tertiary'}>
        {icon}
      </div>
      <span
        className={`ml-3 text-sm font-ui font-medium ${active ? 'text-news-primary' : 'text-text-secondary'}`}>

        {label}
      </span>
    </div>);

};