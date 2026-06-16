import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdSlot, Announcement, Exhibitor, EngagementEvent, MeetingRequest,
} from '@/api/entities';
import {
  Megaphone, Sparkles, BarChart2, TrendingUp, MousePointerClick,
  Plus, Trash2, Eye, EyeOff, Download, Calendar, Users,
  ChevronDown, ChevronUp, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const TIER_COLORS = {
  Diamond: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  Gold:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  Chrome:  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Copper:  'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
};

const GRADIENT_OPTIONS = [
  { label: 'Amber', value: 'from-amber-700 to-amber-900' },
  { label: 'Orange', value: 'from-orange-700 to-orange-900' },
  { label: 'Slate', value: 'from-slate-700 to-slate-900' },
  { label: 'Blue', value: 'from-blue-800 to-blue-900' },
  { label: 'Emerald', value: 'from-emerald-800 to-emerald-900' },
  { label: 'Zinc', value: 'from-zinc-700 to-zinc-900' },
  { label: 'Violet', value: 'from-violet-800 to-violet-900' },
];

const EMPTY_SLOT = {
  company: '', headline: '', sub: '', label: 'Diamond Exhibitor',
  logo_url: '', url: '', bg: 'from-slate-700 to-slate-900',
  exhibitor_id: '', exhibitor_name: '',
};

const EMPTY_POST = {
  type: 'General', title: '', body: '', sponsored: true, sponsor_name: '',
};

function exportCSV(rows, filename, headers) {
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function MarketingHub() {
  const qc = useQueryClient();

  // Dialog state
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [slotForm, setSlotForm] = useState(EMPTY_SLOT);
  const [postForm, setPostForm] = useState(EMPTY_POST);
  const [deleteSlotId, setDeleteSlotId] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);
  const [expandedSection, setExpandedSection] = useState('ads');

  // Data queries
  const { data: adSlots = [] } = useQuery({
    queryKey: ['adslots'],
    queryFn: () => AdSlot.list('-created_date'),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => Announcement.list('-created_date'),
  });

  const { data: exhibitors = [] } = useQuery({
    queryKey: ['exhibitors-all'],
    queryFn: () => Exhibitor.list(null),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['engagements-all'],
    queryFn: () => EngagementEvent.list('-created_date'),
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings-all'],
    queryFn: () => MeetingRequest.list('-created_date'),
  });

  // Derived data
  const sponsoredPosts = announcements.filter(a => a.sponsored);
  const activeSlots = adSlots.filter(s => s.active !== false);
  const adClicks = events.filter(e => e.type === 'ad_click');
  const totalEngagements = events.length;

  // Tier breakdown
  const tierCounts = { Diamond: 0, Gold: 0, Chrome: 0, Copper: 0 };
  exhibitors.forEach(e => { if (tierCounts[e.tier] !== undefined) tierCounts[e.tier]++; });

  // Ad clicks by exhibitor (for performance table)
  const clicksByExhibitor = {};
  adClicks.forEach(e => {
    const name = e.exhibitor_name || 'Unknown';
    clicksByExhibitor[name] = (clicksByExhibitor[name] || 0) + 1;
  });
  const topExhibitors = Object.entries(clicksByExhibitor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Mutations — AdSlot
  const createSlot = useMutation({
    mutationFn: (data) => AdSlot.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adslots'] }); setSlotDialogOpen(false); setSlotForm(EMPTY_SLOT); },
  });
  const toggleSlot = useMutation({
    mutationFn: ({ id, active }) => AdSlot.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adslots'] }),
  });
  const deleteSlot = useMutation({
    mutationFn: (id) => AdSlot.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adslots'] }); setDeleteSlotId(null); },
  });

  // Mutations — Sponsored Announcements
  const createPost = useMutation({
    mutationFn: (data) => Announcement.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); setPostDialogOpen(false); setPostForm(EMPTY_POST); },
  });
  const deletePost = useMutation({
    mutationFn: (id) => Announcement.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); setDeletePostId(null); },
  });

  // Report exports
  const exportEngagementReport = () => {
    exportCSV(
      events.map(e => [e.type, e.source, e.exhibitor_name, e.created_date]),
      'minecon_engagement_report.csv',
      ['Type', 'Source', 'Exhibitor', 'Date'],
    );
  };

  const exportSponsoredPostsReport = () => {
    exportCSV(
      sponsoredPosts.map(a => [a.title, a.sponsor_name, a.type, a.created_date]),
      'minecon_sponsored_posts.csv',
      ['Title', 'Sponsor', 'Type', 'Date'],
    );
  };

  const exportAdPerformanceReport = () => {
    exportCSV(
      adSlots.map(s => [
        s.company, s.headline, s.active ? 'Active' : 'Paused',
        clicksByExhibitor[s.company] || 0, s.created_date,
      ]),
      'minecon_ad_performance.csv',
      ['Company', 'Headline', 'Status', 'Ad Clicks', 'Created'],
    );
  };

  const kpis = [
    { label: 'Active Ad Slots',     value: activeSlots.length,      icon: Layers,            bg: 'bg-amber-50 dark:bg-amber-950/30',   color: 'text-amber' },
    { label: 'Sponsored Posts',     value: sponsoredPosts.length,   icon: Sparkles,          bg: 'bg-violet-50 dark:bg-violet-950/30', color: 'text-violet-500' },
    { label: 'Total Ad Clicks',     value: adClicks.length,         icon: MousePointerClick, bg: 'bg-emerald-50 dark:bg-emerald-950/30', color: 'text-emerald-500' },
    { label: 'Total Engagements',   value: totalEngagements,        icon: BarChart2,         bg: 'bg-blue-50 dark:bg-blue-950/30',     color: 'text-blue-500' },
  ];

  const toggle = (section) => setExpandedSection(v => v === section ? null : section);

  return (
    <div className="pb-12 px-4 sm:px-6 pt-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber" /> Marketing Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage ad inventory, sponsored posts, and monitor performance.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl border border-border p-4`}>
            <div className={`${color} mb-2`}><Icon className="w-5 h-5" /></div>
            <div className="font-heading text-3xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Ad Carousel Inventory ── */}
      <Section
        id="ads"
        title="Ad Carousel Inventory"
        icon={<Layers className="w-4 h-4 text-amber" />}
        expanded={expandedSection === 'ads'}
        onToggle={() => toggle('ads')}
        action={
          <Button size="sm" onClick={() => { setSlotForm(EMPTY_SLOT); setSlotDialogOpen(true); }} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Slot
          </Button>
        }
      >
        {adSlots.length === 0 ? (
          <EmptyState icon={<Layers className="w-8 h-8 text-muted-foreground" />} label="No ad slots configured" sub="Add a slot to populate the home screen carousel." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Company</th>
                  <th className="text-left px-3 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Headline</th>
                  <th className="text-left px-3 py-3 font-semibold text-muted-foreground hidden md:table-cell">Clicks</th>
                  <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {adSlots.map(slot => (
                  <tr key={slot.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {slot.logo_url && (
                          <div className="w-7 h-7 bg-white border border-border rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img src={slot.logo_url} alt={slot.company} className="w-6 h-6 object-contain" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{slot.company}</p>
                          <p className="text-xs text-muted-foreground">{slot.label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground text-xs hidden sm:table-cell max-w-[200px] truncate">
                      {slot.headline}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="font-bold text-emerald-600">{clicksByExhibitor[slot.company] || 0}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={slot.active !== false}
                          onCheckedChange={(v) => toggleSlot.mutate({ id: slot.id, active: v })}
                        />
                        <span className="text-xs text-muted-foreground">
                          {slot.active !== false ? 'Live' : 'Paused'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setDeleteSlotId(slot.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── Sponsored Announcements ── */}
      <Section
        id="posts"
        title="Sponsored Announcements"
        icon={<Sparkles className="w-4 h-4 text-amber" />}
        expanded={expandedSection === 'posts'}
        onToggle={() => toggle('posts')}
        action={
          <Button size="sm" onClick={() => { setPostForm(EMPTY_POST); setPostDialogOpen(true); }} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Post
          </Button>
        }
      >
        {sponsoredPosts.length === 0 ? (
          <EmptyState icon={<Sparkles className="w-8 h-8 text-muted-foreground" />} label="No sponsored posts yet" sub="Create a sponsored announcement to sell premium placement in the attendee feed." />
        ) : (
          <div className="space-y-2 p-1">
            {sponsoredPosts.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl border border-amber/30 bg-amber-50/30 dark:bg-amber-950/10">
                <Sparkles className="w-4 h-4 text-amber mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold">{a.title}</p>
                    {a.sponsor_name && (
                      <span className="text-[10px] font-bold bg-amber/20 text-amber px-1.5 py-0.5 rounded">{a.sponsor_name}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{a.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {a.created_date ? new Date(a.created_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                </div>
                <button
                  onClick={() => setDeletePostId(a.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Performance ── */}
      <Section
        id="performance"
        title="Ad Performance"
        icon={<TrendingUp className="w-4 h-4 text-amber" />}
        expanded={expandedSection === 'performance'}
        onToggle={() => toggle('performance')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-1">
          {/* Top exhibitors by ad clicks */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Ad Clicks by Exhibitor</p>
            {topExhibitors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ad click data yet.</p>
            ) : (
              <div className="space-y-2">
                {topExhibitors.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium truncate">{name}</span>
                      <span className="font-bold tabular-nums ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber rounded-full"
                        style={{ width: `${(count / (topExhibitors[0]?.[1] || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue pipeline — tier breakdown */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Exhibitor Tier Pipeline</p>
            <div className="space-y-2.5">
              {Object.entries(tierCounts).map(([tier, count]) => (
                <div key={tier} className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-16 text-center flex-shrink-0 ${TIER_COLORS[tier]}`}>
                    {tier}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber rounded-full"
                      style={{ width: `${exhibitors.length > 0 ? (count / exhibitors.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold tabular-nums w-6 text-right flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {tierCounts.Diamond + tierCounts.Gold} premium exhibitors (Diamond + Gold) eligible for lead export &amp; ad placement.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Reports ── */}
      <Section
        id="reports"
        title="Reports & Exports"
        icon={<Download className="w-4 h-4 text-amber" />}
        expanded={expandedSection === 'reports'}
        onToggle={() => toggle('reports')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1">
          {[
            {
              label: 'Engagement Events',
              sub: `${events.length} records — all booth visits, QR scans, ad clicks`,
              icon: BarChart2,
              fn: exportEngagementReport,
            },
            {
              label: 'Sponsored Posts',
              sub: `${sponsoredPosts.length} posts — title, sponsor, type, date`,
              icon: Sparkles,
              fn: exportSponsoredPostsReport,
              disabled: sponsoredPosts.length === 0,
            },
            {
              label: 'Ad Performance',
              sub: `${adSlots.length} slots — company, status, click counts`,
              icon: MousePointerClick,
              fn: exportAdPerformanceReport,
              disabled: adSlots.length === 0,
            },
          ].map(({ label, sub, icon: Icon, fn, disabled }) => (
            <button
              key={label}
              onClick={fn}
              disabled={disabled}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/40 active:scale-95 transition-all duration-150 text-left disabled:opacity-40 disabled:pointer-events-none"
            >
              <div className="w-9 h-9 bg-amber/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</p>
                <p className="text-xs text-amber font-semibold mt-1.5 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download CSV
                </p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Add Ad Slot Dialog ── */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Ad Slot</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); if (!slotForm.company || !slotForm.headline) return; createSlot.mutate(slotForm); }}
            className="space-y-3 pt-1"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Company Name</label>
                <Input
                  placeholder="e.g. SANY Group"
                  value={slotForm.company}
                  onChange={e => setSlotForm(f => ({ ...f, company: e.target.value, exhibitor_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Ad Label</label>
                <Input
                  placeholder="Diamond Exhibitor"
                  value={slotForm.label}
                  onChange={e => setSlotForm(f => ({ ...f, label: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Background</label>
                <Select value={slotForm.bg} onValueChange={v => setSlotForm(f => ({ ...f, bg: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADIENT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Headline</label>
                <Input
                  placeholder="World-Class Mining Equipment"
                  value={slotForm.headline}
                  onChange={e => setSlotForm(f => ({ ...f, headline: e.target.value }))}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Subtext</label>
                <Input
                  placeholder="Visit Booth A07 · Main Hall"
                  value={slotForm.sub}
                  onChange={e => setSlotForm(f => ({ ...f, sub: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Logo URL</label>
                <Input
                  placeholder="https://…/logo.png"
                  value={slotForm.logo_url}
                  onChange={e => setSlotForm(f => ({ ...f, logo_url: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Destination URL</label>
                <Input
                  placeholder="https://company.com or /register"
                  value={slotForm.url}
                  onChange={e => setSlotForm(f => ({ ...f, url: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="pt-1">
              <Button type="button" variant="outline" onClick={() => setSlotDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createSlot.isPending}>
                {createSlot.isPending ? 'Saving…' : 'Create Slot'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Sponsored Post Dialog ── */}
      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Sponsored Post</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); if (!postForm.title || !postForm.body) return; createPost.mutate(postForm); }}
            className="space-y-3 pt-1"
          >
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Sponsor Name</label>
              <Input
                placeholder="e.g. SANY Group"
                value={postForm.sponsor_name}
                onChange={e => setPostForm(f => ({ ...f, sponsor_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Type</label>
              <Select value={postForm.type} onValueChange={v => setPostForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Headline</label>
              <Input
                placeholder="Announcement title"
                value={postForm.title}
                onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Body</label>
              <Textarea
                rows={3}
                placeholder="Message to attendees…"
                value={postForm.body}
                onChange={e => setPostForm(f => ({ ...f, body: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPostDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createPost.isPending}>
                {createPost.isPending ? 'Saving…' : 'Publish Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Ad Slot confirm */}
      <Dialog open={!!deleteSlotId} onOpenChange={open => !open && setDeleteSlotId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Remove Ad Slot</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This slot will be removed from the carousel immediately.</p>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeleteSlotId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteSlot.isPending} onClick={() => deleteSlot.mutate(deleteSlotId)}>
              {deleteSlot.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sponsored Post confirm */}
      <Dialog open={!!deletePostId} onOpenChange={open => !open && setDeletePostId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Sponsored Post</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This post will be removed from the attendee feed immediately.</p>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeletePostId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deletePost.isPending} onClick={() => deletePost.mutate(deletePostId)}>
              {deletePost.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ id, title, icon, expanded, onToggle, action, children }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <span className="font-heading text-sm font-bold uppercase tracking-wide flex items-center gap-2">
          {icon} {title}
        </span>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {action}
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, label, sub }) {
  return (
    <div className="py-10 px-4 text-center">
      <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{sub}</p>}
    </div>
  );
}