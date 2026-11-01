import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, User, Building2, Check, Copy, Code2 } from 'lucide-react';
import {
  validateLoginInput,
  validateRegisterInput,
  LogisticsStats,
  EmployeeRecord,
} from '../utils/logisticsLogic';
import { FLASK_EXPORT_BUNDLE } from '../utils/flaskExportBundle';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  companyHub: string;
  role: string;
}

interface AuthModalProps {
  mode: 'login' | 'register' | 'flask-code' | null;
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register' | 'flask-code') => void;
  onAuthSuccess: (
    user: AuthenticatedUser,
    updatedStats?: LogisticsStats,
    updatedEmployees?: EmployeeRecord[]
  ) => void;
}

export const AuthPagesModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  onSwitchMode,
  onAuthSuccess,
}) => {
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [companyHub, setCompanyHub] = useState('Newark Port Hub');
  const [role, setRole] = useState('Route Analyst');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [isRegistering, setIsRegistering] = useState(false);

  // Flask Code Modal State
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!mode) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLoginInput({ email: loginEmail, password: loginPassword });
    if (!validation.valid) {
      setLoginErrors(validation.errors);
      return;
    }

    setLoginErrors({});
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      setIsLoggingIn(false);

      if (!res.ok || !data.valid) {
        setLoginErrors(data.errors || { email: 'Authentication failed.' });
        return;
      }

      onAuthSuccess(data.user);
    } catch {
      setIsLoggingIn(false);
      onAuthSuccess({
        id: 'usr-local',
        fullName: loginEmail.split('@')[0],
        email: loginEmail,
        companyHub: 'Newark Port Hub',
        role: 'Route Analyst',
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegisterInput({
      fullName,
      email: regEmail,
      companyHub,
      role,
      password: regPassword,
      confirmPassword,
    });

    if (!validation.valid) {
      setRegErrors(validation.errors);
      return;
    }

    setRegErrors({});
    setIsRegistering(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email: regEmail,
          companyHub,
          role,
          password: regPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      setIsRegistering(false);

      if (!res.ok || !data.valid) {
        setRegErrors(data.errors || { email: 'Registration failed.' });
        return;
      }

      onAuthSuccess(data.user, data.stats, data.employees);
    } catch {
      setIsRegistering(false);
      onAuthSuccess({
        id: `usr-${Date.now()}`,
        fullName,
        email: regEmail,
        companyHub,
        role,
      });
    }
  };

  const fillDemoLogin = () => {
    setLoginEmail('ops@smartlogistics.io');
    setLoginPassword('Logistics2026');
    setLoginErrors({});
  };

  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-heading"
    >
      {mode === 'flask-code' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden my-8">
          <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <h2 id="modal-heading" className="text-base font-bold">
                Flask Integration Code Bundle (Python + HTML + JS)
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Flask code viewer"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {FLASK_EXPORT_BUNDLE.map((item, idx) => (
                <button
                  key={item.filename}
                  type="button"
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedFileIndex === idx
                      ? 'bg-[#0B192C] text-cyan-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {item.filename}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopyCode(
                  FLASK_EXPORT_BUNDLE[selectedFileIndex].filename,
                  FLASK_EXPORT_BUNDLE[selectedFileIndex].code
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 cursor-pointer whitespace-nowrap"
            >
              {copiedFile === FLASK_EXPORT_BUNDLE[selectedFileIndex].filename ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 bg-slate-950 text-slate-100 max-h-[65vh] overflow-y-auto">
            <p className="text-xs text-cyan-400 font-mono mb-3">
              {FLASK_EXPORT_BUNDLE[selectedFileIndex].description}
            </p>
            <pre className="text-xs font-mono leading-relaxed overflow-x-auto">
              <code>{FLASK_EXPORT_BUNDLE[selectedFileIndex].code}</code>
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-8">
          {/* Header */}
          <div className="px-6 py-5 bg-[#0B192C] text-white flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                SmartLogistics Portal
              </span>
              <h2 id="modal-heading" className="text-lg font-bold mt-0.5">
                {mode === 'login'
                  ? 'Sign In to Operations Console'
                  : 'Create Operator Account'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Operator Login
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New Account
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate className="p-6 space-y-4">
              <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-600">Testing the portal?</span>
                <button
                  type="button"
                  onClick={fillDemoLogin}
                  className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 cursor-pointer"
                >
                  Fill Demo Credentials
                </button>
              </div>

              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Corporate Email Address
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ops@smartlogistics.io"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                    {loginErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-[#0B192C] text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isLoggingIn ? 'Authenticating...' : 'Login & Open Dashboard'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} noValidate className="p-6 space-y-3.5">
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Jordan Vance"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {regErrors.fullName && (
                  <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                    {regErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Work Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="jordan@smartlogistics.io"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {regErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                    {regErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-hub"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Primary Hub
                  </label>
                  <input
                    id="reg-hub"
                    type="text"
                    value={companyHub}
                    onChange={(e) => setCompanyHub(e.target.value)}
                    placeholder="Newark Port Hub"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {regErrors.companyHub && (
                    <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                      {regErrors.companyHub}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reg-role"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Operational Role
                  </label>
                  <select
                    id="reg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Route Analyst">Route Analyst</option>
                    <option value="Fleet Operator">Fleet Operator</option>
                    <option value="Hub Supervisor">Hub Supervisor</option>
                    <option value="Dispatch Coordinator">Dispatch Coordinator</option>
                  </select>
                  {regErrors.role && (
                    <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                      {regErrors.role}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Password (8+ chars, 1 upper, 1 num)
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Secure99Pass"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {regErrors.password && (
                    <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                      {regErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reg-confirm"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {regErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
                      {regErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors cursor-pointer"
              >
                {isRegistering ? 'Provisioning Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
