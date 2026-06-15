import { useState, useEffect } from 'react';

/**
 * Custom hook that returns a time-appropriate greeting
 * Morning: 5-11, Afternoon: 12-17, Evening: 18-4
 */
const useGreeting = (userName: string = 'there'): string => {
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    const getGreeting = (): string => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        return `Good morning, ${userName}`;
      } else if (hour >= 12 && hour < 18) {
        return `Good afternoon, ${userName}`;
      } else {
        return `Good evening, ${userName}`;
      }
    };

    setGreeting(getGreeting());

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, [userName]);

  return greeting;
};

export default useGreeting;
