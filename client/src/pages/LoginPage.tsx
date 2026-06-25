import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  }

  const inputStyle = {
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>

      {/* Navbar */}
      <nav style={{ background: 'var(--color-primary)' }} className="shadow-lg">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-white font-bold text-xl">Dalmar</span>
            <span style={{ color: 'var(--color-gold)' }} className="font-bold text-xl">&nbsp;Travel</span>
          </Link>
        </div>
      </nav>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full" style={{ maxWidth: '420px' }}>

          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--color-primary-light)' }}>
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="font-bold text-2xl mb-2" style={{ color: 'var(--color-text)' }}>
              Agent Login
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
              This portal is for Dalmar Travel agents only.
            </p>
          </div>

          <div className="p-8 rounded-2xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Email
                </label>
                <input
                  required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="agent@dalmartravel.com"
                  className="w-full h-11 px-4 rounded-lg outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Password
                </label>
                <input
                  required type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-lg outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm"
                  style={{ background: '#FEF2F2', color: 'var(--color-danger)', border: '1px solid #FECACA' }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full h-11 rounded-xl font-semibold transition-all hover:opacity-90 disabled:cursor-not-allowed"
                style={{ background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)', color: 'white' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
            Not an agent?{' '}
            <Link to="/" style={{ color: 'var(--color-primary)' }} className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
