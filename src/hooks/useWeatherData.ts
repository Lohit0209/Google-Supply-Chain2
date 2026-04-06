import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  condition: string;
  riskSignal: number; // 0-1
}

export const useWeatherData = (lat: number, lon: number) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const json = await response.json();
        const current = json.current_weather;

        // Map condition codes to risk
        // Simplified: higher wind or extreme temp = high risk
        let risk = 0.1;
        if (current.windspeed > 30) risk += 0.4;
        if (current.weathercode > 50) risk += 0.3; // Rain/Storm codes

        setData({
          temperature: current.temperature,
          windSpeed: current.windspeed,
          condition: `Code: ${current.weathercode}`,
          riskSignal: Math.min(risk, 1)
        });
      } catch (e) {
        console.error('Weather fetch failed', e);
        setData({ temperature: 20, windSpeed: 5, condition: 'Clear', riskSignal: 0.1 }); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [lat, lon]);

  return { data, loading };
};
