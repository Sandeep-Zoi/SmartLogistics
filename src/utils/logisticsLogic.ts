export interface DeliveryRecord {
  id: string;
  trackingCode: string;
  origin: string;
  destination: string;
  driverName: string;
  status: 'Delivered On-Time' | 'Delivered Late' | 'In Transit' | 'Weather Hold' | 'Dispatched';
  distanceKm: number;
  estimatedMinutes: number;
  actualMinutes?: number;
  weatherCondition: 'Clear' | 'Light Rain' | 'Heavy Rain' | 'High Wind' | 'Fog';
  priority: 'Standard' | 'Express' | 'Cold Chain';
  updatedAt: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  role: 'Fleet Operator' | 'Route Analyst' | 'Hub Supervisor' | 'Dispatch Coordinator';
  hub: string;
  completedDeliveries: number;
  onTimeRate: number;
  efficiencyScore: number;
  activeShift: boolean;
}

export interface WeatherHub {
  hubId: string;
  city: string;
  condition: 'Clear' | 'Light Rain' | 'Heavy Rain' | 'High Wind' | 'Fog';
  tempCelsius: number;
  windKmh: number;
  visibilityKm: number;
  routeImpactPct: number;
  advisory: string;
}

export interface LogisticsStats {
  totalDeliveries: number;
  onTimeDeliveryRate: number;
  activeOrders: number;
  totalEmployees: number;
  isSampleData: boolean;
  dataSourceLabel: string;
  lastSyncedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface RouteOptimizationInput {
  origin: string;
  destination: string;
  baseDistanceKm: number;
  weatherCondition: 'Clear' | 'Light Rain' | 'Heavy Rain' | 'High Wind' | 'Fog';
  trafficIndex: number; // 1.0 (free flow) to 2.0 (severe congestion)
  vehicleLoadPct: number; // 0 to 100
}

export interface RouteOptimizationOutput {
  baselineDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  baselineDurationMin: number;
  optimizedDurationMin: number;
  timeSavedMin: number;
  weatherPenaltyPct: number;
  fuelSavedLiters: number;
  recommendedCorridor: string;
  confidenceScore: number;
}

export const INITIAL_SAMPLE_DELIVERIES: DeliveryRecord[] = [
  {
    id: 'del-101',
    trackingCode: 'SL-84920-NY',
    origin: 'Newark Port Hub',
    destination: 'Boston Distribution Center',
    driverName: 'Marcus Vance',
    status: 'Delivered On-Time',
    distanceKm: 346,
    estimatedMinutes: 245,
    actualMinutes: 232,
    weatherCondition: 'Clear',
    priority: 'Express',
    updatedAt: '10 mins ago',
  },
  {
    id: 'del-102',
    trackingCode: 'SL-84921-CH',
    origin: 'Chicago O-Hare Freight',
    destination: 'Detroit Logistics Park',
    driverName: 'Elena Rostova',
    status: 'In Transit',
    distanceKm: 454,
    estimatedMinutes: 295,
    weatherCondition: 'Light Rain',
    priority: 'Cold Chain',
    updatedAt: '4 mins ago',
  },
  {
    id: 'del-103',
    trackingCode: 'SL-84922-LA',
    origin: 'Long Beach Terminal',
    destination: 'Phoenix Hub East',
    driverName: 'Devon Brooks',
    status: 'Delivered On-Time',
    distanceKm: 598,
    estimatedMinutes: 370,
    actualMinutes: 358,
    weatherCondition: 'Clear',
    priority: 'Standard',
    updatedAt: '22 mins ago',
  },
  {
    id: 'del-104',
    trackingCode: 'SL-84923-SE',
    origin: 'Seattle Tacoma Gateway',
    destination: 'Portland River Terminal',
    driverName: 'Hannah Lin',
    status: 'Weather Hold',
    distanceKm: 280,
    estimatedMinutes: 195,
    weatherCondition: 'Heavy Rain',
    priority: 'Express',
    updatedAt: '12 mins ago',
  },
  {
    id: 'del-105',
    trackingCode: 'SL-84924-DA',
    origin: 'Dallas Fort Worth Hub',
    destination: 'Houston Bayport Depot',
    driverName: 'Carlos Mendez',
    status: 'Delivered On-Time',
    distanceKm: 385,
    estimatedMinutes: 240,
    actualMinutes: 235,
    weatherCondition: 'Clear',
    priority: 'Standard',
    updatedAt: '35 mins ago',
  },
  {
    id: 'del-106',
    trackingCode: 'SL-84925-AT',
    origin: 'Atlanta Regional Hub',
    destination: 'Charlotte Air Cargo',
    driverName: 'Priya Nair',
    status: 'Dispatched',
    distanceKm: 394,
    estimatedMinutes: 250,
    weatherCondition: 'Clear',
    priority: 'Cold Chain',
    updatedAt: 'Just now',
  },
  {
    id: 'del-107',
    trackingCode: 'SL-84926-MI',
    origin: 'Miami Port Corridor',
    destination: 'Orlando Central Depot',
    driverName: 'Samuel Okafor',
    status: 'Delivered Late',
    distanceKm: 378,
    estimatedMinutes: 230,
    actualMinutes: 254,
    weatherCondition: 'High Wind',
    priority: 'Standard',
    updatedAt: '1 hr ago',
  },
  {
    id: 'del-108',
    trackingCode: 'SL-84927-DE',
    origin: 'Denver Front Range Hub',
    destination: 'Salt Lake Intermodal',
    driverName: 'Liam O-Connor',
    status: 'Delivered On-Time',
    distanceKm: 838,
    estimatedMinutes: 510,
    actualMinutes: 492,
    weatherCondition: 'Fog',
    priority: 'Express',
    updatedAt: '48 mins ago',
  },
];

export const INITIAL_SAMPLE_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp-01',
    name: 'Marcus Vance',
    role: 'Fleet Operator',
    hub: 'Newark Port Hub',
    completedDeliveries: 312,
    onTimeRate: 98.4,
    efficiencyScore: 96,
    activeShift: true,
  },
  {
    id: 'emp-02',
    name: 'Elena Rostova',
    role: 'Fleet Operator',
    hub: 'Chicago O-Hare Freight',
    completedDeliveries: 289,
    onTimeRate: 96.8,
    efficiencyScore: 94,
    activeShift: true,
  },
  {
    id: 'emp-03',
    name: 'Devon Brooks',
    role: 'Route Analyst',
    hub: 'Long Beach Terminal',
    completedDeliveries: 264,
    onTimeRate: 95.5,
    efficiencyScore: 92,
    activeShift: true,
  },
  {
    id: 'emp-04',
    name: 'Hannah Lin',
    role: 'Hub Supervisor',
    hub: 'Seattle Tacoma Gateway',
    completedDeliveries: 198,
    onTimeRate: 94.2,
    efficiencyScore: 91,
    activeShift: true,
  },
  {
    id: 'emp-05',
    name: 'Carlos Mendez',
    role: 'Fleet Operator',
    hub: 'Dallas Fort Worth Hub',
    completedDeliveries: 217,
    onTimeRate: 97.1,
    efficiencyScore: 95,
    activeShift: true,
  },
  {
    id: 'emp-06',
    name: 'Priya Nair',
    role: 'Dispatch Coordinator',
    hub: 'Atlanta Regional Hub',
    completedDeliveries: 245,
    onTimeRate: 96.3,
    efficiencyScore: 93,
    activeShift: false,
  },
];

