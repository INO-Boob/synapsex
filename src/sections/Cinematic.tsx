import { useRef } from 'react';
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from 'framer-motion';
import { BackgroundVideo } from '../components/BackgroundVideo';
import { VIDEOS } from '../lib/media';

export function Cinematic() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });
  const yScaleValue = useTransform(smooth, [0, 1], [60, -120]);
  const opacity = useTransform(smooth, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`rotateX(24deg) translateY(${yScaleValue}px) translateZ(15px)`;

  return (
    <section id="about" ref={ref} className="relative h-screen h-[100dvh] overflow-hidden bg-black">
      <BackgroundVideo src={VIDEOS.cinematic} />
      <div
        className="absolute top-0 inset-x-0 h-[180px] z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #010103, transparent)' }}
      />
      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="max-w-5xl w-full" style={{ perspective: '400px' }}>
          <motion.p
            style={{ transform, opacity }}
            className="font-sans font-normal text-[22px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-white leading-[1.35] tracking-[-0.02em] select-none px-6 sm:px-12 text-center"
          >
            Нейроинтерфейс, построенный по образцу нервной системы человека. SynapseX переводит синаптическую
            активность в вычисления. Каждый сигнал становится измеримым, упорядоченным и видимым. Система
            постоянно пересобирает ваше внутреннее состояние в живую нейронную карту. Биологический шум
            отсеивается — остаются когнитивные паттерны, с которыми можно работать.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
