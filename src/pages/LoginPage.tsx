import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else navigate('/dashboard');
  }

  const inp = {
    width: '100%', height: '44px', padding: '0 16px', outline: 'none',
    background: 'var(--surface)', border: '1px solid var(--outline-variant)',
    color: 'var(--on-surface)', fontSize: '14px', borderRadius: '4px',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', height: '64px', display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>flight</span>
            <span className="font-bold text-[22px]" style={{ color: 'var(--primary)' }}>Dalmar Travel</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full" style={{ maxWidth: '440px' }}>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--primary)' }}>
              <span className="material-symbols-outlined text-[32px]"
                style={{ color: 'var(--secondary-fixed)', fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <h1 className="font-bold text-[24px] mb-2" style={{ color: 'var(--primary)', letterSpacing: '-0.01em' }}>
              Agent Login
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--on-surface-variant)' }}>
              This portal is for Dalmar Travel agents only.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--on-surface-variant)' }}>Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="agent@dalmartravel.com" style={inp}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--outline-variant)')} />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--on-surface-variant)' }}>Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={inp}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--outline-variant)')} />
              </div>

              {error && (
                <div className="p-3 rounded-lg text-[13px]"
                  style={{ background: 'var(--error-container)', color: 'var(--error)', border: '1px solid var(--error)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-[14px] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-[12px] mt-6" style={{ color: 'var(--on-surface-variant)' }}>
            Not an agent?{' '}
            <Link to="/" style={{ color: 'var(--primary)' }} className="hover:underline font-semibold">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