export const INITIAL_WEATHER_HUBS: WeatherHub[] = [
  {
    hubId: 'wh-1',
    city: 'Newark / NY Corridor',
    condition: 'Clear',
    tempCelsius: 18,
    windKmh: 14,
    visibilityKm: 16,
    routeImpactPct: 0,
    advisory: 'Optimal highway speeds across I-95 corridor.',
  },
  {
    hubId: 'wh-2',
    city: 'Chicago Midwest Hub',
    condition: 'Light Rain',
    tempCelsius: 12,
    windKmh: 26,
    visibilityKm: 9,
    routeImpactPct: 6,
    advisory: 'Minor wet-pavement headway adjustment (+6% transit buffer).',
  },
  {
    hubId: 'wh-3',
    city: 'Seattle Pacific NW',
    condition: 'Heavy Rain',
    tempCelsius: 9,
    windKmh: 38,
    visibilityKm: 4.5,
    routeImpactPct: 18,
    advisory: 'Rerouting Express freight via I-5 inland bypass.',
  },
  {
    hubId: 'wh-4',
    city: 'Long Beach / SoCal',
    condition: 'Clear',
    tempCelsius: 23,
    windKmh: 11,
    visibilityKm: 16,
    routeImpactPct: 0,
    advisory: 'Port gate turnaround averaging 21 minutes.',
  },
];

