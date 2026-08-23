import { useEffect, useState } from 'react';
import { LogOut, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'AG';
}

export default function ProfileMenu({ agentName, onLogout }: { agentName: string; onLogout: () => void }) {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState(agentName);
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setAgentId(user.id);
      const { data: agent } = await supabase.from('agents').select('name, email, phone').eq('id', user.id).single();
      if (agent) {
        setName(agent.name);
        setEmail(agent.email);
        setPhone(agent.phone ?? '');
      }
    }
    load();
  }, []);

  function startEdit() {
    setError(null);
    setEditing(true);
  }

  async function save() {
    if (!agentId || !name.trim()) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('agents').update({ name: name.trim(), phone: phone.trim() || null }).eq('id', agentId);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setEditing(false);
  }

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-3 border-l border-border pl-4 outline-none">
        <div className="text-right">
          <p className="text-[13px] font-semibold text-foreground">{agentName || 'Agent Profile'}</p>
          <p className="text-[11px] text-muted-foreground">{email || 'Loading…'}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
          {initials(agentName)}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        {editing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-phone" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</Label>
              <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+252 ..." />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving || !name.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="px-1 pb-2">
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
              {phone && <p className="mt-1 text-xs text-muted-foreground">{phone}</p>}
            </div>
            <button onClick={startEdit}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-secondary">
              <Pencil className="size-4" />
              Edit profile
            </button>
            <button onClick={onLogout}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
