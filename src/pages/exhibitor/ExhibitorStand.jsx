import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Exhibitor } from '@/api/entities';
import { resizeImageToBlob } from '@/lib/imageUtils';
import {
  Images, Video, FileText, Plus, X, CheckCircle, Loader2,
  Award, Zap, HelpCircle, ExternalLink, Eye, Store,
} from 'lucide-react';

function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return url;
}

export default function ExhibitorStand() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: exhibitors = [] } = useQuery({
    queryKey: ['exhibitors-all'],
    queryFn: () => Exhibitor.list('-created_date'),
  });

  const myBooth = exhibitors.find(
    e => e.contact_email?.toLowerCase() === user?.email?.toLowerCase()
      || e.user_id === user?.id
      || (user?.company && e.name?.toLowerCase() === user.company.toLowerCase())
  ) ?? null;

  const [gallery, setGallery]       = useState([]);
  const [videoUrl, setVideoUrl]     = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts]     = useState([]);
  const [certs, setCerts]           = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [faq, setFaq]               = useState([]);

  const [newProduct, setNewProduct]     = useState('');
  const [newCert, setNewCert]           = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newQ, setNewQ]                 = useState('');
  const [newA, setNewA]                 = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState({});
  const [saved, setSaved]         = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    if (!myBooth) return;
    setGallery(myBooth.gallery || []);
    setVideoUrl(myBooth.video_url || '');
    setBrochureUrl(myBooth.brochure_url || '');
    setDescription(myBooth.description || '');
    setProducts(myBooth.products || []);
    setCerts(myBooth.certifications || []);
    setSpecialties(myBooth.specialties || []);
    setFaq(myBooth.faq || []);
  }, [myBooth?.id]);

  async function patch(key, value) {
    await Exhibitor.update(myBooth.id, { [key]: value });
    qc.invalidateQueries({ queryKey: ['exhibitors-all'] });
  }

  async function saveField(key, value) {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await patch(key, value);
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2500);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  }

  async function handleGalleryUpload(e) {
    const file = e.target.files?.[0];
    if (!file || gallery.length >= 6) return;
    setUploading(true);
    try {
      const blob = await resizeImageToBlob(file);
      const { uploadUrl, publicUrl } = await Exhibitor.getGalleryImageUploadUrl();
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });
      if (!res.ok) throw new Error('S3 upload failed');
      const next = [...gallery, publicUrl];
      setGallery(next);
      await patch('gallery', next);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function removeGalleryImg(url) {
    const next = gallery.filter(u => u !== url);
    setGallery(next);
    await patch('gallery', next);
  }

  function addProduct() {
    const v = newProduct.trim();
    if (!v) return;
    const next = [...products, v];
    setProducts(next); setNewProduct('');
    patch('products', next);
  }
  function removeProduct(p) {
    const next = products.filter(x => x !== p);
    setProducts(next); patch('products', next);
  }

  function addCert() {
    const v = newCert.trim();
    if (!v) return;
    const next = [...certs, v];
    setCerts(next); setNewCert('');
    patch('certifications', next);
  }
  function removeCert(c) {
    const next = certs.filter(x => x !== c);
    setCerts(next); patch('certifications', next);
  }

  function addSpecialty() {
    const v = newSpecialty.trim();
    if (!v) return;
    const next = [...specialties, v];
    setSpecialties(next); setNewSpecialty('');
    patch('specialties', next);
  }
  function removeSpecialty(s) {
    const next = specialties.filter(x => x !== s);
    setSpecialties(next); patch('specialties', next);
  }

  function addFaq() {
    if (!newQ.trim() || !newA.trim()) return;
    const next = [...faq, { question: newQ.trim(), answer: newA.trim() }];
    setFaq(next); setNewQ(''); setNewA('');
    patch('faq', next);
  }
  function removeFaq(i) {
    const next = faq.filter((_, idx) => idx !== i);
    setFaq(next); patch('faq', next);
  }

  if (!myBooth) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">No booth found for your account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold">Virtual Stand</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your public exhibitor page</p>
        </div>
        <Link
          to={`/exhibitors/${myBooth.id}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-amber font-medium border border-amber/30 px-3 py-1.5 rounded-lg hover:bg-amber/10 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Preview Stand <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Gallery */}
      <Section title="Gallery" icon={<Images className="w-4 h-4 text-amber" />} right={<span className="text-xs text-muted-foreground">{gallery.length} / 6</span>}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {gallery.map((url, i) => (
            <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeGalleryImg(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {gallery.length < 6 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-amber/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-amber transition-colors disabled:opacity-50"
            >
              {uploading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Plus className="w-5 h-5" /><span className="text-xs font-medium">Add Photo</span></>
              }
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
        <p className="text-xs text-muted-foreground">Up to 6 photos. Shown as a carousel on your stand. Click × on a photo to remove it.</p>
      </Section>

      {/* Description */}
      <Section title="Description">
        <textarea
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your company and what you offer at this event…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber/50 resize-none"
        />
        <div className="flex justify-end mt-2">
          <FieldSaveBtn saving={saving.description} saved={saved.description} onClick={() => saveField('description', description)} />
        </div>
      </Section>

      {/* Video */}
      <Section title="Company Video" icon={<Video className="w-4 h-4 text-violet-500" />}>
        <input
          type="url"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=… or youtu.be/… or /embed/…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <p className="text-xs text-muted-foreground mt-1.5">Paste any YouTube link — watch URL, short link, or embed URL. Converted automatically on save.</p>
        <div className="flex justify-end mt-2">
          <FieldSaveBtn
            saving={saving.video_url}
            saved={saved.video_url}
            onClick={() => {
              const embed = toEmbedUrl(videoUrl.trim());
              setVideoUrl(embed);
              saveField('video_url', embed);
            }}
          />
        </div>
      </Section>

      {/* Brochure */}
      <Section title="Company Brochure" icon={<FileText className="w-4 h-4 text-blue-500" />}>
        <input
          type="url"
          value={brochureUrl}
          onChange={e => setBrochureUrl(e.target.value)}
          placeholder="https://… (link to PDF or brochure page)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <div className="flex justify-end mt-2">
          <FieldSaveBtn saving={saving.brochure_url} saved={saved.brochure_url} onClick={() => saveField('brochure_url', brochureUrl)} />
        </div>
      </Section>

      {/* Products */}
      <Section title="Products & Services">
        {products.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {products.map((p, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-muted border border-border px-2.5 py-1 rounded-full">
                {p}
                <button onClick={() => removeProduct(p)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <TagInput
          value={newProduct}
          onChange={setNewProduct}
          onAdd={addProduct}
          placeholder="e.g. Mining Cables"
          btnClass="bg-amber"
        />
      </Section>

      {/* Certifications */}
      <Section title="Certifications" icon={<Award className="w-4 h-4 text-emerald-500" />}>
        {certs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {certs.map((c, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                <Award className="w-2.5 h-2.5" /> {c}
                <button onClick={() => removeCert(c)} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <TagInput
          value={newCert}
          onChange={setNewCert}
          onAdd={addCert}
          placeholder="e.g. ISO 9001:2015"
          btnClass="bg-emerald-600"
        />
      </Section>

      {/* Specialties */}
      <Section title="Specialties" icon={<Zap className="w-4 h-4 text-amber" />}>
        {specialties.length > 0 && (
          <ul className="space-y-2 mb-3">
            {specialties.map((s, i) => (
              <li key={i} className="flex items-start gap-2 group">
                <span className="text-amber font-bold mt-0.5 flex-shrink-0">▸</span>
                <span className="text-sm flex-1">{s}</span>
                <button
                  onClick={() => removeSpecialty(s)}
                  className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <TagInput
          value={newSpecialty}
          onChange={setNewSpecialty}
          onAdd={addSpecialty}
          placeholder="e.g. Underground electrical infrastructure"
          btnClass="bg-steel"
        />
      </Section>

      {/* FAQ */}
      <Section title="FAQ" icon={<HelpCircle className="w-4 h-4 text-blue-500" />}>
        {faq.length > 0 && (
          <div className="space-y-2 mb-4">
            {faq.map((item, i) => (
              <div key={i} className="group relative border border-border rounded-xl p-3">
                <p className="text-sm font-semibold pr-6">{item.question}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.answer}</p>
                <button
                  onClick={() => removeFaq(i)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {faq.length === 0 && (
          <p className="text-xs text-muted-foreground mb-3">No FAQ items yet. Add your first one below.</p>
        )}
        <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New FAQ Item</p>
          <input
            type="text"
            value={newQ}
            onChange={e => setNewQ(e.target.value)}
            placeholder="Question"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <textarea
            rows={2}
            value={newA}
            onChange={e => setNewA(e.target.value)}
            placeholder="Answer"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber/50 resize-none"
          />
          <button
            onClick={addFaq}
            disabled={!newQ.trim() || !newA.trim()}
            className="flex items-center gap-1.5 bg-steel text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, right, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide flex items-center gap-2">
          {icon} {title}
        </h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function TagInput({ value, onChange, onAdd, placeholder, btnClass = 'bg-amber' }) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber/50"
      />
      <button
        onClick={onAdd}
        className={`flex items-center gap-1 ${btnClass} text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity`}
      >
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}

function FieldSaveBtn({ saving, saved, onClick }) {
  if (saved) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
        <CheckCircle className="w-3.5 h-3.5" /> Saved
      </span>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-1.5 bg-steel text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      Save
    </button>
  );
}
