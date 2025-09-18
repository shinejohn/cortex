import CategoryFilter from "@/components/common/category-filter";
import CTASection from "@/components/common/cta-section";
import DateSelector from "@/components/common/date-selector";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import EventsGrid from "@/components/events/events-grid";
import UpcomingEvents from "@/components/events/upcoming-events";
import PerformersGrid from "@/components/performers/performers-grid";
import VenuesGrid from "@/components/venues/venues-grid";
import { type SharedData } from "@/types";
import { Head, usePage } from "@inertiajs/react";

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Home" />

            <Header auth={auth} />

            <CategoryFilter selectedCategory="All" onCategoryChange={() => void 0} />

            <DateSelector onDateChange={() => void 0} currentView="daily" setCurrentView={() => void 0} />

            <EventsGrid />

            <VenuesGrid />

            <PerformersGrid />

            <UpcomingEvents />

            <CTASection />

            <Footer />
        </>
    );
}
