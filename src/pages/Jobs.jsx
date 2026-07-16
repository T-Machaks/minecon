import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { JobListing } from '@/api/entities';
import { Briefcase, Search, MapPin, Clock, ChevronRight } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/lib/jobConstants';

const ALL_CATEGORIES = ['All', ...JOB_CATEGORIES];
const ALL_TYPES = ['All', ...JOB_TYPES];

function daysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24));
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Jobs() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['job-listings'],
    queryFn: () => JobListing.list('-created_date'),
  });

  const open = jobs.filter(j => (j.status || 'Open') === 'Open');

  const filtered = open.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      j.title?.toLowerCase().includes(q) ||
      j.company_name?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q);
    const matchCategory = category === 'All' || j.category === category;
    const matchType = type === 'All' || j.type === type;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="pb-24 px-4 pt-5 max-w-2xl lg:max-w-4xl mx-auto">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wide mb-1 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-amber" /> Jobs Board
      </h1>
      <p className="text-sm text-muted-foreground mb-4">Roles posted by MineCon 2026 exhibitors</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, company or location…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-2">
        {ALL_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${category === c ? 'bg-amber text-white border-amber' : 'border-border text-muted-foreground hover:border-amber/50'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {ALL_TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${type === t ? 'bg-steel text-white border-steel' : 'border-border text-muted-foreground hover:border-steel/50'}`}>
            {t}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} open position{filtered.length !== 1 ? 's' : ''}</p>

      {isLoading && <div className="text-center py-12 text-muted-foreground text-sm">Loading jobs…</div>}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No open positions match your search.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(job => {
          const left = daysLeft(job.closing_date);
          return (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block bg-card border border-border rounded-xl p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{job.title}</p>
                  <p className="text-xs text-amber font-medium mt-0.5">{job.company_name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                    )}
                    {job.type && (
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>
                    )}
                    {job.category && (
                      <span className="bg-muted px-2 py-0.5 rounded font-medium">{job.category}</span>
                    )}
                    {job.closing_date && (
                      <span className={`flex items-center gap-1 ${left !== null && left <= 3 ? 'text-red-500 font-semibold' : ''}`}>
                        <Clock className="w-3 h-3" /> Closes {fmtDate(job.closing_date)}{left !== null && left >= 0 ? ` · ${left}d left` : ''}
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
