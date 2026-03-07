import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Calendar, Eye, Phone, Mail, CheckCircle, ArrowLeft, Share2, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { formatPrice, timeAgo } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(res => setProperty(res.data))
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const startChat = async () => {
    if (!user) return toast.error('Please login to message the agent');
    if (user._id === property.agent._id) return toast.error('You cannot message yourself');
    try {
      const res = await api.post('/chat/conversations', {
        recipientId: property.agent._id,
        propertyId: id,
      });
      navigate(`/chat/${res.data._id}`);
    } catch { toast.error('Could not start conversation'); }
  };

  const handleInquiry = async (e) => {    e.preventDefault();
    setSending(true);
    try {
      await api.post('/inquiries', { ...form, propertyId: id, senderId: user?._id });
      toast.success('Inquiry sent! The agent will contact you soon.');
      setForm(prev => ({ ...prev, message: '' }));
    } catch { toast.error('Failed to send inquiry'); }
    finally { setSending(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center text-gray-500">Property not found</div>;

  const images = property.images?.length > 0 ? property.images : [`https://picsum.photos/seed/${id}/800/500`, `https://picsum.photos/seed/${id}2/800/500`];

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link to="/properties" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md">
              <div className="relative h-72 sm:h-96">
                <img src={images[activeImg]} alt={property.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`badge ${property.status === 'sale' ? 'bg-primary-600 text-white' : 'bg-emerald-500 text-white'}`}>For {property.status === 'sale' ? 'Sale' : 'Rent'}</span>
                  <span className="badge bg-white/90 text-gray-700 capitalize">{property.type}</span>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg hover:bg-white transition-colors">
                  <Share2 size={16} className="text-gray-700" />
                </button>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 ring-2 transition-all ${i === activeImg ? 'ring-primary-600' : 'ring-transparent'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{property.title}</h1>
                <p className="text-2xl font-bold text-primary-600 ml-4 shrink-0">{formatPrice(property.price)}</p>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                <MapPin size={14} className="text-primary-500" />
                <span>{property.location?.address}, {property.location?.city}</span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Bed, label: 'Bedrooms', val: property.bedrooms || 'N/A' },
                  { icon: Bath, label: 'Bathrooms', val: property.bathrooms || 'N/A' },
                  { icon: Maximize, label: 'Area', val: `${property.area?.toLocaleString()} sqft` },
                  { icon: Eye, label: 'Views', val: property.views },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <Icon size={20} className="mx-auto mb-2 text-primary-600" />
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-semibold text-gray-900">{val}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <h3 className="font-display font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">{property.description}</p>

              {/* Features */}
              {property.features?.length > 0 && (
                <>
                  <h3 className="font-display font-semibold text-gray-900 mb-3">Features & Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
                <Calendar size={12} />
                Listed {timeAgo(property.createdAt)}
              </div>
            </div>
          </div>

          {/* Right: Agent + Inquiry */}
          <div className="space-y-6">
            {/* Agent Card */}
            {property.agent && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="font-display font-semibold text-gray-900 mb-4">Listed By</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                    {property.agent.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{property.agent.name}</p>
                    <p className="text-xs text-gray-500">Property Agent</p>
                  </div>
                </div>
                {property.agent.bio && <p className="text-sm text-gray-500 mb-4 leading-relaxed">{property.agent.bio}</p>}
                <div className="space-y-2">
                  {property.agent.phone && (
                    <a href={`tel:${property.agent.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                      <Phone size={14} className="text-primary-500" />{property.agent.phone}
                    </a>
                  )}
                  <a href={`mailto:${property.agent.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                    <Mail size={14} className="text-primary-500" />{property.agent.email}
                  </a>
                </div>
                <Link to={`/agents/${property.agent._id}`} className="btn-outline w-full mt-4 block text-center text-sm py-2">View Agent Profile</Link>
                <button onClick={startChat} className="btn-primary w-full mt-2 flex items-center justify-center gap-2 text-sm py-2">
                  <MessageSquare size={14} />Message Agent
                </button>
              </div>
            )}

            {/* Inquiry Form */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="font-display font-semibold text-gray-900 mb-4">Send Inquiry</h3>
              <form onSubmit={handleInquiry} className="space-y-3">
                <input className="input" placeholder="Your Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                <input className="input" type="email" placeholder="Your Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                <input className="input" placeholder="Phone Number" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                <textarea className="input resize-none h-28" placeholder={`I'm interested in "${property.title}"...`} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
                <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60">
                  {sending ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
