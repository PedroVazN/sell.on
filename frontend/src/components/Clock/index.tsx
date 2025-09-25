import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar, MapPin } from 'lucide-react';
import { 
  ClockContainer, 
  TimeDisplay, 
  DateDisplay, 
  ClockIconWrapper, 
  TimeZoneDisplay,
  SecondsDisplay,
  GreetingDisplay
} from './styles';

export const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

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
    <ClockContainer>
      <ClockIconWrapper>
        <ClockIcon size={20} />
      </ClockIconWrapper>
      <div>
        <GreetingDisplay>{getGreeting()}</GreetingDisplay>
        <TimeDisplay>
          {formatTime(currentTime)}
          <SecondsDisplay>:{formatSeconds(currentTime)}</SecondsDisplay>
        </TimeDisplay>
        <DateDisplay>
          <Calendar size={14} />
          <span>{formatShortDate(currentTime)}</span>
        </DateDisplay>
        <TimeZoneDisplay>
          <MapPin size={12} />
          <span>Brasília</span>
        </TimeZoneDisplay>
      </div>
    </ClockContainer>
  );
};
