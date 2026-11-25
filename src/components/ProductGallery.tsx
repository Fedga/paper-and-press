import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Film, Play, X } from 'lucide-react';
import type { Product } from '../data/products';
import { parseVideoUrl, splitProductTitle } from '../utils/catalog';
import { ResilientImage } from './ResilientImage';

interface ProductGalleryProps {
  product: Product;
}

type GallerySlide =
  | { kind: 'image'; src: string; index: number }
  | {
      kind: 'video';
      video: NonNullable<ReturnType<typeof parseVideoUrl>>;
    };

export function ProductGallery({ product }: ProductGalleryProps) {
  const { primary } = splitProductTitle(product.TITLE);
  const parsedVideo = useMemo(() => parseVideoUrl(product.VIDEO_URL), [product.VIDEO_URL]);

  const slides: GallerySlide[] = useMemo(() => {
    const list: GallerySlide[] = product.IMAGES.map((src, index) => ({
      kind: 'image',
      src,
      index,
    }));
    if (parsedVideo) {
      list.push({ kind: 'video', video: parsedVideo });
    }
    return list;
  }, [product.IMAGES, parsedVideo]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [product.id]);

  useEffect(() => {
    if (slides.length <= 1 && !lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight' && slides.length > 1) {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowLeft' && slides.length > 1) {
        setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length, lightboxOpen]);

  const currentSlide = slides[activeIndex];
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  return (
    <div className="space-y-3.5">
      {/* Main Interactive Stage */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E6DDD1] bg-white p-2.5 shadow-[0_12px_32px_-22px_rgba(31,27,24,0.22)]">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#F3EEE6]">
          {!currentSlide ? (
            <ResilientImage
              src=""
              alt={product.TITLE}
              fallbackTitle={primary}
              className="h-full w-full"
            />
          ) : currentSlide.kind === 'image' ? (
            <>
              <ResilientImage
                src={currentSlide.src}
                alt={`${primary} — view ${currentSlide.index + 1}`}
                fallbackTitle={primary}
                loading="eager"
                className="h-full w-full"
              />
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open full-screen preview"
                className="absolute right-3 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DDD1] bg-[#FAF8F5]/95 text-[#1F1B18] shadow-sm transition-all duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#2C4C3B]"
              >
                <Expand className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1F1B18]">
              {currentSlide.video.type === 'youtube' || currentSlide.video.type === 'vimeo' ? (
                <iframe
                  src={currentSlide.video.embedUrl}
                  title={`${primary} video preview`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={currentSlide.video.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                >
                  Your browser does not support embedded video playback.
                </video>
              )}
            </div>
          )}

          {/* Prev / Next Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous image"
                className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6DDD1] bg-[#FAF8F5]/95 text-[#1F1B18] shadow-sm transition-all duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#2C4C3B]"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next image"
                className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6DDD1] bg-[#FAF8F5]/95 text-[#1F1B18] shadow-sm transition-all duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#2C4C3B]"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </>
          )}

          {/* Quiet slide counter */}
          {slides.length > 1 && (
            <div className="tabular-nums pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#1F1B18]/75 px-3 py-1 text-xs font-medium text-[#FAF8F5] backdrop-blur-xs">
              {currentSlide?.kind === 'video' ? 'Video' : `${activeIndex + 1} / ${slides.length}`}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Rail (IMAGE1..IMAGE10 + optional VIDEO_URL slot) */}
      {slides.length > 1 && (
        <div
          className="grid grid-cols-5 gap-2.5 sm:grid-cols-6"
          role="tablist"
          aria-label="Product media thumbnails"
        >
          {slides.map((slide, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={slide.kind === 'image' ? `${slide.src}-${idx}` : 'video-slot'}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={
                  slide.kind === 'video'
                    ? 'Play product video'
                    : `View photo ${idx + 1} of ${product.IMAGES.length}`
                }
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square overflow-hidden rounded-xl border bg-white p-1 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B] ${
                  isSelected
                    ? 'border-[#2C4C3B] ring-2 ring-[#2C4C3B]/20'
                    : 'border-[#E6DDD1] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="h-full w-full overflow-hidden rounded-lg">
                  {slide.kind === 'image' ? (
                    <ResilientImage
                      src={slide.src}
                      alt={`${primary} thumbnail ${idx + 1}`}
                      compact
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[#1F1B18] text-[#FAF8F5]">
                      <Play className="h-4 w-4 fill-current" />
                      <span className="text-[10px] font-medium">Video</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {parsedVideo && (
        <div className="flex items-center gap-2 text-xs text-[#6B6259]">
          <Film className="h-3.5 w-3.5 text-[#2C4C3B]" strokeWidth={1.8} />
          <span>Video preview available in gallery</span>
        </div>
      )}

      {/* Full-Screen Lightbox for Images */}
      {lightboxOpen && currentSlide?.kind === 'image' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1B18]/92 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen product image preview"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close full-screen preview"
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#FAF8F5] transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                className="absolute top-1/2 left-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-[#FAF8F5] transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                className="absolute top-1/2 right-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-[#FAF8F5] transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="relative max-h-[88vh] max-w-[90vw] overflow-hidden rounded-xl bg-[#26211D]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentSlide.src}
              alt={`${primary} — enlarged view ${currentSlide.index + 1}`}
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-[88vw] object-contain"
            />
          </div>

          <div className="tabular-nums absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3.5 py-1 text-xs font-medium text-[#FAF8F5]">
            {activeIndex + 1} / {slides.length}
          </div>
        </div>
      )}
    </div>
  );
}
