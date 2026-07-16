import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Auction } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import {
  ArrowLeft, Gavel, Calendar, Package, Tag, Radio, CheckCircle,
  ChevronLeft, ChevronRight, X, AlertCircle, Loader2, CheckCircle2,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-ZW', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtUSD(val) {
  if (val == null || val === '') return null;
  return `USD ${Number(val).toLocaleString()}`;
}

function ImageCarousel({ images, alt }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div className="relative bg-black aspect-video select-none">
      <img
        src={images[idx]}
        alt={`${alt} ${idx + 1}`}
        className="w-full h-full object-contain"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx(n => (n - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx(n => (n + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, j) => (
              <button
                key={j}
                onClick={() => setIdx(j)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${j === idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── LotSheet (slide-up modal with bid form) ───────────────────────────────────

function LotSheet({ lot, auctionId, isLive, onClose, onBidPlaced }) {
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [name, setName]   = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState(null);

  const currentBid = Number(lot?.current_bid) || 0;
  const increment  = Number(lot?.bid_increment) || 500;
  const starting   = Number(lot?.starting_bid)  || 0;
  const minBid     = currentBid > 0 ? currentBid + increment : starting;

  const mutation = useMutation({
    mutationFn: (data) => Auction.placeBid(auctionId, lot.lot_number, data),
    onSuccess: (data) => {
      setSuccess(`Your bid of ${fmtUSD(data.lot?.current_bid)} has been placed!`);
      onBidPlaced();
      setTimeout(onClose, 2500);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(bidAmount);
    if (!amount || amount < minBid) return;
    mutation.mutate({ bid_amount: amount, bidder_name: name.trim(), bidder_email: email.trim() });
  }

  if (!lot) return null;

  const images = Array.isArray(lot.images) ? lot.images.filter(Boolean) : [];
  const canBid = isLive && lot.status === 'Open';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-2xl pointer-events-auto bg-card border-t border-border rounded-t-2xl max-h-[92vh] flex flex-col">
          {/* Drag handle */}
          <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex-shrink-0 flex items-start gap-3 px-5 pb-3 border-b border-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  Lot {lot.lot_number}
                </span>
                {lot.category && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" /> {lot.category}
                  </span>
                )}
                {lot.status && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lot.status === 'Open'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {lot.status}
                  </span>
                )}
              </div>
              <h2 className="font-heading font-bold text-base mt-1 leading-tight">{lot.title}</h2>
              {lot.seller_name && (
                <p className="text-xs text-muted-foreground mt-0.5">Seller: {lot.seller_name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Image carousel */}
            {images.length > 0 && (
              <ImageCarousel images={images} alt={lot.title} />
            )}

            <div className="p-5 space-y-5">
              {/* Description */}
              {lot.description && (
                <p className="text-sm text-foreground/80 leading-relaxed">{lot.description}</p>
              )}

              {/* Pricing grid */}
              <div className="grid grid-cols-2 gap-2">
                {starting > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted-foreground font-medium">Starting Bid</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {fmtUSD(starting)}
                    </p>
                  </div>
                )}
                {lot.reserve_price > 0 && (
                  <div className="bg-amber/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted-foreground font-medium">Reserve Price</p>
                    <p className="text-sm font-bold text-amber mt-0.5">{fmtUSD(lot.reserve_price)}</p>
                  </div>
                )}
                {increment > 0 && (
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted-foreground font-medium">Bid Increment</p>
                    <p className="text-sm font-bold mt-0.5">{fmtUSD(increment)}</p>
                  </div>
                )}
                <div className={`rounded-xl p-3 text-center ${
                  currentBid > 0
                    ? 'bg-rose-50 dark:bg-rose-900/20'
                    : 'bg-muted'
                }`}>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {currentBid > 0 ? 'Current Bid' : 'No Bids Yet'}
                  </p>
                  <p className={`text-sm font-bold mt-0.5 ${currentBid > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                    {currentBid > 0 ? fmtUSD(currentBid) : '—'}
                  </p>
                  {lot.bid_count > 0 && (
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {lot.bid_count} bid{lot.bid_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Bid section */}
              {canBid && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted px-4 py-2.5 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber" />
                    <span className="text-sm font-semibold">Place a Bid</span>
                  </div>

                  {success ? (
                    <div className="p-5 flex flex-col items-center gap-2 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{success}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="p-4 space-y-3">
                      {/* Min bid callout */}
                      <div className="bg-amber/10 border border-amber/20 rounded-lg px-3 py-2 text-xs">
                        <span className="text-muted-foreground">Minimum next bid: </span>
                        <span className="font-bold text-amber">{fmtUSD(minBid)}</span>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-xs font-medium mb-1 text-muted-foreground">
                          Your Bid (USD) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={minBid}
                          step={increment}
                          value={bidAmount}
                          onChange={e => setBidAmount(e.target.value)}
                          placeholder={minBid.toLocaleString()}
                          required
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber"
                        />
                      </div>

                      {/* Name + Email row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-muted-foreground">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-muted-foreground">
                            Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber"
                          />
                        </div>
                      </div>

                      {/* Error */}
                      {mutation.isError && (
                        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          {mutation.error?.message || 'Bid failed. Please try again.'}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={mutation.isPending || !bidAmount || Number(bidAmount) < minBid}
                        className="w-full flex items-center justify-center gap-2 bg-amber text-white font-semibold text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {mutation.isPending ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Placing bid…</>
                        ) : (
                          <><Gavel className="w-4 h-4" /> Place Bid</>
                        )}
                      </button>

                      <p className="text-[10px] text-muted-foreground text-center">
                        By bidding you confirm you have read and accept the auction terms.
                      </p>
                    </form>
                  )}
                </div>
              )}

              {!canBid && lot.status !== 'Open' && (
                <div className="text-center py-3 text-sm text-muted-foreground bg-muted/50 rounded-xl">
                  This lot is {lot.status === 'Closed' ? 'closed' : 'not yet open'} for bidding.
                </div>
              )}

              {!canBid && isLive && lot.status === 'Open' && (
                <div className="text-center py-3 text-sm text-muted-foreground bg-muted/50 rounded-xl">
                  Bidding is not available at this time.
                </div>
              )}

              {!isLive && (
                <div className="text-center py-3 text-sm text-muted-foreground bg-muted/50 rounded-xl">
                  Bidding opens when this auction goes live.
                </div>
              )}

              <div className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── LotCard (auction detail list) ─────────────────────────────────────────────

function LotCard({ lot, index, isLive, onSelect }) {
  const images = Array.isArray(lot.images) ? lot.images.filter(Boolean) : [];
  const [imgIdx, setImgIdx] = useState(0);
  const currentBid = Number(lot.current_bid) || 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {images.length > 0 && (
        <div className="relative bg-black aspect-video">
          <img
            src={images[imgIdx]}
            alt={`${lot.title} photo ${imgIdx + 1}`}
            className="w-full h-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(n => (n - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImgIdx(n => (n + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, j) => (
                  <button key={j} onClick={() => setImgIdx(j)} className={`w-1.5 h-1.5 rounded-full ${j === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                Lot {lot.lot_number || index + 1}
              </span>
              {lot.category && (
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {lot.category}
                </span>
              )}
            </div>
            <p className="font-semibold text-sm mt-1">{lot.title}</p>
          </div>

          {currentBid > 0 && (
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-muted-foreground">Current Bid</p>
              <p className="text-sm font-bold text-rose-500">{fmtUSD(currentBid)}</p>
              {lot.bid_count > 0 && (
                <p className="text-[10px] text-muted-foreground">{lot.bid_count} bid{lot.bid_count !== 1 ? 's' : ''}</p>
              )}
            </div>
          )}
        </div>

        {/* Pricing tiles */}
        {(lot.starting_bid || lot.reserve_price || lot.bid_increment) && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {lot.starting_bid > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted-foreground font-medium">Starting</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmtUSD(lot.starting_bid)}</p>
              </div>
            )}
            {lot.reserve_price > 0 && (
              <div className="bg-amber/10 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted-foreground font-medium">Reserve</p>
                <p className="text-xs font-bold text-amber">{fmtUSD(lot.reserve_price)}</p>
              </div>
            )}
            {lot.bid_increment > 0 && (
              <div className="bg-muted rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted-foreground font-medium">Increment</p>
                <p className="text-xs font-bold">{fmtUSD(lot.bid_increment)}</p>
              </div>
            )}
          </div>
        )}

        {lot.description && (
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">{lot.description}</p>
        )}

        {/* View & Bid button */}
        <button
          onClick={() => onSelect(lot)}
          className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-colors ${
            isLive && lot.status === 'Open'
              ? 'bg-amber text-white hover:opacity-90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          {isLive && lot.status === 'Open' ? 'View & Place Bid' : 'View Lot Details'}
        </button>
      </div>
    </div>
  );
}

// ── Status styles ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Live:     'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Upcoming: 'bg-amber/10 text-amber border border-amber/20',
  Closed:   'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeLot, setActiveLot] = useState(null);

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => Auction.get(id),
    refetchInterval: 30_000,
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
        <button onClick={() => navigate('/auctions')} className="mt-3 text-amber text-sm underline">
          Back to auctions
        </button>
      </div>
    );
  }

  const lots      = Array.isArray(auction.featured_lots) ? auction.featured_lots : [];
  const status    = auction.status || 'Upcoming';
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Upcoming;
  const isLive    = status === 'Live';

  // Keep activeLot in sync with fresh data after bid refetch
  const syncedLot = activeLot
    ? lots.find(l => String(l.lot_number) === String(activeLot.lot_number)) ?? activeLot
    : null;

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to auctions
        </button>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Header card */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-xl font-bold leading-tight">{auction.title}</h1>
              {auction.organiser && (
                <p className="text-sm text-amber font-medium mt-1">{auction.organiser}</p>
              )}
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1 ${statusStyle}`}>
              {isLive && <Radio className="w-3 h-3 animate-pulse" />}
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

        {/* Details */}
        {(auction.contact_email || auction.registration_url || auction.location) && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide mb-1">Details</h2>
            {auction.location && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Location:</span> {auction.location}
              </p>
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
          <div className="space-y-3">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <Package className="w-4 h-4 text-amber" /> Featured Lots
            </h2>
            {lots.map((lot, i) => (
              <LotCard
                key={i}
                lot={lot}
                index={i}
                isLive={isLive}
                onSelect={setActiveLot}
              />
            ))}
          </div>
        )}

        {status === 'Closed' && (
          <div className="bg-muted/50 border border-border rounded-2xl p-4 text-center text-sm text-muted-foreground">
            This auction has closed. Results may be available from the organiser.
          </div>
        )}
      </div>

      {/* Lot detail + bid sheet */}
      {syncedLot && (
        <LotSheet
          lot={syncedLot}
          auctionId={id}
          isLive={isLive}
          onClose={() => setActiveLot(null)}
          onBidPlaced={() => queryClient.invalidateQueries({ queryKey: ['auction', id] })}
        />
      )}
    </div>
  );
}
