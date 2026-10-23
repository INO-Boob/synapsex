const LAYERS = [
  { name: 'Сбор', desc: 'сырые биоэлектрические сигналы' },
  { name: 'Обработка', desc: 'выделение намерения' },
  { name: 'Интерфейс', desc: 'готовые данные для ваших систем' },
];

export function Architecture() {
  return (
    <section className="relative min-h-screen min-h-[100dvh] bg-black flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-6 py-32 text-center">
        <h2 className="text-white font-light text-[clamp(28px,6vw,56px)] leading-[1.15] tracking-[-0.02em] mb-10">
          Три слоя.
          <br />
          Никакого трения.
        </h2>
        <p className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed max-w-xl mx-auto">
          Сенсорный слой снимает сырые биоэлектрические сигналы. Слой обработки выделяет намерение. Слой
          интерфейса передаёт готовые данные в любую подключённую систему.
        </p>

        {/* Слои идут по порядку — сигнал проходит их сверху вниз */}
        <ol className="mt-20 flex flex-col items-center">
          {LAYERS.map((l, i) => (
            <li key={l.name} className="w-full max-w-md flex flex-col items-center">
              {i > 0 && <span aria-hidden className="block w-px h-6 bg-gradient-to-b from-white/10 to-lilac" />}
              <div className="w-full h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6 text-left">
                <span className="text-white/30 text-[12px] tracking-[0.04em]">Слой {i + 1}</span>
                <span className="flex flex-col items-end">
                  <span className="text-white text-[16px] sm:text-[18px] font-light">{l.name}</span>
                  <span className="text-white/35 text-[11px] sm:text-[12px]">{l.desc}</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
