import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero';
import { Cinematic } from './sections/Cinematic';
import { Metrics } from './sections/Metrics';
import { Technology } from './sections/Technology';
import { Closing } from './sections/Closing';

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setEntranceComplete(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="bg-black text-white" style={{ fontFamily: '"Space Mono", "IBM Plex Mono", monospace' }}>
      <Navbar visible={entranceComplete} />
      <main>
        <Hero entranceComplete={entranceComplete} />
        <Cinematic />
        <Metrics />
        <Technology />
        <Closing />
      </main>
    </div>
  );
}
