import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobListing, JobApplication } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import {
  ArrowLeft, Briefcase, MapPin, Clock, Send, CheckCircle, Lock, LogIn, UserPlus,
} from 'lucide-react';

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job-listing', id],
    queryFn: () => JobListing.get(id),
  });

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.full_name || f.name,
        email: user.email || f.email,
        phone: user.phone || f.phone,
      }));
    }
  }, [user]);

  const applyMutation = useMutation({
    mutationFn: (data) => JobApplication.create(data),
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    applyMutation.mutate({
      job_id: job.id,
      job_title: job.title,
      exhibitor_id: job.exhibitor_id,
      company_name: job.company_name,
      ...form,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-muted-foreground text-sm">Job not found.</p>
        <button onClick={() => navigate('/jobs')} className="mt-3 text-amber text-sm underline">Back to jobs</button>
      </div>
    );
  }

  const isClosed = (job.status || 'Open') !== 'Open';

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </button>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="font-heading text-xl font-bold leading-tight">{job.title}</h1>
              <p className="text-sm text-amber font-medium mt-1">{job.company_name}</p>
            </div>
            {isClosed && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">Closed</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
            {job.type && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>}
            {job.category && <span className="bg-muted px-2 py-0.5 rounded font-medium">{job.category}</span>}
            {job.closing_date && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Closes {fmtDate(job.closing_date)}</span>}
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide mb-2">About the Role</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide mb-2">Requirements</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
          </div>
        )}

        {/* Apply form */}
        {isClosed ? (
          <div className="bg-muted/50 border border-border rounded-2xl p-4 text-center text-sm text-muted-foreground">
            This position is no longer accepting applications.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-amber" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide">Apply Now</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Your application will be sent to {job.company_name}.</p>

            {!isAuthenticated ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <Lock className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Sign in to apply for this role.</p>
                <div className="flex gap-2">
                  <Link to="/login" className="flex items-center gap-1.5 bg-amber text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </Link>
                  <Link to="/signup" className="flex items-center gap-1.5 border border-border text-xs font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                    <UserPlus className="w-3.5 h-3.5" /> Create Account
                  </Link>
                </div>
              </div>
            ) : submitted ? (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Application submitted!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{job.company_name} will be in touch if your profile is a match.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Full Name</label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                    <input
                      type="email" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Phone (optional)</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+263 7X XXX XXXX"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Cover Note</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Briefly introduce yourself and highlight your relevant experience…"
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber resize-none"
                  />
                </div>
                {formError && <p className="text-xs text-red-500">{formError}</p>}
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="w-full bg-amber text-white font-semibold text-sm py-2.5 rounded-xl hover:opacity-90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
