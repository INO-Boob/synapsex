import { motion } from 'framer-motion';
import { ScrambleIn } from '../components/ScrambleIn';
import { ScrubVideo } from '../components/ScrubVideo';
import { VIDEOS } from '../lib/media';

const heading = 'text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]';

export function Hero({ entranceComplete }: { entranceComplete: boolean }) {
  return (
    <section id="top" className="relative h-screen h-[100dvh] overflow-hidden bg-black">
      <ScrubVideo src={VIDEOS.hero} className="absolute inset-0" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 flex justify-center pointer-events-none select-none opacity-10"
        style={{ transform: 'translateY(calc(-50% + 50px))' }}
      >
        <span
          className="font-display uppercase whitespace-nowrap leading-none"
          style={{
            fontSize: 'clamp(120px, 30vw, 521px)',
            letterSpacing: '-4px',
            backgroundImage: 'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Трансценденция
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entranceComplete ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 h-full flex flex-col px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 pointer-events-none"
      >
        <div className="flex-1" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className={heading}>
              <ScrambleIn text="Мозг" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="и тело" delay={500} triggered={entranceComplete} />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
              className="max-w-sm text-[13px] sm:text-[15px] text-white/60 leading-relaxed"
            >
              SynapseX создан на стыке нейронауки и искусственного интеллекта. Он непрерывно считывает нейронные
              связи, когнитивную нагрузку и состояние тела и сводит их в один адаптивный слой.
            </motion.p>
          </div>

          <p className={`${heading} text-left md:text-right`}>
            <ScrambleIn text="Одна" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="сеть" delay={1000} triggered={entranceComplete} />
          </p>
        </div>
      </motion.div>
    </section>
  );
}
