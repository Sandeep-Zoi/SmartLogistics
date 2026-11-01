import React, { useState } from 'react';
import { Truck, MapPin, Navigation, CloudRain, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface HubNode {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  activeTrucks: number;
  weather: string;
  onTimePct: string;
  nextDispatch: string;
}

const HUB_NODES: HubNode[] = [
  {
    id: 'hub-nw',
    name: 'Seattle Gateway',
    code: 'SEA-01',
    x: 95,
    y: 92,
    activeTrucks: 14,
    weather: '9°C · Rain Bypass',
    onTimePct: '94.8%',
    nextDispatch: 'Corridor I-5 South',
  },
  {
    id: 'hub-mw',
    name: 'Chicago O-Hare Hub',
    code: 'ORD-04',
    x: 270,
    y: 135,
    activeTrucks: 28,
    weather: '12°C · Light Rain',
    onTimePct: '96.8%',
    nextDispatch: 'Corridor I-90 East',
  },
  {
    id: 'hub-ne',
    name: 'Newark Port Terminal',
    code: 'EWR-02',
    x: 435,
    y: 110,
    activeTrucks: 34,
    weather: '18°C · Clear Sky',
    onTimePct: '98.4%',
    nextDispatch: 'Boston Express A-01',
  },
  {
    id: 'hub-sw',
    name: 'Long Beach Intermodal',
    code: 'LGB-09',
    x: 115,
    y: 250,
    activeTrucks: 31,
    weather: '23°C · Clear Sky',
    onTimePct: '95.9%',
    nextDispatch: 'Phoenix Freight Line',
  },
  {
    id: 'hub-sc',
    name: 'Dallas Central Depot',
    code: 'DFW-06',
    x: 265,
    y: 265,
    activeTrucks: 22,
    weather: '21°C · Optimal',
    onTimePct: '97.1%',
    nextDispatch: 'Houston Bayport Link',
  },
  {
    id: 'hub-se',
    name: 'Atlanta Air & Ground',
    code: 'ATL-03',
    x: 395,
    y: 235,
    activeTrucks: 19,
    weather: '19°C · Clear Sky',
    onTimePct: '96.3%',
    nextDispatch: 'Charlotte Cargo Corridor',
  },
];

export const LogisticsHeroIllustration: React.FC<{
  onOpenDashboard: () => void;
}> = ({ onOpenDashboard }) => {
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-ne');
  const activeHub = HUB_NODES.find((h) => h.id === selectedHubId) || HUB_NODES[2];

  return (
    <div className="relative rounded-2xl bg-[#0B192C] border border-cyan-500/25 shadow-2xl overflow-hidden">
      {/* Top Bar of Network Map */}
      <div className="flex items-center justify-between gap-2 px-5 py-3.5 bg-[#071120] border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-white truncate">
            Connected Freight &amp; Route Optimization Network
          </span>
        </div>
        <span className="text-xs font-mono text-cyan-300 tabular-nums whitespace-nowrap shrink-0">
          6 Hubs · 148 Fleet Units
        </span>
      </div>

      {/* Interactive SVG Route Network & Delivery Trucks Illustration */}
      <div className="relative px-4 pt-4 pb-2">
        <svg
          viewBox="0 0 520 330"
          className="w-full h-auto select-none"
          role="img"
          aria-label="Interactive logistics illustration showing delivery trucks, route networks, location pins, and connected logistics operations"
        >
          <defs>
            <linearGradient id="routeCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="hubGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </linearGradient>
            <pattern id="logisticsGrid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path
                d="M 26 0 L 0 0 0 26"
                fill="none"
                stroke="rgba(148, 163, 184, 0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Subtle Coordinate Grid Background */}
          <rect width="520" height="330" rx="12" fill="url(#logisticsGrid)" />

          {/* Regional Weather Radar Zone (Pacific NW & Midwest) */}
          <ellipse
            cx="100"
            cy="95"
            rx="58"
            ry="38"
            fill="rgba(56, 189, 248, 0.07)"
            stroke="rgba(56, 189, 248, 0.22)"
            strokeDasharray="4 4"
          />
          <text x="56" y="48" fill="#7dd3fc" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
            WX-RADAR: RAIN DETOUR ACTIVE
          </text>

          {/* Secondary Network Mesh Connections */}
          <g stroke="rgba(148, 163, 184, 0.22)" strokeWidth="1.5" strokeDasharray="5 5" fill="none">
            <path d="M 95 92 Q 190 70 270 135" />
            <path d="M 95 92 L 115 250" />
            <path d="M 270 135 L 265 265" />
            <path d="M 265 265 L 395 235" />
            <path d="M 270 135 L 395 235" />
          </g>

          {/* Primary Optimized Freight Corridors */}
          <g fill="none" stroke="url(#routeCyan)" strokeWidth="3" strokeLinecap="round">
            <path id="corridor-1" d="M 115 250 Q 190 258 265 265" />
            <path id="corridor-2" d="M 270 135 Q 352 105 435 110" />
            <path id="corridor-3" d="M 395 235 Q 425 175 435 110" />
            <path id="corridor-4" d="M 115 250 Q 190 190 270 135" />
          </g>

          {/* Illustrated Delivery Trucks Along Active Corridors */}
          {/* Truck 1: Midwest to Northeast Corridor */}
          <g transform="translate(338, 102)">
            <rect
              x="-22"
              y="-12"
              width="44"
              height="22"
              rx="5"
              fill="#0f172a"
              stroke="#22d3ee"
              strokeWidth="1.5"
            />
            {/* Truck Trailer + Cab */}
            <rect x="-16" y="-6" width="20" height="10" rx="1.5" fill="#22d3ee" />
            <path d="M 5 -4 L 13 -4 L 16 0 L 16 4 L 5 4 Z" fill="#f8fafc" />
            <circle cx="-11" cy="5" r="2.5" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
            <circle cx="0" cy="5" r="2.5" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
            <circle cx="11" cy="5" r="2.5" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
            <text
              x="-18"
              y="-16"
              fill="#e2e8f0"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
            >
              TRK-849 · 88 km/h
            </text>
          </g>

          {/* Truck 2: Southwest to Dallas Corridor */}
          <g transform="translate(190, 255)">
            <rect
              x="-22"
              y="-12"
              width="44"
              height="22"
              rx="5"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <rect x="-16" y="-6" width="20" height="10" rx="1.5" fill="#38bdf8" />
            <path d="M 5 -4 L 13 -4 L 16 0 L 16 4 L 5 4 Z" fill="#f8fafc" />
            <circle cx="-11" cy="5" r="2.5" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
            <circle cx="0" cy="5" r="2.5" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
            <circle cx="11" cy="5" r="2.5" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
            <text
              x="-18"
              y="21"
              fill="#e2e8f0"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
            >
              TRK-312 · COLD CHAIN
            </text>
          </g>

          {/* Truck 3: Southeast to Northeast Corridor */}
          <g transform="translate(418, 174)">
            <rect
              x="-20"
              y="-11"
              width="40"
              height="20"
              rx="5"
              fill="#0f172a"
              stroke="#22d3ee"
              strokeWidth="1.5"
            />
            <rect x="-14" y="-5" width="18" height="9" rx="1.5" fill="#06b6d4" />
            <path d="M 5 -3 L 11 -3 L 14 0 L 14 4 L 5 4 Z" fill="#f8fafc" />
            <circle cx="-9" cy="5" r="2.2" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
            <circle cx="9" cy="5" r="2.2" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.2" />
          </g>

          {/* Interactive Location Pins & Hub Nodes */}
          {HUB_NODES.map((hub) => {
            const isSelected = hub.id === selectedHubId;
            return (
              <g
                key={hub.id}
                transform={`translate(${hub.x}, ${hub.y})`}
                onClick={() => setSelectedHubId(hub.id)}
                className="cursor-pointer"
              >
                {isSelected && (
                  <circle
                    r="24"
                    fill="rgba(6, 182, 212, 0.16)"
                    stroke="#22d3ee"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  r={isSelected ? '10' : '8'}
                  fill={isSelected ? '#22d3ee' : '#0f172a'}
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                />
                {/* Location Pin Icon Stem above node */}
                <path
                  d="M 0 -10 C -5 -16 -8 -20 -8 -24 A 8 8 0 1 1 8 -24 C 8 -20 5 -16 0 -10 Z"
                  fill={isSelected ? '#06b6d4' : '#1e293b'}
                  stroke={isSelected ? '#ffffff' : '#38bdf8'}
                  strokeWidth="1.4"
                />
                <circle cx="0" cy="-24" r="2.5" fill="#ffffff" />
                <text
                  x="0"
                  y="22"
                  textAnchor="middle"
                  fill={isSelected ? '#22d3ee' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight={isSelected ? '700' : '500'}
                >
                  {hub.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Hub Inspector Strip */}
        <div className="mt-2 mb-2 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cyan-400 font-mono">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{activeHub.code}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-white font-sans font-semibold whitespace-nowrap">
                {activeHub.name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 whitespace-nowrap">{activeHub.weather}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="whitespace-nowrap">
                Active Fleet: <strong className="text-white font-mono">{activeHub.activeTrucks} trucks</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">
                Hub On-Time: <strong className="text-emerald-400 font-mono">{activeHub.onTimePct}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">
                Corridor: <strong className="text-slate-200">{activeHub.nextDispatch}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDashboard}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Inspect Live Corridor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hub Quick-Select Bar */}
      <div className="px-5 py-2.5 bg-[#071120] border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[11px] text-slate-400 whitespace-nowrap">Select Hub Pin:</span>
        <div className="flex items-center gap-1.5">
          {HUB_NODES.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => setSelectedHubId(hub.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedHubId === hub.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {hub.code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
