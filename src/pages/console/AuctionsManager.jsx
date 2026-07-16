import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Auction } from '@/api/entities';
import { AUCTION_TYPES, AUCTION_STATUSES, LOT_CATEGORIES } from '@/lib/auctionConstants';
import {
  Gavel, Plus, Trash2, Edit, Package, X, ChevronDown, ChevronUp, Radio,
  ImagePlus, Loader2,
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const EMPTY_LOT = {
  lot_number: '', title: '', category: LOT_CATEGORIES[0], description: '',
  year: '', make: '', model: '', hours: '', condition: 'Good',
  starting_bid: '', reserve_price: '', bid_increment: '',
  images: [],
};

const EMPTY_AUCTION = {
  title: '', description: '', auction_type: AUCTION_TYPES[0], status: 'Upcoming',
  start_date: '', end_date: '', location: '', organiser: '', contact_email: '',
  registration_url: '', featured_lots: [],
};

const STATUS_STYLES = {
  Live: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Upcoming: 'bg-amber/10 text-amber',
  Closed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

async function uploadLotImage(file, oldUrl) {
  const res = await fetch('/api/upload/lot-image-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldImageUrl: oldUrl || null }),
  });
  if (!res.ok) throw new Error('Failed to get upload URL');
  const { uploadUrl, publicUrl } = await res.json();
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': 'image/jpeg' },
  });
  if (!put.ok) throw new Error('S3 upload failed');
  return publicUrl;
}

