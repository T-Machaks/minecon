import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exhibitor, VirtualEnquiry } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import {
  Inbox, Mail, Phone, Building2, Clock,
  CheckCircle, Archive, Search, X, MessageSquare,
} from 'lucide-react';

const STATUSES = [
  { id: 'New',       label: 'New',       color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'Responded', label: 'Responded', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'Closed',    label: 'Closed',    color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.id, s]));

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['New'];
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function ExhibitorEnquiries() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const { data: exhibitors = [] } = useQuery({
    queryKey: ['exhibitors'],
    queryFn: () => Exhibitor.list(),
  });

  const myBooth = exhibitors.find(e =>
    e.contact_email?.toLowerCase() === user?.email?.toLowerCase() ||
    (user?.company && e.name?.toLowerCase() === user.company.toLowerCase())
  );

  const { data: allEnquiries = [], isLoading } = useQuery({
    queryKey: ['virtual-enquiries'],
    queryFn: () => VirtualEnquiry.list('-created_date'),
    enabled: !!myBooth,
  });

  const enquiries = allEnquiries.filter(e => e.exhibitor_id === myBooth?.id);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => VirtualEnquiry.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-enquiries'] }),
  });

  const setStatus = (id, status) => updateMutation.mutate({ id, data: { status } });

  const newCount = enquiries.filter(e => (e.status || 'New') === 'New').length;

  const filtered = enquiries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.company?.toLowerCase().includes(q) ||
      e.message?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (e.status || 'New') === statusFilter;
    return matchSearch && matchStatus;
  });

  const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!myBooth) {
    return (
      <div className="px-4 pt-10 text-center">
        <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No booth linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="pb-12 px-4 pt-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold uppercase tracking-wide">Enquiries</h1>
        <p className="text-sm text-muted-foreground">Information requests sent to your booth</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total',     value: enquiries.length, icon: MessageSquare, color: 'text-amber',        bg: 'bg-amber/10' },
          { label: 'New',       value: newCount,          icon: Clock,         color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Responded', value: enquiries.filter(e => e.status === 'Responded').length, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card`}>
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-heading font-bold leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search enquiries…"
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
          </button>
        ))}
        {(search || statusFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== 'all' ? 'No enquiries match your filter.' : 'No enquiries yet — they\'ll appear here when attendees reach out.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(e => {
              const isOpen = expanded === e.id;
              const status = e.status || 'New';
              return (
                <div key={e.id} className="px-4 py-3">
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : e.id)}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5 ${
                      status === 'New' ? 'bg-amber/20 text-amber' : 'bg-muted text-muted-foreground'
                    }`}>
                      {e.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{e.name}</p>
                        <StatusBadge status={status} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{e.email}{e.company ? ` · ${e.company}` : ''}</p>
                      {!isOpen && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.message}</p>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-shrink-0 mt-1">{fmt(e.created_date)}</p>
                  </div>

                  {isOpen && (
                    <div className="mt-3 ml-12 space-y-3">
                      {/* Message */}
                      <div className="bg-muted/50 rounded-xl p-3 text-sm whitespace-pre-wrap">{e.message || '—'}</div>

                      {/* Contact links */}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {e.email && (
                          <a href={`mailto:${e.email}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber text-white font-semibold hover:opacity-90 transition-opacity">
                            <Mail className="w-3.5 h-3.5" /> Reply by Email
                          </a>
                        )}
                        {e.phone && (
                          <a href={`tel:${e.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-foreground">
                            <Phone className="w-3.5 h-3.5" /> {e.phone}
                          </a>
                        )}
                        {e.company && (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Building2 className="w-3.5 h-3.5" /> {e.company}
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
                            disabled={status === s.id || updateMutation.isPending}
                            className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all disabled:opacity-40 ${
                              status === s.id
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
