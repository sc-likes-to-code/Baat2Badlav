import React, { useState } from 'react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine context badge based on current route
  let contextLabel = 'India · Development Intelligence';
  if (currentPath === '/citizen') {
    contextLabel = 'India · Citizen Voice';
  } else if (currentPath === '/citizen/result') {
    contextLabel = 'India · AI Understanding';
  } else if (currentPath.includes('/region')) {
    contextLabel = 'India · Region Intelligence';
  } else if (currentPath === '/trust') {
    contextLabel = 'India · Trust & Data';
  } else if (currentPath === '/') {
    contextLabel = 'India · Development Intelligence';
  }

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Context Tag */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Baat2Badlav Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-2xs transition-transform group-hover:scale-105"
            />
            <span className="font-bold text-lg tracking-tight text-[#111315]">Baat2Badlav</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
            {contextLabel}
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => handleNavClick('/dashboard')}
            className={`transition-colors hover:text-stone-900 ${
              currentPath === '/dashboard' ? 'text-[#033aaf] font-semibold' : ''
            }`}
          >
            Explore Intelligence
          </button>
          <button
            onClick={() => handleNavClick('/dashboard/region/nadia')}
            className={`transition-colors hover:text-stone-900 ${
              currentPath.includes('/region') ? 'text-[#033aaf] font-semibold' : ''
            }`}
          >
            Scenario Lab
          </button>
          <button
            onClick={() => handleNavClick('/trust')}
            className={`transition-colors hover:text-stone-900 ${
              currentPath === '/trust' ? 'text-[#033aaf] font-semibold' : ''
            }`}
          >
            Data &amp; Trust
          </button>
        </nav>

        {/* Active Action & Quick Language Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 font-mono px-2 py-1 bg-stone-100/80 rounded-md border border-stone-200">
            <span>বাংলা</span>
            <span>·</span>
            <span>हिंदी</span>
            <span>·</span>
            <span className="font-semibold text-stone-800">EN</span>
          </div>

          {/* Primary CTA button */}
          <button
            onClick={() => handleNavClick('/citizen')}
            className="inline-flex items-center gap-2 bg-[#111315] hover:bg-stone-800 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-full transition-all shadow-sm ring-2 ring-stone-900/10 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#E06D28] animate-pulse"></span>
            <span>Share a Need</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <button
            onClick={() => handleNavClick('/dashboard')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentPath === '/dashboard' ? 'bg-stone-100 text-[#033aaf] font-bold' : 'text-stone-700'
            }`}
          >
            Explore Intelligence
          </button>
          <button
            onClick={() => handleNavClick('/dashboard/region/nadia')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentPath.includes('/region') ? 'bg-stone-100 text-[#033aaf] font-bold' : 'text-stone-700'
            }`}
          >
            Scenario Lab (Nadia)
          </button>
          <button
            onClick={() => handleNavClick('/trust')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentPath === '/trust' ? 'bg-stone-100 text-[#033aaf] font-bold' : 'text-stone-700'
            }`}
          >
            Data &amp; Trust
          </button>
          <button
            onClick={() => handleNavClick('/citizen/result')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentPath === '/citizen/result' ? 'bg-stone-100 text-[#033aaf] font-bold' : 'text-stone-700'
            }`}
          >
            AI Interpretation Demo
          </button>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono px-3">
            <span>Languages: বাংলা · हिंदी · EN</span>
            <span className="text-[#0F766E] font-semibold">{contextLabel}</span>
          </div>
        </div>
      )}
    </header>
  );
};
