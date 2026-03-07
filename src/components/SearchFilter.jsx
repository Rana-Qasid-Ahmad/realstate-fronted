import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CITIES, PROPERTY_TYPES } from '../utils/helpers';

export default function SearchFilter({ onSearch, compact = false }) {
  const [filters, setFilters] = useState({ search: '', city: '', type: '', status: '', minPrice: '', maxPrice: '', bedrooms: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const handleSubmit = (e) => { e.preventDefault(); onSearch(filters); };
  const handleReset = () => { const empty = Object.fromEntries(Object.keys(filters).map(k => [k, ''])); setFilters(empty); onSearch(empty); };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-xl p-6 ${compact ? '' : 'border border-gray-100'}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by title, city, address..." value={filters.search} onChange={e => set('search', e.target.value)} className="input pl-9" />
        </div>
        <select value={filters.city} onChange={e => set('city', e.target.value)} className="input w-full sm:w-44">
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={e => set('status', e.target.value)} className="input w-full sm:w-36">
          <option value="">Buy / Rent</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
          <SlidersHorizontal size={14} />Filters
        </button>
        <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <select value={filters.type} onChange={e => set('type', e.target.value)} className="input capitalize">
            <option value="">Property Type</option>
            {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <select value={filters.bedrooms} onChange={e => set('bedrooms', e.target.value)} className="input">
            <option value="">Bedrooms</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
          </select>
          <input type="number" placeholder="Min Price (PKR)" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} className="input" />
          <input type="number" placeholder="Max Price (PKR)" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} className="input" />
          <button type="button" onClick={handleReset} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors col-span-2 sm:col-span-4">
            <X size={14} />Clear all filters
          </button>
        </div>
      )}
    </form>
  );
}
