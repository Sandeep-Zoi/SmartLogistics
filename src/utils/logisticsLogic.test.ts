import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_SAMPLE_DELIVERIES,
  INITIAL_SAMPLE_EMPLOYEES,
  computeLogisticsStats,
  calculateRouteOptimization,
  validateLoginInput,
  validateRegisterInput,
  validateDeliveryOrderInput,
  validateNewsletterEmail,
} from './logisticsLogic';

test('computeLogisticsStats returns accurate metrics and marks sample data explicitly', () => {
  const stats = computeLogisticsStats(
    INITIAL_SAMPLE_DELIVERIES,
    INITIAL_SAMPLE_EMPLOYEES,
    1272,
    42,
    false
  );

  assert.equal(stats.totalDeliveries, 1280);
  assert.equal(stats.activeOrders, 3);
  assert.equal(stats.totalEmployees, 48);
  assert.equal(stats.isSampleData, true);
  assert.ok(stats.dataSourceLabel.includes('Sample Seed Dataset'));
  assert.ok(stats.onTimeDeliveryRate > 90 && stats.onTimeDeliveryRate <= 100);
});

test('computeLogisticsStats updates source label when live mutations occur', () => {
  const stats = computeLogisticsStats(
    INITIAL_SAMPLE_DELIVERIES,
    INITIAL_SAMPLE_EMPLOYEES,
    1272,
    42,
    true
  );
  assert.equal(stats.isSampleData, false);
  assert.ok(stats.dataSourceLabel.includes('Live Session'));
});

test('calculateRouteOptimization computes distance, time, and fuel savings', () => {
  const res = calculateRouteOptimization({
    origin: 'Newark Port Hub',
    destination: 'Boston Distribution Center',
    baseDistanceKm: 350,
    weatherCondition: 'Heavy Rain',
    trafficIndex: 1.4,
    vehicleLoadPct: 80,
  });

  assert.ok(res.optimizedDistanceKm < res.baselineDistanceKm);
  assert.ok(res.distanceSavedKm > 0);
  assert.ok(res.timeSavedMin > 0);
  assert.equal(res.weatherPenaltyPct, 19);
  assert.ok(res.fuelSavedLiters > 0);
  assert.ok(res.recommendedCorridor.includes('All-Weather'));
});

test('validateLoginInput rejects empty and malformed credentials and accepts valid input', () => {
  const emptyRes = validateLoginInput({ email: '', password: '' });
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.errors.email);
  assert.ok(emptyRes.errors.password);

  const badEmail = validateLoginInput({ email: 'not-an-email', password: '123' });
  assert.equal(badEmail.valid, false);
  assert.ok(badEmail.errors.email);
  assert.ok(badEmail.errors.password);

  const validRes = validateLoginInput({
    email: 'ops@smartlogistics.io',
    password: 'Password123',
  });
  assert.equal(validRes.valid, true);
  assert.deepEqual(validRes.errors, {});
});

test('validateRegisterInput enforces strong password, matching confirmation, and required fields', () => {
  const weak = validateRegisterInput({
    fullName: 'A',
    email: 'bad',
    companyHub: '',
    role: '',
    password: 'weak',
    confirmPassword: 'mismatch',
  });
  assert.equal(weak.valid, false);
  assert.ok(weak.errors.fullName);
  assert.ok(weak.errors.email);
  assert.ok(weak.errors.companyHub);
  assert.ok(weak.errors.role);
  assert.ok(weak.errors.password);
  assert.ok(weak.errors.confirmPassword);

  const valid = validateRegisterInput({
    fullName: 'Dr. Elena Rostova',
    email: 'elena@smartlogistics.io',
    companyHub: 'Chicago O-Hare Freight',
    role: 'Route Analyst',
    password: 'Secure99Password',
    confirmPassword: 'Secure99Password',
  });
  assert.equal(valid.valid, true);
});

test('validateDeliveryOrderInput prevents identical origin/destination and out-of-range distances', () => {
  const sameHub = validateDeliveryOrderInput({
    origin: 'Chicago Hub',
    destination: 'chicago hub',
    driverName: 'Marcus Vance',
    distanceKm: 250,
  });
  assert.equal(sameHub.valid, false);
  assert.ok(sameHub.errors.destination);

  const validOrder = validateDeliveryOrderInput({
    origin: 'Chicago Hub',
    destination: 'Detroit Depot',
    driverName: 'Marcus Vance',
    distanceKm: 450,
  });
  assert.equal(validOrder.valid, true);
});

test('validateNewsletterEmail validates email syntax accurately', () => {
  assert.equal(validateNewsletterEmail('').valid, false);
  assert.equal(validateNewsletterEmail('invalid@domain').valid, false);
  assert.equal(validateNewsletterEmail('dispatch@smartlogistics.com').valid, true);
});
