import { ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ShowcaseItem {
    readonly id: number;
    readonly image: string;
    readonly title: string;
    readonly eventUrl: string;
    readonly stats: {
        readonly events: number;
        readonly venues: number;
        readonly performers: number;
    };
}

interface CommunityShowcaseProps {
    readonly showcaseData?: ShowcaseItem[];
}

export function CommunityShowcase({ showcaseData = [] }: CommunityShowcaseProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate images
    useEffect(() => {
        if (showcaseData.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % showcaseData.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [showcaseData.length]);

    // Don't render if no showcase data
    if (showcaseData.length === 0) {
        return null;
    }

    const currentShowcase = showcaseData[currentIndex];

    const handleEventClick = (): void => {
        window.location.href = currentShowcase.eventUrl;
    };

    return (
        <div className="relative h-96 overflow-hidden">
            <div className="absolute inset-0 bg-background/60 z-10"></div>
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                style={{
                    backgroundImage: `url(${currentShowcase.image})`,
                }}
            ></div>
            <div
                className="absolute inset-0 flex flex-col justify-center items-center text-foreground z-20 px-8 cursor-pointer"
                onClick={handleEventClick}
            >
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Featured Event
                </div>
                <h1 className="text-4xl font-bold mb-4">{currentShowcase.title}</h1>
                <Button variant="secondary" className="mt-4 backdrop-blur-sm" onClick={handleEventClick}>
                    View Event Details
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
                <div className="grid grid-cols-3 gap-8 mt-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold">{currentShowcase.stats.events}</div>
                        <div className="text-sm mt-1">Events Today</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold">{currentShowcase.stats.venues}</div>
                        <div className="text-sm mt-1">Local Venues</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold">{currentShowcase.stats.performers}</div>
                        <div className="text-sm mt-1">Performers</div>
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <div className="text-lg font-medium mb-2">Join your local community</div>
                    <div className="text-sm opacity-80">Discover events, connect with others, and never miss what's happening</div>
                </div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
                <div className="flex space-x-2">
                    {showcaseData.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-foreground" : "bg-foreground/50"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
                            aria-label={`View showcase ${index + 1}`}
                        ></button>
                    ))}
                </div>
            </div>
        </div>
    );
}
