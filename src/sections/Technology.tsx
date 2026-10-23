import { BackgroundVideo } from '../components/BackgroundVideo';
import { VIDEOS } from '../lib/media';

const FEATURES = [
  { title: 'Карта коры', desc: 'Восстанавливает активные зоны мозга в пространстве и в реальном времени.' },
  { title: 'Выделение сигнала', desc: 'Отделяет намерение от биологического шума.' },
  { title: 'Прогноз состояния', desc: 'Замечает смену когнитивного состояния до того, как она случится.' },
  { title: 'Обратная связь', desc: 'Подстраивает работу по замкнутому циклу, сверяясь с результатом.' },
];

export function Technology() {
  return (
    <section className="relative h-screen h-[100dvh] min-h-[640px] overflow-hidden bg-black">
      <BackgroundVideo src={VIDEOS.technology} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col px-8 sm:px-12 md:px-16 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <h2 className="text-white font-light text-[clamp(36px,8vw,72px)] leading-[0.95] tracking-[-0.03em]">
            Адаптивный
            <br />
            интеллект
          </h2>
          <p className="text-white/50 text-[13px] sm:text-[15px] leading-relaxed max-w-xs md:text-right md:pt-2">
            За 72 часа система изучает ваш нейронный фон. Дальше каждое когнитивное состояние распознаётся,
            прогнозируется и подстраивается в реальном времени.
          </p>
        </div>
        <div className="flex-1" />
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {FEATURES.map((f) => (
            <li key={f.title} className="border-t border-white/25 pt-4">
              <h3 className="text-white text-[14px] sm:text-[16px] font-normal mb-2">{f.title}</h3>
              <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">{f.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
