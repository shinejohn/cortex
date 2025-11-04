import { Cloud, CloudDrizzle, CloudFog, CloudRain, CloudSnow, CloudSun, Cloudy, type LucideIcon, Moon, Sun, Zap } from "lucide-react";

/**
 * Maps WMO Weather codes to appropriate Lucide icons
 * Based on Open-Meteo weather codes: https://open-meteo.com/en/docs
 */
export function getWeatherIcon(weatherCode: number, isDay: boolean): LucideIcon {
    // Clear sky
    if (weatherCode === 0) {
        return isDay ? Sun : Moon;
    }

    // Mainly clear, partly cloudy, and overcast
    if (weatherCode >= 1 && weatherCode <= 3) {
        if (weatherCode === 1) {
            return isDay ? CloudSun : Cloudy;
        }
        if (weatherCode === 2) {
            return Cloudy;
        }
        return Cloud;
    }

    // Fog
    if (weatherCode >= 45 && weatherCode <= 48) {
        return CloudFog;
    }

    // Drizzle
    if (weatherCode >= 51 && weatherCode <= 57) {
        return CloudDrizzle;
    }

    // Rain
    if (weatherCode >= 61 && weatherCode <= 67) {
        return CloudRain;
    }

    // Snow
    if (weatherCode >= 71 && weatherCode <= 77) {
        return CloudSnow;
    }

    // Rain showers
    if (weatherCode >= 80 && weatherCode <= 82) {
        return CloudRain;
    }

    // Snow showers
    if (weatherCode >= 85 && weatherCode <= 86) {
        return CloudSnow;
    }

    // Thunderstorm
    if (weatherCode >= 95 && weatherCode <= 99) {
        return Zap;
    }

    // Default to cloudy
    return Cloudy;
}

/**
 * Gets a human-readable description for weather codes
 */
export function getWeatherDescription(weatherCode: number): string {
    const descriptions: Record<number, string> = {
        0: "Clear",
        1: "Mostly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Light Drizzle",
        53: "Drizzle",
        55: "Heavy Drizzle",
        56: "Freezing Drizzle",
        57: "Freezing Drizzle",
        61: "Light Rain",
        63: "Rain",
        65: "Heavy Rain",
        66: "Freezing Rain",
        67: "Freezing Rain",
        71: "Light Snow",
        73: "Snow",
        75: "Heavy Snow",
        77: "Snow Grains",
        80: "Light Showers",
        81: "Showers",
        82: "Heavy Showers",
        85: "Light Snow Showers",
        86: "Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Thunderstorm with Hail",
    };

    return descriptions[weatherCode] || "Unknown";
}
