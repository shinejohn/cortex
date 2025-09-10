import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import EventsGrid from "@/components/events/events-grid";
import PerformersGrid from "@/components/performers/performers-grid";
import VenuesGrid from "@/components/venues/venues-grid";
import { type SharedData } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Home" />

            <Header auth={auth} />

            <EventsGrid />

            <VenuesGrid />

            <PerformersGrid />

            <Footer />
        </>
    );
}
