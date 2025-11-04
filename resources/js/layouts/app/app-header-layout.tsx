import { AppContent } from "@/components/app-content";
import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import Header from "@/components/common/header";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Toaster } from "@/components/ui/sonner";
import { LocationProvider } from "@/contexts/location-context";
import { Auth, type BreadcrumbItem, SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import type { PropsWithChildren } from "react";

export default function AppHeaderLayout({ children, breadcrumbs, auth }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; auth: Auth }>) {
    const { appDomain } = usePage<SharedData>().props;

    // Render the appropriate header based on the current domain
    const renderHeader = () => {
        switch (appDomain) {
            case "day-news":
                return <DayNewsHeader auth={auth} />;
            case "downtown-guide":
                // TODO: Create DowntownGuideHeader when needed
                return <Header auth={auth} breadcrumbs={breadcrumbs} />;
            case "event-city":
            default:
                return <Header auth={auth} breadcrumbs={breadcrumbs} />;
        }
    };

    // Wrap Day News pages with LocationProvider
    const content = (
        <AppShell>
            {renderHeader()}
            <AppContent>{children}</AppContent>
            <Toaster />
        </AppShell>
    );

    // Only wrap with LocationProvider for Day News domain
    if (appDomain === "day-news") {
        return <LocationProvider>{content}</LocationProvider>;
    }

    return content;
}