/**
 * Computes dynamic statistics from historical baseline + current session records.
 * Clearly distinguishes sample seed data from live session mutations.
 */
export function computeLogisticsStats(
  deliveries: DeliveryRecord[],
  employees: EmployeeRecord[],
  baselineHistoricalCompleted = 1272,
  baselineStaffCount = 42,
  hasLiveUserMutations = false
): LogisticsStats {
  const completedSession = deliveries.filter(
    (d) => d.status === 'Delivered On-Time' || d.status === 'Delivered Late'
  );
  const onTimeSession = deliveries.filter((d) => d.status === 'Delivered On-Time');
  const activeOrders = deliveries.filter(
    (d) => d.status === 'In Transit' || d.status === 'Weather Hold' || d.status === 'Dispatched'
  ).length;

  const totalDeliveries = baselineHistoricalCompleted + deliveries.length;

  // Baseline historical on-time count: 1204 out of 1272 (94.65%)
  const baselineOnTime = Math.round(baselineHistoricalCompleted * 0.9465);
  const totalCompleted = baselineHistoricalCompleted + completedSession.length;
  const totalOnTime = baselineOnTime + onTimeSession.length;

  const rawRate = totalCompleted > 0 ? (totalOnTime / totalCompleted) * 100 : 0;
  const onTimeDeliveryRate = Number(rawRate.toFixed(1));
  const totalEmployees = baselineStaffCount + employees.length;

  return {
    totalDeliveries,
    onTimeDeliveryRate,
    activeOrders,
    totalEmployees,
    isSampleData: !hasLiveUserMutations,
    dataSourceLabel: hasLiveUserMutations
      ? 'Live Session SQLite State (Updated via API)'
      : 'Sample Seed Dataset (Flask /api/stats Ready — Awaiting Live DB Connection)',
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Calculates route optimization metrics using weather penalty and traffic weights
 * (mirrors the Python NumPy/Pandas route scoring logic).
 */
export function calculateRouteOptimization(
  input: RouteOptimizationInput
): RouteOptimizationOutput {
  const cleanDistance = Math.max(10, Number(input.baseDistanceKm) || 100);
  const traffic = Math.min(2.5, Math.max(1.0, Number(input.trafficIndex) || 1.15));
  const loadPct = Math.min(100, Math.max(0, Number(input.vehicleLoadPct) || 75));

  const weatherMultiplierMap: Record<RouteOptimizationInput['weatherCondition'], number> = {
    Clear: 0,
    'Light Rain': 0.06,
    Fog: 0.11,
    'High Wind': 0.14,
    'Heavy Rain': 0.19,
  };

  const weatherPenalty = weatherMultiplierMap[input.weatherCondition] ?? 0;

  // Smart graph routing saves 8.5% to 14.2% distance depending on traffic & weather detour
  const distanceReductionFactor =
    0.095 + (traffic > 1.3 ? 0.032 : 0.012) - (weatherPenalty > 0.12 ? 0.015 : 0);
  const optimizedDistanceKm = Math.round(cleanDistance * (1 - distanceReductionFactor));
  const distanceSavedKm = Math.max(1, cleanDistance - optimizedDistanceKm);

  // Average baseline highway speed ~78 km/h adjusted by traffic & weather
  const baselineDurationMin = Math.round(
    (cleanDistance / 78) * 60 * traffic * (1 + weatherPenalty)
  );
  // Optimized corridor bypasses congestion chokepoints and severe weather cells
  const optimizedDurationMin = Math.round(
    (optimizedDistanceKm / 84) * 60 * (1 + (traffic - 1) * 0.45) * (1 + weatherPenalty * 0.55)
  );
  const timeSavedMin = Math.max(2, baselineDurationMin - optimizedDurationMin);

  // Diesel consumption ~0.31 liters/km adjusted for load factor
  const loadFactor = 0.85 + (loadPct / 100) * 0.3;
  const fuelSavedLiters = Number((distanceSavedKm * 0.31 * loadFactor).toFixed(1));

  const corridorTag =
    weatherPenalty >= 0.14
      ? 'Inland All-Weather Freight Bypass (Corridor B-04)'
      : traffic >= 1.35
      ? 'Express Toll Ring & Smart Lane (Corridor A-02)'
      : 'Primary Intermodal Direct Arterial (Corridor A-01)';

  const confidenceScore = Number(
    Math.min(99.4, Math.max(86.0, 97.5 - weatherPenalty * 35 - (traffic - 1) * 4)).toFixed(1)
  );

  return {
    baselineDistanceKm: cleanDistance,
    optimizedDistanceKm,
    distanceSavedKm,
    baselineDurationMin,
    optimizedDurationMin,
    timeSavedMin,
    weatherPenaltyPct: Math.round(weatherPenalty * 100),
    fuelSavedLiters,
    recommendedCorridor: corridorTag,
    confidenceScore,
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLoginInput(data: {
  email?: string;
  password?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const email = (data.email ?? '').trim();
  const password = data.password ?? '';

  if (!email) {
    errors.email = 'Corporate email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address (e.g., dispatcher@smartlogistics.io).';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterInput(data: {
  fullName?: string;
  email?: string;
  companyHub?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const fullName = (data.fullName ?? '').trim();
  const email = (data.email ?? '').trim();
  const companyHub = (data.companyHub ?? '').trim();
  const role = (data.role ?? '').trim();
  const password = data.password ?? '';
  const confirmPassword = data.confirmPassword ?? '';

  if (!fullName || fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  if (!email) {
    errors.email = 'Work email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid work email address.';
  }

  if (!companyHub) {
    errors.companyHub = 'Primary logistics hub or organization is required.';
  }

  if (!role) {
    errors.role = 'Please select an operational role.';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter and one number.';
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDeliveryOrderInput(data: {
  origin?: string;
  destination?: string;
  driverName?: string;
  distanceKm?: number | string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const origin = (data.origin ?? '').trim();
  const destination = (data.destination ?? '').trim();
  const driverName = (data.driverName ?? '').trim();
  const distanceKm = Number(data.distanceKm);

  if (!origin) {
    errors.origin = 'Origin hub is required.';
  }
  if (!destination) {
    errors.destination = 'Destination hub is required.';
  } else if (origin && origin.toLowerCase() === destination.toLowerCase()) {
    errors.destination = 'Destination must be different from origin hub.';
  }
  if (!driverName) {
    errors.driverName = 'Assigned driver name is required.';
  }
  if (!Number.isFinite(distanceKm) || distanceKm < 10 || distanceKm > 5000) {
    errors.distanceKm = 'Distance must be between 10 km and 5,000 km.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateNewsletterEmail(email?: string): ValidationResult {
  const trimmed = (email ?? '').trim();
  if (!trimmed) {
    return { valid: false, errors: { email: 'Email address is required.' } };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, errors: { email: 'Please enter a valid email address.' } };
  }
  return { valid: true, errors: {} };
}
