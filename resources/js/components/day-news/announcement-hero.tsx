import React, { useEffect, useState } from "react";
import { Users, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementHeroProps {
    location?: string;
    readerCount?: number;
}

export function AnnouncementHero({ location = "Clearwater", readerCount = 247 }: AnnouncementHeroProps) {
    const [greeting, setGreeting] = useState("Good Morning");
    const [activeReaders, setActiveReaders] = useState(readerCount);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Good Morning");
        else if (hour >= 12 && hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        /* 
        const interval = setInterval(() => {
            setActiveReaders((prev) => Math.floor(Math.random() * 20) - 10 + prev);
        }, 5000);

        return () => clearInterval(interval);
        */
    }, []);

    return (
        <div className="relative overflow-hidden bg-white border-b">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="container relative mx-auto px-4 py-8 lg:px-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-primary">
                            <Sparkles className="size-4 fill-current" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">{greeting}, {location}</span>
                        </div>
                        <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                            Community <span className="text-primary italic">Announcements</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
                            The heart of our community. Celebrations, life transitions, and public notices from your neighbors and local organizations.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 border-l border-muted pl-8 md:pl-12">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Community Pulse</span>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="flex size-2 items-center justify-center">
                                    <span className="absolute size-2 animate-ping rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative size-2 rounded-full bg-green-500"></span>
                                </span>
                                <span className="text-2xl font-black tracking-tighter tabular-nums">
                                    {activeReaders.toLocaleString()}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">Members Online</span>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Regional Focus</span>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <MapPin className="size-4" />
                                </div>
                                <span className="text-xl font-bold tracking-tight">{location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
