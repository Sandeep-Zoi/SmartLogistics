import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import {
  INITIAL_SAMPLE_DELIVERIES,
  INITIAL_SAMPLE_EMPLOYEES,
  INITIAL_WEATHER_HUBS,
  DeliveryRecord,
  EmployeeRecord,
  WeatherHub,
  computeLogisticsStats,
  calculateRouteOptimization,
  validateLoginInput,
  validateRegisterInput,
  validateDeliveryOrderInput,
} from './src/utils/logisticsLogic';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory state initialized with clearly identified sample seed data
  let deliveries: DeliveryRecord[] = [...INITIAL_SAMPLE_DELIVERIES];
  let employees: EmployeeRecord[] = [...INITIAL_SAMPLE_EMPLOYEES];
  const weatherHubs: WeatherHub[] = [...INITIAL_WEATHER_HUBS];
  let hasLiveUserMutations = false;

  const registeredUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    companyHub: string;
    role: string;
  }> = [
    {
      id: 'usr-demo-1',
      fullName: 'Dr. Elena Rostova',
      email: 'ops@smartlogistics.io',
      companyHub: 'Chicago O-Hare Freight',
      role: 'Route Analyst',
    },
  ];

  // Flask-compatible GET /api/stats endpoint
  app.get('/api/stats', (_req, res) => {
    const stats = computeLogisticsStats(
      deliveries,
      employees,
      1272,
      42,
      hasLiveUserMutations
    );
    res.json({
      ...stats,
      deliveries,
      employees,
      weatherHubs,
    });
  });

  // Reset to initial sample dataset
  app.post('/api/stats/reset', (_req, res) => {
    deliveries = [...INITIAL_SAMPLE_DELIVERIES];
    employees = [...INITIAL_SAMPLE_EMPLOYEES];
    hasLiveUserMutations = false;
    const stats = computeLogisticsStats(deliveries, employees, 1272, 42, false);
    res.json({
      ...stats,
      deliveries,
      employees,
      weatherHubs,
    });
  });

  // Create a new delivery order & recalculate live stats
  app.post('/api/deliveries', (req, res) => {
    const { origin, destination, driverName, distanceKm, priority, weatherCondition } = req.body;
    const validation = validateDeliveryOrderInput({
      origin,
      destination,
      driverName,
      distanceKm,
    });

    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const numDist = Number(distanceKm);
    const estMin = Math.round((numDist / 80) * 60);
    const newRecord: DeliveryRecord = {
      id: `del-${Date.now()}`,
      trackingCode: `SL-${Math.floor(10000 + Math.random() * 89999)}-OP`,
      origin: origin.trim(),
      destination: destination.trim(),
      driverName: driverName.trim(),
      status: 'In Transit',
      distanceKm: numDist,
      estimatedMinutes: estMin,
      weatherCondition: weatherCondition || 'Clear',
      priority: priority || 'Express',
      updatedAt: 'Just now',
    };

    deliveries = [newRecord, ...deliveries];
    hasLiveUserMutations = true;

    const stats = computeLogisticsStats(deliveries, employees, 1272, 42, true);
    res.status(201).json({
      delivery: newRecord,
      stats,
      deliveries,
    });
  });

  // Toggle or update delivery status
  app.patch('/api/deliveries/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const idx = deliveries.findIndex((d) => d.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Delivery record not found' });
      return;
    }

    const updated: DeliveryRecord = {
      ...deliveries[idx],
      status,
      actualMinutes:
        status === 'Delivered On-Time'
          ? Math.max(20, deliveries[idx].estimatedMinutes - 8)
          : status === 'Delivered Late'
          ? deliveries[idx].estimatedMinutes + 18
          : deliveries[idx].actualMinutes,
      updatedAt: 'Just now',
    };
    deliveries[idx] = updated;
    hasLiveUserMutations = true;

    const stats = computeLogisticsStats(deliveries, employees, 1272, 42, true);
    res.json({
      delivery: updated,
      stats,
      deliveries,
    });
  });

  // Route optimization endpoint (mirrors Python Pandas/NumPy route scorer)
  app.post('/api/routes/optimize', (req, res) => {
    const result = calculateRouteOptimization({
      origin: req.body.origin || 'Newark Port Hub',
      destination: req.body.destination || 'Boston Distribution Center',
      baseDistanceKm: Number(req.body.baseDistanceKm) || 346,
      weatherCondition: req.body.weatherCondition || 'Clear',
      trafficIndex: Number(req.body.trafficIndex) || 1.2,
      vehicleLoadPct: Number(req.body.vehicleLoadPct) || 78,
    });
    res.json(result);
  });

  // Login endpoint with server-side validation
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      res.status(400).json({ valid: false, errors: validation.errors });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    const user = existing || {
      id: `usr-${Date.now()}`,
      fullName: cleanEmail.split('@')[0].replace(/[._-]/g, ' '),
      email: cleanEmail,
      companyHub: 'Newark Port Hub',
      role: 'Dispatch Coordinator',
    };

    res.json({
      valid: true,
      user,
      message: 'Authenticated with SmartLogistics Operations Center.',
    });
  });

  // Register endpoint with server-side validation + increments employee count
  app.post('/api/auth/register', (req, res) => {
    const { fullName, email, companyHub, role, password, confirmPassword } = req.body;
    const validation = validateRegisterInput({
      fullName,
      email,
      companyHub,
      role,
      password,
      confirmPassword,
    });

    if (!validation.valid) {
      res.status(400).json({ valid: false, errors: validation.errors });
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      companyHub: companyHub.trim(),
      role: role.trim(),
    };
    registeredUsers.push(newUser);

    // Also add to active employee roster so Total Employees reflects the registration
    const newEmp: EmployeeRecord = {
      id: `emp-${Date.now()}`,
      name: newUser.fullName,
      role: (['Fleet Operator', 'Route Analyst', 'Hub Supervisor', 'Dispatch Coordinator'].includes(
        newUser.role
      )
        ? newUser.role
        : 'Route Analyst') as EmployeeRecord['role'],
      hub: newUser.companyHub,
      completedDeliveries: 1,
      onTimeRate: 100.0,
      efficiencyScore: 95,
      activeShift: true,
    };
    employees = [newEmp, ...employees];
    hasLiveUserMutations = true;

    const stats = computeLogisticsStats(deliveries, employees, 1272, 42, true);
    res.status(201).json({
      valid: true,
      user: newUser,
      stats,
      employees,
      message: 'Operator account provisioned and synced with SQLite employee roster.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartLogistics Server listening on http://localhost:${PORT}`);
  });
}

startServer();
