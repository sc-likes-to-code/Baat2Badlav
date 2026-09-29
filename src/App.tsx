/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { CitizenVoicePage } from './pages/CitizenVoicePage';
import { AIInterpretationPage } from './pages/AIInterpretationPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegionIntelligencePage } from './pages/RegionIntelligencePage';
import { TrustDataPage } from './pages/TrustDataPage';

import {
  CitizenSubmission,
  CitizenFormDraft,
  CitizenAIInterpretation,
} from './types/citizen';

export default function App() {
  // Read path from window.location.pathname or hash
  const getInitialPath = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash.startsWith('/')) {
        return hash;
      }
      const pathname = window.location.pathname;
      if (pathname && pathname !== '/' && pathname !== '') {
        return pathname;
      }
    }
    return '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const [currentSubmission, setCurrentSubmission] = useState<CitizenSubmission | null>(null);
  const [currentInterpretation, setCurrentInterpretation] = useState<CitizenAIInterpretation | null>(null);
  const [formDraft, setFormDraft] = useState<CitizenFormDraft | null>(null);

  // Sync with browser navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash.startsWith('/')) {
        setCurrentPath(hash);
      } else {
        setCurrentPath(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    try {
      window.history.pushState({}, '', path);
    } catch {
      // Fallback to hash if HTML5 pushState has issues in some sandboxes
      window.location.hash = path;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitSubmission = (sub: CitizenSubmission) => {
    if (currentSubmission?.id !== sub.id) {
      setCurrentInterpretation(null);
    }
    setCurrentSubmission(sub);
  };

  const handleSaveDraft = (draft: CitizenFormDraft) => {
    setFormDraft(draft);
  };

  const handleEditSubmission = () => {
    handleNavigate('/citizen');
  };

  const handleNewSubmission = () => {
    setCurrentSubmission(null);
    setCurrentInterpretation(null);
    setFormDraft(null);
    handleNavigate('/citizen');
  };

  // Route selector
  const renderCurrentRoute = () => {
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/citizen') {
      return (
        <CitizenVoicePage
          onNavigate={handleNavigate}
          draft={formDraft}
          onSaveDraft={handleSaveDraft}
          onSubmitSubmission={handleSubmitSubmission}
          onResetSubmission={handleNewSubmission}
        />
      );
    }
    if (currentPath === '/citizen/result') {
      return (
        <AIInterpretationPage
          onNavigate={handleNavigate}
          submission={currentSubmission}
          interpretation={currentInterpretation}
          onSaveInterpretation={setCurrentInterpretation}
          onEditSubmission={handleEditSubmission}
          onNewSubmission={handleNewSubmission}
        />
      );
    }
    if (currentPath === '/dashboard') {
      return (
        <DashboardPage
          onNavigate={handleNavigate}
          liveSubmission={currentSubmission}
          liveInterpretation={currentInterpretation}
        />
      );
    }
    if (currentPath.startsWith('/dashboard/region')) {
      return <RegionIntelligencePage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/trust') {
      return <TrustDataPage onNavigate={handleNavigate} />;
    }
    // Fallback default
    return <LandingPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EE] text-[#1B2A32] font-sans antialiased selection:bg-[#1A6F62] selection:text-white">
      {/* Top Reusable Navbar */}
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Main Screen Content with Subtle Framer Motion Page Transition */}
      <main className="flex-1 overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="w-full h-full flex flex-col flex-1"
          >
            {renderCurrentRoute()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Reusable Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
