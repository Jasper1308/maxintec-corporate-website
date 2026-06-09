"use client";

import { useRef, useState, type PointerEvent } from "react";

type CarouselImage = {
  src: string;
  alt: string;
  subtitle: string;
};

type ImageCarouselProps = {
  images: CarouselImage[];
};

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const dragWrapperRef = useRef<HTMLDivElement | null>(null);

  if (images.length === 0) return null;

  const current = images[activeIndex];

  const prevSlide = () => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(event.clientX);
    setDragDelta(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartX === null) return;
    setDragDelta(event.clientX - dragStartX);
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;

    if (dragDelta > 60) {
      prevSlide();
    } else if (dragDelta < -60) {
      nextSlide();
    }

    setIsDragging(false);
    setDragStartX(null);
    setDragDelta(0);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-xl shadow-slate-950/20">
      <div className="relative">
        <div
          ref={dragWrapperRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          className="w-full h-[28rem] sm:h-[34rem] overflow-hidden bg-slate-950 sm:rounded-[2rem] cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(calc(${-activeIndex * (100 / images.length)}% + ${dragDelta}px))`,
              transition: isDragging ? "none" : "transform 300ms ease",
              width: `${images.length * 100}%`,
            }}
          >
            {images.map((image) => (
              <div
                key={image.src}
                className="h-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-slate-950"
                style={{ width: `${100 / images.length}%` }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 top-6 flex items-center justify-between px-4 sm:px-6 z-10">
          <button
            type="button"
            onClick={prevSlide}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900/70 text-white shadow-xl shadow-slate-950/30 transition hover:bg-slate-800"
            aria-label="Previous image"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900/70 text-white shadow-xl shadow-slate-950/30 transition hover:bg-slate-800"
            aria-label="Next image"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{current.subtitle}</p>
        <div className="mt-4 flex items-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-8 rounded-full transition ${index === activeIndex ? "bg-white" : "bg-white/30 hover:bg-white/60"}`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
