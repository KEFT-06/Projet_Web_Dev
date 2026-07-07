import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, fallback, alt, className }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}