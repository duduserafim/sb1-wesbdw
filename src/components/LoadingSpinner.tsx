import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center">
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-green-600`} />
    </div>
  );
}

export default LoadingSpinner;