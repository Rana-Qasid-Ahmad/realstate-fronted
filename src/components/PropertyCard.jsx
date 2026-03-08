import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Heart, Star } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

export default function PropertyCard({ property, saved, onSave }) {
  const img = property.images?.[0] || `https://picsum.photos/seed/${property._id}/600/400`;

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={img}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${property.status === 'sale' ? 'bg-primary-600 text-white' : 'bg-emerald-500 text-white'}`}>
            For {property.status === 'sale' ? 'Sale' : 'Rent'}
          </span>
          {property.isFeatured && (
            <span className="badge bg-amber-400 text-amber-900 flex items-center gap-1">
              <Star size={10} />Featured
            </span>
          )}
        </div>
        {onSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(property._id); }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-md ${saved ? 'bg-primary-600 text-white' : 'bg-white text-gray-400 hover:text-primary-600'}`}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
          >
            <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="badge bg-white/90 text-gray-700 capitalize">{property.type}</span>
        </div>
      </div>

      {/* Content */}
      <Link to={`/properties/${property._id}`} className="block p-5">
        <h3 className="font-display font-semibold text-gray-900 text-base leading-tight line-clamp-2 mb-2">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={13} className="text-primary-500 shrink-0" />
          <span className="truncate">{property.location?.address}, {property.location?.city}</span>
        </div>

        <div className="text-xl font-bold text-primary-600 mb-4">{formatPrice(property.price)}</div>

        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={14} />{property.bedrooms} Bed</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={14} />{property.bathrooms} Bath</span>}
          <span className="flex items-center gap-1"><Maximize size={14} />{property.area?.toLocaleString()} sqft</span>
          <span className="ml-auto text-xs font-semibold text-primary-600">View Details →</span>
        </div>
      </Link>
    </div>
  );
}
