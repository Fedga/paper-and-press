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
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F5F0E8] via-[#EFE8DC] to-[#E6DDD0] text-[#6B6259] select-none ${
          compact ? 'p-2' : 'p-6 text-center'
        } ${className}`}
      >
        <div
          className={`flex items-center justify-center rounded-full border border-[#DCD2C4] bg-[#FAF8F5]/90 text-[#6B6259] ${
            compact ? 'h-7 w-7' : 'mb-3 h-11 w-11'
          }`}
        >
          <ImageOff className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} strokeWidth={1.6} />
        </div>
        {!compact && (
          <>
            <p className="max-w-[200px] truncate text-xs font-medium text-[#3D352E]">
              {fallbackTitle || alt}
            </p>
            <p className="mt-1 text-[11px] text-[#7D7369]">Preview unavailable</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#F3EEE6] ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[#EFE9DF]" aria-hidden="true" />
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
