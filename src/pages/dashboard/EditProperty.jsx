import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { CITIES, PROPERTY_TYPES, FEATURES } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', type: 'house', status: 'sale',
    bedrooms: '', bathrooms: '', area: '', address: '', city: '', state: ''
  });

  useEffect(() => {
    api.get(`/properties/${id}`).then(res => {
      const p = res.data;
      setForm({ title: p.title, description: p.description, price: p.price, type: p.type, status: p.status, bedrooms: p.bedrooms, bathrooms: p.bathrooms, area: p.area, address: p.location?.address, city: p.location?.city, state: p.location?.state || '' });
      setSelectedFeatures(p.features || []);
    }).finally(() => setFetching(false));
  }, [id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleFeature = (f) => setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('features', JSON.stringify(selectedFeatures));
      await api.put(`/properties/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Property updated!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm mb-6"><ArrowLeft size={14} />Back</Link>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-8">Edit Property</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="font-display font-semibold text-gray-900 pb-3 border-b border-gray-100">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input resize-none h-32" value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR)</label>
                <input type="number" className="input" value={form.price} onChange={e => set('price', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input type="number" className="input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input type="number" className="input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
              <input type="number" className="input" value={form.area} onChange={e => set('area', e.target.value)} required />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="font-display font-semibold text-gray-900 pb-3 border-b border-gray-100">Location</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select className="input" value={form.city} onChange={e => set('city', e.target.value)} required>
                  <option value="">Select City</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input className="input" value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="font-display font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Features</h3>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map(f => (
                <button key={f} type="button" onClick={() => toggleFeature(f)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedFeatures.includes(f) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-outline flex-1 text-center">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
