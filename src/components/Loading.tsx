'use client';

import { useState, useEffect } from 'react';

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = "Loading", className = "h-64" }: LoadingProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-gray-400">
        {message}
        <span className="inline-block w-6 text-left">{dots}</span>
      </div>
    </div>
  );
}