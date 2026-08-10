import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <Card className="bg-dusk ring-0 border-0">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-on-dusk">Need instant support?</h3>
            <p className="text-sm text-on-dusk/70 mt-1">Message an agent directly on WhatsApp.</p>
          </div>
          <Button asChild>
            <a href="https://wa.me/447000000000" target="_blank" rel="noopener noreferrer">
              WhatsApp now
            </a>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

export { CtaBanner }
