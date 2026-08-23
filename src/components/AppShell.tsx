import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, MessageCircle, BarChart3, LogOut, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import ProfileMenu from '@/components/ProfileMenu';

const NAV = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/quote',        icon: FileText,        label: 'New Quote' },
  { href: '/customers',    icon: Users,            label: 'Customers' },
  { href: '/coordination', icon: MessageCircle,    label: 'WhatsApp' },
  { href: '/reports',      icon: BarChart3,        label: 'Reports' },
];

const COLLAPSED_W = 68;
const EXPANDED_W = 256;

export default function AppShell({ children, agentName = '' }: { children: ReactNode; agentName?: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const sidebarW = expanded ? EXPANDED_W : COLLAPSED_W;

  return (
    <div className="theme-schiphol dot-field min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="h-screen fixed left-0 top-0 z-50 flex flex-col overflow-hidden bg-ink px-3 py-6 transition-[width] duration-200"
        style={{ width: sidebarW }}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 overflow-hidden" style={{ minHeight: 40 }}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="size-5" strokeWidth={2.5} />
          </div>
          <div className="whitespace-nowrap transition-opacity duration-150" style={{ opacity: expanded ? 1 : 0 }}>
            <h1 className="font-display text-sm font-bold leading-none text-on-ink">Dalmar Travel</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-ink/50">Agency Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-3 overflow-hidden rounded py-2.5 transition-colors',
                  active ? 'border-l-4 border-primary bg-white/[0.06] pl-2 font-semibold text-primary' : 'border-l-4 border-transparent pl-3 text-on-ink/65 hover:text-on-ink'
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="whitespace-nowrap text-sm transition-opacity duration-150" style={{ opacity: expanded ? 1 : 0 }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom -- "New Booking" CTA removed 23/08/2026: it duplicated the
            "New Quote" nav item above, same /quote destination under a
            different name. */}
        <div className="mt-auto space-y-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded py-2 text-xs text-on-ink/40 hover:text-on-ink/70"
          >
            <LogOut className="size-4 shrink-0" />
            {expanded && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header
        className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur transition-[margin-left] duration-200"
        style={{ marginLeft: sidebarW }}
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input variant="default" className="pl-9" placeholder="Search bookings or customers..." />
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Notifications bell removed 23/08/2026 -- it showed a permanent
              fake "unread" dot with no real data or popup behind it.
              Rebuilding for real is its own design pass (see PLANNING.md). */}
          <ProfileMenu agentName={agentName} onLogout={handleLogout} />
        </div>
      </header>

      {/* Page Content */}
      <main
        className="transition-[margin-left] duration-200"
        style={{ marginLeft: sidebarW, padding: '24px', minHeight: 'calc(100vh - 4rem)' }}
      >
        {children}
      </main>
    </div>
  );
}
