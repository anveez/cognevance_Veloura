import { useToast } from '../store/toast';

export default function Toasts() {
  const items = useToast((s) => s.items);
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`pointer-events-auto border px-5 py-3 text-sm shadow-xl ${t.type === 'error' ? 'border-red-400/60 bg-[#2a1210] text-red-200' : 'border-gold/50 bg-cocoa text-parchment'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
