import { cn } from "@/lib/utils"

/** The airmail-envelope stripe — the page's one signature motif. Use sparingly. */
function Stripe({ className }: { className?: string }) {
  return (
    <div
      data-slot="stripe"
      className={cn("h-1 w-full", className)}
      style={{
        background:
          "repeating-linear-gradient(-45deg, var(--primary) 0 10px, var(--destructive) 10px 20px, var(--background) 20px 24px, var(--destructive) 24px 34px, var(--primary) 34px 44px, var(--background) 44px 48px)",
      }}
    />
  )
}

export { Stripe }
