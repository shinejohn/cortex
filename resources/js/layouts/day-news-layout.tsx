import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import LocationPrompt from "@/components/day-news/location-prompt";
import { LocationProvider } from "@/contexts/location-context";
import { type Auth } from "@/types";
import { type ReactNode } from "react";

interface DayNewsLayoutProps {
    children: ReactNode;
    auth?: Auth;
    seo: {
        title: string;
        description?: string;
        image?: string | null;
        url?: string;
        type?: "website" | "article";
        [key: string]: any;
    };
    showLocationPrompt?: boolean;
    containerClassName?: string;
}

export default function DayNewsLayout({
    children,
    auth,
    seo,
    showLocationPrompt = false,
    containerClassName = "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
}: DayNewsLayoutProps) {
    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type={seo.type || "website"}
                    site="day-news"
                    data={{
                        ...seo,
                        description: seo.description || "",
                        image: seo.image || undefined,
                        url: seo.url || "",
                    }}
                />
                <DayNewsHeader auth={auth} />
                {showLocationPrompt && <LocationPrompt />}
                <main className={containerClassName}>
                    {children}
                </main>
            </div>
        </LocationProvider>
    );
}
