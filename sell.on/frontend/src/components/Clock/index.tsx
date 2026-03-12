import React, { useState, useEffect, useCallback } from 'react';
import { Clock as ClockIcon, Calendar, MapPin, CloudRain, Sun, Cloud } from 'lucide-react';
import { 
  ClockContainer, 
  TimeDisplay, 
  DateDisplay, 
  ClockIconWrapper, 
  TimeZoneDisplay,
  SecondsDisplay,
  GreetingDisplay,
  WeatherDisplay,
  RainOverlay
} from './styles';

const SAO_PAULO_LAT = -23.5505;
const SAO_PAULO_LON = -46.6333;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${SAO_PAULO_LAT}&longitude=${SAO_PAULO_LON}&current=temperature_2m,weather_code`;

type WeatherVariant = 'sun' | 'rain' | 'cloudy' | null;

function getWeatherVariant(code: number): WeatherVariant {
  if (code === 0 || code === 1) return 'sun';
  if (code >= 51 && code <= 67) return 'rain'; // drizzle, rain
  if (code >= 80 && code <= 82) return 'rain'; // rain showers
  if (code >= 95 && code <= 99) return 'rain'; // thunderstorm
  return 'cloudy';
}

export const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [temp, setTemp] = useState<number | null>(null);
  const [weatherVariant, setWeatherVariant] = useState<WeatherVariant>(null);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch(WEATHER_URL);
      if (!res.ok) return;
      const data = await res.json();
      const current = data?.current;
      if (current) {
        setTemp(current.temperature_2m ?? null);
        setWeatherVariant(getWeatherVariant(current.weather_code ?? 0));
      }
    } catch {
      setWeatherVariant('cloudy');
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getBrasiliaTime = () => {
    return new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatSeconds = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      hour12: false
    });
    const hourNum = parseInt(hour);
    
    if (hourNum >= 5 && hourNum < 12) return 'Bom dia';
    if (hourNum >= 12 && hourNum < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <ClockContainer $variant={weatherVariant}>
      {weatherVariant === 'rain' && <RainOverlay aria-hidden />}
      <ClockIconWrapper $variant={weatherVariant}>
        {weatherVariant === 'rain' && <CloudRain size={22} />}
        {weatherVariant === 'sun' && <Sun size={22} />}
        {(weatherVariant === 'cloudy' || !weatherVariant) && <ClockIcon size={20} />}
      </ClockIconWrapper>
      <div>
        <GreetingDisplay $variant={weatherVariant}>{getGreeting()}</GreetingDisplay>
        <TimeDisplay>
          {formatTime(currentTime)}
          <SecondsDisplay>:{formatSeconds(currentTime)}</SecondsDisplay>
        </TimeDisplay>
        {temp != null && (
          <WeatherDisplay $variant={weatherVariant}>
            {weatherVariant === 'rain' && <CloudRain size={14} />}
            {weatherVariant === 'sun' && <Sun size={14} />}
            {(weatherVariant === 'cloudy' || !weatherVariant) && <Cloud size={14} />}
            <span>SP {Math.round(temp)}°C</span>
          </WeatherDisplay>
        )}
        <DateDisplay>
          <Calendar size={14} />
          <span>{formatShortDate(currentTime)}</span>
        </DateDisplay>
        <TimeZoneDisplay>
          <MapPin size={12} />
          <span>São Paulo</span>
        </TimeZoneDisplay>
      </div>
    </ClockContainer>
  );
};
