/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Route,
  CloudRain,
  Users,
  BarChart3,
  Lightbulb,
  Menu,
  X,
  ArrowRight,
  Database,
  RefreshCw,
  CheckCircle2,
  Ship,
  PackageCheck,
  ThermometerSnowflake,
  FileCheck2,
  Code2,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import {
  INITIAL_SAMPLE_DELIVERIES,
  INITIAL_SAMPLE_EMPLOYEES,
  INITIAL_WEATHER_HUBS,
  DeliveryRecord,
  EmployeeRecord,
  WeatherHub,
  LogisticsStats,
  computeLogisticsStats,
  validateNewsletterEmail,
} from './utils/logisticsLogic';
import { LogisticsHeroIllustration } from './components/LogisticsHeroIllustration';
import { DashboardPreviewSection } from './components/DashboardPreviewSection';
import { AuthPagesModal, AuthenticatedUser } from './components/AuthPagesModal';

const SIX_FEATURES = [
  {
    index: '01',
    title: 'Smart Route Analysis',
    description:
      'Compute shortest-path and congestion-aware freight corridors using multi-stop graph heuristics, axle-weight constraints, and turn-by-turn ETA telemetry.',
    metric: '11.4% avg. distance reduction across interstate corridors',
    icon: Route,
    targetTab: 'routes',
  },
  {
    index: '02',
    title: 'Delivery Management',
    description:
      'Track end-to-end shipment lifecycles from port gate dispatch to final proof of delivery, with automated exception handling and SLA timers.',
    metric: 'Real-time status synchronization with SQLite order tables',
    icon: Truck,
    targetTab: 'overview',
  },
  {
    index: '03',
    title: 'Weather Integration',
    description:
      'Ingest live meteorological API feeds across regional hubs to quantify precipitation, crosswind, and visibility penalties before trucks depart.',
    metric: 'Automated detour routing when storm delay exceeds +12%',
    icon: CloudRain,
    targetTab: 'weather',
  },
  {
    index: '04',
    title: 'Employee Performance',
    description:
      'Evaluate driver on-time completion rates, shift utilization, and dispatch coordinator throughput using objective operational KPIs.',
    metric: 'Tracks 48+ active fleet operators and route analysts',
    icon: Users,
    targetTab: 'employees',
  },
  {
    index: '05',
    title: 'Advanced Data Analytics',
    description:
      'Leverage Python, Pandas, NumPy, and R statistical pipelines to uncover seasonal bottlenecks, hub dwell times, and cost-per-kilometer trends.',
    metric: 'Vectorized Pandas aggregation on historical delivery logs',
    icon: BarChart3,
    targetTab: 'overview',
  },
  {
    index: '06',
    title: 'Intelligent Recommendations',
    description:
      'Receive actionable dispatch recommendations for fleet rebalancing, cold-chain priority upgrades, and fuel-optimal departure windows.',
    metric: 'Up to 18.2% reduction in weather-related late arrivals',
    icon: Lightbulb,
    targetTab: 'routes',
  },
];

const TRANSPORTATION_SERVICES = [
  {
    id: 'srv-1',
    title: 'Sea & Air Freight Coordination',
    category: 'Intermodal Port-to-Hub',
    transitWindow: '24–72 hrs',
    description:
      'Synchronized container drayage from maritime terminals and air cargo hubs directly into regional distribution lanes.',
  },
  {
    id: 'srv-2',
    title: 'Warehousing & Distribution',
    category: 'Cross-Docking & Storage',
    transitWindow: 'Same-Day Turnaround',
    description:
      'High-throughput cross-docking, automated pallet sorting, and SQLite-backed inventory allocation across 6 regional hubs.',
  },
  {
    id: 'srv-3',
    title: 'Supply Chain Management',
    category: 'End-to-End Visibility',
    transitWindow: 'Continuous Telemetry',
    description:
      'Unified procurement, carrier scheduling, and predictive bottleneck mitigation powered by Pandas and NumPy analytics.',
  },
  {
    id: 'srv-4',
    title: 'E-Commerce Logistics',
    category: 'Last-Mile Fulfillment',
    transitWindow: 'Next-Day Delivery',
    description:
      'High-density urban route clustering and automated customer ETA notifications for high-volume retail parcels.',
  },
  {
    id: 'srv-5',
    title: 'Cold Chain Solutions',
    category: 'Temperature-Controlled',
    transitWindow: '-20°C to +8°C Verified',
    description:
      'Continuous reefer thermal monitoring and priority highway routing for pharmaceuticals and perishable cargo.',
  },
  {
    id: 'srv-6',
    title: 'Customs Brokerage & Compliance',
    category: 'Border Clearance',
    transitWindow: 'Pre-Arrival Filing',
    description:
      'Automated manifest validation, tariff classification, and digital bill-of-lading verification to eliminate port holds.',
  },
];

