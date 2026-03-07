import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../../utils/api';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SavedProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [savedIds, setSavedIds] = useState(user?.savedProperties || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.savedProperties?.length) { setLoading(false); return; }
    Promise.all(user.savedProperties.map(id => api.get(`/properties/${id}`).then(r => r.data).catch(() => null)))
      .then(results => setProperties(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (propId) => {
    try {
      const res = await api.put(`/auth/saved/${propId}`);
      setSavedIds(res.data.savedProperties);
      if (!res.data.savedProperties.includes(propId)) {
        setProperties(prev => prev.filter(p => p._id !== propId));
        toast.success('Removed from saved');
      }
    } catch { toast.error('Error'); }
  };

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Saved Properties</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Heart size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No saved properties yet</p>
            <p className="text-sm mt-1">Click the heart icon on any property to save it</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p._id} property={p} saved={savedIds.includes(p._id)} onSave={handleSave} />)}
          </div>
        )}
      </div>
    </div>
  );
}
