import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Bottle from './Bottle';

const slides = [
  { left: 'Oud', right: 'Amber', accent: '#7a3b12', name: 'Noir Oud', family: 'Woody', note: 'Smoked agarwood, saffron and a long amber finish.' },
  { left: 'Iris', right: 'Suede', accent: '#8a6fa8', name: 'Velvet Iris', family: 'Floral', note: 'Powdery iris root over soft suede. Quiet and close.' },
  { left: 'Cedar', right: 'Smoke', accent: '#4d5b3c', name: 'Cedar & Smoke', family: 'Woody', note: 'Fresh-cut cedar with a thread of campfire smoke.' },
  { left: 'Rose', right: 'Oud', accent: '#9b2f45', name: 'Rose Absolu', family: 'Floral', note: 'Damask rose deepened by a dry, peppery oud shadow.' },
];

export default function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);
  const s = slides[i];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-26, 26]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [14, -14]);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); setPaused(false); };

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const dust = useMemo(
    () => Array.from({ length: 16 }, (_, k) => ({ left: `${(k * 37) % 100}%`, top: `${(k * 53) % 100}%`, delay: `${(k % 7) * 1.1}s`, size: 2 + (k % 3) })),
    []
  );

  return (
    <section
      ref={ref} onMouseMove={onMove} onMouseEnter={() => setPaused(true)} onMouseLeave={onLeave}
      className="relative isolate overflow-hidden border-b border-umber"
      aria-roledescription="carousel" aria-label="Featured perfumes"
    >
      <motion.div
        key={s.accent} className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
        style={{ background: `radial-gradient(55% 60% at 50% 55%, ${s.accent}cc 0%, ${s.accent}33 45%, transparent 75%)` }}
      />
      {dust.map((d, k) => (
        <span key={k} className="absolute -z-10 animate-drift rounded-full bg-gold" style={{ left: d.left, top: d.top, width: d.size, height: d.size, animationDelay: d.delay }} />
      ))}

      <div className="wrap grid min-h-[calc(100svh-6.5rem)] items-center gap-6 py-14 lg:grid-cols-[1fr_auto_1fr]">
        <div className="order-2 text-center lg:order-1 lg:text-right">
          <AnimatePresence mode="wait">
            <motion.p key={s.left} className="font-display text-6xl sm:text-7xl xl:text-8xl" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5 }}>
              {s.left}
            </motion.p>
          </AnimatePresence>
          <h1 className="mt-6 text-3xl text-parchment/90 sm:text-4xl">Find your signature.</h1>
          <p className="mx-auto mt-3 max-w-sm text-sand lg:ml-auto lg:mr-0">Small-batch perfumes with real depth, made to stay on the skin until morning.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-end">
            <Link to="/shop" className="btn btn-gold">Shop the collection</Link>
            <a href="#finder" className="btn btn-line">Find my scent</a>
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2" style={{ perspective: 1100 }}>
          <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="h-[340px] sm:h-[460px] lg:h-[520px]">
            <AnimatePresence mode="wait">
              <motion.div key={s.name} className="h-full" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.55 }}>
                <Bottle accent={s.accent} name={s.name} className="h-full w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="order-3 text-center lg:text-left">
          <AnimatePresence mode="wait">
            <motion.p key={s.right} className="font-display text-6xl sm:text-7xl xl:text-8xl" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }}>
              {s.right}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={s.name} className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-display text-2xl italic">{s.name}</p>
              <p className="mx-auto mt-2 max-w-xs text-sand lg:mx-0">{s.note}</p>
              <Link to={`/shop?family=${s.family}`} className="mt-4 inline-block text-sm text-gold underline-offset-4 hover:underline">See all {s.family.toLowerCase()} perfumes</Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-4">
        <button aria-label="Previous slide" className="h-9 w-9 border border-umber hover:border-gold" onClick={() => setI((i + slides.length - 1) % slides.length)}>‹</button>
        <div className="flex gap-2">
          {slides.map((sl, k) => (
            <button key={sl.name} aria-label={`Show ${sl.name}`} aria-current={k === i} onClick={() => setI(k)} className={`h-1 transition-all ${k === i ? 'w-10 bg-gold' : 'w-5 bg-umber hover:bg-sand'}`} />
          ))}
        </div>
        <button aria-label="Next slide" className="h-9 w-9 border border-umber hover:border-gold" onClick={() => setI((i + 1) % slides.length)}>›</button>
      </div>
    </section>
  );
}
