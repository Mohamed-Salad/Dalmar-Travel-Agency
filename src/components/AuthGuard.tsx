import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// This component is a UI convenience, not the security boundary -- it only
// decides what this browser tab renders. The real boundary is Postgres RLS
// (public.is_approved_agent(), see supabase/migrations/
// 20260821000000_agent_signup_approval_gate.sql). That function is not yet
// referenced by the authenticated-role policies on customers/booking_requests/
// bookings, so a pending agent's *browser* is blocked here, but their
// credentials can still read/write those tables via a direct API call until
// those policies are updated. Don't treat this file as sufficient on its own.
type Status = 'checking' | 'signed-out' | 'pending' | 'approved';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setStatus('signed-out'); return; }
      const { data: agent } = await supabase
        .from('agents').select('status').eq('id', data.session.user.id).single();
      setStatus(agent?.status === 'approved' ? 'approved' : 'pending');
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
