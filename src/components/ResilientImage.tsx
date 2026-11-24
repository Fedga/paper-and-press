import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  compact?: boolean;
  loading?: 'lazy' | 'eager';
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  className = '',
  compact = false,
  loading = 'lazy',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setLoaded(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F1F3F5] via-[#E9ECEF] to-[#DEE2E6] text-[#5C6370] select-none ${
          compact ? 'p-2' : 'p-6 text-center'
        } ${className}`}
      >
        <div
          className={`flex items-center justify-center rounded-full border border-[#D4D8DF] bg-white/80 text-[#5C6370] ${
            compact ? 'h-7 w-7' : 'mb-3 h-11 w-11'
          }`}
        >
          <ImageOff className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} strokeWidth={1.6} />
        </div>
        {!compact && (
          <>
            <p className="max-w-[200px] truncate text-xs font-medium text-[#343A40]">
              {fallbackTitle || alt}
            </p>
            <p className="mt-1 text-[11px] text-[#6C757D]">Preview unavailable</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#F1F3F5] ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[#ECEFF2]" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
