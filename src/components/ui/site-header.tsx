import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "#trust", label: "Why Dalmar" },
  { href: "#services", label: "Services" },
  { href: "#routes", label: "Routes" },
]

/** Shared header for the public pages. `marketing` (Landing) gets the full
 * nav + CTA; `minimal` (Inquiry/Login) is just the wordmark + agent link. */
function SiteHeader({
  variant = "minimal",
  showAgentLink = true,
}: {
  variant?: "marketing" | "minimal"
  /** Suppress the "Agent login" link — e.g. when already on /login. */
  showAgentLink?: boolean
}) {
  const wordmark = (
    <Link to="/" className="font-display text-lg font-bold text-foreground">
      Dalmar Travel
    </Link>
  )

  if (variant === "minimal") {
    return (
      <header className="h-16 border-b border-border">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          {wordmark}
          {showAgentLink && (
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Agent login
            </Link>
          )}
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-background/95 backdrop-blur border-b border-border">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        {wordmark}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link to="/inquiry">Make an inquiry</Link>
          </Button>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Agent login
          </Link>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
