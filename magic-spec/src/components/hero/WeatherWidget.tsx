import React from 'react';
import { Cloud, CloudRain, Sun, ThermometerIcon } from 'lucide-react';
export const WeatherWidget = () => {
  // In a real app, this would come from a weather API
  const weather = {
    temp: 82,
    condition: 'Partly Cloudy',
    high: 86,
    low: 74,
    precipitation: '20%'
  };
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'showers':
        return <CloudRain className="h-6 w-6 text-white" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="h-6 w-6 text-white" />;
      default:
        return <Sun className="h-6 w-6 text-white" />;
    }
  };
  return (
    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-md p-2 transition-all duration-300 hover:bg-white/20">
      <div className="mr-2">{getWeatherIcon(weather.condition)}</div>
      <div>
        <div className="flex items-center text-black">
          <span className="text-sm font-medium">
            H: {weather.high}° L: {weather.low}°
          </span>
        </div>
        <div className="text-xs text-black/80">{weather.condition}</div>
      </div>
    </div>);

};