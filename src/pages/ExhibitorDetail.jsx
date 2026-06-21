import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exhibitor, VirtualEnquiry } from '@/api/entities';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { track } from '@/lib/tracking';
import TierBadge from '@/components/ui/TierBadge';
import {
  ArrowLeft, Globe, Mail, Phone, Calendar, MapPin,
  Video, Send, CheckCircle, FileText, ExternalLink, ImagePlus
} from 'lucide-react';

export default function ExhibitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings } = useAppSettings();

  const { data: ex, isLoading } = useQuery({
    queryKey: ['exhibitor', id],
    queryFn: () => Exhibitor.get(id),
  });

  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const enquireMutation = useMutation({
    mutationFn: (data) => VirtualEnquiry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-enquiries'] });
      setSubmitted(true);
    },
  });

  function handleEnquire(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    track(ex.id, ex.name, 'info_request', 'exhibitor_detail');
    enquireMutation.mutate({
      exhibitor_id: ex.id,
      exhibitor_name: ex.name,
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

  if (!ex) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-muted-foreground text-sm">Exhibitor not found.</p>
        <button onClick={() => navigate('/exhibitors')} className="mt-3 text-amber text-sm underline">Back to directory</button>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-2xl lg:max-w-4xl mx-auto">
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to directory
        </button>
      </div>

      {/* Booth stand image — full-width, above 2-col */}
      {ex.booth_image_url && (
        <div className="px-4 mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-amber" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide">Booth Stand</h2>
            </div>
            <img
              src={ex.booth_image_url}
              alt={`${ex.name} booth stand`}
              className="w-full object-cover max-h-72"
            />
          </div>
        </div>
      )}

      {/* Video embed — full-width, above 2-col */}
      {ex.video_url && (
        <div className="px-4 mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Video className="w-4 h-4 text-violet-500" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide">Company Video</h2>
            </div>
            <div className="aspect-video">
              <iframe
                src={ex.video_url}
                title={`${ex.name} video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* 2-col layout on desktop — stacked on mobile */}
      <div className="px-4 mt-4 lg:grid lg:grid-cols-5 lg:gap-6">
        {/* Left: company info + products (3/5 on desktop) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Company info card */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white border border-border rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                {ex.logo_url
                  ? <img src={ex.logo_url} alt={ex.name} className="w-14 h-14 object-contain" />
                  : <span className="font-heading text-2xl font-bold text-muted-foreground">{ex.name[0]}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="font-heading text-xl font-bold leading-tight">{ex.name}</h1>
                  <TierBadge tier={ex.tier} />
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>Booth <span className="font-bold text-foreground">{ex.booth}</span> · {ex.section || 'General'}</span>
                </div>
                <span className="inline-block mt-2 text-[11px] bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground">{ex.category}</span>
              </div>
            </div>

            {ex.description && (
              <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{ex.description}</p>
            )}
          </div>

          {/* Products / offerings */}
          {ex.products && ex.products.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide mb-3">Products & Services</h2>
              <div className="flex flex-wrap gap-2">
                {ex.products.map((p, i) => (
                  <span key={i} className="text-xs bg-muted border border-border px-2.5 py-1 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: contacts + CTAs + brochure + enquiry (2/5 on desktop) */}
        <div className="lg:col-span-2 space-y-4 mt-4 lg:mt-0">
          {/* Contact & links */}
          {(ex.website || ex.contact_email || ex.contact_phone) && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide mb-3">Contact</h2>
              <div className="flex flex-wrap gap-2">
                {ex.website && (
                  <a
                    href={ex.website}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => track(ex.id, ex.name, 'website_click', 'exhibitor_detail')}
                    className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                )}
                {ex.contact_email && (
                  <a href={`mailto:${ex.contact_email}`} className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-muted active:bg-muted transition-colors min-w-0 max-w-full overflow-hidden">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{ex.contact_email}</span>
                  </a>
                )}
                {ex.contact_phone && (
                  <a href={`tel:${ex.contact_phone}`} className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-muted active:bg-muted transition-colors">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {ex.contact_phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Primary CTAs */}
          <div className="flex gap-2">
            <Link
              to="/meetings"
              state={{ exhibitor: ex }}
              onClick={() => track(ex.id, ex.name, 'meeting_click', 'exhibitor_detail')}
              className="flex-1 flex items-center justify-center gap-2 bg-amber text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4" /> Book Meeting
            </Link>
            {ex.webinar_url && (
              <a
                href={ex.webinar_url}
                target="_blank"
                rel="noreferrer"
                onClick={() => track(ex.id, ex.name, 'webinar_join', 'exhibitor_detail')}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                <Video className="w-4 h-4" /> Join Webinar
              </a>
            )}
          </div>

          {/* Brochure download */}
          {ex.brochure_url && (
            <a
              href={ex.brochure_url}
              target="_blank"
              rel="noreferrer"
              onClick={() => track(ex.id, ex.name, 'brochure_download', 'exhibitor_detail')}
              className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Company Brochure</p>
                <p className="text-xs text-muted-foreground">Download PDF</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          )}

          {/* Request Info form — only shown when virtual exhibition is open */}
          {settings.virtualExhibitionOpen && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-4 h-4 text-amber" />
                <h2 className="font-heading text-sm font-bold uppercase tracking-wide">Request Information</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Send a message directly to {ex.name} and they'll follow up with you.</p>

              {submitted ? (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Enquiry sent!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ex.name} will be in touch. You can also book a meeting above.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnquire} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Name *</label>
                      <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Company</label>
                    <input
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      placeholder="Your company (optional)"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="What would you like to know?"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber resize-none"
                    />
                  </div>
                  {formError && <p className="text-xs text-red-500">{formError}</p>}
                  <button
                    type="submit"
                    disabled={enquireMutation.isPending}
                    className="w-full bg-steel text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-steel/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {enquireMutation.isPending ? 'Sending…' : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
