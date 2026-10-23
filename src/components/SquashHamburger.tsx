import { motion } from 'framer-motion';

interface SquashHamburgerProps {
  isOpen: boolean;
  mobile?: boolean;
}

const spring = { type: 'spring', stiffness: 300, damping: 20 } as const;

export function SquashHamburger({ isOpen, mobile = false }: SquashHamburgerProps) {
  const w = mobile ? 15 : 18;
  const h = mobile ? 10 : 12;
  const bar = mobile ? 1.2 : 1.5;
  const center = h / 2 - bar / 2;

  const base = {
    position: 'absolute' as const,
    left: 0,
    width: w,
    height: bar,
    borderRadius: bar,
    background: '#fff',
  };

  return (
    <span className="relative block" style={{ width: w, height: h }} aria-hidden>
      <motion.span
        style={{ ...base, top: 0 }}
        animate={isOpen ? { rotate: 45, y: center } : { rotate: 0, y: 0 }}
        transition={spring}
      />
      <motion.span
        style={{ ...base, top: center }}
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={spring}
      />
      <motion.span
        style={{ ...base, top: h - bar }}
        animate={isOpen ? { rotate: -45, y: -center } : { rotate: 0, y: 0 }}
        transition={spring}
      />
    </span>
  );
}
