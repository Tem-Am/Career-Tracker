"use client";
import { useState } from 'react';
import { Briefcase, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useSignIn } from "@clerk/nextjs";

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (email: string, name: string, password: string) => boolean;
}

type Mode = 'login' | 'register';

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useSignIn();

  const reset = (m: Mode) => {
    setMode(m); setError('');
    setEmail(''); setName(''); setPassword(''); setConfirm('');
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn.create({ identifier: email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-700" />

          <div className="px-8 py-8">
            {/* Brand */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-200">
                <Briefcase size={24} className="text-white" />
              </div>
              <h1 className="text-slate-900">JobTracker</h1>
              <p className="text-slate-500 mt-0.5" style={{ fontSize: '0.875rem' }}>
                {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600" style={{ fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem' }}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-slate-800 transition-colors"
                    style={{ fontSize: '0.9375rem' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-slate-800 transition-colors"
                  style={{ fontSize: '0.9375rem' }}
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-slate-800 transition-colors"
                    style={{ fontSize: '0.9375rem' }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem' }}>Confirm Password</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-slate-800 transition-colors"
                    style={{ fontSize: '0.9375rem' }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                style={{ fontSize: '0.9375rem' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : mode === 'login' ? (
                  <><LogIn size={17} /> Sign In</>
                ) : (
                  <><UserPlus size={17} /> Create Account</>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              {mode === 'login' ? (
                <p className="text-slate-500" style={{ fontSize: '0.875rem' }}>
                  Don't have an account?{' '}
                  <button onClick={() => reset('register')} className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                    Create one
                  </button>
                </p>
              ) : (
                <p className="text-slate-500" style={{ fontSize: '0.875rem' }}>
                  Already have an account?{' '}
                  <button onClick={() => reset('login')} className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                    Sign in
                  </button>
                </p>
              )}

              {mode === 'login' && (
                <p className="text-slate-400 mt-3" style={{ fontSize: '0.8125rem' }}>
                  Demo: <span className="font-mono">demo@jobtracker.app</span> / <span className="font-mono">demo1234</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 mt-4" style={{ fontSize: '0.8125rem' }}>
          Data stored locally on this device only.
        </p>
      </div>
    </div>
  );
}
