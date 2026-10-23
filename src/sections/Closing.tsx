import TopoField from '@/components/ui/topo-field';
import { Architecture } from './Architecture';
import { Footer } from './Footer';

// Финал страницы — архитектура и футер на общем топографическом фоне.
// Один WebGL-фон на обе секции вместо двух — меньше нагрузки.
export function Closing() {
  return (
    <div className="relative bg-black overflow-hidden">
      <TopoField className="absolute inset-0" lineColor="#C4A5FF" gridColor="#8B5CF6" />
      {/* Фиолетовое свечение — в тон неону из видео */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(60%_45%_at_50%_30%,rgba(139,92,246,0.22),transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(50%_40%_at_75%_95%,rgba(192,38,211,0.14),transparent_70%)]" />
      {/* Мягкий переход от видео сверху и затемнение к краям, чтобы линии не спорили с текстом */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      <div className="relative">
        <Architecture />
        <Footer />
      </div>
    </div>
  );
}
