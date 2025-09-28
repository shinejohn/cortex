import CTASection from "@/components/common/cta-section";
import { Footer } from "@/components/common/footer";
import { GridCard } from "@/components/common/grid-card";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { type Event } from "@/types/events";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowRightIcon, CalendarIcon, ClockIcon, MapPinIcon, TicketIcon } from "lucide-react";
import { useState } from "react";

interface TicketsPageProps {
    auth: {
        user?: {
            id: string;
            name: string;
            email: string;
        };
    };
    upcomingEvents: Event[];
}

export default function Tickets() {
    const { auth, upcomingEvents = [] } = usePage<TicketsPageProps>().props;

    const ticketCategories = [
        {
            title: 'Buy Tickets',
            description: 'Browse and purchase tickets for upcoming events',
            path: '/tickets/buy',
            icon: '🎟️'
        },
        {
            title: 'My Tickets',
            description: 'View and manage your ticket purchases',
            path: '/tickets/my-tickets',
            icon: '📱'
        },
        {
            title: 'Gift Tickets',
            description: 'Send event tickets as gifts to friends and family',
            path: '/tickets/gift',
            icon: '🎁'
        },
        {
            title: 'Group Discounts',
            description: 'Special rates for group ticket purchases',
            path: '/tickets/groups',
            icon: '👥'
        },
    ];

    return (
        <>
            <Head title="Tickets & Passes" />

            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-indigo-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">
                            Tickets & Passes
                        </h1>
                        <p className="mt-3 text-xl">
                            Buy and manage tickets for local events
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <Link
                                href="/events"
                                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                            >
                                <TicketIcon className="h-5 w-5 mr-2" />
                                Browse Events
                            </Link>
                            {auth.user && (
                                <Link
                                    href="/tickets/my-tickets"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    My Tickets
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Options */}
            {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Ticket Options
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ticketCategories.map((category, index) => (
                        <Link
                            key={index}
                            href={category.path}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center group"
                        >
                            <div className="text-3xl mb-3">{category.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {category.title}
                            </h3>
                            <p className="text-gray-600 mt-2 text-sm">
                                {category.description}
                            </p>
                            <div className="mt-4 flex justify-center">
                                <ArrowRightIcon className="h-5 w-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div> */}

            {/* Featured Events with Tickets */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Upcoming Events
                        </h2>
                        <Link
                            href="/events"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center font-medium"
                        >
                            View all events
                            <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.slice(0, 6).map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    <div className="absolute top-0 right-0 m-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-800">
                                            On Sale
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <CalendarIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                        {new Date(event.date).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                        <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                        {event.venue?.name || 'TBD'}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">
                                            {event.price?.isFree ? 'Free' : `$${event.price?.min}`}
                                        </span>
                                        <Link
                                            href={`/events/${event.id}/tickets`}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1 rounded"
                                        >
                                            Get Tickets
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                    Frequently Asked Questions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">
                            How do I receive my tickets?
                        </h3>
                        <p className="text-gray-600">
                            After purchase, tickets are delivered to your email and accessible
                            in your account. You can print them or use the mobile version for
                            entry.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">
                            Can I get a refund if I can't attend?
                        </h3>
                        <p className="text-gray-600">
                            Refund policies vary by event. Check the event details page for
                            specific refund terms. Many events allow you to resell your
                            tickets through our platform.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">
                            Are there fees for buying tickets?
                        </h3>
                        <p className="text-gray-600">
                            Service fees vary by event and are clearly displayed before
                            checkout. Some events offer fee-free tickets during special
                            promotions.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">
                            How do I access my tickets?
                        </h3>
                        <p className="text-gray-600">
                            All your tickets are available in the "My Tickets" section of your
                            account. You can view, download, or share them from there.
                        </p>
                    </div>
                </div>
            </div>

            <CTASection />
            <Footer />
        </>
    );
}
