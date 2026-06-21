import { Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VirtualBanner() {
  return (
    <div className="px-4 mt-4 max-w-2xl lg:max-w-6xl mx-auto">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 lg:p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 lg:gap-4 min-w-0">
            <div className="w-9 h-9 lg:w-12 lg:h-12 bg-white/20 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm lg:text-base font-bold leading-tight">Virtual Exhibition Open</p>
              <p className="text-xs lg:text-sm text-white/80 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Browse virtual booths and send enquiries online
              </p>
            </div>
          </div>
          <Link
            to="/exhibitors"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors text-white text-xs lg:text-sm font-semibold px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl flex-shrink-0 active:scale-95"
          >
            Explore <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
