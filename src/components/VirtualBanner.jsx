import { Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VirtualBanner() {
  return (
    <div className="mx-4 mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">Virtual Exhibition Open</p>
            <p className="text-xs text-white/80 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Browse virtual booths and send enquiries online
            </p>
          </div>
        </div>
        <Link
          to="/exhibitors"
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors text-white text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0 active:scale-95"
        >
          Explore <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}