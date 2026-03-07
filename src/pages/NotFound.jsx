import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-9xl font-black text-gray-100 select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Home size={36} className="text-primary-600" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home size={16} /> Go Home
          </Link>
          <Link to="/properties" className="btn-outline flex items-center justify-center gap-2">
            <Search size={16} /> Browse Properties
          </Link>
        </div>

        <button onClick={() => window.history.back()}
          className="mt-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mx-auto">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    </div>
  );
}