const TECH_STACK = [
  {
    name: 'Python',
    category: 'Backend & Data',
    role: 'Core backend runtime for route optimization services and analytics scripts.',
  },
  {
    name: 'Flask',
    category: 'Backend & Data',
    role: 'Lightweight WSGI web framework serving REST APIs (/api/stats, /api/deliveries) and Jinja2 templates.',
  },
  {
    name: 'Pandas',
    category: 'Data Science',
    role: 'DataFrame transformations, time-series delivery aggregation, and SLA compliance calculation.',
  },
  {
    name: 'NumPy',
    category: 'Data Science',
    role: 'Vectorized distance matrices, weather penalty weights, and numerical efficiency scoring.',
  },
  {
    name: 'SQLite',
    category: 'Backend & Data',
    role: 'Embedded relational database storing deliveries, employees, hubs, and route telemetry.',
  },
  {
    name: 'SQL',
    category: 'Backend & Data',
    role: 'Structured queries, indexed joins, and KPI aggregation views across operational tables.',
  },
  {
    name: 'JavaScript',
    category: 'Frontend & UI',
    role: 'Asynchronous Fetch API client, dynamic DOM updates, interactive calculators, and form validation.',
  },
  {
    name: 'HTML',
    category: 'Frontend & UI',
    role: 'Semantic, accessible document structure for the homepage, forms, and operational tables.',
  },
  {
    name: 'CSS',
    category: 'Frontend & UI',
    role: 'Responsive grid layouts, navy/cyan color tokens, smooth compositor transitions, and print-ready styles.',
  },
  {
    name: 'Bootstrap',
    category: 'Frontend & UI',
    role: 'Responsive container/grid conventions and reusable UI utility patterns for rapid Flask template integration.',
  },
  {
    name: 'Chart.js',
    category: 'Data Science',
    role: 'Interactive visual charts for delivery throughput, on-time rate trends, and corridor comparisons.',
  },
  {
    name: 'R Programming',
    category: 'Data Science',
    role: 'Statistical regression modeling for seasonal freight demand forecasting and weather delay variance.',
  },
];

