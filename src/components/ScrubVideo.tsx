import { useEffect, useRef } from 'react';

const SENSITIVITY = 0.8;

interface ScrubVideoProps {
  src: string;
  className?: string;
}

// Видео стоит на паузе; горизонтальное движение мыши перематывает его
// вперёд и назад. Следующая перемотка запускается только после события
// `seeked`, поэтому кадры не теряются при быстром движении.
export function ScrubVideo({ src, className }: ScrubVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current!;
    let target = 0;
    let seeking = false;
    let lastX: number | null = null;

    const seek = () => {
      if (Math.abs(video.currentTime - target) < 0.01) {
        seeking = false;
        return;
      }
      seeking = true;
      video.currentTime = target;
    };

    const onMove = (e: MouseEvent) => {
      if (lastX !== null && video.duration) {
        const dx = (e.clientX - lastX) / window.innerWidth;
        target = Math.min(video.duration, Math.max(0, target + dx * video.duration * SENSITIVITY));
        if (!seeking) seek();
      }
      lastX = e.clientX;
    };

    video.pause();
    video.currentTime = 0;
    video.addEventListener('seeked', seek);
    window.addEventListener('mousemove', onMove);
    return () => {
      video.removeEventListener('seeked', seek);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={`${className ?? ''} w-full h-full object-cover`}
      src={src}
      muted
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
