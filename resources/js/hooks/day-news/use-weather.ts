import { useEffect, useState } from "react";

interface WeatherData {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
}

/**
 * Fetches current weather data using the Open-Meteo API (free, no API key required)
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 */
export function useWeather(latitude: number | null, longitude: number | null) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!latitude || !longitude) {
            setWeather(null);
            return;
        }

        const fetchWeather = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit&timezone=auto`,
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch weather data");
                }

                const data = await response.json();

                setWeather({
                    temperature: Math.round(data.current.temperature_2m),
                    weatherCode: data.current.weather_code,
                    isDay: data.current.is_day === 1,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
                setWeather(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeather();
    }, [latitude, longitude]);

    return { weather, isLoading, error };
}
