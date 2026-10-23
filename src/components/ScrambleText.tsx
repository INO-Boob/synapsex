import { useEffect, useState } from 'react';
import { charsetFor, randomChar } from '../lib/scramble';

interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

const FRAMES_PER_CHAR = 4;

export function ScrambleText({ text, isHovered, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const set = charsetFor(text);
    let frame = 0;
    const interval = window.setInterval(() => {
      const revealed = Math.floor(frame / FRAMES_PER_CHAR);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        out += text[i] === ' ' || i < revealed ? text[i] : randomChar(set);
      }
      setDisplay(out);
      frame++;
      if (revealed >= text.length) window.clearInterval(interval);
    }, 25);

    return () => window.clearInterval(interval);
  }, [isHovered, text]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
