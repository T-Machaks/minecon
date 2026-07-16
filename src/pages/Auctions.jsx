import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Auction } from '@/api/entities';
import { Gavel, Radio, Calendar, CheckCircle, Package, ChevronRight } from 'lucide-react';
import { AUCTION_TYPES } from '@/lib/auctionConstants';

const TABS = ['Live', 'Upcoming', 'Closed'];

const TAB_STYLES = {
  Live: {
    active: 'bg-rose-500 text-white border-rose-500',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    icon: Radio,
  },
  Upcoming: {
    active: 'bg-amber text-white border-amber',
    badge: 'bg-amber/10 text-amber border border-amber/20',
    icon: Calendar,
  },
  Closed: {
    active: 'bg-slate-600 text-white border-slate-600',
    badge: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    icon: CheckCircle,
  },
};

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Auctions() {
  const [tab, setTab] = useState('Live');
  const [auctionType, setAuctionType] = useState('All');

  const { data: auctions = [], isLoading } = useQuery({
    queryKey: ['auctions'],
    queryFn: () => Auction.list('-created_date'),
  });

  const byTab = auctions.filter(a => (a.status || 'Upcoming') === tab);

  const filtered = byTab.filter(a =>
    auctionType === 'All' || a.auction_type === auctionType
  );

  return (
    <div className="pb-24 px-4 pt-5 max-w-2xl lg:max-w-4xl mx-auto">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wide mb-1 flex items-center gap-2">
        <Gavel className="w-6 h-6 text-amber" /> Auctions
      </h1>
      <p className="text-sm text-muted-foreground mb-5">Mining equipment and assets up for bid</p>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => {
          const styles = TAB_STYLES[t];
          const count = auctions.filter(a => (a.status || 'Upcoming') === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${tab === t ? styles.active : 'border-border text-muted-foreground hover:border-amber/50'}`}
            >
              {t}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${tab === t ? 'bg-white/20 text-white' : styles.badge}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Auction type filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['All', ...AUCTION_TYPES].map(t => (
          <button key={t} onClick={() => setAuctionType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${auctionType === t ? 'bg-steel text-white border-steel' : 'border-border text-muted-foreground hover:border-steel/50'}`}>
            {t}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} auction{filtered.length !== 1 ? 's' : ''}</p>

      {isLoading && <div className="text-center py-12 text-muted-foreground text-sm">Loading auctions…</div>}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Gavel className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No {tab.toLowerCase()} auctions at this time.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(a => {
          const lots = Array.isArray(a.featured_lots) ? a.featured_lots : [];
          const styles = TAB_STYLES[a.status || 'Upcoming'];
          return (
            <Link
              key={a.id}
              to={`/auctions/${a.id}`}
              className="block bg-card border border-border rounded-xl p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                      {a.status || 'Upcoming'}
                    </span>
                  </div>
                  {a.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {a.auction_type && (
                      <span className="bg-muted px-2 py-0.5 rounded font-medium">{a.auction_type}</span>
                    )}
                    {lots.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {lots.length} lot{lots.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {a.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {fmtDate(a.start_date)}
                        {a.end_date && ` – ${fmtDate(a.end_date)}`}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
