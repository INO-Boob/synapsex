import TopoField from '@/components/ui/topo-field';
import { Architecture } from './Architecture';
import { Footer } from './Footer';

// Финал страницы — архитектура и футер на общем топографическом фоне.
// Один WebGL-фон на обе секции вместо двух — меньше нагрузки.
export function Closing() {
  return (
    <div className="relative bg-black overflow-hidden">
      <TopoField className="absolute inset-0" opacity={0.7} speed={0.8} />
      {/* Мягкий переход от видео сверху и затемнение к краям, чтобы линии не спорили с текстом */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
      <div className="relative">
        <Architecture />
        <Footer />
      </div>
    </div>
  );
}
