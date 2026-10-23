import { BackgroundVideo } from '../components/BackgroundVideo';
import { SynapseXLogo } from '../components/SynapseXLogo';
import { VIDEOS } from '../lib/media';

export function Footer() {
  return (
    <footer id="download" className="bg-black overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-[400px]">
        <div className="relative w-full md:w-1/2 h-[300px] md:h-auto">
          <BackgroundVideo src={VIDEOS.footer} />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-between p-10 sm:p-16">
          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <SynapseXLogo size={18} className="text-white/70" />
              <span className="text-[15px] font-medium text-white/70 tracking-tight">SynapseX</span>
            </div>
            <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed max-w-sm">
              Следующий шаг во взаимодействии человека и машины. Для тех, кто не готов ограничиваться одной
              биологией.
            </p>
          </div>
          <p className="text-white/25 text-[12px] mt-12">© 2026 SynapseX Labs. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