function LotImageUploader({ images = [], onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setError('');
    setUploading(true);
    try {
      const url = await uploadLotImage(file);
      onChange([...images, url]);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="text-[11px] text-muted-foreground font-medium block mb-1.5">Photos</label>
      <div className="flex flex-wrap gap-2">
        {images.map((url, idx) => (
          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-amber/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-amber transition-colors disabled:opacity-50"
        >
          {uploading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ImagePlus className="w-4 h-4" />}
          <span className="text-[9px] font-medium leading-none">{uploading ? 'Uploading' : 'Add'}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function LotEditor({ lots, onChange }) {
  const [expanded, setExpanded] = useState(null);

  const addLot = () => {
    const next = [...lots, { ...EMPTY_LOT, lot_number: String(lots.length + 1) }];
    onChange(next);
    setExpanded(next.length - 1);
  };

  const removeLot = (i) => {
    onChange(lots.filter((_, idx) => idx !== i));
    if (expanded === i) setExpanded(null);
  };

  const updateLot = (i, field, value) => {
    onChange(lots.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Featured Lots ({lots.length})</p>
        <Button type="button" variant="outline" size="sm" onClick={addLot} className="gap-1 text-xs h-8">
          <Plus className="w-3 h-3" /> Add Lot
        </Button>
      </div>

      {lots.map((lot, i) => (
        <div key={i} className="border border-border rounded-lg overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex items-center gap-2 flex-1 text-left text-sm font-medium"
            >
              {expanded === i
                ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
              <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                Lot {lot.lot_number || i + 1}
              </span>
              <span className="truncate">{lot.title || 'Untitled lot'}</span>
              {lot.starting_bid && (
                <span className="text-xs text-amber font-semibold ml-auto flex-shrink-0">
                  Start USD {Number(lot.starting_bid).toLocaleString()}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => removeLot(i)}
              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {expanded === i && (
            <div className="p-3 space-y-3 border-t border-border">
              {/* Lot # + Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Lot #</label>
                  <Input value={lot.lot_number} onChange={e => updateLot(i, 'lot_number', e.target.value)} placeholder="1" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Category</label>
                  <Select value={lot.category} onValueChange={v => updateLot(i, 'category', v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium block mb-1">Title</label>
                <Input value={lot.title} onChange={e => updateLot(i, 'title', e.target.value)} placeholder="e.g. 2019 Caterpillar 336 Excavator" className="h-8 text-sm" />
              </div>

              {/* Year / Make / Model */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Year</label>
                  <Input value={lot.year} onChange={e => updateLot(i, 'year', e.target.value)} placeholder="2019" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Make</label>
                  <Input value={lot.make} onChange={e => updateLot(i, 'make', e.target.value)} placeholder="CAT" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Model</label>
                  <Input value={lot.model} onChange={e => updateLot(i, 'model', e.target.value)} placeholder="336" className="h-8 text-sm" />
                </div>
              </div>

              {/* Hours + Condition */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Hours / km</label>
                  <Input value={lot.hours} onChange={e => updateLot(i, 'hours', e.target.value)} placeholder="4 200 hrs" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Condition</label>
                  <Select value={lot.condition} onValueChange={v => updateLot(i, 'condition', v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Excellent', 'Good', 'Fair', 'For Parts'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bidding: Starting bid / Reserve / Increment */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Starting Bid (USD)</label>
                  <Input
                    type="number" min="0" step="any"
                    value={lot.starting_bid}
                    onChange={e => updateLot(i, 'starting_bid', e.target.value)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Reserve (USD)</label>
                  <Input
                    type="number" min="0" step="any"
                    value={lot.reserve_price}
                    onChange={e => updateLot(i, 'reserve_price', e.target.value)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-medium block mb-1">Bid Increment (USD)</label>
                  <Input
                    type="number" min="0" step="any"
                    value={lot.bid_increment}
                    onChange={e => updateLot(i, 'bid_increment', e.target.value)}
                    placeholder="500"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-muted-foreground font-medium block mb-1">Description</label>
                <Textarea
                  value={lot.description}
                  onChange={e => updateLot(i, 'description', e.target.value)}
                  rows={2}
                  placeholder="Key details, service history, notes…"
                  className="text-sm resize-none"
                />
              </div>

              {/* Images */}
              <LotImageUploader
                images={Array.isArray(lot.images) ? lot.images : []}
                onChange={imgs => updateLot(i, 'images', imgs)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AuctionForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial);
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="text-xs text-muted-foreground font-medium block mb-1">Auction Title *</label>
        <Input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Pre-Owned Mining Equipment Auction" className="text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Type</label>
          <Select value={form.auction_type} onValueChange={v => set('auction_type', v)}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AUCTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Status</label>
          <Select value={form.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AUCTION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Start Date/Time</label>
          <Input type="datetime-local" value={form.start_date} onChange={e => set('start_date', e.target.value)} className="text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">End Date/Time</label>
          <Input type="datetime-local" value={form.end_date} onChange={e => set('end_date', e.target.value)} className="text-sm" />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground font-medium block mb-1">Description</label>
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Overview of what's on auction…" className="text-sm resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Location</label>
          <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Harare Exhibition Centre" className="text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Organiser</label>
          <Input value={form.organiser} onChange={e => set('organiser', e.target.value)} placeholder="e.g. ZimAuctions Ltd" className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Contact Email</label>
          <Input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="auctions@example.com" className="text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium block mb-1">Registration URL</label>
          <Input type="url" value={form.registration_url} onChange={e => set('registration_url', e.target.value)} placeholder="https://…" className="text-sm" />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <LotEditor lots={form.featured_lots || []} onChange={lots => set('featured_lots', lots)} />
      </div>

      <div className="flex gap-2 pt-2 border-t border-border sticky bottom-0 bg-background pb-1">
        <Button type="submit" disabled={isSaving} className="bg-amber hover:bg-amber/90 text-white">
          {isSaving ? 'Saving…' : 'Save Auction'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AuctionsManager() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: auctions = [], isLoading } = useQuery({
    queryKey: ['auctions'],
    queryFn: () => Auction.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => Auction.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['auctions'] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Auction.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['auctions'] }); setDialogOpen(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => Auction.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auctions'] }),
  });

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (a) => { setEditing(a); setDialogOpen(true); };

  const handleSave = (form) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const filtered = statusFilter === 'All'
    ? auctions
    : auctions.filter(a => (a.status || 'Upcoming') === statusFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold uppercase tracking-wide flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber" /> Auctions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage auction listings and lots</p>
        </div>
        <Button onClick={openCreate} className="bg-amber hover:bg-amber/90 text-white gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> New Auction
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', ...AUCTION_STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${statusFilter === s ? 'bg-amber text-white border-amber' : 'border-border text-muted-foreground hover:border-amber/50'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-center py-8 text-muted-foreground text-sm">Loading auctions…</div>}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Gavel className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No auctions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create an auction to display it in the marketplace.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(a => {
          const lots = Array.isArray(a.featured_lots) ? a.featured_lots : [];
          const status = a.status || 'Upcoming';
          const isExpanded = expandedId === a.id;

          return (
            <div key={a.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${STATUS_STYLES[status]}`}>
                        {status === 'Live' && <Radio className="w-2.5 h-2.5 animate-pulse" />}
                        {status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {a.auction_type && <span className="bg-muted px-2 py-0.5 rounded font-medium">{a.auction_type}</span>}
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {lots.length} lot{lots.length !== 1 ? 's' : ''}</span>
                      {a.start_date && <span>{new Date(a.start_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)} className="h-8 w-8 p-0">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(a.id)} className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {lots.length > 0 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className="flex items-center gap-1.5 text-xs text-amber font-semibold hover:underline mt-3"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExpanded ? 'Hide' : 'View'} Lots
                  </button>
                )}
              </div>

              {isExpanded && lots.length > 0 && (
                <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
                  {lots.map((lot, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        {Array.isArray(lot.images) && lot.images[0] && (
                          <img src={lot.images[0]} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0 border border-border" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">Lot {lot.lot_number || i + 1}</span>
                            {lot.category && <span className="text-[10px] text-muted-foreground">{lot.category}</span>}
                            {Array.isArray(lot.images) && lot.images.length > 1 && (
                              <span className="text-[10px] text-muted-foreground">{lot.images.length} photos</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold mt-0.5">{lot.title}</p>
                          {(lot.year || lot.make || lot.model) && (
                            <p className="text-xs text-muted-foreground">{[lot.year, lot.make, lot.model].filter(Boolean).join(' ')}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-1 text-xs">
                            {lot.starting_bid && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Start: USD {Number(lot.starting_bid).toLocaleString()}</span>}
                            {lot.reserve_price && <span className="text-amber font-semibold">Reserve: USD {Number(lot.reserve_price).toLocaleString()}</span>}
                            {lot.bid_increment && <span className="text-muted-foreground">Incr: USD {Number(lot.bid_increment).toLocaleString()}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              <Gavel className="w-4 h-4 text-amber" />
              {editing ? 'Edit Auction' : 'New Auction'}
            </DialogTitle>
          </DialogHeader>
          <AuctionForm
            key={editing?.id ?? 'new'}
            initial={editing ? {
              title: editing.title || '',
              description: editing.description || '',
              auction_type: editing.auction_type || AUCTION_TYPES[0],
              status: editing.status || 'Upcoming',
              start_date: editing.start_date || '',
              end_date: editing.end_date || '',
              location: editing.location || '',
              organiser: editing.organiser || '',
              contact_email: editing.contact_email || '',
              registration_url: editing.registration_url || '',
              featured_lots: Array.isArray(editing.featured_lots) ? editing.featured_lots : [],
            } : { ...EMPTY_AUCTION }}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
