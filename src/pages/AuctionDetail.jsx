import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Auction } from '@/api/entities';
import {
  ArrowLeft, Gavel, Calendar, Package, Tag, Radio, CheckCircle,
} from 'lucide-react';

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtCurrency(val) {
  if (!val && val !== 0) return null;
  return `USD ${Number(val).toLocaleString()}`;
}

const STATUS_STYLES = {
  Live: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Upcoming: 'bg-amber/10 text-amber border border-amber/20',
  Closed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => Auction.get(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-muted-foreground text-sm">Auction not found.</p>
        <button onClick={() => navigate('/auctions')} className="mt-3 text-amber text-sm underline">Back to auctions</button>
      </div>
    );
  }

  const lots = Array.isArray(auction.featured_lots) ? auction.featured_lots : [];
  const status = auction.status || 'Upcoming';
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Upcoming;

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to auctions
        </button>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-xl font-bold leading-tight">{auction.title}</h1>
              {auction.organiser && (
                <p className="text-sm text-amber font-medium mt-1">{auction.organiser}</p>
              )}
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1 ${statusStyle}`}>
              {status === 'Live' && <Radio className="w-3 h-3 animate-pulse" />}
              {status === 'Closed' && <CheckCircle className="w-3 h-3" />}
              {status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            {auction.auction_type && (
              <span className="bg-muted px-2 py-0.5 rounded font-medium">{auction.auction_type}</span>
            )}
            {lots.length > 0 && (
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> {lots.length} lot{lots.length !== 1 ? 's' : ''}
              </span>
            )}
            {auction.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Opens {fmtDate(auction.start_date)}
              </span>
            )}
            {auction.end_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Closes {fmtDate(auction.end_date)}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {auction.description && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide mb-2">About this Auction</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{auction.description}</p>
          </div>
        )}

        {/* Contact / Registration */}
        {(auction.contact_email || auction.registration_url || auction.location) && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide mb-1">Details</h2>
            {auction.location && (
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Location:</span> {auction.location}</p>
            )}
            {auction.contact_email && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Contact:</span>{' '}
                <a href={`mailto:${auction.contact_email}`} className="text-amber underline">{auction.contact_email}</a>
              </p>
            )}
            {auction.registration_url && (
              <a
                href={auction.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-amber text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity mt-1"
              >
                Register / Bid Online
              </a>
            )}
          </div>
        )}

        {/* Lots */}
        {lots.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <Package className="w-4 h-4 text-amber" /> Featured Lots
            </h2>
            {lots.map((lot, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                        Lot {lot.lot_number || i + 1}
                      </span>
                      {lot.category && (
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> {lot.category}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm mt-1">{lot.title}</p>
                    {lot.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lot.description}</p>
                    )}
                  </div>
                  {lot.reserve_price && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-muted-foreground">Reserve</p>
                      <p className="text-sm font-bold text-amber">{fmtCurrency(lot.reserve_price)}</p>
                    </div>
                  )}
                </div>
                {(lot.year || lot.make || lot.model || lot.hours || lot.condition) && (
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {lot.year && <span><strong>Year:</strong> {lot.year}</span>}
                    {lot.make && <span><strong>Make:</strong> {lot.make}</span>}
                    {lot.model && <span><strong>Model:</strong> {lot.model}</span>}
                    {lot.hours && <span><strong>Hours:</strong> {lot.hours}</span>}
                    {lot.condition && <span><strong>Condition:</strong> {lot.condition}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {status === 'Closed' && (
          <div className="bg-muted/50 border border-border rounded-2xl p-4 text-center text-sm text-muted-foreground">
            This auction has closed. Results may be available from the organiser.
          </div>
        )}
      </div>
    </div>
  );
}
