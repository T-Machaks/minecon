import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PauseCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdSlot } from '@/api/entities';
import { track } from '@/lib/tracking';
import { ADS } from '@/lib/adBanners';

const KEYFRAMES = `
  @keyframes adProgress { from { width: 0 } to { width: 100% } }
  @keyframes adSlideIn  { from { opacity: 0; transform: translateX(8px) } to { opacity: 1; transform: translateX(0) } }
`;

const INTERVAL = 4500;

export default function AdBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data: dynamicSlots = [] } = useQuery({
    queryKey: ['adslots-active'],
    queryFn: () => AdSlot.listActive(),
  });

  const slots = dynamicSlots.length > 0 ? dynamicSlots : ADS;

  useEffect(() => { setCurrent(0); }, [slots.length]);

  useEffect(() => {
    if (paused || slots.length === 0) return;
    const t = setTimeout(() => setCurrent(c => (c + 1) % slots.length), INTERVAL);
    return () => clearTimeout(t);
  }, [current, paused, slots.length]);

  if (slots.length === 0) return null;

  const ad = slots[current] ?? slots[0];
  const accent = ad.accent || '#f59e0b';

  const goTo = (i, e) => { e.preventDefault(); e.stopPropagation(); setPaused(true); setCurrent(i); };
  const prev = (e) => goTo((current - 1 + slots.length) % slots.length, e);
  const next = (e) => goTo((current + 1) % slots.length, e);

  const handleClick = () => {
    if (ad.exhibitor_id) track(ad.exhibitor_id, ad.exhibitor_name, 'ad_click', 'home_carousel');
  };

  const card = (
    <div
      className={`relative w-full bg-gradient-to-br ${ad.bg} rounded-2xl overflow-hidden cursor-pointer group`}
      style={{ minHeight: 148 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Hatching texture */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '10px 10px' }}
      />

      {/* Slide content — keyed so it fades in on each change */}
      <div key={current} className="relative p-4 flex flex-col gap-2.5" style={{ animation: 'adSlideIn 0.3s ease-out' }}>

        {/* Top row: logo + company + counter */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow overflow-hidden">
              {ad.logo_url
                ? <img src={ad.logo_url} alt={ad.company} className="w-9 h-9 object-contain" />
                : <span className="font-bold text-lg text-foreground">{ad.company[0]}</span>
              }
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">{ad.company}</p>
              <p className="text-white/55 text-[10px] mt-0.5 font-medium">{ad.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {paused && <PauseCircle className="w-3 h-3 text-white/30" />}
            <span className="text-[10px] font-bold tabular-nums text-white/35 select-none">
              {current + 1}&thinsp;/&thinsp;{slots.length}
            </span>
          </div>
        </div>

        {/* Headline + sub */}
        <div>
          <p className="text-white font-heading font-bold text-base leading-snug">{ad.headline}</p>
          {ad.sub && <p className="text-white/55 text-xs mt-0.5">{ad.sub}</p>}
        </div>

        {/* Bottom row: stat + tags + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {ad.stat && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: `${accent}30`, border: `1px solid ${accent}60` }}
              >
                {ad.stat}
              </span>
            )}
            {(ad.tags || []).map(tag => (
              <span key={tag} className="text-[10px] text-white/45 bg-white/10 px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <span
            className="flex-shrink-0 text-[11px] font-bold text-white/80 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-white/25"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Visit ↗
          </span>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="absolute bottom-6 left-0 right-0 h-[2px] bg-white/10">
        <div
          key={`prog-${current}-${paused}`}
          className="h-full rounded-full"
          style={paused
            ? { width: '0%', background: accent }
            : { background: accent, animation: `adProgress ${INTERVAL}ms linear forwards` }
          }
        />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1.5">
        {slots.map((_, i) => (
          <button
            key={i}
            onClick={e => goTo(i, e)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 16 : 6,
              height: 4,
              background: i === current ? accent : 'rgba(255,255,255,0.28)',
            }}
          />
        ))}
      </div>

      {/* Prev / Next edge buttons — visible on hover */}
      <button
        onClick={prev}
        className="absolute left-0 top-0 bottom-6 w-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-3.5 h-3.5 text-white" />
        </div>
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-0 bottom-6 w-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors">
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </div>
      </button>
    </div>
  );

  return (
    <div className="px-4 mb-4 max-w-2xl mx-auto">
      <style>{KEYFRAMES}</style>
      {ad.internal
        ? <a href={ad.url} onClick={handleClick}>{card}</a>
        : <a href={ad.url} target="_blank" rel="noreferrer" onClick={handleClick}>{card}</a>
      }
    </div>
  );
}