import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-background/95 backdrop-blur border-b border-border">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-display text-lg font-bold text-foreground">
          Dalmar Travel
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#routes" className="hover:text-foreground transition-colors">Routes</a>
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

export { Navbar }
