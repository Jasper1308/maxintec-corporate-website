"use client";

import { useState } from "react";

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

  if (images.length === 0) return null;

  const current = images[activeIndex];

  const prevSlide = () => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-xl shadow-slate-950/20">
      <div className="relative">
        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <img src={current.src} alt={current.alt} className="h-full w-full object-cover transition duration-700 ease-out" />
        </div>

        <div className="absolute inset-x-0 top-6 flex items-center justify-between px-4 sm:px-6">
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
