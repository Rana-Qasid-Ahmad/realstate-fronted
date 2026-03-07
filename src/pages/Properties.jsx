import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';
import { PropertyCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Home, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Properties() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });
  const [savedIds, setSavedIds] = useState(user?.savedProperties || []);

  const currentPage = parseInt(searchParams.get('page') || '1');

  const buildFilters = () => {
    const filters = {};
    ['search', 'city', 'type', 'status', 'minPrice', 'maxPrice', 'bedrooms'].forEach(k => {
      const v = searchParams.get(k);
      if (v) filters[k] = v;
    });
    return filters;
  };

  useEffect(() => {
    setLoading(true);
    const params = { ...buildFilters(), page: currentPage, limit: 9 };
    api.get('/properties', { params })
      .then(res => { setProperties(res.data.properties); setPagination({ total: res.data.total, pages: res.data.pages, currentPage: res.data.currentPage }); })
      .catch(() => toast.error('Failed to load properties'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSave = async (propId) => {
    if (!user) return toast.error('Please login to save properties');
    try {
      const res = await api.put(`/auth/saved/${propId}`);
      setSavedIds(res.data.savedProperties);
      toast.success(savedIds.includes(propId) ? 'Removed from saved' : 'Property saved!');
    } catch { toast.error('Error saving property'); }
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-enter min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Home size={14} />
            <span>/</span>
            <span className="text-primary-600 font-medium">Properties</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Browse Properties</h1>
          <SearchFilter onSearch={handleSearch} compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {loading ? 'Loading...' : <><span className="font-semibold text-gray-900">{pagination.total}</span> properties found</>}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => (
                <PropertyCard key={p._id} property={p} saved={savedIds.includes(p._id)} onSave={handleSave} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => goToPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-primary-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pagination.pages} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <Home size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-medium mb-2">No properties found</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
