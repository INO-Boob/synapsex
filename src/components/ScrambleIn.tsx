import { useEffect, useState } from 'react';
import { charsetFor, randomChar } from '../lib/scramble';

interface ScrambleInProps {
  text: string;
  delay: number;
  triggered: boolean;
}

const LOOKAHEAD = 3;
const SPEED = 0.5;

export function ScrambleIn({ text, delay, triggered }: ScrambleInProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (!triggered) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text);
      return;
    }

    const set = charsetFor(text);
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      let cursor = 0;
      interval = window.setInterval(() => {
        cursor += SPEED;
        const revealed = Math.floor(cursor);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') out += ' ';
          else if (i < revealed) out += text[i];
          else if (i < revealed + LOOKAHEAD) out += randomChar(set);
        }
        setDisplay(out);
        if (revealed >= text.length) {
          window.clearInterval(interval);
          setDisplay(text);
        }
      }, 25);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [text, delay, triggered]);

  if (!triggered) return <span aria-hidden>&nbsp;</span>;
  return (
    <span aria-label={text}>
      <span aria-hidden>{display || ' '}</span>
    </span>
  );
}
