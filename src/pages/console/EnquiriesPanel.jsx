import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VirtualEnquiry } from '@/api/entities';
import {
  MessageSquare, Search, X, Mail, Phone, Building2,
  CheckCircle, Clock, Archive, BarChart2, TrendingUp, Users,
} from 'lucide-react';

const STATUSES = [
  { id: 'New',        label: 'New',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'Responded',  label: 'Responded',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'Closed',     label: 'Closed',     color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.id, s]));

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['New'];
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${s.color}`}>
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border border-border bg-card`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function EnquiriesPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ['virtual-enquiries'],
    queryFn: () => VirtualEnquiry.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => VirtualEnquiry.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-enquiries'] }),
  });

  const setStatus = (id, status) => updateMutation.mutate({ id, data: { status } });

  // Analytics
  const total      = enquiries.length;
  const newCount   = enquiries.filter(e => e.status === 'New').length;
  const responded  = enquiries.filter(e => e.status === 'Responded').length;

  const byExhibitor = {};
  enquiries.forEach(e => {
    byExhibitor[e.exhibitor_name] = (byExhibitor[e.exhibitor_name] || 0) + 1;
  });
  const topExhibitor = Object.entries(byExhibitor).sort((a, b) => b[1] - a[1])[0];

  // Filter
  const filtered = enquiries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.company?.toLowerCase().includes(q) ||
      e.exhibitor_name?.toLowerCase().includes(q) ||
      e.message?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="pb-12 px-4 sm:px-6 pt-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide">Enquiries</h1>
        <p className="text-muted-foreground text-sm">Information requests sent to exhibitors via the virtual exhibition</p>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={MessageSquare}  label="Total enquiries"  value={total}       color="text-amber-600"   bg="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard icon={Clock}          label="New / unactioned" value={newCount}     color="text-rose-600"    bg="bg-rose-50 dark:bg-rose-900/20" />
        <StatCard icon={CheckCircle}    label="Responded"        value={responded}    color="text-blue-600"    bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={TrendingUp}     label="Top exhibitor"
          value={topExhibitor ? topExhibitor[1] : 0}
          color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>
      {topExhibitor && (
        <p className="text-xs text-muted-foreground -mt-4 mb-6 pl-1">
          Most enquired: <span className="font-semibold text-foreground">{topExhibitor[0]}</span> ({topExhibitor[1]} enquiries)
        </p>
      )}

      {/* By exhibitor breakdown */}
      {Object.keys(byExhibitor).length > 1 && (
        <div className="mb-6 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-amber" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Enquiries by Exhibitor</p>
          </div>
          <div className="space-y-2">
            {Object.entries(byExhibitor).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">{count}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-amber h-2 rounded-full" style={{ width: `${Math.round((count / total) * 100)}%` }} />
                </div>
                <span className="text-xs font-medium truncate max-w-[160px]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name, email, exhibitor, message…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
        {STATUSES.map(s => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(statusFilter === s.id ? 'all' : s.id)}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              statusFilter === s.id ? 'border-amber bg-amber/10 text-amber' : 'border-border text-muted-foreground hover:border-amber/40'
            }`}
          >
            {s.label}
            <span className="ml-1.5 opacity-70">{enquiries.filter(e => e.status === s.id).length}</span>
          </button>
        ))}
        {(search || statusFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Enquiries list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {search || statusFilter !== 'all' ? 'No enquiries match your filter.' : 'No enquiries yet.'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(e => {
              const isOpen = expanded === e.id;
              return (
                <div key={e.id} className="px-4 py-3">
                  {/* Row header */}
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : e.id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0 text-amber font-bold text-sm mt-0.5">
                      {e.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{e.name}</p>
                        <StatusBadge status={e.status || 'New'} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.email}{e.company ? ` · ${e.company}` : ''}
                      </p>
                      <p className="text-xs text-amber font-medium truncate mt-0.5">{e.exhibitor_name}</p>
                      {!isOpen && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{e.message}</p>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-shrink-0 mt-1">{fmt(e.created_date)}</p>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-3 ml-12 space-y-3">
                      <div className="bg-muted/50 rounded-xl p-3 text-sm text-foreground whitespace-pre-wrap">{e.message || '—'}</div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {e.email && (
                          <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-amber transition-colors">
                            <Mail className="w-3 h-3" /> {e.email}
                          </a>
                        )}
                        {e.phone && (
                          <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-amber transition-colors">
                            <Phone className="w-3 h-3" /> {e.phone}
                          </a>
                        )}
                        {e.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {e.company}
                          </span>
                        )}
                      </div>

                      {/* Status actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Mark as:</span>
                        {STATUSES.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setStatus(e.id, s.id)}
                            disabled={e.status === s.id || updateMutation.isPending}
                            className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all disabled:opacity-40 ${
                              e.status === s.id
                                ? 'border-amber bg-amber/10 text-amber cursor-default'
                                : 'border-border hover:border-amber/50 hover:bg-muted'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
