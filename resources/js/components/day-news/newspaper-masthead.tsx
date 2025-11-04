import { Badge } from "@/components/ui/badge";
import { useWeather } from "@/hooks/day-news/use-weather";
import { getWeatherIcon } from "@/lib/day-news/weather-icons";
import { MapPin } from "lucide-react";
import React from "react";

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
        <div className="bg-background py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Date and location */}
                <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <time dateTime={today.toISOString()}>{formattedDate}</time>
                        {weather && WeatherIcon && (
                            <div className="flex items-center gap-1.5">
                                <WeatherIcon className="size-4" />
                                <span className="font-medium">{weather.temperature}°F</span>
                            </div>
                        )}
                    </div>
                    {region && (
                        <Badge variant="outline">
                            <MapPin />
                            {region.full_name || region.name} Edition
                        </Badge>
                    )}
                </div>

                {/* Newspaper name */}
                <div className="text-center">
                    <h1 className="font-serif text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
                        {region ? `${region.name} Day News` : "Day News"}
                    </h1>
                    <p className="mt-2 font-serif text-sm italic text-muted-foreground">"Your Daily Source for Local Stories"</p>
                </div>

                {/* Decorative border */}
                <div className="mt-4 border-t-2 border-border" />
            </div>
        </div>
    );
}
