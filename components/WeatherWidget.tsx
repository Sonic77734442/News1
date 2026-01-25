// components/WeatherWidget.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  temp: number;
  icon: string;
  description: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey =
          process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'a74c5f3cfd33b8d6c9449a9fc5c64e90';
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Almaty&appid=${apiKey}&units=metric&lang=ru`
        );
        const data = await res.json();
        const icon = data.weather[0].icon;
        const description = data.weather[0].description;
        const temp = Math.round(data.main.temp);
        setWeather({ temp, icon, description });
      } catch (error) {
        console.error('Ошибка получения погоды:', error);
      }
    };

    fetchWeather();
  }, []);

  if (!weather) return null;

  return (
    <motion.div
      className="flex items-center px-3 py-1 rounded-full text-sm space-x-2 backdrop-blur-md shadow-inner
        bg-black/20 text-white dark:bg-white/10 dark:text-white
        border border-white/10 dark:border-white/20"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt="Погода"
        className="w-6 h-6"
      />
      <span className="font-medium">{weather.temp}°</span>
    </motion.div>
  );
};

export default WeatherWidget;
