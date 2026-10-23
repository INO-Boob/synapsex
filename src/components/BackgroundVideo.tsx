import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  src: string;
  className?: string;
}

// Видео играет только когда секция на экране — экономит батарею и трафик.
export function BackgroundVideo({ src, className = 'absolute inset-0' }: BackgroundVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current!;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={`${className} w-full h-full object-cover`}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}
