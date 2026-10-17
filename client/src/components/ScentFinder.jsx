import { useEffect, useState } from 'react';
import api from '../api/client';
import ProductCard from './ProductCard';

const questions = [
  {
    q: 'When will you wear it most?',
    options: [
      { label: 'Evenings out', score: { Oriental: 2, Woody: 2, Gourmand: 1 } },
      { label: 'Every day', score: { Fresh: 2, Citrus: 2, Floral: 1 } },
      { label: 'Special occasions', score: { Floral: 2, Oriental: 2 } },
      { label: 'Quiet nights in', score: { Gourmand: 2, Woody: 1, Floral: 1 } },
    ],
  },
  {
    q: 'Which feeling are you after?',
    options: [
      { label: 'Warm and wrapped up', score: { Oriental: 2, Gourmand: 2 } },
      { label: 'Clean and bright', score: { Fresh: 2, Citrus: 2 } },
      { label: 'Soft and romantic', score: { Floral: 3 } },
      { label: 'Dark and smoky', score: { Woody: 3, Oriental: 1 } },
    ],
  },
  {
    q: 'How strong should it be?',
    options: [
      { label: 'A whisper', score: { Fresh: 2, Citrus: 2, Floral: 1 } },
      { label: 'Noticeable, not loud', score: { Floral: 1, Woody: 1, Citrus: 1, Gourmand: 1 } },
      { label: 'A statement', score: { Oriental: 2, Woody: 2, Gourmand: 1 } },
    ],
  },
];

export default function ScentFinder() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({});
  const [all, setAll] = useState([]);
  const done = step >= questions.length;

  useEffect(() => {
    api.get('/products', { params: { limit: 60 } }).then((r) => setAll(r.data.items)).catch(() => {});
  }, []);

  const pick = (opt) => {
    const next = { ...scores };
    Object.entries(opt.score).forEach(([f, n]) => { next[f] = (next[f] || 0) + n; });
    setScores(next);
    setStep(step + 1);
  };
  const reset = () => { setStep(0); setScores({}); };

  const ranked = [...all]
    .sort((a, b) => (scores[b.family] || 0) - (scores[a.family] || 0) || b.rating - a.rating)
    .slice(0, 3);
  const topFamilies = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([f]) => f.toLowerCase());

  return (
    <section id="finder" className="wrap scroll-mt-28 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl sm:text-5xl">Not sure where to start?</h2>
        <p className="mt-4 text-sand">Answer three quick questions and we will pick three perfumes for you.</p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        {!done ? (
          <div className="panel p-6 sm:p-10">
            <div className="mb-6 flex items-center justify-between text-sm text-sand">
              <span>Question {step + 1} of {questions.length}</span>
              {step > 0 && <button className="btn-quiet" onClick={reset}>Start over</button>}
            </div>
            <h3 className="text-2xl sm:text-3xl">{questions[step].q}</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {questions[step].options.map((o) => (
                <button key={o.label} onClick={() => pick(o)} className="border border-umber px-5 py-4 text-left transition-colors hover:border-gold hover:bg-umber/50">
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-8 text-center text-sand">
              You lean {topFamilies.join(' and ')}. These three are the closest match.
              <button className="ml-3 text-gold underline-offset-4 hover:underline" onClick={reset}>Try again</button>
            </p>
            {ranked.length === 0 ? (
              <p className="text-center text-sand">We could not load the collection. Please refresh the page.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-3">{ranked.map((p) => <ProductCard key={p._id} product={p} />)}</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
