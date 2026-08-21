import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// This component is a UI convenience, not the security boundary -- it only
// decides what this browser tab renders. The real boundary is Postgres RLS:
// every authenticated-role policy on customers/booking_requests/bookings/
// fare_options/etc. is gated by public.is_agent(), which itself requires
// agents.status = 'approved' (fixed 21/08/2026 -- it originally only checked
// row existence). See PLANNING.md for the audit that found and closed this.
type Status = 'checking' | 'signed-out' | 'pending' | 'approved';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    async function check() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) { setStatus('signed-out'); return; }
        const user = data.session.user;

        const { data: agent, error } = await supabase
          .from('agents').select('status').eq('id', user.id).maybeSingle();
        if (error) throw error;

        if (!agent) {
          // First time we've seen this authenticated user with no agents
          // row -- happens for a freshly-confirmed signup (the row couldn't
          // be created at signup time; there was no session yet to insert
          // under) or for an account added directly in the Supabase
          // dashboard. Create it now, from whatever name/phone signup
          // stashed in the user's own metadata, defaulting to email if this
          // account never went through the signup form at all.
          const meta = user.user_metadata as { name?: string; phone?: string | null };
          const { error: insertError } = await supabase.from('agents').insert({
            id: user.id,
            name: meta.name || user.email || 'Unknown',
            email: user.email!,
            phone: meta.phone ?? null,
          });
          if (insertError) throw insertError;
          setStatus('pending');
          return;
        }

        setStatus(agent.status === 'approved' ? 'approved' : 'pending');
      } catch (err) {
        // Never leave this on "checking" forever -- an unexpected error
        // (network blip, unhandled RLS case) should fail closed, not hang.
        console.error('AuthGuard check failed:', err);
        setStatus('pending');
      }
    }
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => subscription.unsubscribe();
  }, []);

  if (status === 'checking') {
    return (
      <div className="theme-schiphol dot-field flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (status === 'signed-out') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'pending') {
    return (
      <div className="theme-schiphol dot-field flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">Your account is pending approval</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          An admin needs to approve your access before you can use the portal. Check back soon.
        </p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 text-sm font-medium text-foreground hover:underline">
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
