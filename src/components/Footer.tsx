import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#111315] text-stone-400 text-xs border-t border-stone-800 py-12 mt-20">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          {/* Logo & Tagline */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            type="button"
            aria-label="Go to homepage"
          >
            <img
              src="/logo.png"
              alt="Baat2Badlav Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-2xs transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-white font-bold text-base tracking-tight block group-hover:text-stone-200 transition-colors">
                Baat2Badlav
              </span>
              <span className="text-stone-500 text-[11px] group-hover:text-stone-400 transition-colors">
                From Citizen Voices to Development Intelligence
              </span>
            </div>
          </button>

          {/* Footer Links */}
          <nav className="flex flex-wrap items-center gap-6 text-stone-400 font-medium">
            <button
              onClick={() => handleNavClick('/dashboard')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Explore Intelligence
            </button>
            <button
              onClick={() => handleNavClick('/dashboard/region/nadia')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Scenario Lab
            </button>
            <button
              onClick={() => handleNavClick('/trust')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Data &amp; Trust
            </button>
            <button
              onClick={() => handleNavClick('/citizen')}
              className="text-[#E06D28] font-semibold hover:underline cursor-pointer"
            >
              Share a Need
            </button>
          </nav>
        </div>

        {/* Copyright & Principles Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-stone-500 font-mono">
          <p>India-first · Designed for human-led development decisions</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
            <span>Active Intelligence Engine · Baat2Badlav Civic Tech</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
