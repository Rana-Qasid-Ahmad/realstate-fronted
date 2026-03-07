import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Shield, HeadphonesIcon, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';
import { CITIES } from '../utils/helpers';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/properties?featured=true&limit=6')
      .then(res => setFeatured(res.data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/properties?${params.toString()}`);
  };

  const stats = [{ label: 'Properties Listed', value: '2,500+' }, { label: 'Happy Clients', value: '1,200+' }, { label: 'Expert Agents', value: '150+' }, { label: 'Cities Covered', value: '25+' }];
  const whys = [
    { icon: Search, title: 'Smart Search', desc: 'Advanced filters to find exactly what you need, fast.' },
    { icon: Shield, title: 'Verified Listings', desc: 'Every property is reviewed and approved by our team.' },
    { icon: TrendingUp, title: 'Best Prices', desc: 'Competitive market prices with transparent history.' },
    { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Our agents are always ready to assist you anytime.' },
  ];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/50 to-dark-900/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl mb-12">
            <span className="inline-block bg-primary-600/20 text-primary-400 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-primary-500/30">🏆 Pakistan's #1 Real Estate Platform</span>
            <h1 className="text-5xl sm:text-6xl font-display font-bold text-white leading-tight mb-6">
              Find Your Perfect<br /><span className="text-primary-400">Dream Home</span>
            </h1>
            <p className="text-gray-300 text-xl leading-relaxed">Discover thousands of properties across Pakistan. Buy, rent, or list your property with confidence.</p>
          </div>

          <SearchFilter onSearch={handleSearch} />

          {/* Quick city links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-gray-400 text-sm">Popular Cities:</span>
            {CITIES.slice(0, 6).map(city => (
              <button key={city} onClick={() => handleSearch({ city })} className="text-sm text-gray-300 hover:text-primary-400 transition-colors underline-offset-2 hover:underline">{city}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-3xl sm:text-4xl font-display font-bold mb-1">{s.value}</div>
                <div className="text-primary-100 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Hand-Picked</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">Featured Properties</h2>
            </div>
            <Link to="/properties" className="hidden sm:flex items-center gap-1 text-primary-600 font-medium hover:underline text-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No featured properties yet.</p>
              <Link to="/properties" className="btn-primary mt-4 inline-block">Browse All Properties</Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/properties" className="btn-primary inline-flex items-center gap-2">Browse All Properties <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2">Our Advantage</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">Why Choose RealVista?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whys.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors group">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
                  <Icon size={24} className="text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-dark-900 text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Are You an Agent?</h2>
          <p className="text-gray-400 text-lg mb-8">List your properties on RealVista and reach thousands of potential buyers and renters across Pakistan.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2">Start Listing <ArrowRight size={16} /></Link>
            <Link to="/agents" className="btn-outline inline-flex items-center justify-center gap-2 border-white text-white hover:bg-white hover:text-dark-900">Meet Our Agents</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
