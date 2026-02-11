import React from "react";
import { useWeather } from "@/hooks/day-news/use-weather";
import { getWeatherIcon } from "@/lib/day-news/weather-icons";

interface Region {
    id: string;
    name: string;
    latitude?: string;
    longitude?: string;
}

interface DayNewsInfoBarProps {
    region: Region | null;
    activeReaders: number;
}

export default function DayNewsInfoBar({ region, activeReaders }: DayNewsInfoBarProps) {
    const { weather } = useWeather(
        region?.latitude ? Number.parseFloat(region.latitude) : null,
        region?.longitude ? Number.parseFloat(region.longitude) : null,
    );

    const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode, weather.isDay) : null;

    return (
        <div className="w-full border-y border-border bg-muted/30 py-1">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Weather */}
                <div className="flex items-center gap-4 text-sm font-medium">
                    {weather && WeatherIcon ? (
                        <div className="flex items-center gap-2 text-foreground">
                            <WeatherIcon className="size-5" />
                            <span>{weather.temperature}°F</span>
                            <span className="hidden text-muted-foreground sm:inline">
                                {weather.weatherCode === 0 ? "Clear" :
                                    weather.weatherCode < 3 ? "Cloudy" : "Precipitation"}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Local Weather</span>
                    )}
                </div>

                {/* Right: Active Readers */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    {activeReaders} neighbors reading now
                </div>
            </div>
        </div>
    );
}
