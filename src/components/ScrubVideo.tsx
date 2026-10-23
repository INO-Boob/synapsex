import { useEffect, useRef } from 'react';

const SENSITIVITY = 0.8;
// Доля оставшегося пути, которую видео проходит за кадр: даёт инерцию
// вместо рывков за курсором
const EASE = 0.12;

interface ScrubVideoProps {
  src: string;
  className?: string;
}

// Видео стоит на паузе; горизонтальное движение мыши перематывает его
// вперёд и назад. Ролик целиком скачивается в память, чтобы перемотка
// не ждала сеть, а позиция плавно догоняет курсор в цикле анимации.
// Следующая перемотка запускается только после `seeked`.
export function ScrubVideo({ src, className }: ScrubVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current!;
    let target = 0;
    let current = 0;
    let seeking = false;
    let lastX: number | null = null;
    let raf = 0;
    let visible = true;
    let objectUrl: string | null = null;
    const controller = new AbortController();

    const onSeeked = () => {
      seeking = false;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!video.duration) return;
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.001) current = target;
      if (!seeking && Math.abs(video.currentTime - current) > 1 / 120) {
        seeking = true;
        video.currentTime = current;
      }
    };

    const onMove = (e: MouseEvent) => {
      if (lastX !== null && video.duration) {
        const dx = (e.clientX - lastX) / window.innerWidth;
        target = Math.min(video.duration - 0.05, Math.max(0, target + dx * video.duration * SENSITIVITY));
      }
      lastX = e.clientX;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });

    // Перемотка по ролику в памяти идёт без сетевых запросов
    fetch(src, { signal: controller.signal })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.currentTime = current;
      })
      .catch(() => {
        // Нет CORS или сети — остаёмся на обычной ссылке
      });

    video.pause();
    video.addEventListener('seeked', onSeeked);
    window.addEventListener('mousemove', onMove);
    io.observe(video);

    return () => {
      controller.abort();
      cancelAnimationFrame(raf);
      io.disconnect();
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('mousemove', onMove);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

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
