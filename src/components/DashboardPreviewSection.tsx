import React, { useState } from 'react';
import {
  Truck,
  CloudRain,
  Wind,
  Sun,
  TrendingUp,
  Route,
  Users,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import {
  DeliveryRecord,
  EmployeeRecord,
  WeatherHub,
  LogisticsStats,
  RouteOptimizationOutput,
  calculateRouteOptimization,
  validateDeliveryOrderInput,
} from '../utils/logisticsLogic';

interface DashboardPreviewSectionProps {
  stats: LogisticsStats;
  deliveries: DeliveryRecord[];
  employees: EmployeeRecord[];
  weatherHubs: WeatherHub[];
  isFullPageMode?: boolean;
  onBackToHome?: () => void;
  onCreateDelivery: (payload: {
    origin: string;
    destination: string;
    driverName: string;
    distanceKm: number;
    priority: 'Standard' | 'Express' | 'Cold Chain';
    weatherCondition: 'Clear' | 'Light Rain' | 'Heavy Rain' | 'High Wind' | 'Fog';
  }) => Promise<{ ok: boolean; errors?: Record<string, string> }>;
  onUpdateDeliveryStatus: (
    id: string,
    status: DeliveryRecord['status']
  ) => Promise<void>;
  onResetSampleData: () => Promise<void>;
}

const CHART_SERIES = {
  '7d': {
    label: 'Last 7 Days Dispatch & On-Time Performance',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dispatched: [172, 188, 195, 181, 210, 168, 166],
    onTime: [164, 179, 186, 169, 201, 160, 159],
    avgOnTime: '95.1%',
    totalVol: '1,280 units',
  },
  '30d': {
    label: '4-Week Regional Freight Throughput',
    days: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5 (Proj)', 'Wk 6 (Proj)', 'Wk 7 (Proj)'],
    dispatched: [1120, 1190, 1245, 1280, 1340, 1390, 1425],
    onTime: [1055, 1128, 1179, 1211, 1282, 1334, 1370],
    avgOnTime: '94.8%',
    totalVol: '4,835 units',
  },
};

export const DashboardPreviewSection: React.FC<DashboardPreviewSectionProps> = ({
  stats,
  deliveries,
  employees,
  weatherHubs,
  isFullPageMode = false,
  onBackToHome,
  onCreateDelivery,
  onUpdateDeliveryStatus,
  onResetSampleData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'routes' | 'weather' | 'employees'>(
    'overview'
  );
  const [chartWindow, setChartWindow] = useState<'7d' | '30d'>('7d');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Delivery Form State
  const [origin, setOrigin] = useState('Newark Port Hub');
  const [destination, setDestination] = useState('Philadelphia Cargo Terminal');
  const [driverName, setDriverName] = useState('Marcus Vance');
  const [distanceKm, setDistanceKm] = useState('165');
  const [priority, setPriority] = useState<'Standard' | 'Express' | 'Cold Chain'>('Express');
  const [weatherCondition, setWeatherCondition] = useState<
    'Clear' | 'Light Rain' | 'Heavy Rain' | 'High Wind' | 'Fog'
  >('Clear');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Route Optimizer State
  const [optOrigin, setOptOrigin] = useState('Chicago O-Hare Freight');
  const [optDestination, setOptDestination] = useState('Detroit Logistics Park');
  const [optDistance, setOptDistance] = useState(454);
  const [optWeather, setOptWeather] = useState<
    'Clear' | 'Light Rain' | 'Heavy Rain' | 'High Wind' | 'Fog'
  >('Light Rain');
  const [optTraffic, setOptTraffic] = useState(1.35);
  const [optLoad, setOptLoad] = useState(82);
  const [optResult, setOptResult] = useState<RouteOptimizationOutput>(() =>
    calculateRouteOptimization({
      origin: 'Chicago O-Hare Freight',
      destination: 'Detroit Logistics Park',
      baseDistanceKm: 454,
      weatherCondition: 'Light Rain',
      trafficIndex: 1.35,
      vehicleLoadPct: 82,
    })
  );

  const handleRunOptimizer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: optOrigin,
          destination: optDestination,
          baseDistanceKm: optDistance,
          weatherCondition: optWeather,
          trafficIndex: optTraffic,
          vehicleLoadPct: optLoad,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOptResult(data);
        return;
      }
    } catch {
      // Fallback to local pure function if offline
    }
    setOptResult(
      calculateRouteOptimization({
        origin: optOrigin,
        destination: optDestination,
        baseDistanceKm: optDistance,
        weatherCondition: optWeather,
        trafficIndex: optTraffic,
        vehicleLoadPct: optLoad,
      })
    );
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const validation = validateDeliveryOrderInput({
      origin,
      destination,
      driverName,
      distanceKm,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    const result = await onCreateDelivery({
      origin,
      destination,
      driverName,
      distanceKm: Number(distanceKm),
      priority,
      weatherCondition,
    });
    setIsSubmitting(false);

    if (!result.ok && result.errors) {
      setFormErrors(result.errors);
      return;
    }

    setFormFeedback(
      `Dispatched ${origin} → ${destination} (${distanceKm} km). Dynamic statistics updated.`
    );
    setDestination('');
  };

  const filteredDeliveries =
    statusFilter === 'ALL'
      ? deliveries
      : deliveries.filter((d) => d.status === statusFilter);

  const currentSeries = CHART_SERIES[chartWindow];
  const maxVal = Math.max(...currentSeries.dispatched, 1);

  return (
    <section
      id="analytics"
      aria-labelledby="analytics-heading"
      className={`scroll-mt-16 ${
        isFullPageMode ? 'py-8 bg-slate-100 min-h-screen' : 'py-20 bg-slate-900 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            {isFullPageMode && onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 hover:text-cyan-900 transition-colors cursor-pointer"
              >
                <span>← Back to SmartLogistics Homepage</span>
              </button>
            )}
            <p
              className={`text-xs font-semibold tracking-wider uppercase mb-2 ${
                isFullPageMode ? 'text-cyan-700' : 'text-cyan-400'
              }`}
            >
              Operational Intelligence &amp; Telemetry
            </p>
            <h2
              id="analytics-heading"
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                isFullPageMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              {isFullPageMode
                ? 'SmartLogistics Live Operations & Analytics Center'
                : 'Interactive Operations & Analytics Dashboard Preview'}
            </h2>
            <p
              className={`mt-2 text-sm max-w-2xl ${
                isFullPageMode ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Monitor real-time delivery charts, active order queues, route optimization models, and
              hub weather conditions. Dispatch an order or change statuses below to see Flask API
              statistics update live.
            </p>
          </div>

          {/* Data Source Status & Reset Control */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`px-3.5 py-2 rounded-lg text-xs border ${
                isFullPageMode
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-slate-800/90 border-slate-700 text-slate-200'
              }`}
            >
              <span className="font-medium">Data Source: </span>
              <span
                className={`font-mono font-semibold ${
                  isFullPageMode ? 'text-cyan-700' : 'text-cyan-300'
                }`}
              >
                {stats.dataSourceLabel}
              </span>
            </div>
            {!stats.isSampleData && (
              <button
                type="button"
                onClick={onResetSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Sample Seed</span>
              </button>
            )}
          </div>
        </div>

        {/* Workspace Container */}
        <div className="rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl overflow-hidden">
          {/* Dashboard Top Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Delivery Charts &amp; Orders
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'routes'}
                onClick={() => setActiveTab('routes')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'routes'
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Smart Route Optimizer
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'weather'}
                onClick={() => setActiveTab('weather')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'weather'
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Weather Telemetry ({weatherHubs.length} Hubs)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'employees'}
                onClick={() => setActiveTab('employees')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'employees'
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Employee Performance ({employees.length})
              </button>
            </div>

            {/* Live KPI Summary Strip inside Dashboard Header */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-600 tabular-nums">
              <span>
                Total: <strong className="text-slate-900">{stats.totalDeliveries.toLocaleString()}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                On-Time: <strong className="text-emerald-700">{stats.onTimeDeliveryRate.toFixed(1)}%</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Active: <strong className="text-cyan-700">{stats.activeOrders}</strong>
              </span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW (Delivery Charts, Weather Summary, Order Queue & Dispatch Form) */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-8">
              {/* Top Row: Delivery Volume Chart + Real-Time Weather & Route Performance Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Delivery Volume & On-Time Chart (7 cols) */}
                <div className="lg:col-span-7 rounded-xl border border-slate-200 p-5 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {currentSeries.label}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total Dispatched vs. Verified On-Time Arrivals · Avg On-Time:{' '}
                        <span className="font-mono font-semibold text-emerald-700">
                          {currentSeries.avgOnTime}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
                      <button
                        type="button"
                        onClick={() => setChartWindow('7d')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          chartWindow === '7d'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartWindow('30d')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          chartWindow === '30d'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        4 Weeks
                      </button>
                    </div>
                  </div>

                  {/* Interactive SVG Bar & Trend Chart */}
                  <div className="pt-2">
                    <div className="grid grid-cols-7 gap-3 items-end h-48 pt-4 px-2 border-b border-slate-200">
                      {currentSeries.days.map((day, idx) => {
                        const disp = currentSeries.dispatched[idx];
                        const onTime = currentSeries.onTime[idx];
                        const dispHeightPct = Math.round((disp / maxVal) * 100);
                        const onTimeHeightPct = Math.round((onTime / maxVal) * 100);
                        const ratePct = ((onTime / disp) * 100).toFixed(1);

                        return (
                          <div
                            key={day}
                            className="flex flex-col items-center h-full justify-end group"
                          >
                            <div className="text-[10px] font-mono text-slate-500 mb-1 tabular-nums">
                              {ratePct}%
                            </div>
                            <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-36">
                              <div
                                style={{ height: `${dispHeightPct}%` }}
                                title={`${day} Dispatched: ${disp}`}
                                className="w-1/2 bg-slate-300 rounded-t transition-opacity group-hover:opacity-90"
                              />
                              <div
                                style={{ height: `${onTimeHeightPct}%` }}
                                title={`${day} On-Time: ${onTime}`}
                                className="w-1/2 bg-cyan-600 rounded-t transition-opacity group-hover:opacity-90"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-7 gap-3 pt-2 px-2 text-center">
                      {currentSeries.days.map((day, idx) => (
                        <div key={day} className="text-xs font-medium text-slate-600">
                          <div>{day}</div>
                          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                            {currentSeries.onTime[idx]}/{currentSeries.dispatched[idx]}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                          <span>Total Dispatched</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs bg-cyan-600 inline-block" />
                          <span>Delivered On-Time</span>
                        </span>
                      </div>
                      <span className="font-mono">Volume: {currentSeries.totalVol}</span>
                    </div>
                  </div>
                </div>

                {/* Weather & Route Performance Snapshot (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                  <div className="rounded-xl border border-slate-200 p-5 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-slate-900">
                        Live Hub Weather Impact
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('weather')}
                        className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 cursor-pointer"
                      >
                        Full Weather View →
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {weatherHubs.map((wh) => (
                        <div
                          key={wh.hubId}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{wh.city}</div>
                            <div className="text-[11px] text-slate-500">{wh.advisory}</div>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <div className="text-xs font-semibold text-slate-800 tabular-nums">
                              {wh.tempCelsius}°C · {wh.condition}
                            </div>
                            <div
                              className={`text-[11px] tabular-nums ${
                                wh.routeImpactPct > 10
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {wh.routeImpactPct === 0
                                ? '0% Delay'
                                : `+${wh.routeImpactPct}% Buffer`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Route Corridor Efficiency Summary */}
                  <div className="rounded-xl border border-slate-200 p-5 bg-slate-50 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">
                        Pandas / NumPy Route Model
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        Avg. 11.4% Fuel &amp; Transit Reduction Across Active Corridors
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Recalculates optimal highway paths every 5 minutes using live weather and
                        axle load telemetry.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('routes')}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0B192C] text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Test Route Optimizer
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Active Deliveries Table + Validated New Delivery Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Active Deliveries Queue (8 cols) */}
                <div className="lg:col-span-8 rounded-xl border border-slate-200 overflow-hidden bg-white">
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Live Shipment &amp; Delivery Queue
                      </h3>
                      <p className="text-xs text-slate-500">
                        Click a status action to update SQLite state and recalculate KPI cards
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
                      {['ALL', 'In Transit', 'Delivered On-Time', 'Weather Hold'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatusFilter(status)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            statusFilter === status
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {status === 'ALL' ? 'All Orders' : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                          <th className="py-3 px-4">Tracking / Corridor</th>
                          <th className="py-3 px-4">Driver</th>
                          <th className="py-3 px-4 text-right">Distance</th>
                          <th className="py-3 px-4">Weather</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Update State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {filteredDeliveries.map((del) => (
                          <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-mono font-semibold text-slate-900">
                                {del.trackingCode}
                              </div>
                              <div className="text-slate-500">
                                {del.origin} → {del.destination}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {del.driverName}
                              <div className="text-[11px] text-slate-500">{del.priority}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                              {del.distanceKm} km
                              <div className="text-[11px] text-slate-400">
                                ~{del.estimatedMinutes}m
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{del.weatherCondition}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-semibold ${
                                  del.status === 'Delivered On-Time'
                                    ? 'text-emerald-700'
                                    : del.status === 'Weather Hold'
                                    ? 'text-amber-700'
                                    : del.status === 'Delivered Late'
                                    ? 'text-rose-700'
                                    : 'text-cyan-700'
                                }`}
                              >
                                {del.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {del.status !== 'Delivered On-Time' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateDeliveryStatus(del.id, 'Delivered On-Time')
                                  }
                                  className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  Mark On-Time
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onUpdateDeliveryStatus(del.id, 'In Transit')}
                                  className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  Reopen Transit
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dispatch New Delivery Order Form (4 cols) */}
                <div className="lg:col-span-4 rounded-xl border border-slate-200 p-5 bg-slate-50">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Dispatch New Delivery Order
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Validated order creation connected to <code className="font-mono">POST /api/deliveries</code>
                  </p>

                  <form onSubmit={handleDispatchSubmit} noValidate className="space-y-3.5">
                    <div>
                      <label
                        htmlFor="dispatch-origin"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Origin Logistics Hub
                      </label>
                      <input
                        id="dispatch-origin"
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="e.g., Newark Port Hub"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      {formErrors.origin && (
                        <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                          {formErrors.origin}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="dispatch-destination"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Destination Terminal
                      </label>
                      <input
                        id="dispatch-destination"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Pittsburgh Freight Depot"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      {formErrors.destination && (
                        <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                          {formErrors.destination}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="dispatch-driver"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Assigned Operator
                        </label>
                        <input
                          id="dispatch-driver"
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          placeholder="Driver name"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        {formErrors.driverName && (
                          <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                            {formErrors.driverName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="dispatch-distance"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Distance (km)
                        </label>
                        <input
                          id="dispatch-distance"
                          type="number"
                          min={10}
                          max={5000}
                          value={distanceKm}
                          onChange={(e) => setDistanceKm(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        {formErrors.distanceKm && (
                          <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                            {formErrors.distanceKm}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="dispatch-priority"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Service Priority
                        </label>
                        <select
                          id="dispatch-priority"
                          value={priority}
                          onChange={(e) =>
                            setPriority(
                              e.target.value as 'Standard' | 'Express' | 'Cold Chain'
                            )
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="Express">Express</option>
                          <option value="Standard">Standard</option>
                          <option value="Cold Chain">Cold Chain</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="dispatch-weather"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Corridor Weather
                        </label>
                        <select
                          id="dispatch-weather"
                          value={weatherCondition}
                          onChange={(e) =>
                            setWeatherCondition(
                              e.target.value as
                                | 'Clear'
                                | 'Light Rain'
                                | 'Heavy Rain'
                                | 'High Wind'
                                | 'Fog'
                            )
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="Clear">Clear</option>
                          <option value="Light Rain">Light Rain</option>
                          <option value="Heavy Rain">Heavy Rain</option>
                          <option value="High Wind">High Wind</option>
                          <option value="Fog">Fog</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#0B192C] text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-cyan-400" />
                      <span>{isSubmitting ? 'Dispatching Order...' : 'Dispatch Order & Sync Stats'}</span>
                    </button>

                    {formFeedback && (
                      <div
                        role="status"
                        className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium"
                      >
                        {formFeedback}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART ROUTE OPTIMIZER */}
          {activeTab === 'routes' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleRunOptimizer}
                className="lg:col-span-5 rounded-xl border border-slate-200 p-5 bg-slate-50 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Route &amp; Weather Parameters
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  Simulate Python NumPy/Pandas route scoring across weather penalties, congestion
                  indices, and axle loads.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="opt-origin"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Origin Hub
                    </label>
                    <input
                      id="opt-origin"
                      type="text"
                      value={optOrigin}
                      onChange={(e) => setOptOrigin(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="opt-dest"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Destination Hub
                    </label>
                    <input
                      id="opt-dest"
                      type="text"
                      value={optDestination}
                      onChange={(e) => setOptDestination(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="opt-distance"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Baseline Distance (km)
                    </label>
                    <input
                      id="opt-distance"
                      type="number"
                      min={20}
                      max={4000}
                      value={optDistance}
                      onChange={(e) => setOptDistance(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="opt-weather"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Weather Condition
                    </label>
                    <select
                      id="opt-weather"
                      value={optWeather}
                      onChange={(e) =>
                        setOptWeather(
                          e.target.value as
                            | 'Clear'
                            | 'Light Rain'
                            | 'Heavy Rain'
                            | 'High Wind'
                            | 'Fog'
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="Clear">Clear (0% penalty)</option>
                      <option value="Light Rain">Light Rain (+6% penalty)</option>
                      <option value="Fog">Dense Fog (+11% penalty)</option>
                      <option value="High Wind">High Wind (+14% penalty)</option>
                      <option value="Heavy Rain">Heavy Rain (+19% penalty)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="opt-traffic"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Traffic Congestion Index ({optTraffic.toFixed(2)}x)
                    </label>
                    <input
                      id="opt-traffic"
                      type="range"
                      min={1.0}
                      max={2.0}
                      step={0.05}
                      value={optTraffic}
                      onChange={(e) => setOptTraffic(Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="opt-load"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Vehicle Load ({optLoad}%)
                    </label>
                    <input
                      id="opt-load"
                      type="range"
                      min={20}
                      max={100}
                      step={5}
                      value={optLoad}
                      onChange={(e) => setOptLoad(Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors cursor-pointer"
                >
                  Calculate Optimal Corridor
                </button>
              </form>

              <div className="lg:col-span-7 rounded-xl border border-slate-200 p-6 bg-white flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                        Optimization Output
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                        {optOrigin} → {optDestination}
                      </h4>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs text-slate-500">Model Confidence</span>
                      <div className="text-base font-bold text-emerald-700 tabular-nums">
                        {optResult.confidenceScore}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="text-xs text-slate-500">Optimized Distance</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                        {optResult.optimizedDistanceKm} km
                      </div>
                      <div className="text-xs font-mono text-emerald-700 mt-0.5 tabular-nums">
                        -{optResult.distanceSavedKm} km saved
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="text-xs text-slate-500">Optimized ETA</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                        {optResult.optimizedDurationMin} min
                      </div>
                      <div className="text-xs font-mono text-emerald-700 mt-0.5 tabular-nums">
                        -{optResult.timeSavedMin} min faster
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="text-xs text-slate-500">Estimated Fuel Saved</div>
                      <div className="text-xl font-bold font-mono text-cyan-700 mt-1 tabular-nums">
                        {optResult.fuelSavedLiters} L
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Diesel reduction</div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="text-xs text-slate-500">Weather Impact</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                        +{optResult.weatherPenaltyPct}%
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{optWeather}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B192C] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-cyan-400 font-mono">RECOMMENDED CORRIDOR</div>
                    <div className="text-sm font-bold mt-0.5">{optResult.recommendedCorridor}</div>
                  </div>
                  <div className="text-xs font-mono text-slate-300 tabular-nums">
                    Baseline: {optResult.baselineDistanceKm} km ({optResult.baselineDurationMin} min)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEATHER TELEMETRY */}
          {activeTab === 'weather' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {weatherHubs.map((wh) => (
                <div
                  key={wh.hubId}
                  className="rounded-xl border border-slate-200 p-5 bg-white flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono text-cyan-700 font-semibold">
                        {wh.hubId.toUpperCase()}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{wh.city}</h3>
                      <p className="text-xs text-slate-600 mt-1">{wh.advisory}</p>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="text-xl font-bold text-slate-900 tabular-nums">
                        {wh.tempCelsius}°C
                      </div>
                      <div className="text-xs text-slate-500">{wh.condition}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs font-mono tabular-nums">
                    <div>
                      <span className="text-slate-400 block font-sans">Wind Speed</span>
                      <strong className="text-slate-800">{wh.windKmh} km/h</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Visibility</span>
                      <strong className="text-slate-800">{wh.visibilityKm} km</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Transit Buffer</span>
                      <strong
                        className={
                          wh.routeImpactPct > 10 ? 'text-amber-700' : 'text-emerald-700'
                        }
                      >
                        +{wh.routeImpactPct}%
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EMPLOYEE PERFORMANCE */}
          {activeTab === 'employees' && (
            <div className="p-6">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Employee Name</th>
                      <th className="py-3.5 px-4">Operational Role</th>
                      <th className="py-3.5 px-4">Assigned Hub</th>
                      <th className="py-3.5 px-4 text-right">Completed Deliveries</th>
                      <th className="py-3.5 px-4 text-right">On-Time Rate</th>
                      <th className="py-3.5 px-4 text-right">Efficiency Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{emp.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{emp.role}</td>
                        <td className="py-3.5 px-4 text-slate-600">{emp.hub}</td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                          {emp.completedDeliveries}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                          {emp.onTimeRate.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-cyan-700 font-semibold">
                          {emp.efficiencyScore}/100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
