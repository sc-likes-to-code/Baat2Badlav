import React, { useState, useRef, useEffect } from 'react';
import { HOTSPOTS, Hotspot } from '../data/mockData';
import { SPATIAL_CORRIDORS } from '../utils/geoProjection';
import { CitizenSubmission, CitizenAIInterpretation } from '../types/citizen';
import { DemandIntelligenceSection } from '../components/DemandIntelligenceSection';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  liveSubmission?: CitizenSubmission | null;
  liveInterpretation?: CitizenAIInterpretation | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  liveSubmission,
  liveInterpretation,
}) => {
  const [dashboardView, setDashboardView] = useState<'demand-intelligence' | 'spatial-atlas'>('demand-intelligence');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(HOTSPOTS[0]);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('All Sectors');
  const [activeLayer, setActiveLayer] = useState<'demand' | 'infra' | 'gap'>('gap');

  // Unified Map Viewport State (Single Source of Truth for all navigation methods)
  const [mapViewport, setMapViewport] = useState<{ x: number; y: number; zoom: number }>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const hasDraggedRef = useRef<boolean>(false);

  // Zoom & Pan Constraints
  const MIN_ZOOM = 0.8;
  const MAX_ZOOM = 3.5;

  const clampPan = (x: number, y: number, zoom: number) => {
    const maxPanX = Math.max(0, (zoom - 0.75) * 350);
    const maxPanY = Math.max(0, (zoom - 0.75) * 450);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y)),
    };
  };

  const handleZoomIn = () => {
    setMapViewport((prev) => {
      const nextZoom = Math.min(MAX_ZOOM, Math.round((prev.zoom + 0.25) * 100) / 100);
      const clamped = clampPan(prev.x, prev.y, nextZoom);
      return { ...prev, zoom: nextZoom, ...clamped };
    });
  };

  const handleZoomOut = () => {
    setMapViewport((prev) => {
      const nextZoom = Math.max(MIN_ZOOM, Math.round((prev.zoom - 0.25) * 100) / 100);
      const clamped = clampPan(prev.x, prev.y, nextZoom);
      return { ...prev, zoom: nextZoom, ...clamped };
    });
  };

  const handleResetViewport = () => {
    setMapViewport({ x: 0, y: 0, zoom: 1 });
    setSelectedHotspot(HOTSPOTS[0]);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left-click
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: mapViewport.x,
      initialY: mapViewport.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.hypot(dx, dy) > 4) {
      hasDraggedRef.current = true;
    }
    const clamped = clampPan(
      dragStartRef.current.initialX + dx,
      dragStartRef.current.initialY + dy,
      mapViewport.zoom
    );
    setMapViewport((prev) => ({
      ...prev,
      x: clamped.x,
      y: clamped.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers (Mobile / Tablet pan support)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasDraggedRef.current = false;
      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        initialX: mapViewport.x,
        initialY: mapViewport.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.startX;
    const dy = e.touches[0].clientY - dragStartRef.current.startY;
    if (Math.hypot(dx, dy) > 4) {
      hasDraggedRef.current = true;
    }
    const clamped = clampPan(
      dragStartRef.current.initialX + dx,
      dragStartRef.current.initialY + dy,
      mapViewport.zoom
    );
    setMapViewport((prev) => ({
      ...prev,
      x: clamped.x,
      y: clamped.y,
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Global mouse up / touch end listener
  useEffect(() => {
    const onGlobalUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onGlobalUp);
    window.addEventListener('touchend', onGlobalUp);
    return () => {
      window.removeEventListener('mouseup', onGlobalUp);
      window.removeEventListener('touchend', onGlobalUp);
    };
  }, []);

  // Wheel zoom attached with { passive: false } to intercept scroll over the map
  useEffect(() => {
    if (dashboardView !== 'spatial-atlas') return;
    const container = mapContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Smooth proportional zoom step
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      setMapViewport((prev) => {
        const rawZoom = prev.zoom * zoomFactor;
        const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(rawZoom * 100) / 100));
        if (nextZoom === prev.zoom) return prev;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        const zoomRatio = nextZoom / prev.zoom;
        const rawX = mouseX - (mouseX - prev.x) * zoomRatio;
        const rawY = mouseY - (mouseY - prev.y) * zoomRatio;

        const clamped = clampPan(rawX, rawY, nextZoom);
        return { x: clamped.x, y: clamped.y, zoom: nextZoom };
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [dashboardView]);

  const filteredHotspots =
    selectedSectorFilter === 'All Sectors'
      ? HOTSPOTS
      : HOTSPOTS.filter((h) => h.sector === selectedSectorFilter);

  const handleSelectHotspot = (h: Hotspot) => {
    setSelectedHotspot(h);
  };

  const handleInspectDossier = (hotspotId: string) => {
    const found = HOTSPOTS.find((h) => h.id === hotspotId);
    if (found && found.id) {
      onNavigate(`/dashboard/region/${found.id.toLowerCase()}`);
    } else if (hotspotId) {
      onNavigate(`/dashboard/region/${hotspotId.toLowerCase()}`);
    } else {
      onNavigate('/dashboard/region/nadia');
    }
  };

  return (
    <main className="w-full bg-[#f9f9fc] py-8 text-[#1a1c1e]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Dashboard Header & Context */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#033aaf]/10 text-[#033aaf] text-[10px] font-mono tracking-widest uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#033aaf] animate-ping"></span>
                Development Intelligence Platform · Update 08
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8e8ea] text-[#444653] text-[11px] font-mono">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                Impact Simulation Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1c1e] tracking-tight">
              Where are communities asking for change?
            </h1>
            <p className="text-base sm:text-lg text-[#444653] leading-relaxed">
              Baat2Badlav connects aggregated citizen demand with localized infrastructure baselines, demographic pressure, and investment context to derive explainable development gaps across regions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start lg:items-end gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-white shadow-xs border border-stone-200 flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fe843e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9e4200]"></span>
              </span>
              <div>
                <p className="text-[10px] font-mono text-[#444653] uppercase tracking-wider font-semibold">
                  Signal Ingestion &amp; Clustering
                </p>
                <p className="text-[11px] font-mono font-bold text-[#1a1c1e]">Deterministic Local Model · Active</p>
              </div>
            </div>
          </div>
        </header>

        {/* Top-level View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-200">
          <div className="inline-flex p-1 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <button
              onClick={() => setDashboardView('demand-intelligence')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                dashboardView === 'demand-intelligence'
                  ? 'bg-[#033aaf] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">workspaces</span>
              Citizen Demand Intelligence
            </button>
            <button
              onClick={() => setDashboardView('spatial-atlas')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                dashboardView === 'spatial-atlas'
                  ? 'bg-[#033aaf] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              Spatial Corridor Atlas
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {dashboardView === 'demand-intelligence'
                ? 'Semantic Demand Clustering Active'
                : 'Geospatial Vector Atlas Active'}
            </span>
          </div>
        </div>

        {/* VIEW 1: CITIZEN DEMAND CLUSTERS & DEMAND HOTSPOTS (UPDATE 04 CORE) */}
        {dashboardView === 'demand-intelligence' && (
          <DemandIntelligenceSection
            liveSubmission={liveSubmission}
            liveInterpretation={liveInterpretation}
            onNavigate={onNavigate}
          />
        )}

        {/* VIEW 2: SPATIAL ATLAS (EXISTING GEOSPATIAL VECTOR VIEW) */}
        {dashboardView === 'spatial-atlas' && (
          <div className="space-y-10">
            {/* 2. Top Metric Strip */}
            <section className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                  Citizen Voices
                </span>
                <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#9cf2e8]/40 text-[#004f49] font-bold">
                  +14.2% this week
                </span>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-[#1a1c1e] tracking-tight">8,421</div>
                <p className="text-xs text-[#444653] mt-1">Across 3 core development sectors</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#033aaf] h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                  Demand Hotspots
                </span>
                <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#ffdbcb]/60 text-[#9e4200] font-bold">
                  18 High Density
                </span>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-[#1a1c1e] tracking-tight">327</div>
                <p className="text-xs text-[#444653] mt-1">Geographic clusters with concentrated demand</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#fe843e] h-full rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                  Development Gaps
                </span>
                <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold">
                  Priority Deliberation
                </span>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-[#ba1a1a] tracking-tight">84</div>
                <p className="text-xs text-[#444653] mt-1">Signals with acute demand-to-infrastructure deficits</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                  Candidate Projects
                </span>
                <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#dce1ff] text-[#033aaf] font-bold">
                  Human Evaluation Ready
                </span>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-[#033aaf] tracking-tight">41</div>
                <p className="text-xs text-[#444653] mt-1">Illustrative scenario modeling interventions</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#006962] h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between px-2 pt-1 text-[#444653] text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#9e4200]">
              <span className="material-symbols-outlined text-[15px]">info</span>
              Representative demonstration dataset · Not official government statistics
            </span>
            <span className="text-[#747685]">Confidence Interval: 94.6% · Geo-hash accuracy: Ward / GP</span>
          </div>
        </section>

        {/* 3. Map Filter & Layer Switcher Bar */}
        <section className="bg-white p-4 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Geography Filter Pill */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f3f3f6] text-xs text-[#1a1c1e] border border-stone-200">
                <span className="material-symbols-outlined text-[16px] text-[#033aaf]">pin_drop</span>
                <span className="text-[#444653]">State:</span>
                <span className="font-semibold text-[#033aaf]">{selectedHotspot.state}</span>
                <span className="text-[#747685]">/</span>
                <span className="font-semibold text-[#1a1c1e]">{selectedHotspot.district} (Selected)</span>
              </div>

              {/* Sector Selection */}
              <div className="inline-flex p-1 rounded-lg bg-[#f3f3f6] border border-stone-200">
                {['All Sectors', 'Roads & Mobility', 'Water Access', 'Healthcare Access'].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSectorFilter(sec)}
                    className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                      selectedSectorFilter === sec
                        ? 'bg-white text-[#033aaf] font-bold shadow-2xs'
                        : 'text-[#444653] hover:text-[#1a1c1e]'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Gap Severity */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f3f3f6] text-xs border border-stone-200">
                <span className="font-mono text-[#444653] uppercase text-[11px]">Gap Severity:</span>
                <span className="inline-flex items-center gap-1 text-[#ba1a1a] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> High Gap
                </span>
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-1 p-1 bg-[#f3f3f6] rounded-lg border border-stone-200">
              <span className="px-2 font-mono text-[#444653] uppercase text-[11px]">Layer:</span>
              <button
                onClick={() => setActiveLayer('demand')}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  activeLayer === 'demand'
                    ? 'bg-[#033aaf] text-white font-bold shadow-2xs'
                    : 'text-[#444653] hover:bg-white'
                }`}
              >
                Demand
              </button>
              <button
                onClick={() => setActiveLayer('infra')}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  activeLayer === 'infra'
                    ? 'bg-[#033aaf] text-white font-bold shadow-2xs'
                    : 'text-[#444653] hover:bg-white'
                }`}
              >
                Infra Deficit
              </button>
              <button
                onClick={() => setActiveLayer('gap')}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  activeLayer === 'gap'
                    ? 'bg-[#033aaf] text-white font-bold shadow-2xs'
                    : 'text-[#444653] hover:bg-white'
                }`}
              >
                Development Gap
              </button>
            </div>
          </div>
        </section>

        {/* 4. Main Map Experience & Selected Hotspot Panel (65% / 35% Grid) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Spatial Atlas (65%) */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden relative flex flex-col h-[640px]">
            {/* Map Header */}
            <div className="p-4 bg-[#f3f3f6] flex items-center justify-between border-b border-stone-200 z-10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#033aaf]">public</span>
                <div>
                  <p className="text-xs font-bold text-[#1a1c1e]">Spatial Atlas: India Sub-Regional Corridors</p>
                  <p className="text-[11px] font-mono text-[#444653]">
                    Focus: Eastern Development Cluster · {selectedHotspot.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#9cf2e8]/40 text-[#004f49] text-[11px] font-mono font-semibold">
                  84 active signals across 18 clusters
                </span>
              </div>
            </div>

            {/* Map Canvas with SVG rendering and Unified Viewport Navigation */}
            <div
              ref={mapContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative flex-1 w-full bg-[#f4f3ef] overflow-hidden flex items-center justify-center select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Background Matrix Grid */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#747685 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              ></div>

              {/* Real Geographic Map of India with Analytical Overlays */}
              <svg
                className="w-full h-full max-h-[580px] object-contain drop-shadow-sm"
                viewBox="0 0 884 1024"
              >
                <defs>
                  <radialGradient cx="50%" cy="50%" id="hotspot-glow-high" r="50%">
                    <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.85"></stop>
                    <stop offset="60%" stopColor="#ba1a1a" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0"></stop>
                  </radialGradient>
                  <radialGradient cx="50%" cy="50%" id="hotspot-glow-amber" r="50%">
                    <stop offset="0%" stopColor="#fe843e" stopOpacity="0.85"></stop>
                    <stop offset="70%" stopColor="#fe843e" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#fe843e" stopOpacity="0"></stop>
                  </radialGradient>
                </defs>

                {/* Unified Navigable Viewport Layer */}
                <g
                  transform={`translate(${mapViewport.x}, ${mapViewport.y}) scale(${mapViewport.zoom})`}
                  style={{
                    transformOrigin: '442px 512px',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  }}
                >
                  {/* Base Layer: Verified Geographic India Map Image */}
                  <image
                    href="/india_map.jpg"
                    x="0"
                    y="0"
                    width="884"
                    height="1024"
                    preserveAspectRatio="xMidYMid meet"
                    opacity="0.95"
                  />

                  {/* Sub-Regional Analytical Corridors (Connecting Related Clusters) */}
                  {SPATIAL_CORRIDORS.map((corridor) => {
                    const fromH = filteredHotspots.find((h) => h.id === corridor.fromId) || HOTSPOTS.find((h) => h.id === corridor.fromId);
                    const toH = filteredHotspots.find((h) => h.id === corridor.toId) || HOTSPOTS.find((h) => h.id === corridor.toId);
                    if (!fromH || !toH) return null;

                    return (
                      <g key={corridor.id} className="pointer-events-none">
                        <line
                          x1={fromH.coordinates.x}
                          y1={fromH.coordinates.y}
                          x2={toH.coordinates.x}
                          y2={toH.coordinates.y}
                          stroke="#033aaf"
                          strokeWidth="2.5"
                          strokeDasharray="5 5"
                          strokeOpacity="0.55"
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  })}

                  {/* Interactive Hotspot Nodes (Positioned via Real Geographic Coordinates) */}
                  {filteredHotspots.map((h) => {
                    const isSelected = selectedHotspot.id === h.id;
                    const glowId = h.gapScore >= 80 ? 'url(#hotspot-glow-high)' : 'url(#hotspot-glow-amber)';
                    const dotColor = h.gapScore >= 80 ? '#ba1a1a' : h.gapScore >= 50 ? '#fe843e' : '#006962';

                    // Dynamic tooltip translation to prevent clipping near canvas edges
                    const tooltipOffsetX = h.coordinates.x > 620 ? -188 : 18;
                    const tooltipOffsetY = h.coordinates.y < 90 ? 15 : -28;

                    return (
                      <g
                        key={h.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasDraggedRef.current) {
                            handleSelectHotspot(h);
                          }
                        }}
                        className="cursor-pointer group"
                      >
                        {isSelected ? (
                          <>
                            {/* Concentric sonar pulses */}
                            <circle cx={h.coordinates.x} cy={h.coordinates.y} fill="none" opacity="0.6" r="32" stroke="#ba1a1a" strokeWidth="1.5">
                              <animate attributeName="r" dur="2.4s" repeatCount="indefinite" values="12;36;42"></animate>
                              <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0.85;0.3;0"></animate>
                            </circle>
                            <circle cx={h.coordinates.x} cy={h.coordinates.y} fill={glowId} r="20"></circle>
                            <circle cx={h.coordinates.x} cy={h.coordinates.y} fill="#ba1a1a" r="8" stroke="#ffffff" strokeWidth="2.5"></circle>

                            {/* Active Callout Marker Card */}
                            <g transform={`translate(${h.coordinates.x + tooltipOffsetX}, ${h.coordinates.y + tooltipOffsetY})`}>
                              <rect fill="#ffffff" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.18))" height="54" rx="8" width="176" stroke="#d5d5dc"></rect>
                              <rect fill="#ba1a1a" height="54" rx="2" width="4"></rect>
                              <text fill="#1a1c1e" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="700" x="12" y="18">
                                {h.name}
                              </text>
                              <text fill="#ba1a1a" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" x="12" y="33">
                                Gap Index: {h.gapScore}/100 · {h.state}
                              </text>
                              <text fill="#444653" fontFamily="Plus Jakarta Sans" fontSize="9.5" x="12" y="46">
                                {h.citizenRequests.toLocaleString()} Requests · {h.sector.split(' ')[0]}
                              </text>
                            </g>
                          </>
                        ) : (
                          <>
                            <circle className="animate-pulse" cx={h.coordinates.x} cy={h.coordinates.y} fill={glowId} r="15"></circle>
                            <circle cx={h.coordinates.x} cy={h.coordinates.y} fill={dotColor} r="5.5" stroke="#ffffff" strokeWidth="1.5"></circle>
                            <text
                              fill="#1a1c1e"
                              fontFamily="Plus Jakarta Sans"
                              fontSize="11"
                              fontWeight="700"
                              textAnchor="middle"
                              x={h.coordinates.x}
                              y={h.coordinates.y - 12}
                              style={{
                                paintOrder: 'stroke fill',
                                stroke: '#ffffff',
                                strokeWidth: '3px',
                                strokeLinejoin: 'round',
                              }}
                            >
                              {h.district}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Floating Map Controls */}
              <div className="absolute right-4 bottom-4 flex flex-col items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-md border border-stone-200 z-20">
                <button
                  onClick={handleZoomIn}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1a1c1e] hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Zoom in (+)"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
                <span className="text-[10px] font-mono text-[#444653] font-bold py-0.5 select-none">
                  {Math.round(mapViewport.zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomOut}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1a1c1e] hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Zoom out (−)"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <button
                  onClick={handleResetViewport}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1a1c1e] hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Recenter map and reset zoom"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">my_location</span>
                </button>
              </div>

              {/* Floating Legend */}
              <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-stone-200 space-y-2 z-20 max-w-xs">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                  Development Gap Severity
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full bg-[#006962]"></span>
                  <span className="font-mono text-[11px]">Low (0-40)</span>
                  <span className="w-3 h-3 rounded-full bg-[#fe843e] ml-2"></span>
                  <span className="font-mono text-[11px]">Med (41-75)</span>
                  <span className="w-3 h-3 rounded-full bg-[#ba1a1a] ml-2"></span>
                  <span className="font-mono text-[11px]">High (76-100)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Selected Hotspot Intelligence Panel (35%) */}
          <aside className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80 space-y-6">
            <div className="space-y-2 pb-4 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#033aaf] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {selectedHotspot.district} · {selectedHotspot.state}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-mono text-[11px] font-bold">
                  {selectedHotspot.gapStatus} GAP · {selectedHotspot.gapScore}/100
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1c1e]">
                {selectedHotspot.sector} Corridor
              </h2>
              <p className="text-xs text-[#444653]">
                Primary focus: {selectedHotspot.cluster}
              </p>
            </div>

            {/* Exposure Metrics Strip */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#f3f3f6] border border-stone-200">
              <div>
                <p className="text-[10px] font-mono text-[#444653] uppercase">Citizen Requests</p>
                <p className="text-2xl font-mono font-bold text-[#1a1c1e]">{selectedHotspot.citizenRequests.toLocaleString()}</p>
                <p className="text-[11px] text-[#033aaf] font-medium">{selectedHotspot.villagesCount} villages actively voicing</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#444653] uppercase">Catchment Basin</p>
                <p className="text-2xl font-mono font-bold text-[#1a1c1e]">{selectedHotspot.exposedPopulation.toLocaleString()}</p>
                <p className="text-[11px] text-[#444653]">Agrarian population</p>
              </div>
            </div>

            {/* Constituent Factor Breakdown */}
            <div className="space-y-3.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-bold">
                Constituent Factor Breakdown
              </p>

              {/* Demand */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1a1c1e] font-medium">Citizen Demand Density</span>
                  <span className="font-mono font-bold text-[#ba1a1a]">{selectedHotspot.demandIndex} / 100</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: `${selectedHotspot.demandIndex}%` }}></div>
                </div>
                <p className="text-[11px] text-[#747685]">Demonstration citizen demand signals</p>
              </div>

              {/* Infra */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1a1c1e] font-medium">Infrastructure Baseline Coverage</span>
                  <span className="font-mono font-bold text-[#1a1c1e]">{selectedHotspot.infraBaseline} / 100</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#747685] h-full rounded-full" style={{ width: `${selectedHotspot.infraBaseline}%` }}></div>
                </div>
                <p className="text-[11px] text-[#747685]">PMGSY all-weather road ratio 42% below district baseline</p>
              </div>

              {/* Investment */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1a1c1e] font-medium">Investment Coverage</span>
                  <span className="font-mono font-bold text-[#9e4200]">{selectedHotspot.investmentCoverage} / 100</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#fe843e] h-full rounded-full" style={{ width: `${selectedHotspot.investmentCoverage}%` }}></div>
                </div>
                <p className="text-[11px] text-[#747685]">Sub-regional public works tender allocation deficit</p>
              </div>

              {/* Urgency */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1a1c1e] font-medium">Seasonal Urgency Score</span>
                  <span className="font-mono font-bold text-[#ba1a1a]">{selectedHotspot.urgencyScore} / 100</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: `${selectedHotspot.urgencyScore}%` }}></div>
                </div>
                <p className="text-[11px] text-[#747685]">Monsoon inundation cuts market transit</p>
              </div>
            </div>

            {/* Why This Signal Matters Insight */}
            <div className="p-4 rounded-xl bg-[#dce1ff]/40 space-y-2 border border-[#b6c4ff]/60">
              <div className="flex items-center gap-2 text-[#033aaf] font-semibold text-xs">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>Why This Signal Matters</span>
              </div>
              <p className="text-xs text-[#1a1c1e] leading-relaxed">
                {selectedHotspot.whyItMatters}
              </p>
              <p className="text-[10px] font-mono text-[#063baf] pt-1">
                Deterministic gap correlation · Demonstration infrastructure baseline
              </p>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleInspectDossier(selectedHotspot.id)}
                className="w-full py-3 px-4 rounded-xl bg-[#033aaf] hover:bg-[#063baf] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors text-center cursor-pointer"
              >
                <span>Open Region Intelligence</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                onClick={() => onNavigate('/citizen/result')}
                className="w-full py-2 px-3 rounded-lg text-[#033aaf] hover:bg-[#dce1ff]/30 text-xs font-semibold transition-colors text-center cursor-pointer"
              >
                View {selectedHotspot.citizenRequests.toLocaleString()} Raw Request Clusters
              </button>
            </div>
          </aside>
        </section>

        {/* 5. Emerging Development Needs (3 Column Sector Cards) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1c1e] tracking-tight">Emerging Development Needs</h2>
              <p className="text-sm text-[#444653]">Cross-sector intelligence clustered by community voice velocity.</p>
            </div>
            <span className="text-[11px] font-mono text-[#747685] uppercase tracking-wider">
              Aggregation cycle: 30-Day moving window
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Roads & Mobility */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200/80 space-y-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#dce1ff] flex items-center justify-center text-[#033aaf]">
                    <span className="material-symbols-outlined">commute</span>
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#1a1c1e]">Roads &amp; Mobility</h3>
                    <span className="text-[11px] font-mono text-[#444653]">Priority Infrastructure</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-mono font-bold">
                  HIGH GAP
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 bg-[#f3f3f6] p-3 rounded-xl border border-stone-200">
                <div>
                  <p className="text-[10px] font-mono text-[#444653] uppercase">Demand Index</p>
                  <p className="text-2xl font-mono font-bold text-[#1a1c1e]">
                    91<span className="text-xs text-[#747685]">/100</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[#444653] uppercase">Active Hotspots</p>
                  <p className="text-2xl font-mono font-bold text-[#1a1c1e]">126</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#444653]">Trend Velocity:</span>
                  <span className="font-bold text-[#ba1a1a]">↑ Emerging (+18% MoM)</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#444653] shrink-0">Primary Issue:</span>
                  <span className="text-[#1a1c1e] text-right font-medium">Monsoon washouts &amp; culvert bottlenecks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#444653]">Concentrated Areas:</span>
                  <span className="font-bold text-[#033aaf]">Nadia &amp; Murshidabad</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/dashboard/region/nadia')}
                  className="w-full py-2 px-3 rounded-lg bg-[#f3f3f6] hover:bg-[#e8e8ea] text-xs font-semibold text-[#1a1c1e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Mobility Portfolio</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Water Access */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200/80 space-y-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#9cf2e8] flex items-center justify-center text-[#004f49]">
                    <span className="material-symbols-outlined">water_drop</span>
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#1a1c1e]">Water Access</h3>
                    <span className="text-[11px] font-mono text-[#444653]">Basic Services</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-mono font-bold">
                  HIGH GAP
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 bg-[#f3f3f6] p-3 rounded-xl border border-stone-200">
                <div>
                  <p className="text-[10px] font-mono text-[#444653] uppercase">Demand Index</p>
                  <p className="text-2xl font-mono font-bold text-[#1a1c1e]">
                    87<span className="text-xs text-[#747685]">/100</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[#444653] uppercase">Active Hotspots</p>
                  <p className="text-2xl font-mono font-bold text-[#1a1c1e]">104</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#444653]">Trend Velocity:</span>
                  <span className="font-bold text-[#ba1a1a]">↑ Emerging (+11% MoM)</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#444653] shrink-0">Primary Issue:</span>
                  <span className="text-[#1a1c1e] text-right font-medium">Salinity intrusion &amp; pipe pressure drop</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#444653]">Concentrated Areas:</span>
                  <span className="font-bold text-[#033aaf]">Kalahandi &amp; Sundarbans</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const kalahandi = HOTSPOTS.find((h) => h.id === 'kalahandi');
                    if (kalahandi) setSelectedHotspot(kalahandi);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#f3f3f6] hover:bg-[#e8e8ea] text-xs font-semibold text-[#1a1c1e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Water Portfolio</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Healthcare Access */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200/80 space-y-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#ffdbcb] flex items-center justify-center text-[#9e4200]">
                    <span className="material-symbols-outlined">health_and_safety</span>
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#1a1c1e]">Healthcare Access</h3>
                    <span className="text-[11px] font-mono text-[#444653]">Primary Welfare</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbcb] text-[#793100] text-[11px] font-mono font-bold">
                  MEDIUM GAP
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 bg-[#f3f3f6] p-3 rounded-xl border border-stone-200">
                <div>
                  <p className="text-[10px] font-mono text-[#444653] uppercase">Demand Index</p>
                  <p className="text-2xl font-mono font-bold text-[#1a1c1e]">
                    69<span className="text-xs text-[#747685]">/100</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[#444653] uppercase">Active Hotspots</p>
                  <p className="text-2xl font-mono font-bold text-[#1a1c1e]">97</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#444653]">Trend Velocity:</span>
                  <span className="font-bold text-[#9e4200]">→ Steady (±2% MoM)</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#444653] shrink-0">Primary Issue:</span>
                  <span className="text-[#1a1c1e] text-right font-medium">Sub-centre distance &gt;12km in rural tracts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#444653]">Concentrated Areas:</span>
                  <span className="font-bold text-[#033aaf]">Gaya &amp; Palamu</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const gaya = HOTSPOTS.find((h) => h.id === 'gaya');
                    if (gaya) setSelectedHotspot(gaya);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#f3f3f6] hover:bg-[#e8e8ea] text-xs font-semibold text-[#1a1c1e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Healthcare Portfolio</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Analytical Deep-Dive: Where Demand Meets Reality */}
        <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-stone-200/80 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#033aaf] font-bold">
              Correlative Quadrant Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1c1e] tracking-tight">
              Where demand meets reality
            </h2>
            <p className="text-sm text-[#444653]">
              A civic signal becomes actionable intelligence when community demand is cross-examined against ground infrastructure reality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* SVG Matrix */}
            <div className="lg:col-span-8 relative bg-[#f3f3f6] p-4 sm:p-8 rounded-2xl border border-stone-200">
              <svg className="w-full h-auto drop-shadow-sm" viewBox="0 0 600 440">
                {/* Quadrants */}
                <rect fill="#ffdad6" height="170" opacity="0.45" rx="6" width="240" x="50" y="30"></rect>
                <rect fill="#eeeef0" height="170" opacity="0.4" rx="6" width="240" x="310" y="30"></rect>
                <rect fill="#eeeef0" height="170" opacity="0.4" rx="6" width="240" x="50" y="220"></rect>
                <rect fill="#9cf2e8" height="170" opacity="0.25" rx="6" width="240" x="310" y="220"></rect>

                {/* Quadrant Labels */}
                <text fill="#ba1a1a" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="700" x="65" y="55">
                  CRITICAL DEVELOPMENT GAP
                </text>
                <text fill="#747685" fontFamily="JetBrains Mono" fontSize="9" x="65" y="70">
                  High Citizen Demand · Low Physical Infrastructure
                </text>
                <text fill="#444653" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="600" x="325" y="55">
                  ACTIVE RESILIENCE
                </text>
                <text fill="#747685" fontFamily="JetBrains Mono" fontSize="9" x="325" y="70">
                  High Demand · High Physical Capacity
                </text>
                <text fill="#444653" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="600" x="65" y="245">
                  LATENT CIVIC RISK
                </text>
                <text fill="#747685" fontFamily="JetBrains Mono" fontSize="9" x="65" y="260">
                  Low Demand Voiced · Infrastructure Deficit
                </text>
                <text fill="#004f49" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="600" x="325" y="245">
                  OPTIMAL BASELINE
                </text>
                <text fill="#747685" fontFamily="JetBrains Mono" fontSize="9" x="325" y="260">
                  Low Unmet Need · Adequate Coverage
                </text>

                {/* Grid Axes */}
                <line stroke="#747685" strokeDasharray="4,4" strokeWidth="1.5" x1="50" x2="560" y1="210" y2="210"></line>
                <line stroke="#747685" strokeDasharray="4,4" strokeWidth="1.5" x1="300" x2="300" y1="30" y2="400"></line>

                {/* Axis Labels */}
                <text fill="#1a1c1e" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" textAnchor="middle" x="25" y="35">100</text>
                <text fill="#1a1c1e" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" textAnchor="middle" x="25" y="215">50</text>
                <text fill="#1a1c1e" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" textAnchor="middle" x="25" y="395">0</text>
                <text fill="#1a1c1e" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" textAnchor="middle" transform="rotate(-90 20 120)" x="20" y="120">
                  CITIZEN DEMAND INDEX →
                </text>

                <text fill="#1a1c1e" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" x="50" y="415">0</text>
                <text fill="#1a1c1e" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" textAnchor="middle" x="300" y="415">50</text>
                <text fill="#1a1c1e" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" textAnchor="end" x="550" y="415">100</text>
                <text fill="#1a1c1e" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" textAnchor="middle" x="300" y="432">
                  INFRASTRUCTURE COVERAGE RATIO →
                </text>

                {/* Scatter Data Points */}
                <circle cx="180" cy="140" fill="#fe843e" opacity="0.7" r="7"></circle>
                <circle cx="210" cy="110" fill="#ba1a1a" opacity="0.6" r="9"></circle>
                <circle cx="150" cy="160" fill="#fe843e" opacity="0.6" r="6"></circle>
                <circle cx="390" cy="120" fill="#2e54c7" opacity="0.5" r="8"></circle>
                <circle cx="440" cy="90" fill="#2e54c7" opacity="0.5" r="10"></circle>
                <circle cx="120" cy="310" fill="#747685" opacity="0.5" r="7"></circle>
                <circle cx="200" cy="270" fill="#747685" opacity="0.5" r="8"></circle>
                <circle cx="420" cy="310" fill="#006962" opacity="0.6" r="9"></circle>
                <circle cx="480" cy="280" fill="#006962" opacity="0.6" r="8"></circle>

                {/* High-Impact Outlier: NADIA */}
                <g>
                  <circle className="animate-ping" cx="120" cy="50" fill="#ba1a1a" opacity="0.3" r="14"></circle>
                  <circle cx="120" cy="50" fill="#ba1a1a" r="9" stroke="#ffffff" strokeWidth="2"></circle>
                  <rect fill="#1a1c1e" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" height="42" rx="6" width="190" x="135" y="32"></rect>
                  <text fill="#ffffff" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" x="145" y="48">
                    Nadia · Roads &amp; Mobility
                  </text>
                  <text fill="#ffb691" fontFamily="JetBrains Mono" fontSize="9.5" x="145" y="62">
                    Demand: 91 | Infra: 28 | Gap: -63pt
                  </text>
                </g>

                {/* High-Impact Outlier: KALAHANDI */}
                <g>
                  <circle cx="135" cy="65" fill="#ba1a1a" r="7"></circle>
                  <text fill="#444653" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" x="148" y="78">
                    Kalahandi (Water)
                  </text>
                </g>
              </svg>
            </div>

            {/* Narrative Context */}
            <div className="lg:col-span-4 space-y-5">
              <div className="p-4 rounded-xl bg-[#f3f3f6] space-y-2 border border-stone-200">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#ba1a1a] font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                  Severe Disconnect Zone
                </span>
                <h3 className="text-lg font-bold text-[#1a1c1e]">The Top-Left Quadrant</h3>
                <p className="text-xs text-[#444653] leading-relaxed">
                  When citizen volume and urgency spike while public infrastructure surveys show persistent supply deficits, this represents an acute institutional blindspot requiring human deliberation.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center font-bold text-xs font-mono">
                    91
                  </span>
                  <div>
                    <p className="font-semibold text-[#1a1c1e]">Nadia Road Disruption</p>
                    <p className="font-mono text-[#444653] text-[11px]">Net civic deficit gap of -63 points</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center font-bold text-xs font-mono">
                    87
                  </span>
                  <div>
                    <p className="font-semibold text-[#1a1c1e]">Kalahandi Water Vulnerability</p>
                    <p className="font-mono text-[#444653] text-[11px]">Net civic deficit gap of -53 points</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-mono text-[#747685]">
                Each point represents an aggregated cluster of demonstration citizen signals modeled against baseline infrastructure profiles.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Data Fusion Panel: One Signal. Multiple Layers of Context */}
        <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-stone-200/80 space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#004f49] font-bold">
              Methodological Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1c1e] tracking-tight">
              One signal. Multiple layers of context.
            </h2>
            <p className="text-sm text-[#444653]">
              Baat2Badlav never relies on citizen volume alone. We synthesize 4 distinct civic layers before scoring a development gap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Stage 1 */}
            <div className="p-5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between space-y-4 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold text-[#033aaf]">01</span>
                <span className="w-8 h-8 rounded-lg bg-[#dce1ff] flex items-center justify-center text-[#033aaf]">
                  <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1c1e]">Citizen Demand</h3>
                <p className="text-xs text-[#444653] mt-1.5 leading-relaxed">
                  What communities are experiencing. Multilingual audio transcripts and localized submissions parsed for recurring civic themes.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#033aaf] font-semibold">ASR + Dialect NER Filtered</span>
            </div>

            {/* Stage 2 */}
            <div className="p-5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between space-y-4 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold text-[#004f49]">02</span>
                <span className="w-8 h-8 rounded-lg bg-[#9cf2e8] flex items-center justify-center text-[#004f49]">
                  <span className="material-symbols-outlined text-[18px]">foundation</span>
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1c1e]">Infrastructure</h3>
                <p className="text-xs text-[#444653] mt-1.5 leading-relaxed">
                  What physical capacity exists. Sector road networks, Jal Jeevan tap connections, and PHC distance rasters.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#004f49] font-semibold">Synthetic Infrastructure Baseline</span>
            </div>

            {/* Stage 3 */}
            <div className="p-5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between space-y-4 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold text-[#9e4200]">03</span>
                <span className="w-8 h-8 rounded-lg bg-[#ffdbcb] flex items-center justify-center text-[#9e4200]">
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1c1e]">Demographics</h3>
                <p className="text-xs text-[#444653] mt-1.5 leading-relaxed">
                  Who is exposed. Census catchment population density, marginal farmer ratio, and seasonal migration indices.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#9e4200] font-semibold">Catchment Vulnerability Score</span>
            </div>

            {/* Stage 4 */}
            <div className="p-5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between space-y-4 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold text-[#1a1c1e]">04</span>
                <span className="w-8 h-8 rounded-lg bg-[#e8e8ea] flex items-center justify-center text-[#1a1c1e]">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1c1e]">Public Investment</h3>
                <p className="text-xs text-[#444653] mt-1.5 leading-relaxed">
                  What public capital exists. Open treasury disbursements, existing state tenders, and approved MLA/MP LAD outlays.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#444653] font-semibold">Tender &amp; Budget Matching</span>
            </div>
          </div>

          {/* Result Banner */}
          <div className="p-4 rounded-xl bg-[#033aaf] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px]">verified</span>
              <div>
                <p className="text-sm font-bold">Identified Development Gap for Human Deliberation</p>
                <p className="text-xs text-[#cdd5ff]">
                  Produces transparent, reproducible dossiers for district collectors and planners
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-mono font-medium">
              Zero Automated Spending Decisions
            </span>
          </div>
        </section>

        {/* 8. Recently Emerging Signals Table */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#1a1c1e]">Recently Emerging Hotspot Signals</h2>
              <p className="text-xs text-[#444653]">Validated signals reaching analytical priority threshold.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#747685]">
              <span className="material-symbols-outlined text-[14px]">tune</span>
              Filtered by confidence threshold ≥85%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f3f6] text-[#444653] text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Location &amp; Cluster</th>
                  <th className="py-3 px-4">Development Sector</th>
                  <th className="py-3 px-4">Community Voices</th>
                  <th className="py-3 px-4">Demographic Exposure</th>
                  <th className="py-3 px-4">Calculated Gap Status</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm text-[#1a1c1e]">
                {HOTSPOTS.slice(0, 4).map((h) => (
                  <tr key={h.id} className="hover:bg-[#f3f3f6]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1a1c1e]">{h.name}</div>
                      <div className="text-[11px] font-mono text-[#747685]">
                        {h.state} · {h.cluster}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dce1ff] text-[#033aaf] text-[11px] font-mono font-semibold">
                        <span className="material-symbols-outlined text-[14px]">
                          {h.sector.includes('Road') ? 'commute' : h.sector.includes('Water') ? 'water_drop' : 'health_and_safety'}
                        </span>
                        {h.sector}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">{h.citizenRequests.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-[#444653] font-mono text-xs">
                      {h.exposedPopulation.toLocaleString()} residents
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                          h.gapScore >= 80
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#ffdbcb] text-[#793100]'
                        }`}
                      >
                        {h.gapStatus} Gap ({h.gapScore})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleInspectDossier(h.id)}
                        className="px-3 py-1 rounded-lg bg-[#033aaf] text-white hover:bg-[#063baf] text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <div className="pt-2 flex flex-wrap items-center justify-between text-[#747685] text-[11px] font-mono">
              <span>Showing 4 of 84 high-priority cluster signals</span>
              <span>Representative demonstration dataset · Not official statistics</span>
            </div>
          </section>
        </div>
      )}

      {/* 9. Scalability & Ethical Governance Banner */}
      <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#033aaf] text-[20px]">hub</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#033aaf]">
                  Scalable Architecture
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1a1c1e]">
                Designed for India. Built to scale across constitutional tiers.
              </h3>
              <p className="text-xs sm:text-sm text-[#444653] leading-relaxed">
                Data aggregates seamlessly along statutory boundaries: National → State → District → Block → Gram Panchayat → Habitation. Every signal preserves privacy while empowering localized governance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="px-4 py-3 rounded-xl bg-[#f3f3f6] text-[#1a1c1e] border border-stone-200">
                <span className="font-bold text-[#033aaf] block text-sm">32 Districts</span>
                <span className="text-[#444653]">Piloted in demo scope</span>
              </div>
              <div className="px-4 py-3 rounded-xl bg-[#f3f3f6] text-[#1a1c1e] border border-stone-200">
                <span className="font-bold text-[#004f49] block text-sm">100% Consent</span>
                <span className="text-[#444653]">Grassroots voice protocol</span>
              </div>
            </div>
          </div>

          <div className="pt-4 bg-[#f3f3f6] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-200">
            <div className="flex items-start sm:items-center gap-3">
              <span className="material-symbols-outlined text-[#9e4200] shrink-0 text-[22px]">policy</span>
              <p className="text-xs text-[#444653]">
                <strong className="text-[#1a1c1e]">Responsible AI Governance:</strong> Baat2Badlav provides objective evidence and scenario modeling — never automated spending mandates. All public resource decisions remain strictly with elected representatives, planners, and citizens.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/trust')}
              className="inline-flex items-center gap-1 text-xs text-[#033aaf] font-bold hover:underline shrink-0 cursor-pointer"
            >
              <span>Explore Data &amp; Trust</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </div>
        </section>

      </div>
    </main>
  );
};