export default function App() {
  // Navigation & Page View State
  const [viewMode, setViewMode] = useState<'homepage' | 'full-dashboard'>('homepage');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'flask-code' | null>(
    null
  );
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [techFilter, setTechFilter] = useState<string>('ALL');

  // Dynamic Backend Data State (connected to /api/stats)
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(INITIAL_SAMPLE_DELIVERIES);
  const [employees, setEmployees] = useState<EmployeeRecord[]>(INITIAL_SAMPLE_EMPLOYEES);
  const [weatherHubs, setWeatherHubs] = useState<WeatherHub[]>(INITIAL_WEATHER_HUBS);
  const [stats, setStats] = useState<LogisticsStats>(() =>
    computeLogisticsStats(INITIAL_SAMPLE_DELIVERIES, INITIAL_SAMPLE_EMPLOYEES, 1272, 42, false)
  );
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Newsletter / Dispatch Alert Footer Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);

  const fetchStatsFromApi = useCallback(async () => {
    setIsRefreshingStats(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalDeliveries: data.totalDeliveries,
          onTimeDeliveryRate: data.onTimeDeliveryRate,
          activeOrders: data.activeOrders,
          totalEmployees: data.totalEmployees,
          isSampleData: data.isSampleData,
          dataSourceLabel: data.dataSourceLabel,
          lastSyncedAt: data.lastSyncedAt,
        });
        if (Array.isArray(data.deliveries)) setDeliveries(data.deliveries);
        if (Array.isArray(data.employees)) setEmployees(data.employees);
        if (Array.isArray(data.weatherHubs)) setWeatherHubs(data.weatherHubs);
      }
    } catch {
      // Fallback uses clearly labeled local sample dataset
    } finally {
      setIsRefreshingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStatsFromApi();
  }, [fetchStatsFromApi]);

  const handleCreateDelivery = async (payload: {
    origin: string;
    destination: string;
    driverName: string;
    distanceKm: number;
    priority: 'Standard' | 'Express' | 'Cold Chain';
    weatherCondition: 'Clear' | 'Light Rain' | 'Heavy Rain' | 'High Wind' | 'Fog';
  }): Promise<{ ok: boolean; errors?: Record<string, string> }> => {
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, errors: data.errors || { origin: 'Failed to create delivery' } };
      }
      setDeliveries(data.deliveries);
      setStats(data.stats);
      return { ok: true };
    } catch {
      const newRecord: DeliveryRecord = {
        id: `del-${Date.now()}`,
        trackingCode: `SL-${Math.floor(10000 + Math.random() * 89999)}-LC`,
        origin: payload.origin,
        destination: payload.destination,
        driverName: payload.driverName,
        status: 'In Transit',
        distanceKm: payload.distanceKm,
        estimatedMinutes: Math.round((payload.distanceKm / 80) * 60),
        weatherCondition: payload.weatherCondition,
        priority: payload.priority,
        updatedAt: 'Just now',
      };
      const nextDeliveries = [newRecord, ...deliveries];
      setDeliveries(nextDeliveries);
      setStats(computeLogisticsStats(nextDeliveries, employees, 1272, 42, true));
      return { ok: true };
    }
  };

  const handleUpdateDeliveryStatus = async (
    id: string,
    status: DeliveryRecord['status']
  ): Promise<void> => {
    try {
      const res = await fetch(`/api/deliveries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries);
        setStats(data.stats);
        return;
      }
    } catch {
      // Fallback local update
    }
    const nextDeliveries = deliveries.map((d) =>
      d.id === id ? { ...d, status, updatedAt: 'Just now' } : d
    );
    setDeliveries(nextDeliveries);
    setStats(computeLogisticsStats(nextDeliveries, employees, 1272, 42, true));
  };

  const handleResetSampleData = async () => {
    try {
      const res = await fetch('/api/stats/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries);
        setEmployees(data.employees);
        setStats(data.stats);
        return;
      }
    } catch {
      // Local reset
    }
    setDeliveries(INITIAL_SAMPLE_DELIVERIES);
    setEmployees(INITIAL_SAMPLE_EMPLOYEES);
    setStats(
      computeLogisticsStats(INITIAL_SAMPLE_DELIVERIES, INITIAL_SAMPLE_EMPLOYEES, 1272, 42, false)
    );
  };

  const handleNavigateSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (viewMode !== 'homepage') {
      setViewMode('homepage');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSuccess(null);
    const validation = validateNewsletterEmail(newsletterEmail);
    if (!validation.valid) {
      setNewsletterError(validation.errors.email);
      return;
    }
    setNewsletterError(null);
    setNewsletterSuccess(`Subscribed ${newsletterEmail.trim()} to SmartLogistics operational alerts.`);
    setNewsletterEmail('');
  };

  const filteredTechStack =
    techFilter === 'ALL'
      ? TECH_STACK
      : TECH_STACK.filter((t) => t.category === techFilter);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0B192C]/95 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavigateSection('home');
            }}
            className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            Smart<span className="text-cyan-400">Logistics</span>
          </a>

          {/* Zone 2: Primary Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('home');
              }}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('features');
              }}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('services');
              }}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              Services
            </a>
            <a
              href="#analytics"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('analytics');
              }}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              Analytics
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('about');
              }}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
          </nav>

          {/* Zone 3: Auth Actions (Login & Register) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'homepage' ? 'full-dashboard' : 'homepage')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{viewMode === 'homepage' ? 'Open Full Dashboard' : 'Back to Homepage'}</span>
                </button>
                <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                  {currentUser.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentUser(null)}
                  aria-label="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('login')}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#071120] border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-200">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateSection('home');
                }}
                className="py-1.5 hover:text-cyan-400"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateSection('features');
                }}
                className="py-1.5 hover:text-cyan-400"
              >
                Features
              </a>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateSection('services');
                }}
                className="py-1.5 hover:text-cyan-400"
              >
                Services
              </a>
              <a
                href="#analytics"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateSection('analytics');
                }}
                className="py-1.5 hover:text-cyan-400"
              >
                Analytics
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateSection('about');
                }}
                className="py-1.5 hover:text-cyan-400"
              >
                About
              </a>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalMode('login');
                }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold border border-slate-700 text-white hover:bg-slate-800 cursor-pointer"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalMode('register');
                }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      {viewMode === 'full-dashboard' ? (
        <main className="flex-1">
          <DashboardPreviewSection
            stats={stats}
            deliveries={deliveries}
            employees={employees}
            weatherHubs={weatherHubs}
            isFullPageMode={true}
            onBackToHome={() => setViewMode('homepage')}
            onCreateDelivery={handleCreateDelivery}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            onResetSampleData={handleResetSampleData}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* HERO SECTION */}
          <section
            id="home"
            className="relative bg-gradient-to-b from-[#0B192C] via-[#0F1E36] to-[#132743] text-white py-16 lg:py-24 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Column: Hero Copy & Primary Actions */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                    Smart Logistics &amp; Delivery Optimization System
                  </div>

                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] text-white"
                    style={{ textWrap: 'balance' }}
                  >
                    Transform Your Logistics Operations with Smart Technology
                  </h1>

                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                    Optimize delivery routes, monitor logistics performance, analyze real-time
                    weather conditions, and make smarter operational decisions using intelligent
                    data analytics.
                  </p>

                  {/* Hero Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        currentUser ? setViewMode('full-dashboard') : setAuthModalMode('register')
                      }
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('full-dashboard')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/20 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Explore Dashboard</span>
                    </button>
                  </div>

                  {/* Operational Proof Metadata */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>Python + Flask REST Backend</span>
                    <span aria-hidden="true">·</span>
                    <span>Pandas &amp; NumPy Route Scoring</span>
                    <span aria-hidden="true">·</span>
                    <span>Live Weather Penalty Feed</span>
                  </div>
                </div>

                {/* Right Column: Interactive Logistics Network Illustration */}
                <div className="lg:col-span-6">
                  <LogisticsHeroIllustration
                    onOpenDashboard={() => handleNavigateSection('analytics')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* DYNAMIC STATISTICS SECTION (4 Cards Connected to /api/stats) */}
          <section
            aria-labelledby="stats-heading"
            className="py-12 bg-white border-b border-slate-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 id="stats-heading" className="text-lg font-bold text-slate-900">
                    Live Operational Telemetry &amp; Key Metrics
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connected to <code className="font-mono text-cyan-700">GET /api/stats</code> ·{' '}
                    <span className="font-medium text-slate-700">{stats.dataSourceLabel}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchStatsFromApi}
                    disabled={isRefreshingStats}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin' : ''}`}
                    />
                    <span>Sync Flask API</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateSection('analytics')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>+ Dispatch Order in Dashboard</span>
                  </button>
                </div>
              </div>

              {/* 4 Dynamic Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Total Deliveries */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Total Deliveries</span>
                    <Truck className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div
                    data-testid="stat-total-deliveries"
                    className="text-3xl font-extrabold font-mono text-slate-900 mt-2 tabular-nums"
                  >
                    {stats.totalDeliveries.toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Historical + Session Dispatches</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-cyan-700">
                      {stats.isSampleData ? 'Sample Seed' : 'Live Updated'}
                    </span>
                  </div>
                </div>

                {/* Card 2: On-Time Delivery Rate */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>On-Time Delivery Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div
                    data-testid="stat-ontime-rate"
                    className="text-3xl font-extrabold font-mono text-emerald-700 mt-2 tabular-nums"
                  >
                    {stats.onTimeDeliveryRate.toFixed(1)}%
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <span>SLA Target: 94.0%</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">+0.6% vs Baseline</span>
                  </div>
                </div>

                {/* Card 3: Active Orders */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Active Orders</span>
                    <Route className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div
                    data-testid="stat-active-orders"
                    className="text-3xl font-extrabold font-mono text-slate-900 mt-2 tabular-nums"
                  >
                    {stats.activeOrders.toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <span>In Transit &amp; Dispatched</span>
                    <span aria-hidden="true">·</span>
                    <span>6 Regional Corridors</span>
                  </div>
                </div>

                {/* Card 4: Total Employees */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Total Employees</span>
                    <Users className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div
                    data-testid="stat-total-employees"
                    className="text-3xl font-extrabold font-mono text-slate-900 mt-2 tabular-nums"
                  >
                    {stats.totalEmployees.toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Fleet Operators &amp; Analysts</span>
                    <span aria-hidden="true">·</span>
                    <span>Active Roster</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES SECTION (6 Professional Feature Cards) */}
          <section id="features" className="py-20 bg-slate-50 scroll-mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mb-12">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 mb-2">
                  Core Platform Capabilities
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Intelligent Logistics Features Engineered for Operational Precision
                </h2>
                <p className="mt-3 text-base text-slate-600">
                  Six integrated modules connect route telemetry, live weather feeds, and Python
                  data science pipelines into a single operational command center.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SIX_FEATURES.map((feat) => {
                  const IconComponent = feat.icon;
                  return (
                    <article
                      key={feat.title}
                      className="rounded-xl bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-cyan-500/60 transition-colors shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono font-semibold text-cyan-700">
                            {feat.index}. CAPABILITY
                          </span>
                          <div className="w-10 h-10 rounded-lg bg-[#0B192C] text-cyan-400 flex items-center justify-center">
                            <IconComponent className="w-5 h-5" />
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-slate-500">{feat.metric}</span>
                        <button
                          type="button"
                          onClick={() => handleNavigateSection('analytics')}
                          className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Explore →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SERVICES SECTION (#services — Fast, Reliable, and Secure Transportation Services) */}
          <section id="services" className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-12">
                <div className="lg:col-span-7">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 mb-2">
                    End-to-End Freight &amp; Trade Execution
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Fast, Reliable, and Secure Transportation Services
                  </h2>
                  <p className="mt-3 text-base text-slate-600">
                    From maritime container drayage and temperature-controlled cold chain corridors
                    to last-mile e-commerce fulfillment, every shipment is continuously optimized.
                  </p>
                </div>

                {/* Maritime & Intermodal Reference Visual Showcase */}
                <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative">
                  <img
                    src="/assets/aistudio/saved-image-file_00000000ba0c820889574c655510bb5c_8b81051e.jpg"
                    alt="Global intermodal container logistics and smart freight corridors"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover object-left-top opacity-90"
                  />
                  <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-cyan-400">
                        INTERMODAL CORRIDOR SYNC
                      </div>
                      <div className="text-sm font-bold">
                        Sea, Air &amp; Highway Telemetry Integration
                      </div>
                    </div>
                    <Ship className="w-5 h-5 text-cyan-400 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TRANSPORTATION_SERVICES.map((srv, idx) => (
                  <div
                    key={srv.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-mono font-semibold text-cyan-800">
                          0{idx + 1} · {srv.category}
                        </span>
                        <span className="font-mono text-slate-600">{srv.transitWindow}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{srv.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{srv.description}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-xs text-emerald-700 font-medium">
                        Route Optimization Enabled
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavigateSection('analytics')}
                        className="text-xs font-semibold text-slate-900 hover:text-cyan-700 cursor-pointer"
                      >
                        Simulate Route →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DASHBOARD PREVIEW SECTION (#analytics) */}
          <DashboardPreviewSection
            stats={stats}
            deliveries={deliveries}
            employees={employees}
            weatherHubs={weatherHubs}
            isFullPageMode={false}
            onCreateDelivery={handleCreateDelivery}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            onResetSampleData={handleResetSampleData}
          />

          {/* ABOUT SECTION (#about) */}
          <section id="about" className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
                    About the Smart Logistics Project
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Bridging Full-Stack Web Engineering with Scientific Data Analytics
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed">
                    The <strong>Smart Logistics &amp; Delivery Optimization System</strong> is
                    designed to eliminate manual dispatch guesswork and reduce transit delays across
                    regional freight networks. By combining a modular <strong>Flask</strong> REST
                    architecture and <strong>SQLite</strong> relational persistence with vectorized{' '}
                    <strong>Python, Pandas, and NumPy</strong> analytics pipelines, the platform
                    transforms raw shipment logs and live meteorological APIs into actionable route
                    decisions.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Historical delivery records and active fleet telemetry are stored in normalized
                    SQLite tables and queried via SQL and Pandas DataFrames to compute rolling
                    on-time delivery rates, driver efficiency scores, and weather delay buffers.
                    Complemented by <strong>R Programming</strong> for seasonal variance modeling
                    and <strong>Chart.js</strong> for real-time visual telemetry, operators gain
                    complete transparency from port gate departure to final customer delivery.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('flask-code')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0B192C] text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      <span>View Flask Integration Code (app.py &amp; index.html)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('full-dashboard')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span>Launch Full Screen Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* System Architecture Pipeline Summary Card */}
                <div className="lg:col-span-5 rounded-2xl bg-[#0B192C] text-white p-6 border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono text-cyan-400">ARCHITECTURE PIPELINE</span>
                      <h3 className="text-base font-bold mt-0.5">
                        End-to-End Data &amp; API Workflow
                      </h3>
                    </div>
                    <Database className="w-5 h-5 text-cyan-400" />
                  </div>

                  <ol className="space-y-4 text-xs">
                    <li className="flex items-start gap-3">
                      <span className="font-mono font-bold text-cyan-400 shrink-0">01.</span>
                      <div>
                        <strong className="text-white block">
                          SQLite &amp; SQL Relational Storage
                        </strong>
                        <span className="text-slate-300">
                          Stores structured tables for deliveries, active orders, fleet employees,
                          and hub coordinates.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-mono font-bold text-cyan-400 shrink-0">02.</span>
                      <div>
                        <strong className="text-white block">
                          Python, Pandas, NumPy &amp; R Analytics Engine
                        </strong>
                        <span className="text-slate-300">
                          Cleans shipment time-series data, applies NumPy weather penalty weights,
                          and computes optimal corridors.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-mono font-bold text-cyan-400 shrink-0">03.</span>
                      <div>
                        <strong className="text-white block">
                          Flask REST APIs &amp; Weather Integration
                        </strong>
                        <span className="text-slate-300">
                          Exposes JSON endpoints (<code className="font-mono text-cyan-300">/api/stats</code>,{' '}
                          <code className="font-mono text-cyan-300">/api/routes/optimize</code>) to
                          the frontend client.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-mono font-bold text-cyan-400 shrink-0">04.</span>
                      <div>
                        <strong className="text-white block">
                          Responsive HTML, CSS, Bootstrap, JS &amp; Chart.js UI
                        </strong>
                        <span className="text-slate-300">
                          Renders interactive KPI cards, route simulators, and real-time charts
                          across desktop, tablet, and mobile.
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* TECHNOLOGY SECTION (All 12 Required Technologies) */}
          <section className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 mb-2">
                    Technology Stack &amp; Ecosystem
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Powered by Modern Data Science &amp; Web Technologies
                  </h2>
                </div>

                {/* Interactive Category Filter */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                  {['ALL', 'Backend & Data', 'Data Science', 'Frontend & UI'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTechFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        techFilter === cat
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'ALL' ? 'All 12 Technologies' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTechStack.map((tech) => (
                  <div
                    key={tech.name}
                    className="rounded-xl bg-white border border-slate-200 p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-base font-bold text-slate-900">{tech.name}</h3>
                        <span className="text-[11px] font-mono text-cyan-700">
                          {tech.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{tech.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-[#071120] text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Brand & Project Info (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-lg font-extrabold tracking-tight text-white">
                Smart<span className="text-cyan-400">Logistics</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Smart Logistics &amp; Delivery Optimization System. Engineered with Python, Flask,
                Pandas, NumPy, SQLite, R Programming, and modern responsive web standards to
                optimize freight operations.
              </p>
              <div className="pt-1 text-xs font-mono text-cyan-400">
                API Endpoint: GET /api/stats · POST /api/routes/optimize
              </div>
            </div>

            {/* Col 2: Navigation Links (2 cols) */}
            <div className="lg:col-span-2 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a
                    href="#home"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('home');
                    }}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('features');
                    }}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('services');
                    }}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#analytics"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('analytics');
                    }}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Analytics Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateSection('about');
                    }}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    About Project
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Core Features (3 cols) */}
            <div className="lg:col-span-3 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Platform Modules
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Smart Route Analysis</li>
                <li>Delivery Management</li>
                <li>Weather Integration</li>
                <li>Employee Performance</li>
                <li>Advanced Data Analytics</li>
                <li>Intelligent Recommendations</li>
              </ul>
            </div>

            {/* Col 4: Dispatch Alerts & Portal Access (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Operational Dispatch Alerts
              </h3>
              <p className="text-xs text-slate-400">
                Receive corridor weather advisories and weekly Pandas performance digests.
              </p>
              <form onSubmit={handleNewsletterSubmit} noValidate className="space-y-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="footer-email" className="sr-only">
                    Email address for dispatch alerts
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter work email"
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-xs text-rose-400" role="alert">
                    {newsletterError}
                  </p>
                )}
                {newsletterSuccess && (
                  <p className="text-xs text-emerald-400" role="status">
                    {newsletterSuccess}
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} SmartLogistics — Smart Logistics &amp; Delivery
              Optimization System. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Operator Login
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Register Account
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setAuthModalMode('flask-code')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Flask Code Bundle
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* AUTH & FLASK CODE MODAL */}
      <AuthPagesModal
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onSwitchMode={(m) => setAuthModalMode(m)}
        onAuthSuccess={(user, updatedStats, updatedEmployees) => {
          setCurrentUser(user);
          if (updatedStats) setStats(updatedStats);
          if (updatedEmployees) setEmployees(updatedEmployees);
          setAuthModalMode(null);
          setViewMode('full-dashboard');
        }}
      />
    </div>
  );
}
