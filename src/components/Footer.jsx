import { Link } from 'react-router-dom';
import { Home, Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Home size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold">Real<span className="text-primary-500">Vista</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">Pakistan's premier real estate platform. Find your dream home, connect with expert agents, and make your property journey seamless.</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/10 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"><Icon size={16} /></a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/properties', 'Properties'], ['/agents', 'Agents'], ['/register', 'List Property']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-primary-500 shrink-0" />Lahore, Pakistan</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-primary-500 shrink-0" />+92 300 1234567</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-primary-500 shrink-0" />info@realvista.pk</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} RealVista. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
