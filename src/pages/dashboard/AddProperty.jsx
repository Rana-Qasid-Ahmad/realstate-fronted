import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import api from '../../utils/api';
import { CITIES, PROPERTY_TYPES, FEATURES } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AddProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', type: 'house', status: 'sale',
    bedrooms: '', bathrooms: '', area: '', address: '', city: '', state: '', country: 'Pakistan'
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImages = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleFeature = (f) => setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.city) return toast.error('Please fill required fields');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('features', JSON.stringify(selectedFeatures));
      files.forEach(f => fd.append('images', f));
      await api.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Property submitted! Pending admin approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add property');
    } finally { setLoading(false); }
  };

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h3 className="font-display font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm mb-6"><ArrowLeft size={14} />Back to Dashboard</Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Add New Property</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                <input className="input" placeholder="e.g. Modern 3-Bedroom House in DHA Lahore" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea className="input resize-none h-32" placeholder="Describe the property in detail..." value={form.description} onChange={e => set('description', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select className="input capitalize" value={form.type} onChange={e => set('type', e.target.value)}>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing For *</label>
                  <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Pricing & Specs">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
                <input type="number" className="input" placeholder="e.g. 15000000" value={form.price} onChange={e => set('price', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input type="number" className="input" placeholder="0" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input type="number" className="input" placeholder="0" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft) *</label>
                <input type="number" className="input" placeholder="e.g. 2500" value={form.area} onChange={e => set('area', e.target.value)} required />
              </div>
            </div>
          </Section>

          <Section title="Location">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input className="input" placeholder="e.g. House 123, DHA Phase 5" value={form.address} onChange={e => set('address', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <select className="input" value={form.city} onChange={e => set('city', e.target.value)} required>
                  <option value="">Select City</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input className="input" placeholder="e.g. Punjab" value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Features & Amenities">
            <div className="flex flex-wrap gap-2">
              {FEATURES.map(f => (
                <button key={f} type="button" onClick={() => toggleFeature(f)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedFeatures.includes(f) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                  {f}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Property Images">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" id="images" />
              <label htmlFor="images" className="cursor-pointer">
                <Upload size={28} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload property images</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — Max 5MB each</p>
              </label>
            </div>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-outline flex-1 text-center">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
