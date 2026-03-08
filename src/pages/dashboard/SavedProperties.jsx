import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';
import api from '../../utils/api';
import PropertyCard from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    api.get('/auth/saved')
      .then(res => {
        setProperties(res.data);
        setSavedIds(res.data.map(p => p._id));
      })
      .catch(() => toast.error('Failed to load saved properties'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (propId) => {
    try {
      await api.put(`/auth/saved/${propId}`);
      setProperties(prev => prev.filter(p => p._id !== propId));
      setSavedIds(prev => prev.filter(id => id !== propId));
      toast.success('Removed from saved');
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="page-enter bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Heart size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Saved Properties</h1>
            <p className="text-gray-500 text-sm">{properties.length} saved</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => (
              <PropertyCard
                key={p._id}
                property={p}
                saved={savedIds.includes(p._id)}
                onSave={handleUnsave}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <Heart size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-medium mb-2">No saved properties yet</p>
            <p className="text-sm mb-6">Browse properties and click the heart icon to save them</p>
            <Link to="/properties" className="btn-primary inline-flex items-center gap-2">
              <Home size={16} /> Browse Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
