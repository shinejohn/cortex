import { MapPin } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useWeather } from "@/hooks/day-news/use-weather";
import { getWeatherIcon } from "@/lib/day-news/weather-icons";

interface Region {
    id: string;
    name: string;
    type: string;
    full_name?: string;
    latitude?: string;
    longitude?: string;
}

interface NewspaperMastheadProps {
    region: Region | null;
}

export default function NewspaperMasthead({ region }: NewspaperMastheadProps) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const { weather } = useWeather(
        region?.latitude ? Number.parseFloat(region.latitude) : null,
        region?.longitude ? Number.parseFloat(region.longitude) : null,
    );

    const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode, weather.isDay) : null;

    return (
        <div className="border-b bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newspaper Title - Centered */}
                <div className="py-4 text-center">
                    <h1 className="font-display text-5xl font-black tracking-tight uppercase sm:text-6xl md:text-7xl">
                        {region ? `${region.name} Day News` : "Day News"}
                    </h1>
                    {/* Date and tagline row with border separator */}
                    <div className="mx-auto mt-1 inline-block border-t border-b border-border/40 px-4 py-1 text-sm text-muted-foreground">
                        <time dateTime={today.toISOString()}>{formattedDate}</time>
                        {weather && WeatherIcon && (
                            <>
                                <span className="mx-2">|</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <WeatherIcon className="inline size-4" />
                                    <span className="font-medium">{weather.temperature}°F</span>
                                </span>
                            </>
                        )}
                        <span className="mx-2">|</span>
                        <span className="font-serif italic">Your Daily Source for Local Stories</span>
                    </div>
                </div>

                {/* Location badge - below title */}
                {region && (
                    <div className="flex justify-end pb-3">
                        <Badge variant="outline">
                            <MapPin className="size-3.5" />
                            {region.full_name || region.name} Edition
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    );
}
