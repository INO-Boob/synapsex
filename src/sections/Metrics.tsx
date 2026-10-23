import { BackgroundVideo } from '../components/BackgroundVideo';
import { VIDEOS } from '../lib/media';

const METRICS = [
  { value: '2,4 мс', label: 'Задержка сигнала', note: 'От импульса в коре до ответа интерфейса.' },
  { value: '99,7 %', label: 'Точность распознавания', note: 'Доля намерений, распознанных верно с первой попытки.' },
  { value: '140 млрд', label: 'Параметров модели', note: 'Нейросеть, на которой строится карта состояний.' },
];

export function Metrics() {
  return (
    <section id="metrics" className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-black flex items-center">
      <BackgroundVideo src={VIDEOS.metrics} />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="relative z-10 w-full max-w-6xl mx-auto pt-32 pb-32 px-6">
        <h2 className="text-white/70 text-[15px] sm:text-[17px] leading-relaxed max-w-md mb-16 md:mb-20">
          Как быстро и точно SynapseX понимает, что происходит в голове и теле.
        </h2>
        <dl>
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] md:items-end gap-4 md:gap-8 border-t border-white/15 py-8 md:py-10"
            >
              <dt className="order-2 md:order-1">
                <span className="block text-white text-[14px] sm:text-[16px]">{m.label}</span>
                <span className="block text-white/40 text-[13px] sm:text-[14px] mt-1 max-w-xs leading-relaxed">
                  {m.note}
                </span>
              </dt>
              <dd className="order-1 md:order-2 text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none tabular-nums whitespace-nowrap">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
