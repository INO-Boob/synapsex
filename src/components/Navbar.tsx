import { useState } from 'react';
import { motion } from 'framer-motion';
import { SynapseXLogo } from './SynapseXLogo';
import { SquashHamburger } from './SquashHamburger';
import { ScrambleText } from './ScrambleText';
import { DOWNLOAD_URL } from '../lib/media';

const spring = { type: 'spring', stiffness: 350, damping: 28 } as const;

const LINKS = [
  { label: 'О системе', to: () => window.innerHeight },
  { label: 'Метрики', to: () => window.innerHeight * 2 },
];

function scrollToY(y: number) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}

function NavLink({ label, onClick, mobile, focusable }: { label: string; onClick: () => void; mobile?: boolean; focusable: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={focusable ? 0 : -1}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={`${mobile ? 'text-[13px]' : 'text-[16px]'} font-normal text-white/85 hover:text-white whitespace-nowrap transition-colors`}
    >
      <ScrambleText text={label} isHovered={hovered} />
    </button>
  );
}

function DownloadButton({ mobile }: { mobile?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={DOWNLOAD_URL}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.03, backgroundColor: '#e2e2e6' }}
      whileTap={{ scale: 0.97 }}
      className={`${
        mobile ? 'h-9 px-3.5 text-[13px] gap-1.5' : 'h-12 px-6 text-[16px] gap-2'
      } bg-white text-black rounded-full flex items-center shrink-0`}
    >
      <i className="bi bi-apple" aria-hidden />
      <ScrambleText text="Скачать" isHovered={hovered} />
    </motion.a>
  );
}

export function Navbar({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);

  const go = (y: number) => {
    setOpen(false);
    scrollToY(y);
  };

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 inset-x-0 z-50 h-20 px-4 sm:px-6 md:px-8 flex items-center"
    >
      {/* Desktop */}
      <nav className="hidden sm:flex w-full items-center justify-between" aria-label="Основное меню">
        <div className="flex items-center gap-2">
          <motion.a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go(0);
            }}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.22)' }}
            whileTap={{ scale: 0.98 }}
            className={`${open ? 'hidden md:flex' : 'flex'} h-12 px-5 items-center gap-2.5 bg-white/15 backdrop-blur-md rounded-[14px]`}
          >
            <SynapseXLogo size={18} className="text-white" />
            <span className="text-[16px] font-medium tracking-tight text-white">SynapseX</span>
          </motion.a>

          <motion.div
            initial={false}
            animate={{ width: open ? 300 : 48 }}
            transition={spring}
            className="h-12 rounded-[14px] bg-white/15 backdrop-blur-md flex items-center overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              className={`shrink-0 flex items-center justify-center transition-colors ${
                open ? 'w-9 h-9 rounded-[11px] bg-white/10 hover:bg-white/20 ml-1.5' : 'w-12 h-12 rounded-[14px]'
              }`}
            >
              <SquashHamburger isOpen={open} />
            </button>
            <motion.div
              initial={false}
              animate={{ opacity: open ? 1 : 0, x: open ? 0 : 15 }}
              transition={{ duration: 0.25, delay: open ? 0.1 : 0 }}
              className="flex items-center gap-6 pl-5 pr-5"
              style={{ pointerEvents: open ? 'auto' : 'none' }}
              aria-hidden={!open}
            >
              {LINKS.map((l) => (
                <NavLink key={l.label} label={l.label} onClick={() => go(l.to())} focusable={open} />
              ))}
            </motion.div>
          </motion.div>
        </div>
        <DownloadButton />
      </nav>

      {/* Mobile */}
      <nav className="flex sm:hidden w-full items-center gap-2" aria-label="Основное меню">
        <motion.a
          href="#top"
          initial={false}
          animate={{ width: open ? 0 : 'auto', opacity: open ? 0 : 1 }}
          transition={spring}
          className="h-9 rounded-[10px] bg-white/15 backdrop-blur-md flex items-center overflow-hidden shrink-0"
          tabIndex={open ? -1 : 0}
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
        >
          <span className="flex items-center gap-2 px-3.5">
            <SynapseXLogo size={14} className="text-white" />
            <span className="text-[13px] font-medium tracking-tight">SynapseX</span>
          </span>
        </motion.a>

        <motion.div
          initial={false}
          animate={{ width: open ? '100%' : 36 }}
          transition={spring}
          className="h-9 rounded-[10px] bg-white/15 backdrop-blur-md flex items-center overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            className={`shrink-0 flex items-center justify-center ${
              open ? 'w-7 h-7 rounded-[8px] bg-white/10 ml-1' : 'w-9 h-9 rounded-[10px]'
            }`}
          >
            <SquashHamburger isOpen={open} mobile />
          </button>
          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0, x: open ? 0 : 15 }}
            transition={{ duration: 0.25, delay: open ? 0.1 : 0 }}
            className="flex items-center gap-4 px-4"
            style={{ pointerEvents: open ? 'auto' : 'none' }}
            aria-hidden={!open}
          >
            {LINKS.map((l) => (
              <NavLink key={l.label} label={l.label} onClick={() => go(l.to())} mobile focusable={open} />
            ))}
          </motion.div>
        </motion.div>

        <div className="ml-auto">
          <DownloadButton mobile />
        </div>
      </nav>
    </motion.header>
  );
}
