import { useEffect, useState } from 'react';
import { HardHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';

export default function ReportsPage() {
  const [agentName, setAgentName] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: agent } = await supabase.from('agents').select('name').eq('id', user.id).single();
      if (agent) setAgentName(agent.name);
    }
    load();
  }, []);

  return (
    <AppShell agentName={agentName}>
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HardHat className="size-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reports — under construction</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page isn't built yet. We're still deciding what metrics actually belong here.
        </p>
      </div>
    </AppShell>
  );
}
